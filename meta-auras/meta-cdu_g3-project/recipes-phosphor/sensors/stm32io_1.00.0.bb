SUMMARY = "Auras STM32 IO"
DESCRIPTION = "Get/Set STM32 data"
LICENSE = "CLOSED"

inherit obmc-phosphor-systemd
FILESEXTRAPATHS:prepend := "${THISDIR}:"

DEPENDS = "systemd boost sdbusplus phosphor-logging libgpiod auras-io"
RDEPENDS:${PN} = "systemd boost sdbusplus phosphor-logging libgpiod auras-io bash"

# DEPENDS = "systemd boost sdbusplus phosphor-logging libgpiod dbg-auras-io"
# RDEPENDS:${PN} = "systemd boost sdbusplus phosphor-logging libgpiod dbg-auras-io"

HAL_LIB_NAME = "IoLlcdu"

SYSTEMD_SERVICE:${PN} = " xyz.openbmc_project.ioService.service xyz.openbmc_project.stm32io.service"

# file://src/ioTest
# file://src/ioTest_LLCDU.sh

SRC_URI += "file://src/Makefile \
            file://src/STM32IOMain.cpp \
            file://include/STM32IOMain.hpp \
            file://src/STM32IO.cpp \
            file://include/STM32IO.hpp \
            file://src/ioService \
            "

S = "${WORKDIR}"

TARGET_CXXFLAGS = " -std=c++20 -I${S}/include -I${STAGING_INCDIR} -L${STAGING_LIBDIR}"
TARGET_LDFLAGS = " -Wl,--hash-style=gnu -lsystemd -lsdbusplus -lphosphor_logging -lboost_thread -lboost_chrono -l${HAL_LIB_NAME}"
# TARGET_LDFLAGS = " -Wl,--hash-style=gnu -lsystemd -lsdbusplus -lphosphor_logging -lboost_thread -lboost_chrono -lIo -ljansson"

do_compile() {
    make -C src
}

do_install() {
    install -d ${D}${bindir}
    install -m 0755 ${S}/src/stm32io ${D}${bindir}
    install -m 0755 ${S}/src/ioService ${D}${bindir}
    # install -m 0755 ${S}/src/ioTest ${D}${bindir}
    # install -m 0755 ${S}/src/ioTest_LLCDU.sh ${D}${bindir}
}

FILES:${PN} += "${bindir}"
FILES:${PN}-dev += "${includedir}"