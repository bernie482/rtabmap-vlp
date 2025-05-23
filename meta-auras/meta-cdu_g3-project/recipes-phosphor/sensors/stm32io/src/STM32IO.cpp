#include <iostream>
#include "STM32IO.hpp"
#include <phosphor-logging/log.hpp>

#ifdef  __cplusplus
extern "C"
{
#endif
#include "libIo.h"
#ifdef  __cplusplus
}
#endif

STM32io::STM32io(int deviceID) :
                deviceID(deviceID),
                _systemStatus {
                    1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
                    1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
                    1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
                    1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
//#if HAS_FAN_WALL
#if 0
                    1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
                    1, 1, 1,
                    0x000007FF
#else
                    1,
                    0x007FFFFF
#endif
                }
{
    if (0 != _ioHalInit()) {
        printERRLog("Initialization failed in constructor of stm32io");
        return;
    }

    // Set device default value
    if (0 != _initDevice()) {
        printERRLog("Initialization device failed in constructor of stm32io");
    }

    _updateDeviceThread = std::thread(&STM32io::_update_data, this);
    _updateAbnormalDeviceThread = std::thread(&STM32io::_update_abnormal_data, this);
    _ledAutomaticThread = std::thread(&STM32io::_led_automatic_handler, this);

    return;
}

STM32io::~STM32io()
{
    printDBGLog("The destructor of stm32io has been called");

    if (_updateDeviceThread.joinable())
    {
        _updateDeviceThread.join();
    }

    if (_updateAbnormalDeviceThread.joinable())
    {
        _updateAbnormalDeviceThread.join();
    }

    if (_ledAutomaticThread.joinable())
    {
        _ledAutomaticThread.join();
    }
    return;
}

bool STM32io::getInitState()
{
    return _bInitState;
}

int STM32io::getOneSysBoardInfo(EsysBoardInfoItem index, std::variant<int, std::string>& value)
{
    int ret = 0;

    // Get device value
    if (_dataState.systBoardInfoGetState.devState != dataState::EOK) {
        return -EIO;
    }

    switch (index)
    {
        case EFW_VER:
            value = _sysBoardInfo.firmware_ver;
            break;
        case ELIB_VER:
            value = _sysBoardInfo.lib_ver;
            break;
        case ETEMP:
            value = static_cast<int>((_sysBoardInfo.temperature * 100));
            break;
        default:
            return -ENODEV;
    }
    return 0;
}

int STM32io::setOnePumpDevice(EpumpDevice index, int value)
{
    int ret = 0;

    std::unique_lock<std::mutex> lock(setPumpMutex);
    pump_device newPumpDevice = _pumpDevice;

    switch (index)
    {
        case EPUMP_PWM_1:
            newPumpDevice.lv1 = value;
            break;
        case EPUMP_PWM_2:
            newPumpDevice.lv2 = value;
            break;
        case EPUMP_PWM_3:
            newPumpDevice.lv3 = value;
            break;
        case EPUMP_PWM_4:
            newPumpDevice.lv4 = value;
            break;
        default:
            return -ENODEV;
    }

    if (0 > (ret = _pumpDeviceSet(&newPumpDevice)))
    {
        printERRLog("_pumpDeviceSet() failed. return ", ret);
        return ret;
    }
    _pumpDevice.lv1 = newPumpDevice.lv1;
    _pumpDevice.lv2 = newPumpDevice.lv2;
    _pumpDevice.lv3 = newPumpDevice.lv3;
    _pumpDevice.lv4 = newPumpDevice.lv4;
    dumpPumpDevice(__FUNCTION__, "Set & update pump pwm data");
    lock.unlock();

    return 0;
}

int STM32io::getOnePumpDevice(EpumpDevice index, int& value)
{
    int ret = 0;

    if (index >= EPUMP_PWM_1 && index <= EPUMP_PWM_4)
    {
        // Get device setting
        if (_dataState.pumpSetDataState.devState != dataState::EOK) {
            return -EIO;
        }
    }
    else if (index >= EPUMP_SPEED_1 && index <= EPUMP_SPEED_4)
    {
        // Get device value
        if (_dataState.pumpGetDataState.devState != dataState::EOK) {
            return -EIO;
        }
    }

    switch (index)
    {
        case EPUMP_PWM_1:
            value = _pumpDevice.lv1;
            break;
        case EPUMP_PWM_2:
            value = _pumpDevice.lv2;
            break;
        case EPUMP_PWM_3:
            value = _pumpDevice.lv3;
            break;
        case EPUMP_PWM_4:
            value = _pumpDevice.lv4;
            break;
        case EPUMP_SPEED_1:
            value = _pumpDevice.speed[0];
            break;
        case EPUMP_SPEED_2:
            value = _pumpDevice.speed[1];
            break;
        case EPUMP_SPEED_3:
            value = _pumpDevice.speed[2];
            break;
        case EPUMP_SPEED_4:
            value = _pumpDevice.speed[3];
            break;
        default:
            return -ENODEV;
    }

    return 0;
}

int STM32io::getOneAdcDevice(EadcDevice index, int& value)
{
    int ret = 0;

    // Get device value
    if (_dataState.adcGetDataState.devState != dataState::EOK) {
        return -EIO;
    }

    switch (index)
    {
        case EADC_PRESSURE_1:
            value = _adcDevice.pressure1;
            break;
        case EADC_PRESSURE_2:
            value = _adcDevice.pressure2;
            break;
        case EADC_PRESSURE_3:
            value = _adcDevice.pressure3;
            break;
        case EADC_PRESSURE_DROP:
            value = (_adcDevice.pressure2 - _adcDevice.pressure1);
            break;
        case EADC_FLOW_1:
            value = (_adcDevice.flow1 * 100);
            break;
        case EADC_FLOW_2:
            value = (_adcDevice.flow2 * 100);
            break;
        case EADC_FLOW_3:
            value = (_adcDevice.flow3 * 100);
            break;
        case EADC_TEMP_1:
            value = (_adcDevice.temperature1 * 100);
            break;
        case EADC_TEMP_2:
            value = (_adcDevice.temperature2 * 100);
            break;
        case EADC_TEMP_3:
            value = (_adcDevice.temperature3 * 100);
            break;
        case EADC_TEMP_4:
            value = (_adcDevice.temperature4 * 100);
            break;
        default:
            return -ENODEV;
    }

    return 0;
}

int STM32io::getOnePt100Device(Ept100Device index, int& value)
{
    int ret = 0;

    // Get device value
    if (_dataState.pt100GetDataState.devState != dataState::EOK) {
        return -EIO;
    }

    switch (index)
    {
        case EPT100_TEMP:
            value = (_pt100Device.temperature * 100);
            break;
        default:
            return -ENODEV;
    }

    return 0;
}

int STM32io::getOneInputGpioDevice(EinputGpioDevice index, int& value)
{
    int ret = 0;

    // Get device value
    if (_dataState.inputGpioGetDataState.devState != dataState::EOK) {
        return -EIO;
    }

    switch (index)
    {
        case EGPIO_BUTTON:
            value = _inputGpioStatus.button;
            break;
        case EGPIO_LV1:
            value = _inputGpioStatus.lv1;
            break;
        case EGPIO_LV2:
            value = _inputGpioStatus.lv2;
            break;
        case EGPIO_LV3:
            value = _inputGpioStatus.lv3;
            break;
        case EGPIO_WATER_DETECT1:
            value = _inputGpioStatus.water_detect1;
            break;
        case EGPIO_WATER_DETECT2:
            value = _inputGpioStatus.water_detect2;
            break;
        default:
            return -ENODEV;
    }

    return 0;
}

int STM32io::getOneLedStatus(EledDevice index, int& value)
{
    int ret = 0;

    // Get device value
    if (_dataState.ledGetDataState.devState != dataState::EOK) {
        return -EIO;
    }

    switch (index) {
        case ELED1:
            value = _ledStatus.led1;
            break;
        case ELED2:
            value = _ledStatus.led2;
            break;
        case ELED3:
            value = _ledStatus.led3;
            break;
        case ELED4:
            value = _ledStatus.led4;
            break;
        case ELED5:
            value = _ledStatus.led5;
            break;
        case ELED6:
            value = _ledStatus.led6;
            break;
        case ELED7:
            value = _ledStatus.led7;
            break;
        default:
            ret = -ENODEV;
    };

    return ret;
}

int STM32io::setOneLedStatus(EledDevice index, int value)
{
    int ret = 0;

    std::unique_lock<std::mutex> lock(setLedMutex);
    led_status newLedStatus;

    if ((index < 0) && (index >= ELED_MAX))
    {
        printERRLog("Invalid index %d", index);
        return -ENODEV;
    }

    if (value != LED_OFF && value != LED_ON && value != LED_FLASH)
    {
        printERRLog("Invalid value %d", value);
        return -ENODEV;
    }

    newLedStatus = _ledStatus;
    switch (index) {
        case ELED1:
            newLedStatus.led1 = value;
            break;
        case ELED2:
            newLedStatus.led2 = value;
            break;
        case ELED3:
            newLedStatus.led3 = value;
            break;
        case ELED4:
            newLedStatus.led4 = value;
            break;
        case ELED5:
            newLedStatus.led5 = value;
            break;
        case ELED6:
            newLedStatus.led6 = value;
            break;
        case ELED7:
            newLedStatus.led7 = value;
            break;
        default:
            ret = -ENODEV;
    };

    if (0 > (ret = _ledStatusSet(&newLedStatus)))
    {
        printERRLog("_ledStatusSet() failed. return ", ret);
        return ret;
    }

    _ledStatus = newLedStatus;
    dumpLedStatus(__FUNCTION__, "Set & update LED data");
    lock.unlock();

    return 0;
}

#if HAS_FAN_DEV
int STM32io::getOneFanStatus(EfanDevice index, int& value)
{
    int ret = 0;

    if (index >= EFAN_PWM_1_4 && index <= EFAN_PWM_9_12)
    {
        // Get device setting
        if (_dataState.fanSetDataState.devState != dataState::EOK) {
            return -EIO;
        }
    }
    else if (index >= EFAN_SPEED_1 && index <= EFAN_SPEED_11)
    {
        // Get device value
        if (_dataState.fanGetDataState.devState != dataState::EOK) {
            return -EIO;
        }
    }

    switch (index) {
        case EFAN_PWM_1_4:
            value = _fanDevice.lv1_4;
            break;
        case EFAN_PWM_5_8:
            value = _fanDevice.lv5_8;
            break;
        case EFAN_PWM_9_12:
            value = _fanDevice.lv9_12;
            break;
        case EFAN_SPEED_1:
        case EFAN_SPEED_2:
        case EFAN_SPEED_3:
        case EFAN_SPEED_4:
        case EFAN_SPEED_5:
        case EFAN_SPEED_6:
        case EFAN_SPEED_7:
        case EFAN_SPEED_8:
        case EFAN_SPEED_9:
        case EFAN_SPEED_10:
        case EFAN_SPEED_11:
            value = _fanDevice.speed[index - EFAN_SPEED_1];
            break;
        default:
            ret = -ENODEV;
    };

    return ret;
}

int STM32io::setOneFanStatus(EfanDevice index, int value)
{
    int ret = 0;

    std::unique_lock<std::mutex> lock(setFanDevMutex);
    fan_device newFanDevice = _fanDevice;

    switch (index) {
        case EFAN_PWM_1_4:
            newFanDevice.lv1_4 = value;
            break;
        case EFAN_PWM_5_8:
            newFanDevice.lv5_8 = value;
            break;
        case EFAN_PWM_9_12:
            newFanDevice.lv9_12 = value;
            break;
        default:
            return -ENODEV;
    };

    if (0 > (ret = _fanDeviceSet(&newFanDevice)))
    {
        printERRLog(__FUNCTION__, "_fanDeviceSet() failed. return ", ret);
        return ret;
    }

    _fanDevice.lv1_4 = newFanDevice.lv1_4;
    _fanDevice.lv5_8 = newFanDevice.lv5_8;
    _fanDevice.lv9_12 = newFanDevice.lv9_12;
    dumpFanDevice(__FUNCTION__, "Set & update fan pwm data");
    lock.unlock();

    return ret;
}
#endif

#if HAS_BOXER_PUMP
int STM32io::getOneBoxerPumpStatus(EboxerPumpDevice index, int& value)
{
    int ret = 0;

    if (index == EBOXER_PUMP_PWM)
    {
        // Get device setting
        if (_dataState.boxerPumpSetDataState.devState != dataState::EOK) {
            return -EIO;
        }
    }
    else if (index == EBOXER_PUMP_SPEED)
    {
        // Get device value
        if (_dataState.boxerPumpGetDataState.devState != dataState::EOK) {
            return -EIO;
        }
    }

    switch (index) {
        case EBOXER_PUMP_PWM:
            value = _boxerPumpDevice.lv;
            break;
        case EBOXER_PUMP_SPEED:
            value = _boxerPumpDevice.speed;
            break;
        default:
            ret = -ENODEV;
    };

    return ret;
}

