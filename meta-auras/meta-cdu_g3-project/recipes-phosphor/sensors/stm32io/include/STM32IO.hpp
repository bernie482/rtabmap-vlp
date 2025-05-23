#pragma once
#include <sdbusplus/asio/object_server.hpp>
#include <atomic>
#include <cerrno>
#include <variant>
#include <fstream>
#include <mutex>
#include <boost/chrono.hpp>
#include <boost/thread/thread.hpp>
#include <condition_variable>

#ifdef  __cplusplus
extern "C"
{
#endif
#include "libIo.h"
#ifdef  __cplusplus
}
#endif

#define MS_LEVEL_LOG                                            (1)
#define SHORT_HAL_EXECUTE_INTERVAL                              (0)

#define HAL_MTX_TRY_LOCK_TIMEOUT                                (6000)
#define BASE_MTX_TRY_LOCK_TIMEOUT                               (1000)
#define STM32IO_SUCCESS                                         (0)
#define ESTM32IO_N_INIT                                         (98)
#define ESTM32IO_HAL_ERROR                                      (99)
#define LED_AUTO_OFFSET                                         (0x3)
#define LED_STATE_MASK                                          (0x3)

#define DEF_STM32_PWM                                           (15)
#define DEF_DAC_MVOL                                            (5000)
#define DEF_ERR_TIMES                                           (3)
#define AIR_FLOW_AERA                                           (0.035)
#define AIR_FLOW_UNIT_CONVERT_FACTOR                            (2118.88)
#define AIR_FLOW_TOTAL_FACTOR                                   (AIR_FLOW_AERA * AIR_FLOW_UNIT_CONVERT_FACTOR)

#define DEF_RETRY_INTERVAL                                      (1000 * 1)
#define ABNORMAL_DATA_REUPDATE_INTERVAL                         (1000 * 10)

#if SHORT_HAL_EXECUTE_INTERVAL
#define HAL_EXECUTE_INTERVAL                                    (50)
#else
#define HAL_EXECUTE_INTERVAL                                    (1000 * 1)
#endif

#define HAS_FAN_WALL                                            (1)
#define HAS_FAN_DEV                                             (0)
#define HAS_DAC_DEV                                             (0)
#define HAS_BOXER_PUMP                                          (0)

extern bool bDbgLogFlag;
extern bool bPrintDataUpdated;
extern bool bSaveToFile;
extern void save_log_to_file(std::string str);

enum class dataState
{
    EOK = 0,
    EWarning,
    ENotAvailable
};

enum EsysBoardInfoItem
{
    EFW_VER = 0,
    ELIB_VER,
    ETEMP,
};

enum EledDevice
{
    ELED1 = 0,
    ELED2,
    ELED3,
    ELED4,
    ELED5,
    ELED6,
    ELED7,

    ELED_MAX
};

enum EpumpDevice
{
    EPUMP_PWM_1 = 0,
    EPUMP_PWM_2,
    EPUMP_PWM_3,
    EPUMP_PWM_4,
    EPUMP_SPEED_1,
    EPUMP_SPEED_2,
    EPUMP_SPEED_3,
    EPUMP_SPEED_4,

    EPUMP_MAX
};

enum EadcDevice
{
    EADC_PRESSURE_1 = 0,
    EADC_PRESSURE_2,
    EADC_PRESSURE_3,
    EADC_PRESSURE_DROP,     // (outlet-inlet) = (PRESSURE_2-PRESSURE_1)
    EADC_FLOW_1,
    EADC_FLOW_2,
    EADC_FLOW_3,
    EADC_TEMP_1,
    EADC_TEMP_2,
    EADC_TEMP_3,
    EADC_TEMP_4,

    EADC_MAX
};

enum Ept100Device
{
    EPT100_TEMP = 0,
};

enum EinputGpioDevice
{
    EGPIO_BUTTON = 0,
    EGPIO_LV1,
    EGPIO_LV2,
    EGPIO_LV3,
    EGPIO_WATER_DETECT1,
    EGPIO_WATER_DETECT2,

