FILESEXTRAPATHS:append := ":${THISDIR}/${PN}"
SRC_URI:append = " file://0001-Redfish-Correct-the-errors-identified-by-the-validator.patch \
                    file://0002-redfish-Add-OEM-sensor-unit.patch \
                    file://0003-LED-automatic-mechanism.patch \
                    file://0004-Add-description-for-fan-status.patch \
                    file://0005-WORKAROUND-Hide-the-storage-service.patch \
                    file://0006-Update-the-flowrate-pressure-sensor-unit.patch \"
