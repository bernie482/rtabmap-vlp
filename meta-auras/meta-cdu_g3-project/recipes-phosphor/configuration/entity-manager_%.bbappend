FILESEXTRAPATHS:append := ":${THISDIR}/${PN}"
SRC_URI:append = " file://Auras-LLCDU_00.json \
                    file://0001-WORKAROUND-Fix-Barrier-state-is-not-correct.patch \
                    "

RDEPENDS:${PN} += " default-fru"

do_install:append() {
     install -d ${D}/usr/share/entity-manager/configurations
     install -m 0444 ${WORKDIR}/Auras-LLCDU_00.json ${D}/usr/share/entity-manager/configurations
}
