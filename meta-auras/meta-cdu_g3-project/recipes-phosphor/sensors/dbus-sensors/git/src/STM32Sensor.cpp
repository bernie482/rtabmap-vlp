#include <unistd.h>

#include "STM32Sensor.hpp"
#include <boost/algorithm/string/predicate.hpp>
#include <boost/asio/read_until.hpp>
#include <boost/date_time/posix_time/posix_time.hpp>
#include <sdbusplus/asio/connection.hpp>
#include <sdbusplus/asio/object_server.hpp>

#include <iostream>
#include <istream>
#include <limits>
#include <memory>
#include <string>
#include <vector>


/*
// Copyright (c) 2017 Intel Corporation
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
*/



// Temperatures are read in milli degrees Celsius, we need degrees Celsius.
// Pressures are read in kilopascal, we need Pascals.  On D-Bus for Open BMC
// we use the International System of Units without prefixes.
// Links to the kernel documentation:
// https://www.kernel.org/doc/Documentation/hwmon/sysfs-interface
// https://www.kernel.org/doc/Documentation/ABI/testing/sysfs-bus-iio
// For IIO RAW sensors we get a raw_value, an offset, and scale to compute
// the value = (raw_value + offset) * scale
static constexpr double sensorOffset = 0;
static constexpr double sensorScale = 1;
static constexpr size_t warnAfterErrorCount = 10;

STM32IoSensor::STM32IoSensor(
    const std::string& dbusObjpath, const std::string& objectType,
    sdbusplus::asio::object_server& objectServer,
    std::shared_ptr<sdbusplus::asio::connection>& conn,
    boost::asio::io_service& io, const std::string& sensorName,
    std::vector<thresholds::Threshold>&& thresholdsIn, const float pollRate,
    const std::string& sensorConfiguration, const std::string& deviceObjPath,
    const std::string& sensorTypesPathStr, const char* sensorPath,
    double maxReading, double minReading, double readingScale, const PowerState powerState) :
    Sensor(escapeName(sensorName), std::move(thresholdsIn), sensorConfiguration,
            objectType, false, false, maxReading, minReading, conn, powerState),
    std::enable_shared_from_this<STM32IoSensor>(), objServer(objectServer),
    waitTimer(io), _dbusObjpath(deviceObjPath), _sensorType(sensorTypesPathStr),
    _maxReading(maxReading), _minReading(minReading), _readingScale(readingScale),
    sensorPollMs(static_cast<unsigned int>(pollRate * 1000))
{
    _readValue = 0;
    std::cout << "sensorConfiguration: " << sensorConfiguration << std::endl;
    sensorInterface = objectServer.add_interface(
        "/xyz/openbmc_project/sensors/" + _sensorType + "/" + name,
        "xyz.openbmc_project.Sensor.Value");

    if (thresholds::hasWarningInterface(thresholds))
    {
        thresholdInterfaceWarning = objectServer.add_interface(
            "/xyz/openbmc_project/sensors/" + _sensorType + "/" + name,
            "xyz.openbmc_project.Sensor.Threshold.Warning");
    }
    if (thresholds::hasCriticalInterface(thresholds))
    {
        thresholdInterfaceCritical = objectServer.add_interface(
            "/xyz/openbmc_project/sensors/" + _sensorType + "/" + name,
            "xyz.openbmc_project.Sensor.Threshold.Critical");
    }
    association = objectServer.add_interface(
        "/xyz/openbmc_project/sensors/" + _sensorType + "/" + name,
        association::interface);
    setInitialProperties(conn, sensorPath);
}

STM32IoSensor::~STM32IoSensor()
{
    // close the input dev to cancel async operations
    waitTimer.cancel();
    objServer.remove_interface(thresholdInterfaceWarning);
    objServer.remove_interface(thresholdInterfaceCritical);
    objServer.remove_interface(sensorInterface);
    objServer.remove_interface(association);
}

void STM32IoSensor::setupRead(void)
{
    if (!readingStateGood())
    {
        markAvailable(false);
        updateValue(std::numeric_limits<double>::quiet_NaN());
        restartRead();
        return;
    }
    auto path = _dbusObjpath;
    std::weak_ptr<STM32IoSensor> weakRef = weak_from_this();
    dbusConnection->async_method_call (
        [weakRef, path](boost::system::error_code ec, const std::variant<int> responseVariant) {
            std::shared_ptr<STM32IoSensor> self = weakRef.lock();
            if (!self)
            {
                return;
            }
            if (ec) {
                std::cerr << path << " Error: " << ec.message() << "\n";
            } else {
                try {
                    self->_readValue = std::get<int>(responseVariant);
                    // std::cout << "Value: " << self->_readValue << "\n";
                } catch (const std::bad_variant_access&) {
                    std::cerr << "Error: failed to get the Value property.\n";
                }
            }
            self->handleResponse(ec);
        },
        "xyz.openbmc_project.stm32io.service",
        path,
        "org.freedesktop.DBus.Properties",
        "Get",
        "xyz.openbmc_project.stm32io.UART",
        "Value"
    );
}

void STM32IoSensor::restartRead()
{
    std::weak_ptr<STM32IoSensor> weakRef = weak_from_this();
    waitTimer.expires_from_now(boost::posix_time::milliseconds(sensorPollMs));
    waitTimer.async_wait([&,weakRef](const boost::system::error_code& ec) {
        if (ec == boost::asio::error::operation_aborted)
        {
            return; // we're being canceled
        }
        std::shared_ptr<STM32IoSensor> self = weakRef.lock();
        if (!self)
        {
            return;
        }

        self->setupRead();
    });
}

void STM32IoSensor::handleResponse(const boost::system::error_code& err)
{
    if (err == boost::asio::error::misc_errors::not_found)
    {
        std::cerr << "STM32 sensor " << name << " removed " << _dbusObjpath
                    << "\n";
        return; // we're being destroyed
    }
    if (!err)
    {
        try
        {
            rawValue = _readValue;
            // !TODO - need to confirm invalid value
            double nvalue = (rawValue + sensorOffset) * _readingScale;
            if (nvalue > _maxReading)
            {
                nvalue = _maxReading;
            }
            else if (nvalue < _minReading)
            {
                nvalue = _minReading;
            }
            updateValue(nvalue);
            // std::cout << "Value: " << nvalue << "\n";
        }
        catch (const std::invalid_argument&)
        {
            incrementError();
        }
    }
    else
    {
        incrementError();
    }

    restartRead();
}

void STM32IoSensor::checkThresholds(void)
{
    thresholds::checkThresholds(this);
}