SUMMARY = "Utility used for PID tuning"
DESCRIPTION = "Tuning the PID parameters of a proportional valve"
LICENSE = "CLOSED"

FILESEXTRAPATHS:prepend := "${THISDIR}:"

DEPENDS = "boost phosphor-logging libgpiod nlohmann-json bash auras-io"
RDEPENDS:${PN} = "boost phosphor-logging libgpiod auras-io"

# DEPENDS = "boost phosphor-logging libgpiod nlohmann-json bash dbg-auras-io"
# RDEPENDS:${PN} = "boost phosphor-logging libgpiod dbg-auras-io"


HAL_LIB_NAME = "IoLlcdu"

SRC_URI += "file://src/Makefile \
            file://src/tunePid.cpp \
            file://include/tunePid.hpp \
            "

S = "${WORKDIR}"

TARGET_CXXFLAGS = " -std=c++20 -I${S}/include -I${STAGING_INCDIR} -L${STAGING_LIBDIR}"
TARGET_LDFLAGS = " -Wl,--hash-style=gnu -lphosphor_logging -lboost_thread -lboost_chrono -lgpiodcxx -l${HAL_LIB_NAME}"
# TARGET_LDFLAGS = " -Wl,--hash-style=gnu -lphosphor_logging -lboost_thread -lboost_chrono -l${HAL_LIB_NAME}"

do_compile() {
    make -C src
}

do_install() {
    install -d ${D}${bindir}
    install -m 0755 ${S}/src/tunePid ${D}${bindir}
}

FILES:${PN} += "${bindir}"
FILES:${PN}-dev += "${includedir}"