int STM32io::setOneBoxerPumpStatus(EboxerPumpDevice index, int value)
{
    int ret = 0;

    std::unique_lock<std::mutex> lock(setBoxerPumpMutex);
    boxer_pump_device newBoxerPumpDevice = _boxerPumpDevice;

    switch (index) {
        case EBOXER_PUMP_PWM:
            newBoxerPumpDevice.lv = value;
            break;
        default:
            return -ENODEV;
    };

    if (0 > (ret = _boxerPumpDeviceSet(&newBoxerPumpDevice)))
    {
        printERRLog(__FUNCTION__, "_boxerPumpDeviceSet() failed. return ", ret);
        return ret;
    }

    _boxerPumpDevice.lv = newBoxerPumpDevice.lv;
    dumpBoxerPumpDevice(__FUNCTION__, "Set & update boxer pump pwm data");
    lock.unlock();

    return ret;
}
#endif

int STM32io::getOnePsu1Status(EpsuDevice index, int& value)
{
    int ret = 0;

    // Get device value
    if (_dataState.psu1GetDataState.devState != dataState::EOK) {
        return -EIO;
    }

    switch (index) {
        case EPSU_TOTAL_WATT:
            value = _psu1Device.totalWatt;
            break;
        case EPSU_VOL:
            value = _psu1Device.vol;
            break;
        case EPSU_CUR:
            value = _psu1Device.cur;
            break;
        default:
            ret = -ENODEV;
    };

    return ret;
}

int STM32io::getOnePsu2Status(EpsuDevice index, int& value)
{
    int ret = 0;

    // Get device value
    if (_dataState.psu2GetDataState.devState != dataState::EOK) {
        return -EIO;
    }

    switch (index) {
        case EPSU_TOTAL_WATT:
            value = _psu2Device.totalWatt;
            break;
        case EPSU_VOL:
            value = _psu2Device.vol;
            break;
        case EPSU_CUR:
            value = _psu2Device.cur;
            break;
        default:
            ret = -ENODEV;
    };

    return ret;
}

#if HAS_DAC_DEV
int STM32io::getOneDacDevice(EdacDevice index, int& value)
{
    int ret = 0;

    // Get device value
    if (_dataState.dacGetDataState.devState != dataState::EOK) {
        return -EIO;
    }

    switch (index) {
        case EDAC_MVOL:
            value = _dacDevice.mVol;
            break;
        default:
            ret = -ENODEV;
    };

    return ret;
}

int STM32io::setOneDacDevice(EdacDevice index, int value)
{
    int ret = 0;

    std::unique_lock<std::mutex> lock(setDACMutex);
    dac_device tmpDacDevice = _dacDevice;

    switch (index) {
        case EDAC_MVOL:
            tmpDacDevice.mVol = value;
            break;
        default:
            ret = -ENODEV;
    };

    if (0 > (ret = _dacDeviceSet(&tmpDacDevice)))
    {
        printERRLog(__FUNCTION__, "_dacDeviceSet() failed. return ", ret);
        return ret;
    }

    _dacDevice.mVol = tmpDacDevice.mVol;
    dumpDacDevice(__FUNCTION__, "Set & update dac data");
    lock.unlock();

    return ret;
}
#endif

#if HAS_FAN_WALL
int STM32io::setOneFanWallDevice(EfanWallDevice index, int value)
{
    int ret = 0;

    std::unique_lock<std::mutex> lock(setFanWallMutex);
    fan_wall_dev_ctrl newFanWallCtrlDevice = _fanWallCtrlDevice;

    switch (index) {
        case EFAN_WALL_LV1_2:
            newFanWallCtrlDevice.lv1_2 = value;
            break;
        case EFAN_WALL_LV3_5:
            newFanWallCtrlDevice.lv3_5 = value;
            break;
        default:
            return -ENODEV;
    };

    if (0 > (ret = _fanWallDeviceSet(&newFanWallCtrlDevice)))
    {
        printERRLog(__FUNCTION__, "_fanWallDeviceSet() failed. return ", ret);
        return ret;
    }

    _fanWallCtrlDevice.lv1_2 = newFanWallCtrlDevice.lv1_2;
    _fanWallCtrlDevice.lv3_5 = newFanWallCtrlDevice.lv3_5;
    dumpSetFanWallDevice(__FUNCTION__, "Set & update fan wall data");
    lock.unlock();

    return ret;
}

int STM32io::getOneFanWallDevice(EfanWallDevice index, int& value)
{
    int ret = 0;

    if (index >= EFAN_WALL_LV1_2 && index <= EFAN_WALL_LV3_5)
    {
        // Get device setting
        if (_dataState.fanWallSetDataState.devState != dataState::EOK) {
            return -EIO;
        }
    }
    else if (index >= EFAN_WALL_SPEED_1 && index <= EFAN_WALL_WATER_DETECT)
    {
        // Get device value
        if (_dataState.fanWallGetDataState.devState != dataState::EOK) {
            return -EIO;
        }
    }

    switch (index) {
        case EFAN_WALL_LV1_2:
            value = _fanWallCtrlDevice.lv1_2;
            break;
        case EFAN_WALL_LV3_5:
            value = _fanWallCtrlDevice.lv3_5;
            break;
        case EFAN_WALL_SPEED_1:
        case EFAN_WALL_SPEED_2:
        case EFAN_WALL_SPEED_3:
        case EFAN_WALL_SPEED_4:
        case EFAN_WALL_SPEED_5:
            value = _fanWallStatus.speed[index - EFAN_WALL_SPEED_1];
            break;
        case EFAN_WALL_AIR_FLOW_1:
        case EFAN_WALL_AIR_FLOW_2:
        case EFAN_WALL_AIR_FLOW_3:
        case EFAN_WALL_AIR_FLOW_4:
        case EFAN_WALL_AIR_FLOW_5:
            value = _fanWallStatus.air_flow[index - EFAN_WALL_AIR_FLOW_1];
            break;
        case EFAN_WALL_Total_AIR_FLOW:
            value = 0;
            for (int i = 0; i < 5; i++)
            {
                value += _fanWallStatus.air_flow[i];
            }
            break;
        case EFAN_WALL_STATUS_1:
        case EFAN_WALL_STATUS_2:
        case EFAN_WALL_STATUS_3:
        case EFAN_WALL_STATUS_4:
        case EFAN_WALL_STATUS_5:
            value = _fanWallStatus.status[index - EFAN_WALL_STATUS_1];
            break;
        case EFAN_WALL_PT100:
            value = (_fanWallStatus.pt100 * 100);
            break;
        case EFAN_WALL_WATER_DETECT:
            value = _fanWallStatus.water_detect;
            break;
        default:
            ret = -ENODEV;
    };

    return ret;
}
#endif

template <typename... Args>
void STM32io::printDBGLog(const std::string& log_message, Args... args)
{
    std::chrono::system_clock::time_point now;
    std::time_t timestamp;
    if (bDbgLogFlag == false) {
        return;
    }

    now = std::chrono::system_clock::now();
    timestamp = std::chrono::system_clock::to_time_t(now);

    std::chrono::duration<double> fractional_seconds = now - std::chrono::time_point_cast<std::chrono::seconds>(now);

    std::tm* local_time = std::localtime(&timestamp);

    std::ostringstream log_stream;
    log_stream << "["
                << std::put_time(local_time, "%Y-%m-%d %H:%M:%S")
#if MS_LEVEL_LOG
                << '.' << std::setw(3) << std::setfill('0') << static_cast<int>(fractional_seconds.count() * 1000)
#endif
                << "] "
                << "STM32IO_" << deviceID << ": " << log_message;

    _print_log_helper(log_stream, args...);
    if (bSaveToFile == true) {
        save_log_to_file(log_stream.str());
    } else {
        std::cout << log_stream.str() << std::endl;
    }
}

template <typename... Args>
void STM32io::printERRLog(const std::string& log_message, Args... args)
{
    std::chrono::system_clock::time_point now = std::chrono::system_clock::now();
    std::time_t timestamp = std::chrono::system_clock::to_time_t(now);

    std::chrono::duration<double> fractional_seconds = now - std::chrono::time_point_cast<std::chrono::seconds>(now);

    std::tm* local_time = std::localtime(&timestamp);

    std::ostringstream log_stream;
    log_stream << "["
                << std::put_time(local_time, "%Y-%m-%d %H:%M:%S")
#if MS_LEVEL_LOG
                << '.' << std::setw(3) << std::setfill('0') << static_cast<int>(fractional_seconds.count() * 1000)
#endif
                << "] "
                << "STM32IO_" << deviceID << ": " << log_message;
    _print_log_helper(log_stream, args...);
    if (bSaveToFile == true) {
        save_log_to_file(log_stream.str());
    } else {
        std::cerr << log_stream.str() << std::endl;
    }
}

// For debug
void STM32io::dumpSysBoardInfo(std::string funName, std::string log_message)
{
    if (bPrintDataUpdated == false) {
        printDBGLog(funName, "() ", log_message);
        return;
    }

    printDBGLog(funName, "() ", log_message, ">>====================>>");
    printDBGLog("_sysBoardInfo.firmware_ver = ", _sysBoardInfo.firmware_ver);
    printDBGLog("_sysBoardInfo.lib_ver = ", _sysBoardInfo.lib_ver);
    printDBGLog("_sysBoardInfo.temperature = ", _sysBoardInfo.temperature);
    printDBGLog(funName, "() ", log_message, "<<====================<<");

    return;
}

void STM32io::dumpLedStatus(std::string funName, std::string log_message)
{
    if (bPrintDataUpdated == false) {
        printDBGLog(funName, "() ", log_message);
        return;
    }

    printDBGLog(funName, "() ", log_message, ">>====================>>");
    printDBGLog("_ledStatus.led1 = ", static_cast<int>(_ledStatus.led1));
    printDBGLog("_ledStatus.led2 = ", static_cast<int>(_ledStatus.led2));
    printDBGLog("_ledStatus.led3 = ", static_cast<int>(_ledStatus.led3));
    printDBGLog("_ledStatus.led4 = ", static_cast<int>(_ledStatus.led4));
    printDBGLog("_ledStatus.led5 = ", static_cast<int>(_ledStatus.led5));
    printDBGLog("_ledStatus.led6 = ", static_cast<int>(_ledStatus.led6));
    printDBGLog("_ledStatus.led7 = ", static_cast<int>(_ledStatus.led7));
    printDBGLog(funName, "() ", log_message, "<<====================<<");

    return;
}

void STM32io::dumpPumpDevice(std::string funName, std::string log_message)
{
    int size, i;
    if (bPrintDataUpdated == false) {
        printDBGLog(funName, "() ", log_message);
        return;
    }

    printDBGLog(funName, "() ", log_message, ">>====================>>");
    printDBGLog("_pumpDevice.lv1 = ", static_cast<int>(_pumpDevice.lv1));
    printDBGLog("_pumpDevice.lv2 = ", static_cast<int>(_pumpDevice.lv2));
    printDBGLog("_pumpDevice.lv3 = ", static_cast<int>(_pumpDevice.lv3));
    printDBGLog("_pumpDevice.lv4 = ", static_cast<int>(_pumpDevice.lv4));
    size = sizeof(_pumpDevice.speed) / sizeof(_pumpDevice.speed[0]);
    for (i = 0; i < size; i++)
    {
        printDBGLog("_pumpDevice.speed[", i + 1, "] = ", _pumpDevice.speed[i]);
    }
    printDBGLog(funName, "() ", log_message, "<<====================<<");

    return;
}

#if HAS_FAN_DEV
void STM32io::dumpFanDevice(std::string funName, std::string log_message)
{
    int size, i;
    if (bPrintDataUpdated == false) {
        printDBGLog(funName, "() ", log_message);
        return;
    }

    printDBGLog(funName, "() ", log_message, ">>====================>>");
    printDBGLog("_fanDevice.lv1_4 = ", static_cast<int>(_fanDevice.lv1_4));
    printDBGLog("_fanDevice.lv5_8 = ", static_cast<int>(_fanDevice.lv5_8));
    printDBGLog("_fanDevice.lv9_12 = ", static_cast<int>(_fanDevice.lv9_12));
    size = sizeof(_fanDevice.speed) / sizeof(_fanDevice.speed[0]);
    for (i = 0; i < size; i++)
    {
        printDBGLog("_fanDevice.speed[", i + 1, "] = ", _fanDevice.speed[i]);
    }
    printDBGLog(funName, "() ", log_message, "<<====================<<");

    return;
}
#endif

#if HAS_BOXER_PUMP
void STM32io::dumpBoxerPumpDevice(std::string funName, std::string log_message)
{
    if (bPrintDataUpdated == false) {
        printDBGLog(funName, "() ", log_message);
        return;
    }

    printDBGLog(funName, "() ", log_message, ">>====================>>");
    printDBGLog("_boxerPumpDevice.lv = ", static_cast<int>(_boxerPumpDevice.lv));
    printDBGLog("_boxerPumpDevice.speed = ", _boxerPumpDevice.speed);
    printDBGLog(funName, "() ", log_message, "<<====================<<");

    return;
}
#endif

