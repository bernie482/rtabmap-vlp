#include "STM32Sensor.hpp"
#include <Utils.hpp>
#include <boost/algorithm/string/predicate.hpp>
#include <boost/algorithm/string/replace.hpp>
#include <boost/container/flat_map.hpp>
#include <boost/container/flat_set.hpp>
#include <sdbusplus/asio/connection.hpp>
#include <sdbusplus/asio/object_server.hpp>
#include <sdbusplus/bus/match.hpp>

#include <array>
#include <charconv>
#include <filesystem>
#include <fstream>
#include <functional>
#include <memory>
#include <regex>
#include <stdexcept>
#include <string>
#include <utility>
#include <variant>
#include <vector>

#include <sdbusplus/bus.hpp>


static constexpr float pollRateDefault = 2.0;

namespace fs = std::filesystem;
static auto sensorTypes{
    std::to_array<const char*>({"xyz.openbmc_project.Configuration.STM32_PRESSURE",      // kPa (kilopascal)
                                "xyz.openbmc_project.Configuration.STM32_TEMPERATURE",   // C (Celsius)
                                "xyz.openbmc_project.Configuration.STM32_FLOW",          // L/s
                                "xyz.openbmc_project.Configuration.STM32_BUTTON",        // Press/Release (1/0)
                                "xyz.openbmc_project.Configuration.STM32_SPEED",         // RPM (revolutions per minute)
                                "xyz.openbmc_project.Configuration.STM32_WATER",         // High/Low (1/0)
                                "xyz.openbmc_project.Configuration.STM32_VOLTAGE",       // V (Volts)
                                "xyz.openbmc_project.Configuration.STM32_CURRENT",       // A (Amps)
                                "xyz.openbmc_project.Configuration.STM32_POWER",         // W (Watt)
                                "xyz.openbmc_project.Configuration.STM32_PumpFanState",  // 0(off), 1(off), 2(abnormal)
                                "xyz.openbmc_project.Configuration.STM32_AirFlow",       // CFM
                                })};