    EGPIO_MAX
};

#if HAS_FAN_DEV
enum EfanDevice
{
    EFAN_PWM_1_4 = 0,
    EFAN_PWM_5_8,
    EFAN_PWM_9_12,
    EFAN_SPEED_1,
    EFAN_SPEED_2,
    EFAN_SPEED_3,
    EFAN_SPEED_4,
    EFAN_SPEED_5,
    EFAN_SPEED_6,
    EFAN_SPEED_7,
    EFAN_SPEED_8,
    EFAN_SPEED_9,
    EFAN_SPEED_10,
    EFAN_SPEED_11,

    EFAN_MAX
};
#endif

#if HAS_BOXER_PUMP
enum EboxerPumpDevice
{
    EBOXER_PUMP_PWM = 0,
    EBOXER_PUMP_SPEED,

    EBOXER_PUMP_MAX
};
#endif

enum EpsuDevice
{
    EPSU_TOTAL_WATT = 0,
    EPSU_VOL,
    EPSU_CUR,

    EPSU_MAX
};

#if HAS_DAC_DEV
enum EdacDevice
{
    EDAC_MVOL = 0,

    EDAC_MAX
};
#endif

enum EpumpSpeedState
{
    EPUMPSPEED_STATE_NORMAL = 0,
    EPUMPSPEED_STATE_ABNORMAL,
    EPUMPSPEED_GET_READING_FAILED,

    EPUMPSPEED_MAX
};

#if HAS_FAN_WALL
enum EfanWallDevice
{
    EFAN_WALL_LV1_2 = 0,
    EFAN_WALL_LV3_5,
    EFAN_WALL_SPEED_1,
    EFAN_WALL_SPEED_2,
    EFAN_WALL_SPEED_3,
    EFAN_WALL_SPEED_4,
    EFAN_WALL_SPEED_5,
    EFAN_WALL_AIR_FLOW_1,
    EFAN_WALL_AIR_FLOW_2,
    EFAN_WALL_AIR_FLOW_3,
    EFAN_WALL_AIR_FLOW_4,
    EFAN_WALL_AIR_FLOW_5,
    EFAN_WALL_Total_AIR_FLOW,
    EFAN_WALL_STATUS_1,
    EFAN_WALL_STATUS_2,
    EFAN_WALL_STATUS_3,
    EFAN_WALL_STATUS_4,
    EFAN_WALL_STATUS_5,
    EFAN_WALL_PT100,
    EFAN_WALL_WATER_DETECT,

    EFAN_WALL_MAX
};
#endif

struct data_state
{
    dataState devState = dataState::ENotAvailable;
    int failureCounter = 0;
};

struct pumpLed_state
{
    EpumpSpeedState devState = EpumpSpeedState::EPUMPSPEED_STATE_NORMAL;
    bool bNeedUpdate = true;
    bool bIsAutomaticMode = true;
};

struct stmDataState
{
    data_state ledGetDataState;
    data_state ledSetDataState;
    data_state systBoardInfoGetState;
    data_state pumpGetDataState;
    data_state pumpSetDataState;
    data_state adcGetDataState;
    data_state pt100GetDataState;
    data_state inputGpioGetDataState;
#if HAS_FAN_DEV
    data_state fanGetDataState;
    data_state fanSetDataState;
#endif
#if HAS_BOXER_PUMP
    data_state boxerPumpGetDataState;
    data_state boxerPumpSetDataState;
#endif
    data_state psu1GetDataState;
    data_state psu2GetDataState;
#if HAS_DAC_DEV
    data_state dacGetDataState;
    data_state dacSetDataState;
#endif
#if HAS_FAN_WALL
    data_state fanWallSetDataState;
    data_state fanWallGetDataState;
#endif
};

class baseMutex {
    protected:
        std::mutex mtx;
        std::condition_variable cv;
        bool locked = false;
        virtual void beforeLock() {}