void STM32io::dumpInputGpio(std::string funName, std::string log_message)
{
    if (bPrintDataUpdated == false) {
        printDBGLog(funName, "() ", log_message);
        return;
    }

    printDBGLog(funName, "() ", log_message, ">>====================>>");
    printDBGLog("_inputGpioStatus.button = ", static_cast<int>(_inputGpioStatus.button));
    printDBGLog("_inputGpioStatus.lv1 = ", static_cast<int>(_inputGpioStatus.lv1));
    printDBGLog("_inputGpioStatus.lv2 = ", static_cast<int>(_inputGpioStatus.lv2));
    printDBGLog("_inputGpioStatus.lv3 = ", static_cast<int>(_inputGpioStatus.lv3));
    printDBGLog("_inputGpioStatus.water_detect1 = ", static_cast<int>(_inputGpioStatus.water_detect1));
    printDBGLog("_inputGpioStatus.water_detect2 = ", static_cast<int>(_inputGpioStatus.water_detect2));
    printDBGLog(funName, "() ", log_message, "<<====================<<");

    return;
}

void STM32io::dumpAdcDevice(std::string funName, std::string log_message)
{
    if (bPrintDataUpdated == false) {
        printDBGLog(funName, "() ", log_message);
        return;
    }

    printDBGLog(funName, "() ", log_message, ">>====================>>");
    printDBGLog("_adcDevice.pressure1 = ", _adcDevice.pressure1);
    printDBGLog("_adcDevice.pressure2 = ", _adcDevice.pressure2);
    printDBGLog("_adcDevice.pressure3 = ", _adcDevice.pressure3);
    printDBGLog("_adcDevice.flow1 = ", _adcDevice.flow1);
    printDBGLog("_adcDevice.flow2 = ", _adcDevice.flow2);
    printDBGLog("_adcDevice.flow3 = ", _adcDevice.flow3);
    printDBGLog("_adcDevice.temperature1 = ", _adcDevice.temperature1);
    printDBGLog("_adcDevice.temperature2 = ", _adcDevice.temperature2);
    printDBGLog("_adcDevice.temperature3 = ", _adcDevice.temperature3);
    printDBGLog("_adcDevice.temperature4 = ", _adcDevice.temperature4);
    printDBGLog(funName, "() ", log_message, "<<====================<<");

    return;
}

void STM32io::dumpPt100Device(std::string funName, std::string log_message)
{
    if (bPrintDataUpdated == false) {
        printDBGLog(funName, "() ", log_message);
        return;
    }

    printDBGLog(funName, "() ", log_message, ">>====================>>");
    printDBGLog("_pt100Device.temperature = ", _pt100Device.temperature);
    printDBGLog(funName, "() ", log_message, "<<====================<<");

    return;
}

#if HAS_DAC_DEV
void STM32io::dumpDacDevice(std::string funName, std::string log_message)
{
    if (bPrintDataUpdated == false) {
        printDBGLog(funName, "() ", log_message);
        return;
    }

    printDBGLog(funName, "() ", log_message, ">>====================>>");
    printDBGLog("_dacDevice.mVol = ", static_cast<int>(_dacDevice.mVol));
    printDBGLog(funName, "() ", log_message, "<<====================<<");

    return;
}
#endif

void STM32io::dumpPsu1Device(std::string funName, std::string log_message)
{
    if (bPrintDataUpdated == false) {
        printDBGLog(funName, "() ", log_message);
        return;
    }

    printDBGLog(funName, "() ", log_message, ">>====================>>");
    printDBGLog("_psu1Device.totalWatt = ", _psu1Device.totalWatt);
    printDBGLog("_psu1Device.vol = ", _psu1Device.vol);
    printDBGLog("_psu1Device.cur = ", _psu1Device.cur);
    printDBGLog(funName, "() ", log_message, "<<====================<<");

    return;
}

void STM32io::dumpPsu2Device(std::string funName, std::string log_message)
{
    if (bPrintDataUpdated == false) {
        printDBGLog(funName, "() ", log_message);
        return;
    }

    printDBGLog(funName, "() ", log_message, ">>====================>>");
    printDBGLog("_psu2Device.totalWatt = ", _psu2Device.totalWatt);
    printDBGLog("_psu2Device.vol = ", _psu2Device.vol);
    printDBGLog("_psu2Device.cur = ", _psu2Device.cur);
    printDBGLog(funName, "() ", log_message, "<<====================<<");

    return;
}

#if HAS_FAN_WALL
void STM32io::dumpSetFanWallDevice(std::string funName, std::string log_message)
{
    if (bPrintDataUpdated == false) {
        printDBGLog(funName, "() ", log_message);
        return;
    }

    printDBGLog(funName, "() ", log_message, ">>====================>>");
    printDBGLog("_fanWallCtrlDevice.lv1_2 = ", static_cast<int>(_fanWallCtrlDevice.lv1_2));
    printDBGLog("_fanWallCtrlDevice.lv3_5 = ", static_cast<int>(_fanWallCtrlDevice.lv3_5));
    printDBGLog(funName, "() ", log_message, "<<====================<<");

    return;
}

void STM32io::dumpGetFanWallDevice(std::string funName, std::string log_message)
{
    if (bPrintDataUpdated == false) {
        printDBGLog(funName, "() ", log_message);
        return;
    }

    printDBGLog(funName, "() ", log_message, ">>====================>>");
    printDBGLog("_fanWallStatus.speed[0] ", _fanWallStatus.speed[0]);
    printDBGLog("_fanWallStatus.speed[1] ", _fanWallStatus.speed[1]);
    printDBGLog("_fanWallStatus.speed[2] ", _fanWallStatus.speed[2]);
    printDBGLog("_fanWallStatus.speed[3] ", _fanWallStatus.speed[3]);
    printDBGLog("_fanWallStatus.speed[4] ", _fanWallStatus.speed[4]);
    printDBGLog("_fanWallStatus.air_flow[0] ", _fanWallStatus.air_flow[0]);
    printDBGLog("_fanWallStatus.air_flow[1] ", _fanWallStatus.air_flow[1]);
    printDBGLog("_fanWallStatus.air_flow[2] ", _fanWallStatus.air_flow[2]);
    printDBGLog("_fanWallStatus.air_flow[3] ", _fanWallStatus.air_flow[3]);
    printDBGLog("_fanWallStatus.air_flow[4] ", _fanWallStatus.air_flow[4]);
    printDBGLog("_fanWallStatus.pt100 ", _fanWallStatus.pt100);
    printDBGLog("_fanWallStatus.water_detect ", static_cast<int>(_fanWallStatus.water_detect));
    printDBGLog(funName, "() ", log_message, "<<====================<<");

    return;
}
#endif

// STM32io Private

// Helper function implementation
template <typename T, typename... Args>
void STM32io::_print_log_helper(std::ostringstream& log_stream, T arg, Args... args)
{
    log_stream << "" << arg;
    _print_log_helper(log_stream, args...);
}

// Base case for recursion
void STM32io::_print_log_helper(std::ostringstream& log_stream)
{
}

void STM32io::_update_data()
{
    int ret, size, i;
    bool bInitFlag = false;
    pump_device tmpPumpDevice;
#if HAS_FAN_DEV
    fan_device tmpFanDevice;
#endif
#if HAS_BOXER_PUMP
    boxer_pump_device tmpBoxerPumpDevice;
#endif
    input_gpio tmpInputGpioStatus;
    adc_device tmpAdcDevice;
    pt100_device tmpPt100Device;
    psu_device tmpPsu1Device;
    psu_device tmpPsu2Device;
    system_board_info tmpSysBoardInfo;
    led_status tmpLedStatus;
#if HAS_DAC_DEV
    //! HAL not implemented dacDeviceGet
    // dac_device tmpDacDevice;
#endif
#if HAS_FAN_WALL
    fan_wall_dev_status tmpFanWallStatus;
#endif

    while(1)
    {
        if (false == _bInitState)
        {
            printERRLog("_bInitState is false.");
            boost::this_thread::sleep_for(boost::chrono::milliseconds(DEF_RETRY_INTERVAL));
            continue;
        }

        // Only update LED and DAC data when the first time
        if (bInitFlag == false)
        {
            bInitFlag = true;
            printDBGLog("Initialization device data");
            if (0 > (ret = _ledStatusGet(&tmpLedStatus)))
            {
                printERRLog(__FUNCTION__, "() _ledStatusGet() failed. ret = ", ret);
                bInitFlag = false;
            }
            else
            {
                _ledStatus = tmpLedStatus;
                dumpLedStatus(__FUNCTION__, "Update LED data");
            }

#if HAS_DAC_DEV
            //! HAL not implemented dacDeviceGet
            // if (0 > (ret = _dacDeviceGet(&tmpDacDevice)))
            // {
            //     printERRLog(__FUNCTION__, "() _dacDeviceGet() failed. ret = ", ret);
            //     bInitFlag = false;
            // }
            // else
            // {
            //     _dacDevice.mVol = tmpDacDevice.mVol;
            //     dumpDacDevice(__FUNCTION__, "Update dac data");
            // }
#endif
        }

        // !REMOVE, Need to remove the following force update
        if (1 || _systemStatus.pump1_speed || _systemStatus.pump2_speed || _systemStatus.pump3_speed)
        {
            if (0 > (ret = _pumpDeviceGet(&tmpPumpDevice)))
            {
                printERRLog("_pumpDeviceGet() failed. ret = ", ret);
            }
            else
            {
                size = sizeof(tmpPumpDevice.speed) / sizeof(tmpPumpDevice.speed[0]);
                for (i = 0; i < size; i++)
                {
                    _pumpDevice.speed[i] = tmpPumpDevice.speed[i];
                }
                dumpPumpDevice(__FUNCTION__, "Update pump data");
            }
        }

#if HAS_FAN_DEV
        if (1 || _systemStatus.fan1_speed || _systemStatus.fan2_speed || _systemStatus.fan3_speed || _systemStatus.fan4_speed ||
            _systemStatus.fan5_speed || _systemStatus.fan6_speed || _systemStatus.fan7_speed || _systemStatus.fan8_speed ||
            _systemStatus.fan9_speed || _systemStatus.fan10_speed || _systemStatus.fan11_speed)
        {
            if (0 > (ret = _fanDeviceGet(&tmpFanDevice)))
            {
                printERRLog("_fanDeviceGet() failed. ret = ", ret);
            }
            else
            {
                size = sizeof(tmpFanDevice.speed) / sizeof(tmpFanDevice.speed[0]);
                for (i = 0; i < size; i++)
                {
                    _fanDevice.speed[i] = tmpFanDevice.speed[i];
                }
                dumpFanDevice(__FUNCTION__, "Update fan data");
            }
        }
#endif

#if HAS_BOXER_PUMP
        if (1 || _systemStatus.boxer_pump_speed)
        {
            if (0 > (ret = _boxerPumpDeviceGet(&tmpBoxerPumpDevice)))
            {
                printERRLog("_boxerPumpDeviceGet() failed. ret = ", ret);
            }
            else
            {
                _boxerPumpDevice.speed = tmpBoxerPumpDevice.speed;
                dumpBoxerPumpDevice(__FUNCTION__, "Update boxer pump data");
            }
        }
#endif

        if (1 || _systemStatus.lv1)
        {
            if (0 > (ret = _inputGpioGet(&tmpInputGpioStatus)))
            {
                printERRLog("_inputGpioGet() failed. ret = ", ret);
            }
            else
            {
                _inputGpioStatus = tmpInputGpioStatus;
                dumpInputGpio(__FUNCTION__, "Update input Gpio data");
            }
        }

        if (1 || _systemStatus.pressure1 || _systemStatus.pressure2 || _systemStatus.pressure3 || _systemStatus.flow1 || _systemStatus.flow2 ||
            _systemStatus.temperature1 || _systemStatus.temperature2 || _systemStatus.temperature3)
        {
            if (0 > (ret = _adcDeviceGet(&tmpAdcDevice)))
            {
                printERRLog("_adcDeviceGet() failed. ret = ", ret);
            }
            else
            {
                _adcDevice = tmpAdcDevice;
                dumpAdcDevice(__FUNCTION__, "Update adc data");
            }
        }

        if (1 || _systemStatus.pt100_temperature)
        {
            if (0 > (ret = _pt100DeviceGet(&tmpPt100Device)))
            {
                printERRLog("_pt100DeviceGet() failed. ret = ", ret);
            }
            else
            {
                _pt100Device = tmpPt100Device;
                dumpPt100Device(__FUNCTION__, "Update pt100 data");
            }
        }

        if (1 || _systemStatus.psu1_totalWatt || _systemStatus.psu1_vol || _systemStatus.psu1_cur)
        {
            if (0 > (ret = _psu1DeviceGet(&tmpPsu1Device)))
            {
                printERRLog("_psu1DeviceGet() failed. ret = ", ret);
            }
            else
            {
                _psu1Device = tmpPsu1Device;
                dumpPsu1Device(__FUNCTION__, "Update psu1 data");
            }
        }

        if (1 || _systemStatus.psu2_totalWatt || _systemStatus.psu2_vol || _systemStatus.psu2_cur)
        {
            if (0 > (ret = _psu2DeviceGet(&tmpPsu2Device)))
            {
                printERRLog("_psu2DeviceGet() failed. ret = ", ret);
            }
            else
            {
                _psu2Device = tmpPsu2Device;
                dumpPsu2Device(__FUNCTION__, "Update PSU2 data");
            }
        }

        if (1 || _systemStatus.pcb_temperature)
        {
            if (0 > (ret = _systemBoardInfoGet(&tmpSysBoardInfo)))
            {
                printERRLog("_systemBoardInfoGet() failed. ret = ", ret);
            }
            else
            {
                _sysBoardInfo = tmpSysBoardInfo;
                dumpSysBoardInfo(__FUNCTION__, "Update system board info data");
            }
        }

#if HAS_FAN_WALL
#if 0
        if (_systemStatus.fan_wall_fan1_speed || _systemStatus.fan_wall_fan2_speed || _systemStatus.fan_wall_fan3_speed ||
            _systemStatus.fan_wall_fan4_speed || _systemStatus.fan_wall_fan5_speed || _systemStatus.fan_wall_air_flow1 ||
            _systemStatus.fan_wall_air_flow2 || _systemStatus.fan_wall_air_flow3 || _systemStatus.fan_wall_air_flow4 ||
            _systemStatus.fan_wall_air_flow5 || _systemStatus.fan_wall_pt100 || _systemStatus.fan_wall_water_detect)
#else
        if (1)
#endif
        {
            if (0 > (ret = _fanWallDeviceGet(&tmpFanWallStatus)))
            {
                printERRLog(__FUNCTION__, "() _fanWallDeviceGet() failed. ret = ", ret);
            }
            else
            {
                _fanWallStatus = tmpFanWallStatus;
                dumpGetFanWallDevice(__FUNCTION__, "Update fan wall data");
            }
        }
#endif

        // while (1)
        // {
            // if (_getSystemStatusChg(&_systemStatus))
            // {
            //     printDBGLog("Update System Status Chg");
            //     break;
            // }
            // else
            // {
            //     printERRLog("_getSystemStatusChg() failed. ret = ", ret);
            // }
            // boost::this_thread::sleep_for(boost::chrono::milliseconds(HAL_EXECUTE_INTERVAL));
        // }
    }
}

