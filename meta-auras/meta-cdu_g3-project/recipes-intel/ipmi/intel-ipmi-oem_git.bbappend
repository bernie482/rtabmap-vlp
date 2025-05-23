# add insyde patch
FILESEXTRAPATHS:prepend := "${THISDIR}/files:"


SRC_URI += " \
            file://0001_Support_other_sensor_type.patch \
            file://0002-intel-ipmi-oem-Add-OEM-sensor-unit.patch \
            file://0003-Add-sensor-type-for-fan-status.patch \
            file://0004-Add-air-flow-sensor-unit.patch \"
