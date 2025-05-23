include ${LINUX_VERSION}.inc
FILESEXTRAPATHS:prepend := "${THISDIR}/linux-aspeed:"
SRC_URI += " \
    file://auras.cfg \
    file://0001-disable-mac3-ncsi.patch \
    file://0002-support-w25q01jviq.patch \
    file://0003-Support-flash-gd25b512.patch \"
