#include <iostream>
#include <boost/chrono.hpp>
#include <boost/thread/thread.hpp>
#include "STM32IOMain.hpp"


std::string INSYDE_EXAMPLE_SETTINGS_VERSION = "1.0";
bool bDbgLogFlag = false;
bool bPrintDataUpdated = false;
bool bSaveToFile = false;

void daemonUsage(void)
{
    std::cout << "Usage: stm32io [-[d][h][v][s]]" << std::endl;
    std::cout << "   d: Enable debug log." << std::endl;
    std::cout << "   h: Show this help message." << std::endl;
    std::cout << "   v: Enable debug log & show the updated content of the data." << std::endl;
    std::cout << "   s: Save log to " << STM32_LOG_PATH << "." << std::endl;
    std::cout << "   SIG:USR1 Switch the flag of debug log & updated content of the data" << std::endl;
}

// To avoid dbg log file too large.
void truncateHalf(const std::string& filename) {
    std::ifstream ifs(filename, std::ios::binary | std::ios::ate);
    if (!ifs.is_open()) {
        std::cerr << "Could not open file for reading." << std::endl;
        return;
    }

    std::streamsize fileSize = ifs.tellg();
    ifs.seekg(0, std::ios::beg);

    std::vector<char> buffer(fileSize);
    ifs.read(buffer.data(), fileSize);
    ifs.close();

    std::streamsize halfSize = fileSize / 2;

    // Find the closest newline character after the half-way mark.
    for (; halfSize < fileSize; ++halfSize) {
        if (buffer[halfSize] == '\n') {
            ++halfSize;  // Move past the newline character.
            break;
        }
    }

    // If a newline character was not found, then we can't really proceed.
    if (halfSize >= fileSize) {
        std::cerr << "Could not find a newline character after the half-way mark." << std::endl;
        return;
    }

    std::ofstream ofs(filename, std::ios::binary | std::ios::trunc);
    if (!ofs.is_open()) {
        std::cerr << "Could not open file for writing." << std::endl;
        return;
    }

    ofs.write(buffer.data() + halfSize, fileSize - halfSize);
    ofs.close();
}

void checkLogSize(const std::string& filename, std::size_t maxSize) {
    std::ifstream file(filename, std::ifstream::ate | std::ifstream::binary);
    if (!file.is_open()) {
        return;
    }

    std::size_t size = file.tellg();
    // If too large, truncate to half.
    if (size > maxSize) {
        truncateHalf(filename);
    }
}

void save_log_to_file(std::string str) {
    checkLogSize(STM32_LOG_PATH, STM32_LOG_MAX_SIZE);

    std::ofstream file(STM32_LOG_PATH, std::ios::app);
    if (!file) {
        std::cerr << "Error opening or creating file" << std::endl;
        exit(EXIT_FAILURE);
    }

    file << str << "\n";
    if (!file) {
        std::cerr << "Error writing to file" << std::endl;
        exit(EXIT_FAILURE);
    }
}

void handle_signal(int signal) {
    if (signal == SIGUSR1) {
        std::cout << "Signal USR1 received." << std::endl;
        if (bDbgLogFlag == true) {
            bDbgLogFlag = false;
            bPrintDataUpdated = false;
            std::cerr << "Disable debug log." << std::endl;
        } else {
            bDbgLogFlag = true;
            bPrintDataUpdated = true;
            std::cerr << "Enable debug log." << std::endl;
        }
    }
}

