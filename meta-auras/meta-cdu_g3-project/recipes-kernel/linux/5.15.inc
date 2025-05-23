FILESEXTRAPATHS:prepend := "${THISDIR}/${LINUX_VERSION}:"
RDEPENDS:${KERNEL_PACKAGE_NAME}-base = ""

SRC_URI += " \
    file://0001-Add-other-UART.patch \
    "

# Solution to fix loadable module build fail after cleanning linux-aspeed
do_clean[depends] += "make-mod-scripts:do_clean"
do_package[nostamp] = "1"
do_package_write_rpm[nostamp] = "1"

require insyde_overlay_5.15.inc
inherit insyde-overlay