void STM32io::_update_abnormal_data()
{
    int ret, size, i;
    pump_device tmpPumpDevice;
#if HAS_FAN_DEV
    fan_device tmpFanDevice;
#endif
#if HAS_BOXER_PUMP
    boxer_pump_device tmpBoxerPumpDevice;
#endif
    input_gpio tmpInputGpioStatus;
    adc_device tmpAdcDevice;
    pt100_device tmpPt100Device;
    psu_device tmpPsu1Device;
    psu_device tmpPsu2Device;
    system_board_info tmpSysBoardInfo;
    led_status tmpLedStatus;
#if HAS_DAC_DEV
    //! HAL not implemented dacDeviceGet
    // dac_device tmpDacDevice;
#endif
#if HAS_FAN_WALL
    fan_wall_dev_status tmpFanWallStatus;
#endif

    // If get data is abnormal, update data
    if (_dataState.systBoardInfoGetState.devState != dataState::EOK) {
        if (0 > (ret = _systemBoardInfoGet(&tmpSysBoardInfo)))
        {
            printERRLog(__FUNCTION__, "() _systemBoardInfoGet() failed. ret = ", ret);
        }
        else
        {
            _sysBoardInfo = tmpSysBoardInfo;
            dumpSysBoardInfo(__FUNCTION__, "Update system board info data");
        }
    }

    if (_dataState.pumpGetDataState.devState != dataState::EOK) {
        if (0 > (ret = _pumpDeviceGet(&tmpPumpDevice)))
        {
            printERRLog(__FUNCTION__, "() _pumpDeviceGet() failed. ret = ", ret);
        }
        else
        {
            size = sizeof(tmpPumpDevice.speed) / sizeof(tmpPumpDevice.speed[0]);
            for (i = 0; i < size; i++)
            {
                _pumpDevice.speed[i] = tmpPumpDevice.speed[i];
            }
            dumpPumpDevice(__FUNCTION__, "Update pump data");
        }
    }

    if (_dataState.adcGetDataState.devState != dataState::EOK) {
        if (0 > (ret = _adcDeviceGet(&tmpAdcDevice)))
        {
            printERRLog(__FUNCTION__, "() _adcDeviceGet() failed. ret = ", ret);
        }
        else
        {
            _adcDevice = tmpAdcDevice;
            dumpAdcDevice(__FUNCTION__, "Update adc data");
        }
    }

    if (_dataState.pt100GetDataState.devState != dataState::EOK) {
        if (0 > (ret = _pt100DeviceGet(&tmpPt100Device)))
        {
            printERRLog(__FUNCTION__, "() _pt100DeviceGet() failed. ret = ", ret);
        }
        else
        {
            _pt100Device = tmpPt100Device;
            dumpPt100Device(__FUNCTION__, "Update pt100 data");
        }
    }

    if (_dataState.inputGpioGetDataState.devState != dataState::EOK) {
        if (0 > (ret = _inputGpioGet(&tmpInputGpioStatus)))
        {
            printERRLog(__FUNCTION__, "() _inputGpioGet() failed. ret = ", ret);
        }
        else
        {
            _inputGpioStatus = tmpInputGpioStatus;
            dumpInputGpio(__FUNCTION__, "Update input Gpio data");
        }
    }

#if HAS_FAN_DEV
    if (_dataState.fanGetDataState.devState != dataState::EOK) {
        if (0 > (ret = _fanDeviceGet(&tmpFanDevice)))
        {
            printERRLog(__FUNCTION__, "() _fanDeviceGet() failed. ret = ", ret);
        }
        else
        {
            printDBGLog("Update fan data");
            size = sizeof(tmpFanDevice.speed) / sizeof(tmpFanDevice.speed[0]);
            for (i = 0; i < size; i++)
            {
                _fanDevice.speed[i] = tmpFanDevice.speed[i];
            }
            dumpFanDevice(__FUNCTION__, "Update fan data");
        }
    }
#endif

#if HAS_BOXER_PUMP
    if (_dataState.boxerPumpGetDataState.devState != dataState::EOK) {
        if (0 > (ret = _boxerPumpDeviceGet(&tmpBoxerPumpDevice)))
        {
            printERRLog(__FUNCTION__, "() _boxerPumpDeviceGet() failed. ret = ", ret);
        }
        else
        {
            _boxerPumpDevice.speed = tmpBoxerPumpDevice.speed;
            dumpBoxerPumpDevice(__FUNCTION__, "Update boxer pump data");
        }
    }
#endif

    if (_dataState.psu1GetDataState.devState != dataState::EOK) {
        if (0 > (ret = _psu1DeviceGet(&tmpPsu1Device)))
        {
            printERRLog(__FUNCTION__, "() _psu1DeviceGet() failed. ret = ", ret);
        }
        else
        {
            _psu1Device = tmpPsu1Device;
            dumpPsu1Device(__FUNCTION__, "Update psu1 data");
        }
    }

    if (_dataState.psu2GetDataState.devState != dataState::EOK) {
        if (0 > (ret = _psu2DeviceGet(&tmpPsu2Device)))
        {
            printERRLog(__FUNCTION__, "() _psu2DeviceGet() failed. ret = ", ret);
        }
        else
        {
            _psu2Device = tmpPsu2Device;
            dumpPsu2Device(__FUNCTION__, "Update PSU2 data");
        }
    }

    if (_dataState.ledGetDataState.devState != dataState::EOK) {
        if (0 > (ret = _ledStatusGet(&tmpLedStatus)))
        {
            printERRLog(__FUNCTION__, "() _ledStatusGet() failed. ret = ", ret);
        }
        else
        {
            _ledStatus = tmpLedStatus;
            dumpLedStatus(__FUNCTION__, "Update LED data");
        }
    }

#if HAS_DAC_DEV
    //! HAL not implemented dacDeviceGet
    // if (_dataState.dacGetDataState.devState != dataState::EOK) {
    //     if (0 > (ret = _dacDeviceGet(&tmpDacDevice)))
    //     {
    //         printERRLog(__FUNCTION__, "() _dacDeviceGet() failed. ret = ", ret);
    //     }
    //     else
    //     {
    //         _dacDevice.mVol = tmpDacDevice.mVol;
    //         dumpDacDevice(__FUNCTION__, "Update dac data");
    //     }
    // }
#endif

#if HAS_FAN_WALL
    if (_dataState.fanWallGetDataState.devState != dataState::EOK) {
        if (0 > (ret = _fanWallDeviceGet(&tmpFanWallStatus)))
        {
            printERRLog(__FUNCTION__, "() _fanWallDeviceGet() failed. ret = ", ret);
        }
        else
        {
            _fanWallStatus = tmpFanWallStatus;
            dumpGetFanWallDevice(__FUNCTION__, "Update fan wall data");
        }
    }
#endif

    boost::this_thread::sleep_for(boost::chrono::milliseconds(ABNORMAL_DATA_REUPDATE_INTERVAL));
}

void STM32io::_led_automatic_handler()
{
    int ret = 0;
    bool failFlag = false;
    EpumpSpeedState currentState;
    while(1)
    {
        if (pump1LedState.bNeedUpdate && pump1LedState.bIsAutomaticMode)
        {
            failFlag = false;
            currentState = pump1LedState.devState;
            switch (currentState)
            {
                case EpumpSpeedState::EPUMPSPEED_STATE_NORMAL:
                    failFlag = false;
                    // Red
                    if (0 > (ret = setOneLedStatus(ELED3, LED_OFF)))
                    {
                        failFlag = true;
                    }
                    // Green
                    if (0 > (ret = setOneLedStatus(ELED2, LED_ON)))
                    {
                        failFlag = true;
                    }
                    break;
                case EpumpSpeedState::EPUMPSPEED_STATE_ABNORMAL:
                    // Red
                    if (0 > (ret = setOneLedStatus(ELED3, LED_ON)))
                    {
                        failFlag = true;
                    }
                    // Green
                    if (0 > (ret = setOneLedStatus(ELED2, LED_OFF)))
                    {
                        failFlag = true;
                    }
                    break;
                case EpumpSpeedState::EPUMPSPEED_GET_READING_FAILED:
                    // Red
                    if (0 > (ret = setOneLedStatus(ELED3, LED_FLASH)))
                    {
                        failFlag = true;
                    }
                    // Green
                    if (0 > (ret = setOneLedStatus(ELED2, LED_OFF)))
                    {
                        failFlag = true;
                    }
                    break;
                default:
                    failFlag = true;
                    break;
            }
            if (failFlag)
            {
                printERRLog(__FUNCTION__, "() Set pump 1 LED failed.");
            }
            else
            {
                printDBGLog("Set pump 1 LED success.");
                try {
                    try {
                        baseMutex::Lock lock(ledAutoMutex, std::chrono::milliseconds(BASE_MTX_TRY_LOCK_TIMEOUT));
                        if (currentState == pump1LedState.devState)
                        {
                            pump1LedState.bNeedUpdate = false;
                        }
                        lock.unlock();
                    } catch (const std::runtime_error& e) {
                        printERRLog(__FUNCTION__, "() ", e.what());
                    }
                } catch (const std::runtime_error& e) {

                }
            }
        }

        if (pump2LedState.bNeedUpdate && pump2LedState.bIsAutomaticMode)
        {
            failFlag = false;
            switch (pump2LedState.devState)
            {
                case EpumpSpeedState::EPUMPSPEED_STATE_NORMAL:
                    failFlag = false;
                    // Red
                    if (0 > (ret = setOneLedStatus(ELED1, LED_OFF)))
                    {
                        failFlag = true;
                    }
                    // Green
                    if (0 > (ret = setOneLedStatus(ELED4, LED_ON)))
                    {
                        failFlag = true;
                    }
                    break;
                case EpumpSpeedState::EPUMPSPEED_STATE_ABNORMAL:
                    // Red
                    if (0 > (ret = setOneLedStatus(ELED1, LED_ON)))
                    {
                        failFlag = true;
                    }
                    // Green
                    if (0 > (ret = setOneLedStatus(ELED4, LED_OFF)))
                    {
                        failFlag = true;
                    }
                    break;
                case EpumpSpeedState::EPUMPSPEED_GET_READING_FAILED:
                    // Red
                    if (0 > (ret = setOneLedStatus(ELED1, LED_FLASH)))
                    {
                        failFlag = true;
                    }
                    // Green
                    if (0 > (ret = setOneLedStatus(ELED4, LED_OFF)))
                    {
                        failFlag = true;
                    }
                    break;
                default:
                    failFlag = true;
                    break;
            }
            if (failFlag)
            {
                printERRLog(__FUNCTION__, "() Set pump 2 LED failed.");
            }
            else
            {
                printDBGLog("Set pump 2 LED success.");
                try {
                    try {
                        baseMutex::Lock lock(ledAutoMutex, std::chrono::milliseconds(BASE_MTX_TRY_LOCK_TIMEOUT));
                        if (currentState == pump2LedState.devState)
                        {
                            pump2LedState.bNeedUpdate = false;
                        }
                        lock.unlock();
                    } catch (const std::runtime_error& e) {
                        printERRLog(__FUNCTION__, "() ", e.what());
                    }
                } catch (const std::runtime_error& e) {

                }
            }
        }

        if (pump3LedState.bNeedUpdate && pump3LedState.bIsAutomaticMode)
        {
            failFlag = false;
            switch (pump3LedState.devState)
            {
                case EpumpSpeedState::EPUMPSPEED_STATE_NORMAL:
                    failFlag = false;
                    // Red
                    if (0 > (ret = setOneLedStatus(ELED5, LED_OFF)))
                    {
                        failFlag = true;
                    }
                    // Green
                    if (0 > (ret = setOneLedStatus(ELED6, LED_ON)))
                    {
                        failFlag = true;
                    }
                    break;
                case EpumpSpeedState::EPUMPSPEED_STATE_ABNORMAL:
                    // Red
                    if (0 > (ret = setOneLedStatus(ELED5, LED_ON)))
                    {
                        failFlag = true;
                    }
                    // Green
                    if (0 > (ret = setOneLedStatus(ELED6, LED_OFF)))
                    {
                        failFlag = true;
                    }
                    break;
                case EpumpSpeedState::EPUMPSPEED_GET_READING_FAILED:
                    // Red
                    if (0 > (ret = setOneLedStatus(ELED5, LED_FLASH)))
                    {
                        failFlag = true;
                    }
                    // Green
                    if (0 > (ret = setOneLedStatus(ELED6, LED_OFF)))
                    {
                        failFlag = true;
                    }
                    break;
                default:
                    failFlag = true;
                    break;
            }
            if (failFlag)
            {
                printERRLog(__FUNCTION__, "() Set pump 3 LED failed.");
            }
            else
            {
                printDBGLog("Set pump 3 LED success.");
                try {
                    try {
                        baseMutex::Lock lock(ledAutoMutex, std::chrono::milliseconds(BASE_MTX_TRY_LOCK_TIMEOUT));
                        if (currentState == pump3LedState.devState)
                        {
                            pump3LedState.bNeedUpdate = false;
                        }
                        lock.unlock();
                    } catch (const std::runtime_error& e) {
                        printERRLog(__FUNCTION__, "() ", e.what());
                    }
                } catch (const std::runtime_error& e) {

                }
            }
        }

        boost::this_thread::sleep_for(boost::chrono::milliseconds(DEF_RETRY_INTERVAL));
    }
}

