#!/bin/bash

execution_time=15
MAX_TIMES=10000
TEST_COUNT=1
NON_ZERO_COUNT=0
HANDLER=0

# Board Info
fun0() {
    FORMATTED_STRING=$(printf "%-20s" "  Board Info")
    echo "<===============${FORMATTED_STRING}===============>"
    ioTest ${HANDLER} 0;
    result=$?
    if [ $result -ne 0 ]; then
        NON_ZERO_COUNT=$((NON_ZERO_COUNT + result))
    fi
}

# Led Test
fun1() {
    FORMATTED_STRING=$(printf "%-20s" "  Led Test")
    echo "<===============${FORMATTED_STRING}===============>"
    ioTest ${HANDLER} 1;
    result=$?
    if [ $result -ne 0 ]; then
        NON_ZERO_COUNT=$((NON_ZERO_COUNT + result))
    fi
}

# GPIO Status Get
fun2() {
    FORMATTED_STRING=$(printf "%-20s" "  GPIO Status Get")
    echo "<===============${FORMATTED_STRING}===============>"
    ioTest ${HANDLER} 2;
    result=$?
    if [ $result -ne 0 ]; then
        NON_ZERO_COUNT=$((NON_ZERO_COUNT + result))
    fi
}

# Pump Set
fun3() {
    FORMATTED_STRING=$(printf "%-20s" "  Pump Set")
    echo "<===============${FORMATTED_STRING}===============>"
    ioTest ${HANDLER} 3;
    result=$?
    if [ $result -ne 0 ]; then
        NON_ZERO_COUNT=$((NON_ZERO_COUNT + result))
    fi
}

# Fan Set
fun4() {
    FORMATTED_STRING=$(printf "%-20s" "  Fan Set")
    echo "<===============${FORMATTED_STRING}===============>"
    ioTest ${HANDLER} 4;
    result=$?
    if [ $result -ne 0 ]; then
        NON_ZERO_COUNT=$((NON_ZERO_COUNT + result))
    fi
}

# Boxer Pump Set
fun5() {
    FORMATTED_STRING=$(printf "%-20s" "  Boxer Pump Set")
    echo "<===============${FORMATTED_STRING}===============>"
    ioTest ${HANDLER} 5;
    result=$?
    if [ $result -ne 0 ]; then
        NON_ZERO_COUNT=$((NON_ZERO_COUNT + result))
    fi
}

# Pump Get
fun6() {
    FORMATTED_STRING=$(printf "%-20s" "  Pump Speed Get")
    echo "<===============${FORMATTED_STRING}===============>"
    ioTest ${HANDLER} 6;
    result=$?
    if [ $result -ne 0 ]; then
        NON_ZERO_COUNT=$((NON_ZERO_COUNT + result))
    fi
}

# Fan Get
fun7() {
    FORMATTED_STRING=$(printf "%-20s" "  Fan Speed Get")
    echo "<===============${FORMATTED_STRING}===============>"
    ioTest ${HANDLER} 7;
    result=$?
    if [ $result -ne 0 ]; then
        NON_ZERO_COUNT=$((NON_ZERO_COUNT + result))
    fi
}

# Boxer Pump Get
fun8() {
    FORMATTED_STRING=$(printf "%-20s" "  Boxer Pump Speed Get")
    echo "<===============${FORMATTED_STRING}=============>"
    ioTest ${HANDLER} 8;
    result=$?
    if [ $result -ne 0 ]; then
        NON_ZERO_COUNT=$((NON_ZERO_COUNT + result))
    fi
}

# DAC Set
fun9() {
    FORMATTED_STRING=$(printf "%-20s" "  Dac Test")
    echo "<===============${FORMATTED_STRING}===============>"
    ioTest ${HANDLER} 9;
    result=$?
    if [ $result -ne 0 ]; then
        NON_ZERO_COUNT=$((NON_ZERO_COUNT + result))
    fi
}

# ADC Get
fun10() {
    FORMATTED_STRING=$(printf "%-20s" "  ADC Get")
    echo "<===============${FORMATTED_STRING}===============>"
    ioTest ${HANDLER} 10;
    result=$?
    if [ $result -ne 0 ]; then
        NON_ZERO_COUNT=$((NON_ZERO_COUNT + result))
    fi
}

# pt100 Get
fun11() {
    FORMATTED_STRING=$(printf "%-20s" "  PT100 Get")
    echo "<===============${FORMATTED_STRING}===============>"
    ioTest ${HANDLER} 11;
    result=$?
    if [ $result -ne 0 ]; then
        NON_ZERO_COUNT=$((NON_ZERO_COUNT + result))
    fi
}

# Psu Get
fun12() {
    FORMATTED_STRING=$(printf "%-20s" "  PSU Get")
    echo "<===============${FORMATTED_STRING}===============>"
    ioTest ${HANDLER} 12;
    result=$?
    if [ $result -ne 0 ]; then
        NON_ZERO_COUNT=$((NON_ZERO_COUNT + result))
    fi
}

systemctl stop xyz.openbmc_project.stm32io.service;
systemctl stop xyz.openbmc_project.stm32sensor.service;

echo "<===============       HALINIT      ===============>"
    ioTest 0;
    HANDLER=$?

if [ $HANDLER -lt 0 ]; then
    echo "HAL INIT failed handler = ${HANDLER}"
else
    echo "handler = ${HANDLER}"
    sleep 1;
    while [ $MAX_TIMES -gt 0 ]; do
        FORMATTED_COUNT=$(printf "%04d" ${TEST_COUNT})
        echo "<===============  Running test ${FORMATTED_COUNT} ===============>"
        RAND_FUNC=$((RANDOM % 13))
        sleep 1;

        case $RAND_FUNC in
            0) fun0 ;;
            1) fun1 ;;
            2) fun2 ;;
            3) fun3 ;;
            4) fun4 ;;
            5) fun5 ;;
            6) fun6 ;;
            7) fun7 ;;
            8) fun8 ;;
            9) fun9 ;;
            10) fun10 ;;
            11) fun11 ;;
            12) fun12 ;;

        esac

        MAX_TIMES=$((MAX_TIMES - 1))
        TEST_COUNT=$((TEST_COUNT + 1))

        # echo "Remaining times: $MAX_TIMES"
        echo ""
    done
fi

echo "Done!"
echo "Number of times ioTest returned non-zero: $NON_ZERO_COUNT"