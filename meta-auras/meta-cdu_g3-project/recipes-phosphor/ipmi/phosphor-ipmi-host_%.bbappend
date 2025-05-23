FILESEXTRAPATHS:prepend := "${THISDIR}/${PN}:"

SRC_URI += " \
            file://0001-Specific-ipmi-command-should-not-return-a-value.patch \
           "