int STM32io::_ioHalInit(void)
{
    _bInitState = false;

    try {
        halMutex::Lock lock(_halMtx, std::chrono::milliseconds(HAL_MTX_TRY_LOCK_TIMEOUT));
        printDBGLog(__FUNCTION__, " (HAL+)ioHalInit()");
        _handler = ioHalInit();
        printDBGLog(__FUNCTION__, " (HAL-)ioHalInit()", " Handler = ", _handler);
        lock.unlock();
    } catch (const std::runtime_error& e) {
        printERRLog(__FUNCTION__, "() ", e.what());
        return -EBUSY;
    }

    if (_handler < 0){
        printERRLog(__FUNCTION__, "() handler failed. return ", _handler);
        return -ESTM32IO_HAL_ERROR;
    }
    printDBGLog(__FUNCTION__, " Get Handler ", _handler);

    _bInitState = true;
    return 0;
}

int STM32io::_initDevice(void)
{
    int ret = 0;
    int funRet = 0;

    // !TODO need to implement keep data and restore last setting when _initDevice
    led_status newLedStatus;
    pump_device newPumpDevice;
#if HAS_FAN_DEV
    fan_device newFanDevice;
#endif
#if HAS_BOXER_PUMP
    boxer_pump_device newBoxerPumpDevice;
#endif
#if HAS_DAC_DEV
    dac_device newDacDevice;
#endif
#if HAS_FAN_WALL
    fan_wall_dev_ctrl newFanWallCtrlDevice;
#endif

    newLedStatus.led1 = LED_OFF;
    newLedStatus.led2 = LED_OFF;
    newLedStatus.led3 = LED_OFF;
    newLedStatus.led4 = LED_OFF;
    newLedStatus.led5 = LED_OFF;
    newLedStatus.led6 = LED_OFF;
    newLedStatus.led7 = LED_OFF;

    newPumpDevice.lv1 = DEF_STM32_PWM;
    newPumpDevice.lv2 = DEF_STM32_PWM;
    newPumpDevice.lv3 = DEF_STM32_PWM;
    newPumpDevice.lv4 = DEF_STM32_PWM;

#if HAS_FAN_DEV
    newFanDevice.lv1_4 = DEF_STM32_PWM;
    newFanDevice.lv5_8 = DEF_STM32_PWM;
    newFanDevice.lv9_12 = DEF_STM32_PWM;
#endif

#if HAS_BOXER_PUMP
    newBoxerPumpDevice.lv = DEF_STM32_PWM;
#endif

#if HAS_DAC_DEV
    newDacDevice.mVol = DEF_DAC_MVOL;
#endif

#if HAS_FAN_WALL
    newFanWallCtrlDevice.lv1_2 = DEF_STM32_PWM;
    newFanWallCtrlDevice.lv3_5 = DEF_STM32_PWM;
#endif

    strncpy(_sysBoardInfo.firmware_ver, "N/A", sizeof(_sysBoardInfo.firmware_ver) - 1);
    strncpy(_sysBoardInfo.lib_ver, "N/A", sizeof(_sysBoardInfo.lib_ver) - 1);
    dumpSysBoardInfo(__FUNCTION__, "Update system board info data");

    if (0 > (ret = _ledStatusSet(&newLedStatus)))
    {
        printERRLog(__FUNCTION__, " _ledStatusSet() init failed. return ", ret);
        funRet |= 1;
    }
    else
    {
        _ledStatus = newLedStatus;
        dumpLedStatus(__FUNCTION__, "Set & update LED data");
    }

    if (0 > (ret = _pumpDeviceSet(&newPumpDevice)))
    {
        printERRLog(__FUNCTION__, " _pumpDeviceSet() init failed. return ", ret);
        funRet |= 1;
    }
    else
    {
        _pumpDevice.lv1 = newPumpDevice.lv1;
        _pumpDevice.lv2 = newPumpDevice.lv2;
        _pumpDevice.lv3 = newPumpDevice.lv3;
        _pumpDevice.lv4 = newPumpDevice.lv4;
        dumpPumpDevice(__FUNCTION__, "Set & update pump pwm data");
    }

#if HAS_FAN_DEV
    if (0 > (ret = _fanDeviceSet(&newFanDevice)))
    {
        printERRLog(__FUNCTION__, " _fanDeviceSet() init failed. return ", ret);
        funRet |= 1;
    }
    else
    {
        _fanDevice.lv1_4 = newFanDevice.lv1_4;
        _fanDevice.lv5_8 = newFanDevice.lv5_8;
        _fanDevice.lv9_12 = newFanDevice.lv9_12;
        dumpFanDevice(__FUNCTION__, "Set & update fan data");
    }
#endif

#if HAS_BOXER_PUMP
    if (0 > (ret = _boxerPumpDeviceSet(&newBoxerPumpDevice)))
    {
        printERRLog(__FUNCTION__, " _boxerPumpDeviceSet() init failed. return ", ret);
        funRet |= 1;
    }
    else
    {
        _boxerPumpDevice.lv = newBoxerPumpDevice.lv;
        dumpBoxerPumpDevice(__FUNCTION__, "Set & update boxer pump pwm data");
    }
#endif

#if HAS_DAC_DEV
    if (0 > (ret = _dacDeviceSet(&newDacDevice)))
    {
        printERRLog(__FUNCTION__, " _dacDeviceSet() init failed. return ", ret);
        funRet |= 1;
    }
    else
    {
        _dacDevice.mVol = newDacDevice.mVol;
        dumpDacDevice(__FUNCTION__, "Set & update dac data");
    }
#endif

#if HAS_FAN_WALL
    if (0 > (ret = _fanWallDeviceSet(&newFanWallCtrlDevice)))
    {
        printERRLog(__FUNCTION__, " _fanWallDeviceSet() init failed. return ", ret);
        funRet |= 1;
    }
    else
    {
        _fanWallCtrlDevice.lv1_2 = newFanWallCtrlDevice.lv1_2;
        _fanWallCtrlDevice.lv3_5 = newFanWallCtrlDevice.lv3_5;
        dumpSetFanWallDevice(__FUNCTION__, "Set & update fan wall data");
    }
#endif

    return -funRet;
}

int STM32io::_systemBoardInfoGet(struct system_board_info* info)
{
    system_board_info tmpSystemBoardInfo;
    int res = 0;

    if (false == _bInitState)
    {
        return -ESTM32IO_N_INIT;
    }

    try {
        halMutex::Lock lock(_halMtx, std::chrono::milliseconds(HAL_MTX_TRY_LOCK_TIMEOUT));
        printDBGLog(__FUNCTION__, " (HAL+)systemBoardInfoGet()", " Handler = ", _handler);
        res = systemBoardInfoGet(_handler, &tmpSystemBoardInfo);
        printDBGLog(__FUNCTION__, " (HAL-)systemBoardInfoGet() return ", res, " Handler = ", _handler);
        lock.unlock();
    } catch (const std::runtime_error& e) {
        printERRLog(__FUNCTION__, "() ", e.what());
        return -EBUSY;
    }

    if (0 == res)
    {
        if (_dataState.systBoardInfoGetState.devState == dataState::EWarning || _dataState.systBoardInfoGetState.devState == dataState::EOK) {
            if (_dataState.systBoardInfoGetState.failureCounter > DEF_ERR_TIMES) {
                _dataState.systBoardInfoGetState.devState = dataState::ENotAvailable;
            } else {
                _dataState.systBoardInfoGetState.devState = dataState::EWarning;
                _dataState.systBoardInfoGetState.failureCounter++;
            }
        }
        return -ESTM32IO_HAL_ERROR;
    }
    else
    {
        _dataState.systBoardInfoGetState.devState = dataState::EOK;
        _dataState.systBoardInfoGetState.failureCounter = 0;
        printDBGLog(__FUNCTION__, " firmware_ver ", tmpSystemBoardInfo.firmware_ver);
        printDBGLog(__FUNCTION__, " lib_ver ", tmpSystemBoardInfo.lib_ver);
        printDBGLog(__FUNCTION__, " temperature ", tmpSystemBoardInfo.temperature);
        *info = tmpSystemBoardInfo;
        return 0;
    }
}

int STM32io::_getSystemStatusChg(struct system_status* status)
{
    int res = 0;
    if (false == _bInitState)
    {
        boost::this_thread::sleep_for(boost::chrono::milliseconds(DEF_RETRY_INTERVAL));
        return -ESTM32IO_N_INIT;
    }

    printDBGLog(__FUNCTION__, " (HAL+)getSystemStatusChg()", " Handler = ", _handler);
    res = getSystemStatusChg(_handler, status);
    printDBGLog(__FUNCTION__, " (HAL-)getSystemStatusChg() return ", res, " Handler = ", _handler);

    return res;
}

int STM32io::_ledStatusGet(struct led_status* status)
{
    led_status tmpLedStatus;
    int res = 0;

    if (false == _bInitState)
    {
        return -ESTM32IO_N_INIT;
    }

    try {
        halMutex::Lock lock(_halMtx, std::chrono::milliseconds(HAL_MTX_TRY_LOCK_TIMEOUT));
        printDBGLog(__FUNCTION__, " (HAL+)ledStatusGet()", " Handler = ", _handler);
        res = ledStatusGet(_handler, &tmpLedStatus);
        printDBGLog(__FUNCTION__, " (HAL-)ledStatusGet() return ", res, " Handler = ", _handler);
        lock.unlock();
    } catch (const std::runtime_error& e) {
        printERRLog(__FUNCTION__, "() ", e.what());
        return -EBUSY;
    }

    if (0 == res)
    {
        if (_dataState.ledGetDataState.devState == dataState::EWarning || _dataState.ledGetDataState.devState == dataState::EOK) {
            if (_dataState.ledGetDataState.failureCounter > DEF_ERR_TIMES) {
                _dataState.ledGetDataState.devState = dataState::ENotAvailable;
            } else {
                _dataState.ledGetDataState.devState = dataState::EWarning;
                _dataState.ledGetDataState.failureCounter++;
            }
        }
        return -ESTM32IO_HAL_ERROR;
    }
    else
    {
        _dataState.ledGetDataState.devState = dataState::EOK;
        _dataState.ledGetDataState.failureCounter = 0;
        printDBGLog(__FUNCTION__, " led1 ", static_cast<int>(tmpLedStatus.led1));
        printDBGLog(__FUNCTION__, " led2 ", static_cast<int>(tmpLedStatus.led2));
        printDBGLog(__FUNCTION__, " led3 ", static_cast<int>(tmpLedStatus.led3));
        printDBGLog(__FUNCTION__, " led4 ", static_cast<int>(tmpLedStatus.led4));
        printDBGLog(__FUNCTION__, " led5 ", static_cast<int>(tmpLedStatus.led5));
        printDBGLog(__FUNCTION__, " led6 ", static_cast<int>(tmpLedStatus.led6));
        printDBGLog(__FUNCTION__, " led7 ", static_cast<int>(tmpLedStatus.led7));
        *status = tmpLedStatus;
        return 0;
    }
}