int main(int argc, char* argv[])
{
    const char* serviceName = STM32_DBUS_SERVICE;
    const char* objectPathPrefix = STM32_DBUS_OBJ_PREFIX;
    std::string daemonArgument;
    if (argc >= 2) {
        daemonArgument = argv[1];
        if (daemonArgument[0] == '-') {
            for (int i = 1; i < daemonArgument.length(); i++) {
                switch (daemonArgument[i]) {
                    case 'd':
                        std::cout << "Enable debug log." << std::endl;
                        bDbgLogFlag = true;
                        break;
                    case 'h':
                        daemonUsage();
                        return 0;
                    case 'v':
                        std::cout << "Enable debug log." << std::endl;
                        std::cout << "Display the updated content of the data." << std::endl;
                        bDbgLogFlag = true;
                        bPrintDataUpdated = true;
                        break;
                    case 's':
                        bSaveToFile = true;
                        break;
                    default:
                        std::cout << "Invalid argument." << std::endl;
                        daemonUsage();
                        return -EINVAL;
                }
            }
        }
    }

    std::signal(SIGUSR1, handle_signal);

    STM32io stm_0(0);


    // Check Init state
    if (false == stm_0.getInitState())
    {
        std::cerr << "HAL init failed" << std::endl;
        return -1;
    }

    // initial boost asio and sdbus
    boost::asio::io_service io;
    auto sysBus = std::make_shared<sdbusplus::asio::connection>(io);
    sysBus->request_name(serviceName);
    sdbusplus::asio::object_server objServer(sysBus);

    // Add dbus object
    ledInterface LED1Interface(io, sysBus, stm_0, ELED1, "LED1");
    ledInterface LED2Interface(io, sysBus, stm_0, ELED2, "LED2");
    ledInterface LED3Interface(io, sysBus, stm_0, ELED3, "LED3");
    ledInterface LED4Interface(io, sysBus, stm_0, ELED4, "LED4");
    ledInterface LED5Interface(io, sysBus, stm_0, ELED5, "LED5");
    ledInterface LED6Interface(io, sysBus, stm_0, ELED6, "LED6");
    ledInterface LED7Interface(io, sysBus, stm_0, ELED7, "LED7");

    sysBoardInfoInterface sysBoardFwVerInterface(io, sysBus, stm_0, EFW_VER, "FirmwareVersion");
    sysBoardInfoInterface sysBoardLibVerInterface(io, sysBus, stm_0, ELIB_VER, "LibraryVersion");
    sysBoardInfoInterface sysBoardSysBoardTempInterface(io, sysBus, stm_0, ETEMP, "SysBoardTemperature");

    pumpInterface pumpPwm1Interface(io, sysBus, stm_0, EPUMP_PWM_1, "PumpPwm1");
    pumpInterface pumpPwm2Interface(io, sysBus, stm_0, EPUMP_PWM_2, "PumpPwm2");
    pumpInterface pumpPwm3Interface(io, sysBus, stm_0, EPUMP_PWM_3, "PumpPwm3");
    pumpInterface pumpPwm4Interface(io, sysBus, stm_0, EPUMP_PWM_4, "PumpPwm4");
    pumpInterface pumpSpeed1Interface(io, sysBus, stm_0, EPUMP_SPEED_1, "PumpSpeed1");
    pumpInterface pumpSpeed2Interface(io, sysBus, stm_0, EPUMP_SPEED_2, "PumpSpeed2");
    pumpInterface pumpSpeed3Interface(io, sysBus, stm_0, EPUMP_SPEED_3, "PumpSpeed3");
    pumpInterface pumpSpeed4Interface(io, sysBus, stm_0, EPUMP_SPEED_4, "PumpSpeed4");

    adcInterface adcPressure1Interface(io, sysBus, stm_0, EADC_PRESSURE_1, "Pressure1");
    adcInterface adcPressure2Interface(io, sysBus, stm_0, EADC_PRESSURE_2, "Pressure2");
    adcInterface adcPressure3Interface(io, sysBus, stm_0, EADC_PRESSURE_3, "Pressure3");
    adcInterface adcPressureDropInterface(io, sysBus, stm_0, EADC_PRESSURE_DROP, "PressureDrop");
    adcInterface adcFlow1Interface(io, sysBus, stm_0, EADC_FLOW_1, "Flow1");
    adcInterface adcFlow2Interface(io, sysBus, stm_0, EADC_FLOW_2, "Flow2");
    adcInterface adcTemp1Interface(io, sysBus, stm_0, EADC_TEMP_1, "Temperature1");
    adcInterface adcTemp2Interface(io, sysBus, stm_0, EADC_TEMP_2, "Temperature2");
    adcInterface adcTemp3Interface(io, sysBus, stm_0, EADC_TEMP_3, "Temperature3");
    adcInterface adcTemp4Interface(io, sysBus, stm_0, EADC_TEMP_4, "Temperature4");

    pt100Interface pt100TempInterface(io, sysBus, stm_0, EPT100_TEMP, "Temperature");

    intputGpioInterface intputGpioButtonInterface(io, sysBus, stm_0, EGPIO_BUTTON, "Button");
    intputGpioInterface intputGpioLv1Interface(io, sysBus, stm_0, EGPIO_LV1, "LV1");
    intputGpioInterface intputGpioLv2Interface(io, sysBus, stm_0, EGPIO_LV2, "LV2");
    intputGpioInterface intputGpioLv3Interface(io, sysBus, stm_0, EGPIO_LV3, "LV3");
    intputGpioInterface intputGpioWaterDetect1Interface(io, sysBus, stm_0, EGPIO_WATER_DETECT1, "WaterDetect1");
    intputGpioInterface intputGpioWaterDetect2Interface(io, sysBus, stm_0, EGPIO_WATER_DETECT2, "WaterDetect2");

#if HAS_FAN_DEV
    fanInterface fanPwm1_4Interface(io, sysBus, stm_0, EFAN_PWM_1_4, "FanPwm1_4");
    fanInterface fanPwm5_8Interface(io, sysBus, stm_0, EFAN_PWM_5_8, "FanPwm5_8");
    fanInterface fanPwm9_12Interface(io, sysBus, stm_0, EFAN_PWM_9_12, "FanPwm9_12");
    fanInterface fanSpeed1Interface(io, sysBus, stm_0, EFAN_SPEED_1, "FanSpeed01");
    fanInterface fanSpeed2Interface(io, sysBus, stm_0, EFAN_SPEED_2, "FanSpeed02");
    fanInterface fanSpeed3Interface(io, sysBus, stm_0, EFAN_SPEED_3, "FanSpeed03");
    fanInterface fanSpeed4Interface(io, sysBus, stm_0, EFAN_SPEED_4, "FanSpeed04");
    fanInterface fanSpeed5Interface(io, sysBus, stm_0, EFAN_SPEED_5, "FanSpeed05");
    fanInterface fanSpeed6Interface(io, sysBus, stm_0, EFAN_SPEED_6, "FanSpeed06");
    fanInterface fanSpeed7Interface(io, sysBus, stm_0, EFAN_SPEED_7, "FanSpeed07");
    fanInterface fanSpeed8Interface(io, sysBus, stm_0, EFAN_SPEED_8, "FanSpeed08");
    fanInterface fanSpeed9Interface(io, sysBus, stm_0, EFAN_SPEED_9, "FanSpeed09");
    fanInterface fanSpeed10Interface(io, sysBus, stm_0, EFAN_SPEED_10, "FanSpeed10");
    fanInterface fanSpeed11Interface(io, sysBus, stm_0, EFAN_SPEED_11, "FanSpeed11");
#endif

#if HAS_BOXER_PUMP
    boxerPumpInterface boxerPumpPwmInterface(io, sysBus, stm_0, EBOXER_PUMP_PWM, "BoxerPumpPwm");
    boxerPumpInterface boxerPumpSpeedInterface(io, sysBus, stm_0, EBOXER_PUMP_SPEED, "BoxerPumpSpeed");
#endif

    psu1Interface psu1TotalPowerInterface(io, sysBus, stm_0, EPSU_TOTAL_WATT, "TotalPower");
    psu1Interface psu1VoltageInterface(io, sysBus, stm_0, EPSU_VOL, "Voltage");
    psu1Interface psu1CurrentInterface(io, sysBus, stm_0, EPSU_CUR, "Current");

    psu2Interface psu2TotalPowerInterface(io, sysBus, stm_0, EPSU_TOTAL_WATT, "TotalPower");
    psu2Interface psu2VoltageInterface(io, sysBus, stm_0, EPSU_VOL, "Voltage");
    psu2Interface psu2CurrentInterface(io, sysBus, stm_0, EPSU_CUR, "Current");

#if HAS_DAC_DEV
    dacInterface dacMvolInterface(io, sysBus, stm_0, EDAC_MVOL, "mVol");
#endif

#if HAS_FAN_WALL
    FanWallInterface fanWallLv1_2Interface(io, sysBus, stm_0, EFAN_WALL_LV1_2, "LV1_2");
    FanWallInterface fanWallLv3_5Interface(io, sysBus, stm_0, EFAN_WALL_LV3_5, "LV3_5");
    FanWallInterface fanWallSpeed1Interface(io, sysBus, stm_0, EFAN_WALL_SPEED_1, "Speed01");
    FanWallInterface fanWallSpeed2Interface(io, sysBus, stm_0, EFAN_WALL_SPEED_2, "Speed02");
    FanWallInterface fanWallSpeed3Interface(io, sysBus, stm_0, EFAN_WALL_SPEED_3, "Speed03");
    FanWallInterface fanWallSpeed4Interface(io, sysBus, stm_0, EFAN_WALL_SPEED_4, "Speed04");
    FanWallInterface fanWallSpeed5Interface(io, sysBus, stm_0, EFAN_WALL_SPEED_5, "Speed05");
    FanWallInterface fanWallAirFlow1Interface(io, sysBus, stm_0, EFAN_WALL_AIR_FLOW_1, "AirFlow01");
    FanWallInterface fanWallAirFlow2Interface(io, sysBus, stm_0, EFAN_WALL_AIR_FLOW_2, "AirFlow02");
    FanWallInterface fanWallAirFlow3Interface(io, sysBus, stm_0, EFAN_WALL_AIR_FLOW_3, "AirFlow03");
    FanWallInterface fanWallAirFlow4Interface(io, sysBus, stm_0, EFAN_WALL_AIR_FLOW_4, "AirFlow04");
    FanWallInterface fanWallAirFlow5Interface(io, sysBus, stm_0, EFAN_WALL_AIR_FLOW_5, "AirFlow05");
    FanWallInterface fanWallTotalAirFlowInterface(io, sysBus, stm_0, EFAN_WALL_Total_AIR_FLOW, "TotalAirFlow");
    FanWallInterface fanWallStatus1Interface(io, sysBus, stm_0, EFAN_WALL_STATUS_1, "Status01");
    FanWallInterface fanWallStatus2Interface(io, sysBus, stm_0, EFAN_WALL_STATUS_2, "Status02");
    FanWallInterface fanWallStatus3Interface(io, sysBus, stm_0, EFAN_WALL_STATUS_3, "Status03");
    FanWallInterface fanWallStatus4Interface(io, sysBus, stm_0, EFAN_WALL_STATUS_4, "Status04");
    FanWallInterface fanWallStatus5Interface(io, sysBus, stm_0, EFAN_WALL_STATUS_5, "Status05");
    FanWallInterface fanWallPt100Interface(io, sysBus, stm_0, EFAN_WALL_PT100, "Pt100");
    FanWallInterface fanWallWaterDetectInterface(io, sysBus, stm_0, EFAN_WALL_WATER_DETECT, "WaterDetect");
#endif

    io.run();

    return 0;
}