static std::vector<std::string> stm32DbusObjects = {
            "/xyz/openbmc_project/stm32io/0/ADC/Flow1",
            "/xyz/openbmc_project/stm32io/0/ADC/Flow2",
            "/xyz/openbmc_project/stm32io/0/ADC/Pressure1",
            "/xyz/openbmc_project/stm32io/0/ADC/Pressure2",
            "/xyz/openbmc_project/stm32io/0/ADC/Pressure3",
            "/xyz/openbmc_project/stm32io/0/ADC/PressureDrop",
            "/xyz/openbmc_project/stm32io/0/ADC/Temperature1",
            "/xyz/openbmc_project/stm32io/0/ADC/Temperature2",
            "/xyz/openbmc_project/stm32io/0/ADC/Temperature3",
            "/xyz/openbmc_project/stm32io/0/ADC/Temperature4",
#if HAS_BOXER_PUMP
            "/xyz/openbmc_project/stm32io/0/BoxerPump/BoxerPumpSpeed",
#endif
#if HAS_DAC_DEV
            "/xyz/openbmc_project/stm32io/0/DAC/mVol",
#endif
#if HAS_FAN_DEV
            "/xyz/openbmc_project/stm32io/0/FAN/FanSpeed01",
            "/xyz/openbmc_project/stm32io/0/FAN/FanSpeed02",
            "/xyz/openbmc_project/stm32io/0/FAN/FanSpeed03",
            "/xyz/openbmc_project/stm32io/0/FAN/FanSpeed04",
            "/xyz/openbmc_project/stm32io/0/FAN/FanSpeed05",
            "/xyz/openbmc_project/stm32io/0/FAN/FanSpeed06",
            "/xyz/openbmc_project/stm32io/0/FAN/FanSpeed07",
            "/xyz/openbmc_project/stm32io/0/FAN/FanSpeed08",
            "/xyz/openbmc_project/stm32io/0/FAN/FanSpeed09",
            "/xyz/openbmc_project/stm32io/0/FAN/FanSpeed10",
            "/xyz/openbmc_project/stm32io/0/FAN/FanSpeed11",
#endif
            "/xyz/openbmc_project/stm32io/0/GPIO/Button",
            "/xyz/openbmc_project/stm32io/0/GPIO/LV1",
            "/xyz/openbmc_project/stm32io/0/GPIO/LV2",
            "/xyz/openbmc_project/stm32io/0/GPIO/LV3",
            "/xyz/openbmc_project/stm32io/0/GPIO/WaterDetect1",
            "/xyz/openbmc_project/stm32io/0/GPIO/WaterDetect2",
            "/xyz/openbmc_project/stm32io/0/PSU1/Current",
            "/xyz/openbmc_project/stm32io/0/PSU1/TotalPower",
            "/xyz/openbmc_project/stm32io/0/PSU1/Voltage",
            "/xyz/openbmc_project/stm32io/0/PSU2/Current",
            "/xyz/openbmc_project/stm32io/0/PSU2/TotalPower",
            "/xyz/openbmc_project/stm32io/0/PSU2/Voltage",
            "/xyz/openbmc_project/stm32io/0/PT100/Temperature",
            "/xyz/openbmc_project/stm32io/0/Pump/PumpSpeed1",
            "/xyz/openbmc_project/stm32io/0/Pump/PumpSpeed2",
            "/xyz/openbmc_project/stm32io/0/Pump/PumpSpeed3",
            "/xyz/openbmc_project/stm32io/0/Pump/PumpSpeed4",
            "/xyz/openbmc_project/stm32io/0/SystemInfo/SysBoardTemperature",
#if HAS_FAN_WALL
            "/xyz/openbmc_project/stm32io/0/FanWall/Speed01",
            "/xyz/openbmc_project/stm32io/0/FanWall/Speed02",
            "/xyz/openbmc_project/stm32io/0/FanWall/Speed03",
            "/xyz/openbmc_project/stm32io/0/FanWall/Speed04",
            "/xyz/openbmc_project/stm32io/0/FanWall/Speed05",
            "/xyz/openbmc_project/stm32io/0/FanWall/AirFlow01",
            "/xyz/openbmc_project/stm32io/0/FanWall/AirFlow02",
            "/xyz/openbmc_project/stm32io/0/FanWall/AirFlow03",
            "/xyz/openbmc_project/stm32io/0/FanWall/AirFlow04",
            "/xyz/openbmc_project/stm32io/0/FanWall/AirFlow05",
            "/xyz/openbmc_project/stm32io/0/FanWall/TotalAirFlow",
            "/xyz/openbmc_project/stm32io/0/FanWall/Status01",
            "/xyz/openbmc_project/stm32io/0/FanWall/Status02",
            "/xyz/openbmc_project/stm32io/0/FanWall/Status03",
            "/xyz/openbmc_project/stm32io/0/FanWall/Status04",
            "/xyz/openbmc_project/stm32io/0/FanWall/Status05",
            "/xyz/openbmc_project/stm32io/0/FanWall/Pt100",
            "/xyz/openbmc_project/stm32io/0/FanWall/WaterDetect",
#endif
    };