int STM32io::_ledStatusSet(struct led_status* status)
{
    led_status tmpLedStatus = *status;
    int res = 0;

    if (false == _bInitState)
    {
        return -ESTM32IO_N_INIT;
    }

    printDBGLog(__FUNCTION__, " Set led1 to ", static_cast<int>(tmpLedStatus.led1));
    printDBGLog(__FUNCTION__, " Set led2 to ", static_cast<int>(tmpLedStatus.led2));
    printDBGLog(__FUNCTION__, " Set led3 to ", static_cast<int>(tmpLedStatus.led3));
    printDBGLog(__FUNCTION__, " Set led4 to ", static_cast<int>(tmpLedStatus.led4));
    printDBGLog(__FUNCTION__, " Set led5 to ", static_cast<int>(tmpLedStatus.led5));
    printDBGLog(__FUNCTION__, " Set led6 to ", static_cast<int>(tmpLedStatus.led6));
    printDBGLog(__FUNCTION__, " Set led7 to ", static_cast<int>(tmpLedStatus.led7));

    try {
        halMutex::Lock lock(_halMtx, std::chrono::milliseconds(HAL_MTX_TRY_LOCK_TIMEOUT));
        printDBGLog(__FUNCTION__, " (HAL+)ledStatusSet()", " Handler = ", _handler);
        res = ledStatusSet(_handler, &tmpLedStatus);
        printDBGLog(__FUNCTION__, " (HAL-)ledStatusSet() return ", res, " Handler = ", _handler);
        lock.unlock();
    } catch (const std::runtime_error& e) {
        printERRLog(__FUNCTION__, "() ", e.what());
        return -EBUSY;
    }

    if (0 == res)
    {
        // Do not change the state to 'abnormal' when a failure occurs in the settings.
        // if (_dataState.ledSetDataState.devState == dataState::EWarning || _dataState.ledSetDataState.devState == dataState::EOK) {
        //     if (_dataState.ledSetDataState.failureCounter > DEF_ERR_TIMES) {
        //         _dataState.ledSetDataState.devState = dataState::ENotAvailable;
        //     } else {
        //         _dataState.ledSetDataState.devState = dataState::EWarning;
        //         _dataState.ledSetDataState.failureCounter++;
        //     }
        // }
        return -ESTM32IO_HAL_ERROR;
    }
    else
    {
        if ((_dataState.ledSetDataState.devState != dataState::EOK) || (_dataState.ledGetDataState.devState != dataState::EOK))
        {
            _dataState.ledGetDataState.devState = dataState::EOK;
            _dataState.ledGetDataState.failureCounter = 0;
            _dataState.ledSetDataState.devState = dataState::EOK;
            _dataState.ledSetDataState.failureCounter = 0;
        }
        return 0;
    }
}

int STM32io::_pumpDeviceSet(struct pump_device* device)
{
    pump_device tmpPumpDevice = *device;
    int res = 0;

    if (false == _bInitState)
    {
        return -ESTM32IO_N_INIT;
    }

    printDBGLog(__FUNCTION__, " Set pump_device lv1 to ", static_cast<int>(tmpPumpDevice.lv1));
    printDBGLog(__FUNCTION__, " Set pump_device lv2 to ", static_cast<int>(tmpPumpDevice.lv2));
    printDBGLog(__FUNCTION__, " Set pump_device lv3 to ", static_cast<int>(tmpPumpDevice.lv3));
    printDBGLog(__FUNCTION__, " Set pump_device lv4 to ", static_cast<int>(tmpPumpDevice.lv4));

    try {
        halMutex::Lock lock(_halMtx, std::chrono::milliseconds(HAL_MTX_TRY_LOCK_TIMEOUT));
        printDBGLog(__FUNCTION__, " (HAL+)pumpDeviceSet()", " Handler = ", _handler);
        res = pumpDeviceSet(_handler, &tmpPumpDevice);
        printDBGLog(__FUNCTION__, " (HAL-)pumpDeviceSet() return ", res, " Handler = ", _handler);
        lock.unlock();
    } catch (const std::runtime_error& e) {
        printERRLog(__FUNCTION__, "() ", e.what());
        return -EBUSY;
    }

    if (0 == res)
    {
        // Do not change the state to 'abnormal' when a failure occurs in the settings.
        // if (_dataState.pumpSetDataState.devState == dataState::EWarning || _dataState.pumpSetDataState.devState == dataState::EOK) {
        //     if (_dataState.pumpSetDataState.failureCounter > DEF_ERR_TIMES) {
        //         _dataState.pumpSetDataState.devState = dataState::ENotAvailable;
        //     } else {
        //         _dataState.pumpSetDataState.devState = dataState::EWarning;
        //         _dataState.pumpSetDataState.failureCounter++;
        //     }
        // }
        return -ESTM32IO_HAL_ERROR;
    }
    else
    {
        if (_dataState.pumpSetDataState.devState != dataState::EOK)
        {
            _dataState.pumpSetDataState.devState = dataState::EOK;
            _dataState.pumpSetDataState.failureCounter = 0;
        }
        return 0;
    }
}

int STM32io::_pumpDeviceGet(struct pump_device* device)
{
    pump_device tmpPumpDevice;
    int res = 0;

    if (false == _bInitState)
    {
        return -ESTM32IO_N_INIT;
    }

    try {
        halMutex::Lock lock(_halMtx, std::chrono::milliseconds(HAL_MTX_TRY_LOCK_TIMEOUT));
        printDBGLog(__FUNCTION__, " (HAL+)pumpDeviceGet()", " Handler = ", _handler);
        res = pumpDeviceGet(_handler, &tmpPumpDevice);
        printDBGLog(__FUNCTION__, " (HAL-)pumpDeviceGet() return ", res, " Handler = ", _handler);
        lock.unlock();
    } catch (const std::runtime_error& e) {
        printERRLog(__FUNCTION__, "() ", e.what());
        return -EBUSY;
    }

    if (0 == res)
    {
        if (_dataState.pumpGetDataState.devState == dataState::EWarning || _dataState.pumpGetDataState.devState == dataState::EOK) {
            if (_dataState.pumpGetDataState.failureCounter > DEF_ERR_TIMES) {
                _dataState.pumpGetDataState.devState = dataState::ENotAvailable;
            } else {
                _dataState.pumpGetDataState.devState = dataState::EWarning;
                _dataState.pumpGetDataState.failureCounter++;
            }
        }

        try {
            baseMutex::Lock lock(ledAutoMutex, std::chrono::milliseconds(BASE_MTX_TRY_LOCK_TIMEOUT));
            // Pump1
            if (pump1LedState.devState != EpumpSpeedState::EPUMPSPEED_GET_READING_FAILED)
            {
                pump1LedState.devState = EpumpSpeedState::EPUMPSPEED_GET_READING_FAILED;
                pump1LedState.bNeedUpdate = true;
            }

            // Pump2
            if (pump2LedState.devState != EpumpSpeedState::EPUMPSPEED_GET_READING_FAILED)
            {
                pump2LedState.devState = EpumpSpeedState::EPUMPSPEED_GET_READING_FAILED;
                pump2LedState.bNeedUpdate = true;
            }

            // Pump3
            if (pump3LedState.devState != EpumpSpeedState::EPUMPSPEED_GET_READING_FAILED)
            {
                pump3LedState.devState = EpumpSpeedState::EPUMPSPEED_GET_READING_FAILED;
                pump3LedState.bNeedUpdate = true;
            }
            lock.unlock();
        } catch (const std::runtime_error& e) {
            std::string throwOutMessage = e.what();
            throw std::runtime_error("Failed to lock ledAutoMutex: " + throwOutMessage);
            return -ESTM32IO_HAL_ERROR;
        }

        return -ESTM32IO_HAL_ERROR;
    }
    else
    {
        _dataState.pumpGetDataState.devState = dataState::EOK;
        _dataState.pumpGetDataState.failureCounter = 0;
        printDBGLog(__FUNCTION__, " pump_device speed 0 ", tmpPumpDevice.speed[0]);
        printDBGLog(__FUNCTION__, " pump_device speed 1 ", tmpPumpDevice.speed[1]);
        printDBGLog(__FUNCTION__, " pump_device speed 2 ", tmpPumpDevice.speed[2]);
        printDBGLog(__FUNCTION__, " pump_device speed 3 ", tmpPumpDevice.speed[3]);
        *device = tmpPumpDevice;

        try {
            baseMutex::Lock lock(ledAutoMutex, std::chrono::milliseconds(BASE_MTX_TRY_LOCK_TIMEOUT));
            // Pump 1
            if ((0 == tmpPumpDevice.speed[0]) && (pump1LedState.devState != EpumpSpeedState::EPUMPSPEED_STATE_ABNORMAL))
            {
                pump1LedState.devState = EpumpSpeedState::EPUMPSPEED_STATE_ABNORMAL;
                pump1LedState.bNeedUpdate = true;
            }
            else if ((0 != tmpPumpDevice.speed[0]) && (pump1LedState.devState != EpumpSpeedState::EPUMPSPEED_STATE_NORMAL))
            {
                pump1LedState.devState = EpumpSpeedState::EPUMPSPEED_STATE_NORMAL;
                pump1LedState.bNeedUpdate = true;
            }

            // Pump 2
            if ((0 == tmpPumpDevice.speed[1]) && (pump2LedState.devState != EpumpSpeedState::EPUMPSPEED_STATE_ABNORMAL))
            {
                pump2LedState.devState = EpumpSpeedState::EPUMPSPEED_STATE_ABNORMAL;
                pump2LedState.bNeedUpdate = true;
            }
            else if ((0 != tmpPumpDevice.speed[1]) && (pump2LedState.devState != EpumpSpeedState::EPUMPSPEED_STATE_NORMAL))
            {
                pump2LedState.devState = EpumpSpeedState::EPUMPSPEED_STATE_NORMAL;
                pump2LedState.bNeedUpdate = true;
            }

            // Pump 3
            if ((0 == tmpPumpDevice.speed[2]) && (pump3LedState.devState != EpumpSpeedState::EPUMPSPEED_STATE_ABNORMAL))
            {
                pump3LedState.devState = EpumpSpeedState::EPUMPSPEED_STATE_ABNORMAL;
                pump3LedState.bNeedUpdate = true;
            }
            else if ((0 != tmpPumpDevice.speed[2]) && (pump3LedState.devState != EpumpSpeedState::EPUMPSPEED_STATE_NORMAL))
            {
                pump3LedState.devState = EpumpSpeedState::EPUMPSPEED_STATE_NORMAL;
                pump3LedState.bNeedUpdate = true;
            }
            lock.unlock();
        } catch (const std::runtime_error& e) {
            std::string throwOutMessage = e.what();
            throw std::runtime_error("Failed to lock ledAutoMutex: " + throwOutMessage);
            return 0;
        }

        return 0;
    }
}

#if HAS_FAN_DEV
int STM32io::_fanDeviceSet(struct fan_device* device)
{
    fan_device tmpFanDevice = *device;
    int res = 0;

    if (false == _bInitState)
    {
        return -ESTM32IO_N_INIT;
    }

    printDBGLog(__FUNCTION__, " Set fan_device lv1_4 to ", static_cast<int>(tmpFanDevice.lv1_4));
    printDBGLog(__FUNCTION__, " Set fan_device lv5_8 to ", static_cast<int>(tmpFanDevice.lv5_8));
    printDBGLog(__FUNCTION__, " Set fan_device lv9_12 to ", static_cast<int>(tmpFanDevice.lv9_12));

    try {
        halMutex::Lock lock(_halMtx, std::chrono::milliseconds(HAL_MTX_TRY_LOCK_TIMEOUT));
        printDBGLog(__FUNCTION__, " (HAL+)fanDeviceSet()", " Handler = ", _handler);
        res = fanDeviceSet(_handler, &tmpFanDevice);
        printDBGLog(__FUNCTION__, " (HAL-)fanDeviceSet() return ", res, " Handler = ", _handler);
        lock.unlock();
    } catch (const std::runtime_error& e) {
        printERRLog(__FUNCTION__, "() ", e.what());
        return -EBUSY;
    }

    if (0 == res)
    {
        // Do not change the state to 'abnormal' when a failure occurs in the settings.
        // if (_dataState.fanSetDataState.devState == dataState::EWarning || _dataState.fanSetDataState.devState == dataState::EOK) {
        //     if (_dataState.fanSetDataState.failureCounter > DEF_ERR_TIMES) {
        //         _dataState.fanSetDataState.devState = dataState::ENotAvailable;
        //     } else {
        //         _dataState.fanSetDataState.devState = dataState::EWarning;
        //         _dataState.fanSetDataState.failureCounter++;
        //     }
        // }
        return -ESTM32IO_HAL_ERROR;
    }
    else
    {
        if (_dataState.fanSetDataState.devState != dataState::EOK)
        {
            _dataState.fanSetDataState.devState = dataState::EOK;
            _dataState.fanSetDataState.failureCounter = 0;
        }
        return 0;
    }
}