ledInterface::ledInterface(boost::asio::io_service& io,
                        std::shared_ptr<sdbusplus::asio::connection> conn,
                        STM32io& stm32Device, EledDevice itemIndex, const std::string& objName) :
                            STM32ObjInterface(io, conn, stm32Device, STM32_DBUS_INTERFACE, std::string("LED/") + objName),
                            _itemIndex(itemIndex),
                            _stm32Device(stm32Device)
{

    register_property("Value", int(),
        // Override set
        [this](const int& req, int& propertyValue) -> bool {
            int ret;
            bool isAuto = false;
            if (req & (1 << LED_AUTO_OFFSET))
            {
                isAuto = true;
            }

            try {
                baseMutex::Lock lock(_stm32Device.ledAutoMutex, std::chrono::milliseconds(BASE_MTX_TRY_LOCK_TIMEOUT));
                switch (_itemIndex)
                {
                    case ELED3:
                    case ELED2:
                        // Pump1
                        _stm32Device.pump1LedState.bIsAutomaticMode = isAuto;
                        _stm32Device.pump1LedState.bNeedUpdate = true;
                        break;
                    case ELED1:
                    case ELED4:
                        // Pump2
                        _stm32Device.pump2LedState.bIsAutomaticMode = isAuto;
                        _stm32Device.pump2LedState.bNeedUpdate = true;
                        break;
                    case ELED5:
                    case ELED6:
                        // Pump3
                        _stm32Device.pump3LedState.bIsAutomaticMode = isAuto;
                        _stm32Device.pump3LedState.bNeedUpdate = true;
                        break;
                    default:
                        break;
                }
                lock.unlock();
            } catch (const std::runtime_error& e) {
                std::string throwOutMessage = e.what();
                throw std::runtime_error("Failed to lock ledAutoMutex: " + throwOutMessage);
            }

            if (isAuto)
            {
                return true;
            }
            else
            {
                if (0 > (ret = _stm32Device.setOneLedStatus(_itemIndex, req)))
                {
                    throw std::runtime_error("Failed to setOneLedStatus. Error code: " + std::to_string(ret));
                }
                else
                {
                    return true;
                }
            }
        },
        // Override get
        [this](const int&) -> int {
            int ret;
            int value;
            bool isAuto = true;

            try {
                baseMutex::Lock lock(_stm32Device.ledAutoMutex, std::chrono::milliseconds(BASE_MTX_TRY_LOCK_TIMEOUT));
                switch (_itemIndex)
                {
                    case ELED3:
                    case ELED2:
                        // Pump1
                        isAuto = _stm32Device.pump1LedState.bIsAutomaticMode;
                        break;
                    case ELED1:
                    case ELED4:
                        // Pump2
                        isAuto = _stm32Device.pump2LedState.bIsAutomaticMode;
                        break;
                    case ELED5:
                    case ELED6:
                        // Pump3
                        isAuto = _stm32Device.pump3LedState.bIsAutomaticMode;
                        break;
                    default:
                        break;
                }
                lock.unlock();
            } catch (const std::runtime_error& e) {
                std::string throwOutMessage = e.what();
                throw std::runtime_error("Failed to lock ledAutoMutex: " + throwOutMessage);
            }

            if (0 > (ret = _stm32Device.getOneLedStatus(_itemIndex, value)))
            {
                throw std::runtime_error("Failed to get LED status. Error code: " + std::to_string(ret));
            }
            else
            {
                if (isAuto)
                {
                    value |= (1 << LED_AUTO_OFFSET);
                }
                else
                {
                    value &= ~(1 << LED_AUTO_OFFSET);
                }
                return value;
            }
        }
    );
    initialize();
}

