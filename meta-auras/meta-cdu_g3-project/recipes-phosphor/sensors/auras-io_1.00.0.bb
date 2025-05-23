SUMMARY = "Auras STM32 IO library"
DESCRIPTION = "STM32 IO library"
LICENSE = "CLOSED"

VER_MAJOR = "1"
VER_MINOR = "0"
VER_PATCH = "10"

HAL_LIB_NAME = "IoLlcdu"
LIBIO_VER = "${VER_MAJOR}.${VER_MINOR}.${VER_PATCH}"

FILESEXTRAPATHS:prepend := "${THISDIR}:"
S = "${WORKDIR}"

SRC_URI += "file://lib/lib${HAL_LIB_NAME}.so.${LIBIO_VER} \
            file://include/libIo.h \
            "

do_install() {
    install -d ${D}${libdir}
    install -d ${D}${includedir}
    install -m 0755 ${S}/lib/lib${HAL_LIB_NAME}.so.${LIBIO_VER} ${D}${libdir}
    ln -sf lib${HAL_LIB_NAME}.so.${LIBIO_VER} ${D}${libdir}/lib${HAL_LIB_NAME}.so.${VER_MAJOR}
    ln -sf lib${HAL_LIB_NAME}.so.${VER_MAJOR} ${D}${libdir}/lib${HAL_LIB_NAME}.so
    install -m 0644 ${S}/include/libIo.h ${D}${includedir}
}

FILES:${PN} += "${libdir}/libIo*"

FILES:${PN} += "${libdir}/lib${HAL_LIB_NAME}.so ${libdir}/lib${HAL_LIB_NAME}.so.${VER_MAJOR} ${libdir}/lib${HAL_LIB_NAME}.so.${LIBIO_VER}"
FILES:${PN}-dev += "${includedir}/libIo.h ${libdir}/lib${HAL_LIB_NAME}.so"