    public:
        baseMutex() = default;

        ~baseMutex() {
            unlock();
        }

        baseMutex(const baseMutex&) = delete;
        baseMutex& operator=(const baseMutex&) = delete;

        bool try_lock_for(const std::chrono::milliseconds& timeout) {
            std::unique_lock<std::mutex> lk(mtx);
            if (!cv.wait_for(lk, timeout, [this] { return !locked; })) {
                return false;
            }
            locked = true;
            return true;
        }

        void unlock() {
            std::lock_guard<std::mutex> lk(mtx);
            if (locked) {
                locked = false;
                cv.notify_one();
            }
        }
        class Lock {
            private:
                baseMutex& bm;
                bool acquired;

            public:
                Lock(baseMutex& bm, const std::chrono::milliseconds& timeout) : bm(bm), acquired(false) {
                    bm.beforeLock();
                    if (bm.try_lock_for(timeout)) {
                        acquired = true;
                    } else {
                        throw std::runtime_error("lock timeout");
                    }
                }

                ~Lock() {
                    if (acquired) {
                        bm.unlock();
                    }
                }

                void unlock() {
                    if (acquired) {
                        bm.unlock();
                        acquired = false;
                    }
                }

                Lock(const Lock&) = delete;
                Lock& operator=(const Lock&) = delete;
        };
};

class halMutex : public baseMutex {
    protected:
        void beforeLock() override {
            boost::this_thread::sleep_for(boost::chrono::milliseconds(HAL_EXECUTE_INTERVAL));
        }
};

class STM32io
{
    public:
        STM32io(int deviceID);
        ~STM32io();

        bool getInitState();

        int getOneSysBoardInfo(EsysBoardInfoItem index, std::variant<int, std::string>& value);

        int getOneLedStatus(EledDevice index, int& value);

        int setOneLedStatus(EledDevice index, int value);

        int getOnePumpDevice(EpumpDevice index, int& value);

        int setOnePumpDevice(EpumpDevice index, int value);

        int getOneAdcDevice(EadcDevice index, int& value);

        int getOnePt100Device(Ept100Device index, int& value);

        int getOneInputGpioDevice(EinputGpioDevice index, int& value);

#if HAS_FAN_DEV
        int getOneFanStatus(EfanDevice index, int& value);

        int setOneFanStatus(EfanDevice index, int value);
#endif

#if HAS_BOXER_PUMP
        int getOneBoxerPumpStatus(EboxerPumpDevice index, int& value);

        int setOneBoxerPumpStatus(EboxerPumpDevice index, int value);
#endif

        int getOnePsu1Status(EpsuDevice index, int& value);
        int getOnePsu2Status(EpsuDevice index, int& value);

#if HAS_DAC_DEV
        int getOneDacDevice(EdacDevice index, int& value);
        int setOneDacDevice(EdacDevice index, int value);
#endif

#if HAS_FAN_WALL
        int setOneFanWallDevice(EfanWallDevice index, int value);
        int getOneFanWallDevice(EfanWallDevice index, int& value);
#endif

        template <typename... Args>
        void printDBGLog(const std::string& log_message, Args... args);

        template <typename... Args>
        void printERRLog(const std::string& log_message, Args... args);

        // For debug
        void dumpSysBoardInfo(std::string funName, std::string log_message);
        void dumpLedStatus(std::string funName, std::string log_message);
        void dumpPumpDevice(std::string funName, std::string log_message);
#if HAS_FAN_DEV
        void dumpFanDevice(std::string funName, std::string log_message);
#endif
#if HAS_BOXER_PUMP
        void dumpBoxerPumpDevice(std::string funName, std::string log_message);
#endif
        void dumpInputGpio(std::string funName, std::string log_message);
        void dumpAdcDevice(std::string funName, std::string log_message);
        void dumpPt100Device(std::string funName, std::string log_message);
#if HAS_DAC_DEV
        void dumpDacDevice(std::string funName, std::string log_message);
#endif
        void dumpPsu1Device(std::string funName, std::string log_message);
        void dumpPsu2Device(std::string funName, std::string log_message);
#if HAS_FAN_WALL
        void dumpSetFanWallDevice(std::string funName, std::string log_message);
        void dumpGetFanWallDevice(std::string funName, std::string log_message);
#endif