sysBoardInfoInterface::sysBoardInfoInterface(boost::asio::io_service& io,
                        std::shared_ptr<sdbusplus::asio::connection> conn,
                        STM32io& stm32Device, EsysBoardInfoItem itemIndex, const std::string& objName) :
                            STM32ObjInterface(io, conn, stm32Device, STM32_DBUS_INTERFACE, std::string("SystemInfo/") + objName),
                            _itemIndex(itemIndex),
                            _stm32Device(stm32Device)
{
    switch (_itemIndex)
    {
        case (EFW_VER):
            register_property("Value", std::string(),
                // Override set
                [this](const std::string&, std::string&) -> bool {
                    throw std::runtime_error("Not support");
                },
                // Override get
                [this](const std::string&) -> std::string {
                    // throw std::runtime_error("Not support");
                    int ret = 0;
                    std::variant<int, std::string> value;
                    std::string fwVer;
                    if (0 > (ret = _stm32Device.getOneSysBoardInfo(_itemIndex, value)))
                    {
                        throw std::runtime_error("Failed to get SysBoardInfo. Error code: " + std::to_string(ret));
                    }
                    else
                    {
                        fwVer = std::get<std::string>(value);
                    }
                    return fwVer;
                }
            );
            break;
        case (ELIB_VER):
            register_property("Value", std::string(),
                // Override set
                [this](const std::string&, std::string&) -> bool {
                    throw std::runtime_error("Not support");
                },
                // Override get
                [this](const std::string&) -> std::string {
                    int ret = 0;
                    // throw std::runtime_error("Not support");
                    std::variant<int, std::string> value;
                    std::string libVer;
                    if (0 > (ret = _stm32Device.getOneSysBoardInfo(_itemIndex, value)))
                    {
                        throw std::runtime_error("Failed to get SysBoardInfo. Error code: " + std::to_string(ret));
                    }
                    else
                    {
                        libVer = std::get<std::string>(value);
                    }
                    return libVer;
                }
            );
            break;
        case (ETEMP):
            register_property("Value", int(),
                // Override set
                [this](const int&, int&) -> bool {
                    throw std::runtime_error("Not support");
                },
                // Override get
                [this](const int&) -> int {
                    int ret = 0;
                    std::variant<int, std::string> value;
                    int sysBoardTemp;
                    if (0 > (ret = _stm32Device.getOneSysBoardInfo(_itemIndex, value)))
                    {
                        throw std::runtime_error("Failed to get SysBoardInfo. Error code: " + std::to_string(ret));
                    }
                    else
                    {
                        sysBoardTemp = std::get<int>(value);
                    }
                    return sysBoardTemp;
                }
            );
            break;
        default:
            return;
    }
    initialize();
}

