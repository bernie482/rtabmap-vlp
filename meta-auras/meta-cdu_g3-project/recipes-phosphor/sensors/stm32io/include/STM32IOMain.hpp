#pragma once
#include <sdbusplus/asio/object_server.hpp>
#include <boost/asio/io_service.hpp>
#include "STM32IO.hpp"

#define STM32_DBUS_SERVICE              "xyz.openbmc_project.stm32io.service"
#define STM32_DBUS_INTERFACE            "xyz.openbmc_project.stm32io.UART"
#define STM32_DBUS_OBJ_PREFIX           "/xyz/openbmc_project/stm32io"
#define STM32_LOG_PATH                  "/dev/shm/stm32io.log"
#define STM32_LOG_MAX_SIZE              (20 * 1024 * 1024)      // 20MB

class STM32ObjInterface : public sdbusplus::asio::dbus_interface {
    public:
        STM32ObjInterface(boost::asio::io_service& io,
                        std::shared_ptr<sdbusplus::asio::connection> conn,
                        STM32io& stm32Device,
                        const std::string& interfaceName,
                        const std::string& path)
            : dbus_interface(conn,
                                std::string(STM32_DBUS_OBJ_PREFIX) + "/" + std::to_string(stm32Device.deviceID) + "/" + path,
                                interfaceName){}
};

class ledInterface : public STM32ObjInterface {
    public:
        ledInterface(boost::asio::io_service& io,
                        std::shared_ptr<sdbusplus::asio::connection> conn,
                        STM32io& stm32Device, EledDevice itemIndex, const std::string& objName);
    private:
        STM32io& _stm32Device;
        EledDevice _itemIndex;
};

class sysBoardInfoInterface : public STM32ObjInterface {
    public:
        sysBoardInfoInterface(boost::asio::io_service& io,
                        std::shared_ptr<sdbusplus::asio::connection> conn,
                        STM32io& stm32Device, EsysBoardInfoItem itemIndex, const std::string& objName);
    private:
        STM32io& _stm32Device;
        EsysBoardInfoItem _itemIndex;
};

class pumpInterface : public STM32ObjInterface {
    public:
        pumpInterface(boost::asio::io_service& io,
                        std::shared_ptr<sdbusplus::asio::connection> conn,
                        STM32io& stm32Device, EpumpDevice itemIndex, const std::string& objName);
    private:
        STM32io& _stm32Device;
        EpumpDevice _itemIndex;
};

class adcInterface : public STM32ObjInterface {
    public:
        adcInterface(boost::asio::io_service& io,
                        std::shared_ptr<sdbusplus::asio::connection> conn,
                        STM32io& stm32Device, EadcDevice itemIndex, const std::string& objName);
    private:
        STM32io& _stm32Device;
        EadcDevice _itemIndex;
};

class pt100Interface : public STM32ObjInterface {
    public:
        pt100Interface(boost::asio::io_service& io,
                        std::shared_ptr<sdbusplus::asio::connection> conn,
                        STM32io& stm32Device, Ept100Device itemIndex, const std::string& objName);
    private:
        STM32io& _stm32Device;
        Ept100Device _itemIndex;
};

class intputGpioInterface : public STM32ObjInterface {
    public:
        intputGpioInterface(boost::asio::io_service& io,
                        std::shared_ptr<sdbusplus::asio::connection> conn,
                        STM32io& stm32Device, EinputGpioDevice itemIndex, const std::string& objName);
    private:
        STM32io& _stm32Device;
        EinputGpioDevice _itemIndex;
};

#if HAS_FAN_DEV
class fanInterface : public STM32ObjInterface {
    public:
        fanInterface(boost::asio::io_service& io,
                        std::shared_ptr<sdbusplus::asio::connection> conn,
                        STM32io& stm32Device, EfanDevice itemIndex, const std::string& objName);
    private:
        STM32io& _stm32Device;
        EfanDevice _itemIndex;
};
#endif

#if HAS_BOXER_PUMP
class boxerPumpInterface : public STM32ObjInterface {
    public:
        boxerPumpInterface(boost::asio::io_service& io,
                        std::shared_ptr<sdbusplus::asio::connection> conn,
                        STM32io& stm32Device, EboxerPumpDevice itemIndex, const std::string& objName);
    private:
        STM32io& _stm32Device;
        EboxerPumpDevice _itemIndex;
};
#endif

class psu1Interface : public STM32ObjInterface {
    public:
        psu1Interface(boost::asio::io_service& io,
                        std::shared_ptr<sdbusplus::asio::connection> conn,
                        STM32io& stm32Device, EpsuDevice itemIndex, const std::string& objName);
    private:
        STM32io& _stm32Device;
        EpsuDevice _itemIndex;
};

class psu2Interface : public STM32ObjInterface {
    public:
        psu2Interface(boost::asio::io_service& io,
                        std::shared_ptr<sdbusplus::asio::connection> conn,
                        STM32io& stm32Device, EpsuDevice itemIndex, const std::string& objName);
    private:
        STM32io& _stm32Device;
        EpsuDevice _itemIndex;
};

#if HAS_DAC_DEV
class dacInterface : public STM32ObjInterface {
    public:
        dacInterface(boost::asio::io_service& io,
                        std::shared_ptr<sdbusplus::asio::connection> conn,
                        STM32io& stm32Device, EdacDevice itemIndex, const std::string& objName);
    private:
        STM32io& _stm32Device;
        EdacDevice _itemIndex;
};
#endif

#if HAS_FAN_WALL
class FanWallInterface : public STM32ObjInterface {
    public:
        FanWallInterface(boost::asio::io_service& io,
                        std::shared_ptr<sdbusplus::asio::connection> conn,
                        STM32io& stm32Device, EfanWallDevice itemIndex, const std::string& objName);
    private:
        STM32io& _stm32Device;
        EfanWallDevice _itemIndex;
};
#endif

void daemonUsage(void);
void save_log_to_file(std::string str);