#pragma once

#include <Thresholds.hpp>
#include <boost/asio/streambuf.hpp>
#include <sdbusplus/asio/object_server.hpp>
#include <sensor.hpp>

#include <string>
#include <vector>
#define HAS_FAN_WALL                                            1
#define HAS_FAN_DEV                                             0
#define HAS_DAC_DEV                                             0
#define HAS_BOXER_PUMP                                          0

class STM32IoSensor :
    public Sensor,
    public std::enable_shared_from_this<STM32IoSensor>
{
    public:
        STM32IoSensor(const std::string& dbusObjpath, const std::string& objectType,
                        sdbusplus::asio::object_server& objectServer,
                        std::shared_ptr<sdbusplus::asio::connection>& conn,
                        boost::asio::io_service& io, const std::string& sensorName,
                        std::vector<thresholds::Threshold>&& thresholds,
                        const float pollRate,
                        const std::string& sensorConfiguration,
                        const std::string& deviceObjPath,
                        const std::string& sensorTypesPathStr,
                        const char* sensorPath,
                        double maxReading, double minReading,
                        double readingScale,
                        const PowerState powerState);
        ~STM32IoSensor() override;
        void setupRead(void);

    private:
        sdbusplus::asio::object_server& objServer;
        boost::asio::deadline_timer waitTimer;
        std::string _dbusObjpath;
        std::string _sensorType;
        double _minReading;
        double _maxReading;
        int _readValue;
        double _readingScale;
        unsigned int sensorPollMs;

        void handleResponse(const boost::system::error_code& err);
        void restartRead();
        void checkThresholds(void) override;
};