pumpInterface::pumpInterface(boost::asio::io_service& io,
                        std::shared_ptr<sdbusplus::asio::connection> conn,
                        STM32io& stm32Device, EpumpDevice itemIndex, const std::string& objName) :
                            STM32ObjInterface(io, conn, stm32Device, STM32_DBUS_INTERFACE, std::string("Pump/") + objName),
                            _itemIndex(itemIndex),
                            _stm32Device(stm32Device)
{
    register_property("Value", int(),
        // Override set
        [this](const int& req, int&) -> bool {
            int ret;
            if (0 > (ret = _stm32Device.setOnePumpDevice(_itemIndex, req)))
            {
                throw std::runtime_error("Failed to setOnePumpDevice. Error code: " + std::to_string(ret));
            }
            else
            {
                return true;
            }
        },
        // Override get
        [this](const int&) -> int {
            int ret;
            int value;
            if (0 > (ret = _stm32Device.getOnePumpDevice(_itemIndex, value)))
            {
                throw std::runtime_error("Failed to getOnePumpDevice. Error code: " + std::to_string(ret));
            }
            else
            {
                return value;
            }
        }
    );
    initialize();
}

adcInterface::adcInterface(boost::asio::io_service& io,
                        std::shared_ptr<sdbusplus::asio::connection> conn,
                        STM32io& stm32Device, EadcDevice itemIndex, const std::string& objName) :
                            STM32ObjInterface(io, conn, stm32Device, STM32_DBUS_INTERFACE, std::string("ADC/") + objName),
                            _itemIndex(itemIndex),
                            _stm32Device(stm32Device)
{
    register_property("Value", int(),
        // Override set
        [this](const int& req, int&) -> bool {
            throw std::runtime_error("Not support");
            return false;
        },
        // Override get
        [this](const int&) -> int {
            int ret;
            int value;
            if (0 > (ret = _stm32Device.getOneAdcDevice(_itemIndex, value)))
            {
                throw std::runtime_error("Failed to getOneAdcDevice. Error code: " + std::to_string(ret));
            }
            else
            {
                return value;
            }
        }
    );
    initialize();
}

