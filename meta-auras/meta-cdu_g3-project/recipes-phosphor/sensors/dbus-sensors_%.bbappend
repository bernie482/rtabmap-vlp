FILESEXTRAPATHS:prepend := "${THISDIR}/${PN}:"

SRC_URI += "file://git/src/STM32SensorMain.cpp \
            file://git/src/STM32Sensor.cpp \
            file://git/include/STM32Sensor.hpp \
            file://git/service_files/xyz.openbmc_project.stm32sensor.service \
            file://git/0000-Add-stm32sensor.patch \
            file://git/0001_Support_other_sensor_type.patch \
            "

PACKAGECONFIG += " stm32-sensor"
PACKAGECONFIG[stm32-sensor] = "-Dstm32-sensor=enabled, -Dstm32-sensor=disabled"

SYSTEMD_SERVICE:${PN} += "${@bb.utils.contains('PACKAGECONFIG', 'stm32-sensor', \
                        'xyz.openbmc_project.stm32sensor.service', \
                        '', d)}"