void createSensors(
    boost::asio::io_service& io, sdbusplus::asio::object_server& objectServer,
    boost::container::flat_map<std::string, std::shared_ptr<STM32IoSensor>>&
        sensors,
    std::shared_ptr<sdbusplus::asio::connection>& dbusConnection,
    const std::shared_ptr<boost::container::flat_set<std::string>>&
        sensorsChanged)
{
    auto getter = std::make_shared<GetSensorConfiguration>(
        dbusConnection,
        [&io, &objectServer, &sensors, &dbusConnection,
            sensorsChanged](const ManagedObjectType& sensorConfigurations) {
            bool firstScan = sensorsChanged == nullptr;

            boost::container::flat_set<std::string> directories;

            // iterate through all sensors, and try to match them
            // with configuration
            for (auto& path : stm32DbusObjects)
            {
                // !TODO Need to implement confirm stm32 dbus object exist

                const SensorData* sensorData = nullptr;
                const std::string* interfacePath = nullptr;
                const char* sensorType = nullptr;
                const SensorBaseConfiguration* baseConfiguration = nullptr;
                const SensorBaseConfigMap* baseConfigMap = nullptr;
                std::string sensorTypesPathStr;
                std::string deviceObjPath;
                double maxReading = 127;
                double minReading = -127;
                double readingScale = 1;
                const char* sensorPath;

                for (const std::pair<sdbusplus::message::object_path,
                            SensorData>& sensor : sensorConfigurations)
                {
                    sensorData = &(sensor.second);
                    for (const char* type : sensorTypes)
                    {
                        auto sensorBase = sensorData->find(type);
                        if (sensorBase != sensorData->end())
                        {
                            baseConfiguration = &(*sensorBase);
                            sensorType = type;
                        }
                    }
                    if (baseConfiguration == nullptr)
                    {
                        std::cerr << "error finding base configuration for "
                                    << path << "\n";
                        continue;
                    }
                    baseConfigMap = &baseConfiguration->second;
                    auto configurationDbusObj = baseConfigMap->find("DBusObj");

                    if (configurationDbusObj == baseConfigMap->end())
                    {
                        std::cerr << "error finding bus or address in "
                                        "configuration\n";
                        continue;
                    }

                    if (path != std::get<std::string>(configurationDbusObj->second))
                    {
                        continue;
                    }

                    interfacePath = &(sensor.first.str);
                    // std::cout << "interfacePath = " << interfacePath <<
                    //                     "\n";
                    break;
                }
                if (interfacePath == nullptr)
                {
                    std::cerr << "failed to find match for " << path
                                << "\n";
                    continue;
                }
                else
                {
                    // std::cout << "found match for " << path << "\n";
                }

                auto findSensorName = baseConfigMap->find("Name");
                if (findSensorName == baseConfigMap->end())
                {
                    std::cerr << "could not determine configuration name for "
                                << path << "\n";
                    continue;
                }
                std::string sensorName =
                    std::get<std::string>(findSensorName->second);
                // std::cout << "found sensorName " << sensorName
                //                 << "\n";
                // on rescans, only update sensors we were signaled by
                auto findSensor = sensors.find(sensorName);
                if (!firstScan && findSensor != sensors.end())
                {
                    bool found = false;
                    auto it = sensorsChanged->begin();
                    while (it != sensorsChanged->end())
                    {
                        if (boost::ends_with(*it, findSensor->second->name))
                        {
                            it = sensorsChanged->erase(it);
                            findSensor->second = nullptr;
                            found = true;
                            break;
                        }
                        ++it;
                    }
                    if (!found)
                    {
                        continue;
                    }
                }

                std::vector<thresholds::Threshold> sensorThresholds;
                int index = 1;

                if (!parseThresholdsFromConfig(*sensorData, sensorThresholds,
                                                nullptr, &index))
                {
                    std::cerr << "error populating thresholds for "
                                << sensorName << " index 1\n";
                }

                auto findPollRate = baseConfiguration->second.find("PollRate");
                float pollRate = pollRateDefault;
                if (findPollRate != baseConfiguration->second.end())
                {
                    pollRate = std::visit(VariantToFloatVisitor(),
                                            findPollRate->second);
                    if (pollRate <= 0.0f)
                    {
                        pollRate = pollRateDefault; // polling time too short
                    }
                }

                auto findPowerOn = baseConfiguration->second.find("PowerState");
                PowerState readState = PowerState::always;
                if (findPowerOn != baseConfiguration->second.end())
                {
                    std::string powerState = std::visit(
                        VariantToStringVisitor(), findPowerOn->second);
                    setReadState(powerState, readState);
                }

                auto permitSet = getPermitSet(*baseConfigMap);
                auto& sensor = sensors[sensorName];
                sensor = nullptr;

                // Set value by sensor type
                // !TODO Need to get maxreading and minreading from config
                if (strcmp(sensorType, "xyz.openbmc_project.Configuration.STM32_PRESSURE") == 0)
                {
                    sensorTypesPathStr = "pressure";
                    maxReading = 1500;
                    minReading = -100;
                    sensorPath = sensor_paths::unitPascals;
                } else if (strcmp(sensorType, "xyz.openbmc_project.Configuration.STM32_TEMPERATURE") == 0)
                {
                    sensorTypesPathStr = "temperature";
                    maxReading = 150;
                    minReading = -55;
                    readingScale = 0.01;
                    sensorPath = sensor_paths::unitDegreesC;
                } else if (strcmp(sensorType, "xyz.openbmc_project.Configuration.STM32_FLOW") == 0)
                {
                    sensorTypesPathStr = "flowrate";
                    maxReading = 10;
                    minReading = 0;
                    readingScale = 0.01;
                    sensorPath = sensor_paths::unitUnspecified;
                } else if (strcmp(sensorType, "xyz.openbmc_project.Configuration.STM32_BUTTON") == 0)
                {
                    sensorTypesPathStr = "state";
                    maxReading = 1;
                    minReading = 0;
                    sensorPath = sensor_paths::unitUnspecified;
                } else if (strcmp(sensorType, "xyz.openbmc_project.Configuration.STM32_SPEED") == 0)
                {
                    sensorTypesPathStr = "fan_tach";
                    maxReading = 100000;
                    minReading = 0;
                    sensorPath = sensor_paths::unitRPMs;
                } else if (strcmp(sensorType, "xyz.openbmc_project.Configuration.STM32_WATER") == 0)
                {
                    sensorTypesPathStr = "state";
                    maxReading = 1;
                    minReading = 0;
                    sensorPath = sensor_paths::unitUnspecified;
                } else if (strcmp(sensorType, "xyz.openbmc_project.Configuration.STM32_VOLTAGE") == 0)
                {
                    sensorTypesPathStr = "voltage";
                    maxReading = 55;
                    minReading = 0;
                    sensorPath = sensor_paths::unitVolts;
                } else if (strcmp(sensorType, "xyz.openbmc_project.Configuration.STM32_CURRENT") == 0)
                {
                    sensorTypesPathStr = "current";
                    maxReading = 90;
                    minReading = 0;
                    sensorPath = sensor_paths::unitUnspecified;
                } else if (strcmp(sensorType, "xyz.openbmc_project.Configuration.STM32_POWER") == 0)
                {
                    sensorTypesPathStr = "power";
                    maxReading = 4000;
                    minReading = 0;
                    sensorPath = sensor_paths::unitUnspecified;
                } else if (strcmp(sensorType, "xyz.openbmc_project.Configuration.STM32_PumpFanState") == 0)
                {
                    sensorTypesPathStr = "pump_fan_state";
                    maxReading = 2;
                    minReading = 0;
                    sensorPath = sensor_paths::unitUnspecified;
                } else if (strcmp(sensorType, "xyz.openbmc_project.Configuration.STM32_AirFlow") == 0)
                {
                    sensorTypesPathStr = "airflow";
                    maxReading = 2000;
                    minReading = 0;
                    readingScale = 0.01;
                    sensorPath = sensor_paths::unitCFM;
                } else {
                    std::cerr << "error sensor type not found\n";
                }

                auto configurationMaxReading = baseConfigMap->find("MaxReading");
                if (configurationMaxReading != baseConfigMap->end())
                {
                    maxReading = std::get<double>(configurationMaxReading->second);
                }

                auto configurationMinReading = baseConfigMap->find("MinReading");
                if (configurationMinReading != baseConfigMap->end())
                {
                    minReading = std::get<double>(configurationMinReading->second);
                }

                auto configurationReadingScale = baseConfigMap->find("ReadingScale");
                if (configurationReadingScale != baseConfigMap->end())
                {
                    readingScale = std::get<double>(configurationReadingScale->second);
                }

                // !HARDCODE Need to determine device path from config
                deviceObjPath = path;
                path = "/xyz/openbmc_project/inventory/system/board/Auras_LLCDU/" + sensorName;
                std::replace(path.begin(), path.end(), ' ', '_');
                sensor = std::make_shared<STM32IoSensor>(
                    std::get<std::string>(findSensorName->second), sensorType, objectServer, dbusConnection,
                    io, sensorName, std::move(sensorThresholds), pollRate,
                    path, deviceObjPath, sensorTypesPathStr, sensorPath, maxReading, minReading, readingScale, readState);
                sensor->setupRead();
            }
        });
    getter->getConfiguration(
        std::vector<std::string>(sensorTypes.begin(), sensorTypes.end()));
}