        pumpLed_state pump1LedState;
        pumpLed_state pump2LedState;
        pumpLed_state pump3LedState;
        std::mutex setLedMutex;
        std::mutex setPumpMutex;
#if HAS_FAN_DEV
        std::mutex setFanDevMutex;
#endif
#if HAS_BOXER_PUMP
        std::mutex setBoxerPumpMutex;
#endif
#if HAS_DAC_DEV
        std::mutex setDACMutex;
#endif
#if HAS_FAN_WALL
        std::mutex setFanWallMutex;
#endif
        baseMutex ledAutoMutex;

        int deviceID;

    private:
        bool _bInitState;
        int _handler;
        system_board_info _sysBoardInfo = {"", "", "", "", 0, 0};
        led_status _ledStatus = {0};
        pump_device _pumpDevice = {0};
#if HAS_FAN_DEV
        fan_device _fanDevice = {0};
#endif
#if HAS_BOXER_PUMP
        boxer_pump_device _boxerPumpDevice = {0};
#endif
        input_gpio _inputGpioStatus = {0};
        adc_device _adcDevice = {0};
        pt100_device _pt100Device = {0};
#if HAS_DAC_DEV
        dac_device _dacDevice = {0};
#endif
        psu_device _psu1Device = {0};
        psu_device _psu2Device = {0};
#if HAS_FAN_WALL
        fan_wall_dev_ctrl _fanWallCtrlDevice = {0};
        fan_wall_dev_status _fanWallStatus = {0};
#endif
        system_status _systemStatus;
        stmDataState _dataState;

        void _update_data();
        void _update_abnormal_data();
        void _led_automatic_handler();

        // Helper function declaration
        template <typename T, typename... Args>
        void _print_log_helper(std::ostringstream& log_stream, T arg, Args... args);

        // Base case for recursion
        void _print_log_helper(std::ostringstream& log_stream);

        int _ioHalInit(void);

        int _initDevice(void);

        int _systemBoardInfoGet(struct system_board_info* info);

        int _getSystemStatusChg(struct system_status* status);

        int _ledStatusGet(struct led_status* status);

        int _ledStatusSet(struct led_status* status);

        int _pumpDeviceSet(struct pump_device* device);

        int _pumpDeviceGet(struct pump_device* device);

#if HAS_FAN_DEV
        int _fanDeviceSet(struct fan_device* device);

        int _fanDeviceGet(struct fan_device* device);
#endif

#if HAS_BOXER_PUMP
        int _boxerPumpDeviceSet(struct boxer_pump_device* device);

        int _boxerPumpDeviceGet(struct boxer_pump_device* device);
#endif

        int _inputGpioGet(struct input_gpio* status);

        int _adcDeviceGet(struct adc_device* status);

#if HAS_DAC_DEV
        int _dacDeviceSet(struct dac_device* status);

        int _dacDeviceGet(struct dac_device* status);
#endif

        int _pt100DeviceGet(struct pt100_device* status);

        int _psu1DeviceGet(struct psu_device* device);

        int _psu2DeviceGet(struct psu_device* device);

#if HAS_FAN_WALL
        int _fanWallDeviceSet(struct fan_wall_dev_ctrl* device);

        int _fanWallDeviceGet(struct fan_wall_dev_status* device);
#endif

        halMutex _halMtx;
        std::thread _updateDeviceThread;
        std::thread _updateAbnormalDeviceThread;
        std::thread _ledAutomaticThread;
        std::shared_ptr<sdbusplus::asio::dbus_interface> sensorInterface;
};

struct SenssorInstrumentation
{
    std::shared_ptr<sdbusplus::asio::dbus_interface> sensorInterface;
};
