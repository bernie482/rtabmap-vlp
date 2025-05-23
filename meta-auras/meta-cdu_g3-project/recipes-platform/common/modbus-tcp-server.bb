SUMMARY = "Modbus TCP server"
LICENSE = "InsydeOpfRestrictedLicense"
LIC_FILES_CHKSUM = "file://${INSYDEBASE}/InsydeOpfRestrictedLicense;md5=d41d8cd98f00b204e9800998ecf8427e"
LICENSE_FLAGS = "InsydeOpfRestrictedLicense"

SRC_URI = "file://src/;subdir=localImpl \
            file://modbus-tcp-server.json;subdir=localImpl/src"
S = "${WORKDIR}/localImpl/src"

FILES:${PN} += "${systemd_system_unitdir}/xyz.openbmc_project.modbus_tcp_server.service /nv"
SYSTEMD_SERVICE:${PN} += "xyz.openbmc_project.modbus_tcp_server.service"

DEPENDS = "boost nlohmann-json sdbusplus libmodbus cli11 phosphor-logging"
RDEPENDS:${PN} = "sdbusplus libmodbus boost"
inherit cmake systemd

do_install() {
    install -d ${D}${bindir}
    install -m 0755 ${WORKDIR}/build/modbus-tcp-server ${D}${bindir}
    install -Dm 0644 ${S}/service_files/xyz.openbmc_project.modbus_tcp_server.service \
        ${D}${systemd_system_unitdir}/xyz.openbmc_project.modbus_tcp_server.service
    install -d ${D}/nv/
    install -m 0755 ${S}/modbus-tcp-server.json ${D}/nv/
}