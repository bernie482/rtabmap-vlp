# WARNING!
#
# These modifications to os-release disable the bitbake parse
# cache (for the os-release recipe only).  Before copying
# and pasting into another recipe ensure it is understood
# what that means!
OPF_VERSION = "01.03.00.0000"

OS_RELEASE_FIELDS:append = " OPF_VERSION IPMI_MAJOR IPMI_MINOR IPMI_AUX13 IPMI_AUX14 IPMI_AUX15 IPMI_AUX16"

OS_RELEASE_FIELDS:remove = "BUILD_ID"

python() {
    opf_version = d.getVar('OPF_VERSION', True)

    ver_list = opf_version.split('.')

    d.setVar('VERSION_ID', opf_version)
    d.setVar('IPMI_MAJOR', ver_list[0])
    d.setVar('IPMI_MINOR', ver_list[1])
    d.setVar('IPMI_AUX13', "0x00")
    d.setVar('IPMI_AUX14', '0x{}{}'.format(ver_list[3][2], ver_list[3][3]))
    d.setVar('IPMI_AUX15', '0x{}{}'.format(ver_list[3][0], ver_list[3][1]))
    d.setVar('IPMI_AUX16', '0x{}'.format(ver_list[2]))
}


# Ensure the git commands run every time bitbake is invoked.
#BB_DONT_CACHE = "1"

# Make os-release available to other recipes.
SYSROOT_DIRS:append = " ${sysconfdir}"