pt100Interface::pt100Interface(boost::asio::io_service& io,
                        std::shared_ptr<sdbusplus::asio::connection> conn,
                        STM32io& stm32Device, Ept100Device itemIndex, const std::string& objName) :
                            STM32ObjInterface(io, conn, stm32Device, STM32_DBUS_INTERFACE, std::string("PT100/") + objName),
                            _itemIndex(itemIndex),
                            _stm32Device(stm32Device)
{
    register_property("Value", int(),
        // Override set
        [this](const int& req, int&) -> bool {
            throw std::runtime_error("Not support");
            return false;
        },
        // Override get
        [this](const int&) -> int {
            int ret;
            int value;
            if (0 > (ret = _stm32Device.getOnePt100Device(_itemIndex, value)))
            {
                throw std::runtime_error("Failed to getOnePt100Device. Error code: " + std::to_string(ret));
            }
            else
            {
                return value;
            }
        }
    );
    initialize();
}

intputGpioInterface::intputGpioInterface(boost::asio::io_service& io,
                        std::shared_ptr<sdbusplus::asio::connection> conn,
                        STM32io& stm32Device, EinputGpioDevice itemIndex, const std::string& objName) :
                            STM32ObjInterface(io, conn, stm32Device, STM32_DBUS_INTERFACE, std::string("GPIO/") + objName),
                            _itemIndex(itemIndex),
                            _stm32Device(stm32Device)
{
    register_property("Value", int(),
        // Override set
        [this](const int& req, int&) -> bool {
            throw std::runtime_error("Not support");
            return false;
        },
        // Override get
        [this](const int&) -> int {
            int ret;
            int value;
            if (0 > (ret = _stm32Device.getOneInputGpioDevice(_itemIndex, value)))
            {
                throw std::runtime_error("Failed to getOneInputGpioDevice. Error code: " + std::to_string(ret));
            }
            else
            {
                return value;
            }
        }
    );
    initialize();
}