void interfaceRemoved(
    sdbusplus::message::message& message,
    boost::container::flat_map<std::string, std::shared_ptr<STM32IoSensor>>&
        sensors)
{
    if (message.is_method_error())
    {
        std::cerr << "interfacesRemoved callback method error\n";
        return;
    }

    sdbusplus::message::object_path path;
    std::vector<std::string> interfaces;

    message.read(path, interfaces);

    // If the xyz.openbmc_project.Confguration.X interface was removed
    // for one or more sensors, delete those sensor objects.
    auto sensorIt = sensors.begin();
    while (sensorIt != sensors.end())
    {
        if ((sensorIt->second->configurationPath == path) &&
            (std::find(interfaces.begin(), interfaces.end(),
                        sensorIt->second->objectType) != interfaces.end()))
        {
            sensorIt = sensors.erase(sensorIt);
        }
        else
        {
            sensorIt++;
        }
    }
}

int main()
{
    boost::asio::io_service io;
    auto systemBus = std::make_shared<sdbusplus::asio::connection>(io);
    systemBus->request_name("xyz.openbmc_project.stm32sensor");
    sdbusplus::asio::object_server objectServer(systemBus);
    boost::container::flat_map<std::string, std::shared_ptr<STM32IoSensor>>
        sensors;
    std::vector<std::unique_ptr<sdbusplus::bus::match::match>> matches;
    auto sensorsChanged =
        std::make_shared<boost::container::flat_set<std::string>>();
#ifdef SPF_SENSOR
    boost::asio::deadline_timer filterTimer(io);

    BARRIER_STATE_CONTINUE_INIT_START();
#endif
    io.post([&]() {
        createSensors(io, objectServer, sensors, systemBus, nullptr);
    });
#ifndef SPF_SENSOR
    boost::asio::deadline_timer filterTimer(io);
#endif
    std::function<void(sdbusplus::message::message&)> eventHandler =
        [&](sdbusplus::message::message& message) {
            if (message.is_method_error())
            {
                std::cerr << "callback method error\n";
                return;
            }
            sensorsChanged->insert(message.get_path());
            // this implicitly cancels the timer
            filterTimer.expires_from_now(boost::posix_time::seconds(1));

            filterTimer.async_wait([&](const boost::system::error_code& ec) {
                if (ec == boost::asio::error::operation_aborted)
                {
                    /* we were canceled*/
                    return;
                }
                if (ec)
                {
                    std::cerr << "timer error\n";
                    return;
                }
                createSensors(io, objectServer, sensors, systemBus,
                                sensorsChanged);
            });
        };

    for (const char* type : sensorTypes)
    {
        auto match = std::make_unique<sdbusplus::bus::match::match>(
            static_cast<sdbusplus::bus::bus&>(*systemBus),
            "type='signal',member='PropertiesChanged',path_namespace='" +
                std::string(inventoryPath) + "',arg0namespace='" + type + "'",
            eventHandler);
        matches.emplace_back(std::move(match));
    }

    setupManufacturingModeMatch(*systemBus);

    // Watch for entity-manager to remove configuration interfaces
    // so the corresponding sensors can be removed.
    auto ifaceRemovedMatch = std::make_unique<sdbusplus::bus::match::match>(
        static_cast<sdbusplus::bus::bus&>(*systemBus),
        "type='signal',member='InterfacesRemoved',arg0path='" +
            std::string(inventoryPath) + "/'",
        [&sensors](sdbusplus::message::message& msg) {
            interfaceRemoved(msg, sensors);
        });

    matches.emplace_back(std::move(ifaceRemovedMatch));

#ifdef SPF_SENSOR
    BARRIER_STATE_CONTINUE_INIT_DONE();

    INIT_WAIT_BARRIER_STATE(io, objectServer, systemBus);
#endif

    io.run();
}
