IMAGE_INSTALL:append = " stm32io jansson modbus-tcp-server"

# Generate HPM update file
generate_hpm_file() {
    SRCFILE="${1}"
    DSTFILE="${SRCFILE%.*}"
    if [ -z "${SRCFILE}" ] || [ ! -f "${SRCFILE}" ]; then
        bbwarn "Expected file ${SRCFILE} does not exist"
        return 0
    fi
    OPF_VERSION="${@do_get_version(d)}"
    FWREV="0x${OPF_VERSION:0:2}${OPF_VERSION:3:2}${OPF_VERSION:6:2}${OPF_VERSION:9:4}00"
    if [ -x ${COREBASE}/meta-auras/tools/HPM/GenHpmFw.py ]; then
        cd ${COREBASE}/meta-auras/tools/HPM ;\
        ${COREBASE}/meta-auras/tools/HPM/GenHpmFw.py \
        -i "${SRCFILE}" \
        -o "${DSTFILE}.hpm" \
        -fwrev ${FWREV} \
        -conf ${COREBASE}/meta-auras/tools/HPM/HPM_BMC.conf;
        ln -sf ${DSTFILE}.hpm ${DEPLOY_DIR_IMAGE}/image-hpm-update
    fi
}