#if HAS_FAN_DEV
fanInterface::fanInterface(boost::asio::io_service& io,
                        std::shared_ptr<sdbusplus::asio::connection> conn,
                        STM32io& stm32Device, EfanDevice itemIndex, const std::string& objName) :
                            STM32ObjInterface(io, conn, stm32Device, STM32_DBUS_INTERFACE, std::string("FAN/") + objName),
                            _itemIndex(itemIndex),
                            _stm32Device(stm32Device)
{

    register_property("Value", int(),
        // Override set
        [this](const int& req, int& propertyValue) -> bool {
            int ret;
            if (0 > (ret = _stm32Device.setOneFanStatus(_itemIndex, req)))
            {
                throw std::runtime_error("Failed to setOneFanStatus. Error code: " + std::to_string(ret));
            }
            else
            {
                return true;
            }
        },
        // Override get
        [this](const int&) -> int {
            int ret;
            int value;
            if (0 > (ret = _stm32Device.getOneFanStatus(_itemIndex, value)))
            {
                throw std::runtime_error("Failed to getOneFanStatus. Error code: " + std::to_string(ret));
            }
            else
            {
                return value;
            }
        }
    );
    initialize();
}
#endif

#if HAS_BOXER_PUMP
boxerPumpInterface::boxerPumpInterface(boost::asio::io_service& io,
                        std::shared_ptr<sdbusplus::asio::connection> conn,
                        STM32io& stm32Device, EboxerPumpDevice itemIndex, const std::string& objName) :
                            STM32ObjInterface(io, conn, stm32Device, STM32_DBUS_INTERFACE, std::string("BoxerPump/") + objName),
                            _itemIndex(itemIndex),
                            _stm32Device(stm32Device)
{d

    register_property("Value", int(),
        // Override set
        [this](const int& req, int& propertyValue) -> bool {
            int ret;
            if (0 > (ret = _stm32Device.setOneBoxerPumpStatus(_itemIndex, req)))
            {
                throw std::runtime_error("Failed to setOneBoxerPumpStatus. Error code: " + std::to_string(ret));
            }
            else
            {
                return true;
            }
        },
        // Override get
        [this](const int&) -> int {
            int ret;
            int value;
            if (0 > (ret = _stm32Device.getOneBoxerPumpStatus(_itemIndex, value)))
            {
                throw std::runtime_error("Failed to getOneBoxerPumpStatus. Error code: " + std::to_string(ret));
            }
            else
            {
                return value;
            }
        }
    );
    initialize();
}
#endif

