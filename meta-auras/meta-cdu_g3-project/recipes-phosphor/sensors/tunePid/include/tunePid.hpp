#pragma once
#include <sdbusplus/asio/object_server.hpp>
#include <boost/asio/io_service.hpp>

#ifdef  __cplusplus
extern "C"
{
#endif
#include "libIo.h"
#ifdef  __cplusplus
}
#endif

#define	CONSUMER                           "tunePid"
#define TUNE_PID_LOG_PATH                  "/dev/shm/tunePid.log"
#define TUNE_PID_LOG_MAX_SIZE              (20 * 1024 * 1024)      // 20MB
#define TUNE_PID_JSON_DIR                  "/tmp/test/"
#define TUNE_PID_JSON_NAME                 "tunePid.json"
#define TUNE_PID_JSON_PATH                 TUNE_PID_JSON_DIR TUNE_PID_JSON_NAME

#define SYSTEMD_START_SERVICE              "systemctl start "
#define SYSTEMD_STOP_SERVICE               "systemctl stop "
#define SYSTEMD_ENABLE_SERVICE             "systemctl enable "
#define SYSTEMD_DISABLE_SERVICE            "systemctl disable "
#define SYSTEMD_RESTART_SERVICE            "systemctl restart "

#define SYSTEMD_STM32IO_SERVICE            "xyz.openbmc_project.stm32io.service"
#define SYSTEMD_STM32SENSOR_SERVICE        "xyz.openbmc_project.stm32sensor.service"
#define SYSTEMD_IOSERVICE_SERVICE          "xyz.openbmc_project.ioService"

#define HAL_DAC_MVOL_MAX                   5000
#define HAL_DAC_MVOL_MIN                   0
#define HAL_FLOW_MAX                       550
#define HAL_FLOW_MIN                       0

#define DFT_KP                             0.0
#define DFT_KI                             0.0
#define DFT_KD                             0.0
#define DFT_SETPOINT                       50.0
#define DFT_SAMPLE_TIME                    1000 //ms
#define DFT_INTERVAL_TIME                  1000 //ms
#define DFT_NEED_RESET_STM32               false

#define DFT_HAL_SPINLOCK_TIMEOUT           3000

#define DFT_GPIO_VALUE                     1
#define	GPIOY0_LINE_NUM                    192
#define	DEF_RESET_STM32_TIME               5000

void daemonUsage(void);
void save_log_to_file(std::string str);