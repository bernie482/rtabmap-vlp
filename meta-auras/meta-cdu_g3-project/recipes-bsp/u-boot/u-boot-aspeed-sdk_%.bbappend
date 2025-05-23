FILESEXTRAPATHS:prepend := "${THISDIR}/files:"

SRC_URI:remove:intel-ast2600 = " file://0003-Change-system-uart-clock-source-to-192MHz.patch"

SRC_URI:append:intel-ast2600 = " \
    file://0001-Enable-u-boot-dts-MAC4.patch \
    file://0002-RM-GPIO-Set-GPIOY0-to-output-high.patch \
    "