psu1Interface::psu1Interface(boost::asio::io_service& io,
                        std::shared_ptr<sdbusplus::asio::connection> conn,
                        STM32io& stm32Device, EpsuDevice itemIndex, const std::string& objName) :
                            STM32ObjInterface(io, conn, stm32Device, STM32_DBUS_INTERFACE, std::string("PSU1/") + objName),
                            _itemIndex(itemIndex),
                            _stm32Device(stm32Device)
{
    register_property("Value", int(),
        // Override set
        [this](const int& req, int&) -> bool {
            throw std::runtime_error("Not support");
            return false;
        },
        // Override get
        [this](const int&) -> int {
            int ret;
            int value;
            if (0 > (ret = _stm32Device.getOnePsu1Status(_itemIndex, value)))
            {
                throw std::runtime_error("Failed to getOnePsu1Status. Error code: " + std::to_string(ret));
            }
            else
            {
                return value;
            }
        }
    );
    initialize();
}

psu2Interface::psu2Interface(boost::asio::io_service& io,
                        std::shared_ptr<sdbusplus::asio::connection> conn,
                        STM32io& stm32Device, EpsuDevice itemIndex, const std::string& objName) :
                            STM32ObjInterface(io, conn, stm32Device, STM32_DBUS_INTERFACE, std::string("PSU2/") + objName),
                            _itemIndex(itemIndex),
                            _stm32Device(stm32Device)
{
    register_property("Value", int(),
        // Override set
        [this](const int& req, int&) -> bool {
            throw std::runtime_error("Not support");
            return false;
        },
        // Override get
        [this](const int&) -> int {
            int ret;
            int value;
            if (0 > (ret = _stm32Device.getOnePsu2Status(_itemIndex, value)))
            {
                throw std::runtime_error("Failed to getOnePsu2Status. Error code: " + std::to_string(ret));
            }
            else
            {
                return value;
            }
        }
    );
    initialize();
}

#if HAS_DAC_DEV
dacInterface::dacInterface(boost::asio::io_service& io,
                        std::shared_ptr<sdbusplus::asio::connection> conn,
                        STM32io& stm32Device, EdacDevice itemIndex, const std::string& objName) :
                            STM32ObjInterface(io, conn, stm32Device, STM32_DBUS_INTERFACE, std::string("DAC/") + objName),
                            _itemIndex(itemIndex),
                            _stm32Device(stm32Device)
{

    register_property("Value", int(),
        // Override set
        [this](const int& req, int& propertyValue) -> bool {
            int ret;
            if (0 > (ret = _stm32Device.setOneDacDevice(_itemIndex, req)))
            {
                throw std::runtime_error("Failed to setOneDacDevice. Error code: " + std::to_string(ret));
            }
            else
            {
                return true;
            }
        },
        // Override get
        [this](const int&) -> int {
            int ret;
            int value;
            if (0 > (ret = _stm32Device.getOneDacDevice(_itemIndex, value)))
            {
                throw std::runtime_error("Failed to getOneDacDevice. Error code: " + std::to_string(ret));
            }
            else
            {
                return value;
            }
        }
    );
    initialize();
}
#endif

#if HAS_FAN_WALL
FanWallInterface::FanWallInterface(boost::asio::io_service& io,
                        std::shared_ptr<sdbusplus::asio::connection> conn,
                        STM32io& stm32Device, EfanWallDevice itemIndex, const std::string& objName) :
                            STM32ObjInterface(io, conn, stm32Device, STM32_DBUS_INTERFACE, std::string("FanWall/") + objName),
                            _itemIndex(itemIndex),
                            _stm32Device(stm32Device)
{

    register_property("Value", int(),
        // Override set
        [this](const int& req, int& propertyValue) -> bool {
            int ret;
            if (0 > (ret = _stm32Device.setOneFanWallDevice(_itemIndex, req)))
            {
                throw std::runtime_error("Failed to setOneFanWallDevice. Error code: " + std::to_string(ret));
            }
            else
            {
                return true;
            }
        },
        // Override get
        [this](const int&) -> int {
            int ret;
            int value;
            if (0 > (ret = _stm32Device.getOneFanWallDevice(_itemIndex, value)))
            {
                throw std::runtime_error("Failed to getOneFanWallDevice. Error code: " + std::to_string(ret));
            }
            else
            {
                return value;
            }
        }
    );
    initialize();
}
#endif