int STM32io::_fanDeviceGet(struct fan_device* device)
{
    fan_device tmpFanDevice;
    int res = 0;

    if (false == _bInitState)
    {
        return -ESTM32IO_N_INIT;
    }

    try {
        halMutex::Lock lock(_halMtx, std::chrono::milliseconds(HAL_MTX_TRY_LOCK_TIMEOUT));
        printDBGLog(__FUNCTION__, " (HAL+)fanDeviceGet()", " Handler = ", _handler);
        res = fanDeviceGet(_handler, &tmpFanDevice);
        printDBGLog(__FUNCTION__, " (HAL-)fanDeviceGet() return ", res, " Handler = ", _handler);
        lock.unlock();
    } catch (const std::runtime_error& e) {
        printERRLog(__FUNCTION__, "() ", e.what());
        return -EBUSY;
    }

    if (0 == res)
    {
        if (_dataState.fanGetDataState.devState == dataState::EWarning || _dataState.fanGetDataState.devState == dataState::EOK) {
            if (_dataState.fanGetDataState.failureCounter > DEF_ERR_TIMES) {
                _dataState.fanGetDataState.devState = dataState::ENotAvailable;
            } else {
                _dataState.fanGetDataState.devState = dataState::EWarning;
                _dataState.fanGetDataState.failureCounter++;
            }
        }
        return -ESTM32IO_HAL_ERROR;
    }
    else
    {
        _dataState.fanGetDataState.devState = dataState::EOK;
        _dataState.fanGetDataState.failureCounter = 0;
        printDBGLog(__FUNCTION__, " fan_device speed 0 ", tmpFanDevice.speed[0]);
        printDBGLog(__FUNCTION__, " fan_device speed 1 ", tmpFanDevice.speed[1]);
        printDBGLog(__FUNCTION__, " fan_device speed 2 ", tmpFanDevice.speed[2]);
        printDBGLog(__FUNCTION__, " fan_device speed 3 ", tmpFanDevice.speed[3]);
        printDBGLog(__FUNCTION__, " fan_device speed 4 ", tmpFanDevice.speed[4]);
        printDBGLog(__FUNCTION__, " fan_device speed 5 ", tmpFanDevice.speed[5]);
        printDBGLog(__FUNCTION__, " fan_device speed 6 ", tmpFanDevice.speed[6]);
        printDBGLog(__FUNCTION__, " fan_device speed 7 ", tmpFanDevice.speed[7]);
        printDBGLog(__FUNCTION__, " fan_device speed 8 ", tmpFanDevice.speed[8]);
        printDBGLog(__FUNCTION__, " fan_device speed 9 ", tmpFanDevice.speed[9]);
        printDBGLog(__FUNCTION__, " fan_device speed 10 ", tmpFanDevice.speed[10]);
        printDBGLog(__FUNCTION__, " fan_device speed 11 ", tmpFanDevice.speed[11]);
        *device = tmpFanDevice;
        return 0;
    }
}
#endif

#if HAS_BOXER_PUMP
int STM32io::_boxerPumpDeviceSet(struct boxer_pump_device* device)
{
    boxer_pump_device tmpBoxerPumpDevice = *device;
    int res = 0;

    if (false == _bInitState)
    {
        return -ESTM32IO_N_INIT;
    }

    printDBGLog(__FUNCTION__, " Set boxer_pump_device lv to ", static_cast<int>(tmpBoxerPumpDevice.lv));

    try {
        halMutex::Lock lock(_halMtx, std::chrono::milliseconds(HAL_MTX_TRY_LOCK_TIMEOUT));
        printDBGLog(__FUNCTION__, " (HAL+)boxerPumpDeviceSet()", " Handler = ", _handler);
        res = boxerPumpDeviceSet(_handler, &tmpBoxerPumpDevice);
        printDBGLog(__FUNCTION__, " (HAL-)boxerPumpDeviceSet() return ", res, " Handler = ", _handler);
        lock.unlock();
    } catch (const std::runtime_error& e) {
        printERRLog(__FUNCTION__, "() ", e.what());
        return -EBUSY;
    }

    if (0 == res)
    {
        // Do not change the state to 'abnormal' when a failure occurs in the settings.
        // if (_dataState.boxerPumpSetDataState.devState == dataState::EWarning || _dataState.boxerPumpSetDataState.devState == dataState::EOK) {
        //     if (_dataState.boxerPumpSetDataState.failureCounter > DEF_ERR_TIMES) {
        //         _dataState.boxerPumpSetDataState.devState = dataState::ENotAvailable;
        //     } else {
        //         _dataState.boxerPumpSetDataState.devState = dataState::EWarning;
        //         _dataState.boxerPumpSetDataState.failureCounter++;
        //     }
        // }
        return -ESTM32IO_HAL_ERROR;
    }
    else
    {
        if (_dataState.boxerPumpSetDataState.devState != dataState::EOK)
        {
            _dataState.boxerPumpSetDataState.devState = dataState::EOK;
            _dataState.boxerPumpSetDataState.failureCounter = 0;
        }
        return 0;
    }
}

int STM32io::_boxerPumpDeviceGet(struct boxer_pump_device* device)
{
    boxer_pump_device tmpBoxerPumpDevice;
    int res = 0;

    if (false == _bInitState)
    {
        return -ESTM32IO_N_INIT;
    }

    try {
        halMutex::Lock lock(_halMtx, std::chrono::milliseconds(HAL_MTX_TRY_LOCK_TIMEOUT));
        printDBGLog(__FUNCTION__, " (HAL+)boxerPumpDeviceGet()", " Handler = ", _handler);
        res = boxerPumpDeviceGet(_handler, &tmpBoxerPumpDevice);
        printDBGLog(__FUNCTION__, " (HAL-)boxerPumpDeviceGet() return ", res, " Handler = ", _handler);
        lock.unlock();
    } catch (const std::runtime_error& e) {
        printERRLog(__FUNCTION__, "() ", e.what());
        return -EBUSY;
    }

    if (0 == res)
    {
        if (_dataState.boxerPumpGetDataState.devState == dataState::EWarning || _dataState.boxerPumpGetDataState.devState == dataState::EOK) {
            if (_dataState.boxerPumpGetDataState.failureCounter > DEF_ERR_TIMES) {
                _dataState.boxerPumpGetDataState.devState = dataState::ENotAvailable;
            } else {
                _dataState.boxerPumpGetDataState.devState = dataState::EWarning;
                _dataState.boxerPumpGetDataState.failureCounter++;
            }
        }
        return -ESTM32IO_HAL_ERROR;
    }
    else
    {
        _dataState.boxerPumpGetDataState.devState = dataState::EOK;
        _dataState.boxerPumpGetDataState.failureCounter = 0;
        printDBGLog(__FUNCTION__, " boxer_pump_device speed ", tmpBoxerPumpDevice.speed);
        *device = tmpBoxerPumpDevice;
        return 0;
    }
}
#endif

int STM32io::_inputGpioGet(struct input_gpio* status)
{
    input_gpio tmpInputGpioStatus;
    int res = 0;

    if (false == _bInitState)
    {
        return -ESTM32IO_N_INIT;
    }

    try {
        halMutex::Lock lock(_halMtx, std::chrono::milliseconds(HAL_MTX_TRY_LOCK_TIMEOUT));
        printDBGLog(__FUNCTION__, " (HAL+)inputGpioGet()", " Handler = ", _handler);
        res = inputGpioGet(_handler, &tmpInputGpioStatus);
        printDBGLog(__FUNCTION__, " (HAL-)inputGpioGet() return ", res, " Handler = ", _handler);
        lock.unlock();
    } catch (const std::runtime_error& e) {
        printERRLog(__FUNCTION__, "() ", e.what());
        return -EBUSY;
    }

    if (0 == res)
    {
        if (_dataState.inputGpioGetDataState.devState == dataState::EWarning || _dataState.inputGpioGetDataState.devState == dataState::EOK) {
            if (_dataState.inputGpioGetDataState.failureCounter > DEF_ERR_TIMES) {
                _dataState.inputGpioGetDataState.devState = dataState::ENotAvailable;
            } else {
                _dataState.inputGpioGetDataState.devState = dataState::EWarning;
                _dataState.inputGpioGetDataState.failureCounter++;
            }
        }
        return -ESTM32IO_HAL_ERROR;
    }
    else
    {
        _dataState.inputGpioGetDataState.devState = dataState::EOK;
        _dataState.inputGpioGetDataState.failureCounter = 0;
        printDBGLog(__FUNCTION__, " input_gpio button ", static_cast<int>(tmpInputGpioStatus.button));
        printDBGLog(__FUNCTION__, " input_gpio lv1 ", static_cast<int>(tmpInputGpioStatus.lv1));
        printDBGLog(__FUNCTION__, " input_gpio lv2 ", static_cast<int>(tmpInputGpioStatus.lv2));
        printDBGLog(__FUNCTION__, " input_gpio lv3 ", static_cast<int>(tmpInputGpioStatus.lv3));
        printDBGLog(__FUNCTION__, " input_gpio water_detect1 ", static_cast<int>(tmpInputGpioStatus.water_detect1));
        printDBGLog(__FUNCTION__, " input_gpio water_detect2 ", static_cast<int>(tmpInputGpioStatus.water_detect2));
        *status = tmpInputGpioStatus;
        return 0;
    }
}

int STM32io::_adcDeviceGet(struct adc_device* status)
{
    adc_device tmpAdcDevice;
    int res = 0;

    if (false == _bInitState)
    {
        return -ESTM32IO_N_INIT;
    }

    try {
        halMutex::Lock lock(_halMtx, std::chrono::milliseconds(HAL_MTX_TRY_LOCK_TIMEOUT));
        printDBGLog(__FUNCTION__, " (HAL+)adcDeviceGet()", " Handler = ", _handler);
        res = adcDeviceGet(_handler, &tmpAdcDevice);
        printDBGLog(__FUNCTION__, " (HAL-)adcDeviceGet() return ", res, " Handler = ", _handler);
        lock.unlock();
    } catch (const std::runtime_error& e) {
        printERRLog(__FUNCTION__, "() ", e.what());
        return -EBUSY;
    }

    if (0 == res)
    {
        if (_dataState.adcGetDataState.devState == dataState::EWarning || _dataState.adcGetDataState.devState == dataState::EOK) {
            if (_dataState.adcGetDataState.failureCounter > DEF_ERR_TIMES) {
                _dataState.adcGetDataState.devState = dataState::ENotAvailable;
            } else {
                _dataState.adcGetDataState.devState = dataState::EWarning;
                _dataState.adcGetDataState.failureCounter++;
            }
        }
        return -ESTM32IO_HAL_ERROR;
    }
    else
    {
        _dataState.adcGetDataState.devState = dataState::EOK;
        _dataState.adcGetDataState.failureCounter = 0;
        printDBGLog(__FUNCTION__, " adc_device pressure1 ", tmpAdcDevice.pressure1);
        printDBGLog(__FUNCTION__, " adc_device pressure2 ", tmpAdcDevice.pressure2);
        printDBGLog(__FUNCTION__, " adc_device pressure3 ", tmpAdcDevice.pressure3);
        printDBGLog(__FUNCTION__, " adc_device flow1 ", tmpAdcDevice.flow1);
        printDBGLog(__FUNCTION__, " adc_device flow2 ", tmpAdcDevice.flow2);
        printDBGLog(__FUNCTION__, " adc_device flow3 ", tmpAdcDevice.flow3);
        printDBGLog(__FUNCTION__, " adc_device temperature1 ", tmpAdcDevice.temperature1);
        printDBGLog(__FUNCTION__, " adc_device temperature2 ", tmpAdcDevice.temperature2);
        printDBGLog(__FUNCTION__, " adc_device temperature3 ", tmpAdcDevice.temperature3);
        printDBGLog(__FUNCTION__, " adc_device temperature4 ", tmpAdcDevice.temperature4);
        // Convert flow unit from L/min to L/sec
        tmpAdcDevice.flow1 /= 60;
        tmpAdcDevice.flow2 /= 60;
        tmpAdcDevice.flow3 /= 60;
        *status = tmpAdcDevice;
        return 0;
    }
}

#if HAS_DAC_DEV
int STM32io::_dacDeviceSet(struct dac_device* status)
{
    dac_device tmpDacDevice = *status;
    int res = 0;

    if (false == _bInitState)
    {
        return -ESTM32IO_N_INIT;
    }

    printDBGLog(__FUNCTION__, " Set dac_device mVol to ", static_cast<int>(tmpDacDevice.mVol));

    try {
        halMutex::Lock lock(_halMtx, std::chrono::milliseconds(HAL_MTX_TRY_LOCK_TIMEOUT));
        printDBGLog(__FUNCTION__, " (HAL+)dacDeviceSet()", " Handler = ", _handler);
        res = dacDeviceSet(_handler, &tmpDacDevice);
        printDBGLog(__FUNCTION__, " (HAL-)dacDeviceSet() return ", res, " Handler = ", _handler);
        lock.unlock();
    } catch (const std::runtime_error& e) {
        printERRLog(__FUNCTION__, "() ", e.what());
        return -EBUSY;
    }

    if (0 == res)
    {
        // Do not change the state to 'abnormal' when a failure occurs in the settings.
        // if (_dataState.dacSetDataState.devState == dataState::EWarning || _dataState.dacSetDataState.devState == dataState::EOK) {
        //     if (_dataState.dacSetDataState.failureCounter > DEF_ERR_TIMES) {
        //         _dataState.dacSetDataState.devState = dataState::ENotAvailable;
        //     } else {
        //         _dataState.dacSetDataState.devState = dataState::EWarning;
        //         _dataState.dacSetDataState.failureCounter++;
        //     }
        // }
        return -ESTM32IO_HAL_ERROR;
    }
    else
    {
        if (_dataState.dacSetDataState.devState != dataState::EOK)
        {
            _dataState.dacGetDataState.devState = dataState::EOK;
            _dataState.dacGetDataState.failureCounter = 0;
            _dataState.dacSetDataState.devState = dataState::EOK;
            _dataState.dacSetDataState.failureCounter = 0;
        }
        return 0;
    }
}

