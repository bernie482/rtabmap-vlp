#!/bin/bash

# this script uses the BOARD_ID set from checkFru.sh and provides the NAME,
# PRODID, and EEPROM_FRU values for this platform
decode_board_id() {
    if grep -q 'CPU part\s*: 0xc07' /proc/cpuinfo; then
        # LLCDU
        # EEPROM_FRU=true
        case $BOARD_ID in
            *)  NAME="LLCDU"
                PRODID="0x00";;
        esac

    fi
}
