FILESEXTRAPATHS:prepend := "${THISDIR}/${PN}:"

SRC_URI:append = " file://0001-Add-log-for-debug-barrier-state.patch  \
                    "