//! HAL not implemented dacDeviceGet, so do not use this function.
int STM32io::_dacDeviceGet(struct dac_device* status)
{
    dac_device tmpDacDevice;
    int res = 0;

    if (false == _bInitState)
    {
        return -ESTM32IO_N_INIT;
    }

    try {
        halMutex::Lock lock(_halMtx, std::chrono::milliseconds(HAL_MTX_TRY_LOCK_TIMEOUT));
        printDBGLog(__FUNCTION__, " (HAL+)dacDeviceGet()", " Handler = ", _handler);
        res = dacDeviceGet(_handler, &tmpDacDevice);
        printDBGLog(__FUNCTION__, " (HAL-)dacDeviceGet() return ", res, " Handler = ", _handler);
        lock.unlock();
    } catch (const std::runtime_error& e) {
        printERRLog(__FUNCTION__, "() ", e.what());
        return -EBUSY;
    }

    if (0 == res)
    {
        if (_dataState.dacGetDataState.devState == dataState::EWarning || _dataState.dacGetDataState.devState == dataState::EOK) {
            if (_dataState.dacGetDataState.failureCounter > DEF_ERR_TIMES) {
                _dataState.dacGetDataState.devState = dataState::ENotAvailable;
            } else {
                _dataState.dacGetDataState.devState = dataState::EWarning;
                _dataState.dacGetDataState.failureCounter++;
            }
        }
        return -ESTM32IO_HAL_ERROR;
    }
    else
    {
        _dataState.dacGetDataState.devState = dataState::EOK;
        _dataState.dacGetDataState.failureCounter = 0;
        printDBGLog(__FUNCTION__, " dac_device mVol ", static_cast<int>(tmpDacDevice.mVol));
        *status = tmpDacDevice;
        return 0;
    }
}
#endif

int STM32io::_pt100DeviceGet(struct pt100_device* status)
{
    pt100_device tmpPt100Device;
    int res = 0;

    if (false == _bInitState)
    {
        return -ESTM32IO_N_INIT;
    }

    try {
        halMutex::Lock lock(_halMtx, std::chrono::milliseconds(HAL_MTX_TRY_LOCK_TIMEOUT));
        printDBGLog(__FUNCTION__, " (HAL+)pt100DeviceGet()", " Handler = ", _handler);
        res = pt100DeviceGet(_handler, &tmpPt100Device);
        printDBGLog(__FUNCTION__, " (HAL-)pt100DeviceGet() return ", res, " Handler = ", _handler);
        lock.unlock();
    } catch (const std::runtime_error& e) {
        printERRLog(__FUNCTION__, "() ", e.what());
        return -EBUSY;
    }

    if (0 == res)
    {
        if (_dataState.pt100GetDataState.devState == dataState::EWarning || _dataState.pt100GetDataState.devState == dataState::EOK) {
            if (_dataState.pt100GetDataState.failureCounter > DEF_ERR_TIMES) {
                _dataState.pt100GetDataState.devState = dataState::ENotAvailable;
            } else {
                _dataState.pt100GetDataState.devState = dataState::EWarning;
                _dataState.pt100GetDataState.failureCounter++;
            }
        }
        return -ESTM32IO_HAL_ERROR;
    }
    else
    {
        _dataState.pt100GetDataState.devState = dataState::EOK;
        _dataState.pt100GetDataState.failureCounter = 0;
        printDBGLog(__FUNCTION__, " pt100_device temperature ", tmpPt100Device.temperature);
        *status = tmpPt100Device;
        return 0;
    }
}

int STM32io::_psu1DeviceGet(struct psu_device* device)
{
    psu_device tmpPsuDevice;
    int res = 0;

    if (false == _bInitState)
    {
        return -ESTM32IO_N_INIT;
    }

    try {
        halMutex::Lock lock(_halMtx, std::chrono::milliseconds(HAL_MTX_TRY_LOCK_TIMEOUT));
        printDBGLog(__FUNCTION__, " (HAL+)psu1DeviceGet()", " Handler = ", _handler);
        res = psu1DeviceGet(_handler, &tmpPsuDevice);
        printDBGLog(__FUNCTION__, " (HAL-)psu1DeviceGet() return ", res, " Handler = ", _handler);
        lock.unlock();
    } catch (const std::runtime_error& e) {
        printERRLog(__FUNCTION__, "() ", e.what());
        return -EBUSY;
    }

    if (0 == res)
    {
        if (_dataState.psu1GetDataState.devState == dataState::EWarning || _dataState.psu1GetDataState.devState == dataState::EOK) {
            if (_dataState.psu1GetDataState.failureCounter > DEF_ERR_TIMES) {
                _dataState.psu1GetDataState.devState = dataState::ENotAvailable;
            } else {
                _dataState.psu1GetDataState.devState = dataState::EWarning;
                _dataState.psu1GetDataState.failureCounter++;
            }
        }
        return -ESTM32IO_HAL_ERROR;
    }
    else
    {
        _dataState.psu1GetDataState.devState = dataState::EOK;
        _dataState.psu1GetDataState.failureCounter = 0;
        printDBGLog(__FUNCTION__, " psu1_device totalWatt ", tmpPsuDevice.totalWatt);
        printDBGLog(__FUNCTION__, " psu1_device vol ", tmpPsuDevice.vol);
        printDBGLog(__FUNCTION__, " psu1_device cur ", tmpPsuDevice.cur);
        // According the requirement, the voltage and current need to transfer to V and A.
        tmpPsuDevice.vol /= 1000;
        tmpPsuDevice.cur /= 1000;
        *device = tmpPsuDevice;
        return 0;
    }
}

int STM32io::_psu2DeviceGet(struct psu_device* device)
{
    psu_device tmpPsuDevice;
    int res = 0;

    if (false == _bInitState)
    {
        return -ESTM32IO_N_INIT;
    }

    try {
        halMutex::Lock lock(_halMtx, std::chrono::milliseconds(HAL_MTX_TRY_LOCK_TIMEOUT));
        printDBGLog(__FUNCTION__, " (HAL+)psu2DeviceGet()", " Handler = ", _handler);
        res = psu2DeviceGet(_handler, &tmpPsuDevice);
        printDBGLog(__FUNCTION__, " (HAL-)psu2DeviceGet() return ", res, " Handler = ", _handler);
        lock.unlock();
    } catch (const std::runtime_error& e) {
        printERRLog(__FUNCTION__, "() ", e.what());
        return -EBUSY;
    }

    if (0 == res)
    {
        if (_dataState.psu2GetDataState.devState == dataState::EWarning || _dataState.psu2GetDataState.devState == dataState::EOK) {
            if (_dataState.psu2GetDataState.failureCounter > DEF_ERR_TIMES) {
                _dataState.psu2GetDataState.devState = dataState::ENotAvailable;
            } else {
                _dataState.psu2GetDataState.devState = dataState::EWarning;
                _dataState.psu2GetDataState.failureCounter++;
            }
        }
        return -ESTM32IO_HAL_ERROR;
    }
    else
    {
        _dataState.psu2GetDataState.devState = dataState::EOK;
        _dataState.psu2GetDataState.failureCounter = 0;
        printDBGLog(__FUNCTION__, " psu2_device totalWatt ", tmpPsuDevice.totalWatt);
        printDBGLog(__FUNCTION__, " psu2_device vol ", tmpPsuDevice.vol);
        printDBGLog(__FUNCTION__, " psu2_device cur ", tmpPsuDevice.cur);
        // According the requirement, the voltage and current need to transfer to V and A.
        tmpPsuDevice.vol /= 1000;
        tmpPsuDevice.cur /= 1000;
        *device = tmpPsuDevice;
        return 0;
    }
}

#if HAS_FAN_WALL
int STM32io::_fanWallDeviceSet(struct fan_wall_dev_ctrl* device)
{
    fan_wall_dev_ctrl tmpFanWallCtrlDevice = *device;
    int res = 0;

    if (false == _bInitState)
    {
        return -ESTM32IO_N_INIT;
    }

    printDBGLog(__FUNCTION__, " Set fan_wall_dev_ctrl lv1_2 to ", static_cast<int>(tmpFanWallCtrlDevice.lv1_2));
    printDBGLog(__FUNCTION__, " Set fan_wall_dev_ctrl lv3_5 to ", static_cast<int>(tmpFanWallCtrlDevice.lv3_5));

    try {
        halMutex::Lock lock(_halMtx, std::chrono::milliseconds(HAL_MTX_TRY_LOCK_TIMEOUT));
        printDBGLog(__FUNCTION__, " (HAL+)fanWallDeviceSet()", " Handler = ", _handler);
        res = fanWallDeviceSet(_handler, &tmpFanWallCtrlDevice);
        printDBGLog(__FUNCTION__, " (HAL-)fanWallDeviceSet() return ", res, " Handler = ", _handler);
        lock.unlock();
    } catch (const std::runtime_error& e) {
        printERRLog(__FUNCTION__, "() ", e.what());
        return -EBUSY;
    }

    if (0 == res)
    {
        // Do not change the state to 'abnormal' when a failure occurs in the settings.
        // if (_dataState.fanWallSetDataState.devState == dataState::EWarning || _dataState.fanWallSetDataState.devState == dataState::EOK) {
        //     if (_dataState.fanWallSetDataState.failureCounter > DEF_ERR_TIMES) {
        //         _dataState.fanWallSetDataState.devState = dataState::ENotAvailable;
        //     } else {
        //         _dataState.fanWallSetDataState.devState = dataState::EWarning;
        //         _dataState.fanWallSetDataState.failureCounter++;
        //     }
        // }
        return -ESTM32IO_HAL_ERROR;
    }
    else
    {
        if ((_dataState.fanWallSetDataState.devState != dataState::EOK))
        {
            _dataState.fanWallSetDataState.devState = dataState::EOK;
            _dataState.fanWallSetDataState.failureCounter = 0;
        }
        return 0;
    }
}

int STM32io::_fanWallDeviceGet(struct fan_wall_dev_status* device)
{
    fan_wall_dev_status tmpFanWallStatus;
    int res = 0;

    if (false == _bInitState)
    {
        return -ESTM32IO_N_INIT;
    }

    try {
        halMutex::Lock lock(_halMtx, std::chrono::milliseconds(HAL_MTX_TRY_LOCK_TIMEOUT));
        printDBGLog(__FUNCTION__, " (HAL+)fanWallDeviceGet()", " Handler = ", _handler);
        res = fanWallDeviceGet(_handler, &tmpFanWallStatus);
        printDBGLog(__FUNCTION__, " (HAL-)fanWallDeviceGet() return ", res, " Handler = ", _handler);
        lock.unlock();
    } catch (const std::runtime_error& e) {
        printERRLog(__FUNCTION__, "() ", e.what());
        return -EBUSY;
    }

    if (0 == res)
    {
        if (_dataState.fanWallGetDataState.devState == dataState::EWarning || _dataState.fanWallGetDataState.devState == dataState::EOK) {
            if (_dataState.fanWallGetDataState.failureCounter > DEF_ERR_TIMES) {
                _dataState.fanWallGetDataState.devState = dataState::ENotAvailable;
            } else {
                _dataState.fanWallGetDataState.devState = dataState::EWarning;
                _dataState.fanWallGetDataState.failureCounter++;
            }
        }
        return -ESTM32IO_HAL_ERROR;
    }
    else
    {
        _dataState.fanWallGetDataState.devState = dataState::EOK;
        _dataState.fanWallGetDataState.failureCounter = 0;
        printDBGLog(__FUNCTION__, " fan_wall_dev_status speed[0] ", tmpFanWallStatus.speed[0]);
        printDBGLog(__FUNCTION__, " fan_wall_dev_status speed[1] ", tmpFanWallStatus.speed[1]);
        printDBGLog(__FUNCTION__, " fan_wall_dev_status speed[2] ", tmpFanWallStatus.speed[2]);
        printDBGLog(__FUNCTION__, " fan_wall_dev_status speed[3] ", tmpFanWallStatus.speed[3]);
        printDBGLog(__FUNCTION__, " fan_wall_dev_status speed[4] ", tmpFanWallStatus.speed[4]);
        printDBGLog(__FUNCTION__, " fan_wall_dev_status air_flow[0] ", tmpFanWallStatus.air_flow[0]);
        printDBGLog(__FUNCTION__, " fan_wall_dev_status air_flow[1] ", tmpFanWallStatus.air_flow[1]);
        printDBGLog(__FUNCTION__, " fan_wall_dev_status air_flow[2] ", tmpFanWallStatus.air_flow[2]);
        printDBGLog(__FUNCTION__, " fan_wall_dev_status air_flow[3] ", tmpFanWallStatus.air_flow[3]);
        printDBGLog(__FUNCTION__, " fan_wall_dev_status air_flow[4] ", tmpFanWallStatus.air_flow[4]);
        printDBGLog(__FUNCTION__, " fan_wall_dev_status pt100 ", tmpFanWallStatus.pt100);
        printDBGLog(__FUNCTION__, " fan_wall_dev_status water_detect ", static_cast<int>(tmpFanWallStatus.water_detect));
        for (int i = 0; i < 5; i++) {
            tmpFanWallStatus.air_flow[i] = tmpFanWallStatus.air_flow[i] * AIR_FLOW_TOTAL_FACTOR * 100;
        }
        *device = tmpFanWallStatus;
        return 0;
    }
}
#endif