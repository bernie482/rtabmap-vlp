#!/bin/bash

# OPTIONAL_PATH=$(readlink -f ${OPTIONAL_PATH:-../optional})
# DOT_CONFIG_PATH=$(readlink -f ${DOT_CONFIG_PATH:-../dot_config})
# OPTIONAL_PATH=../optional DOT_CONFIG_PATH=../dot_config tools/build.sh
# OPTIONAL_PATH=../optional DOT_CONFIG_PATH=../dot_config npm run serve:insyde:preview

function main() {
    if [[ -d $OPTIONAL_PATH ]]; then
        optional_path=$OPTIONAL_PATH
    else
        echo "Merge optional features."
        read -e -p "Where is the optional path(OPTIONAL_PATH)? (empty to skip) = " optional_path
        while [[ $optional_path ]] && [[ ! -d "$optional_path" ]]; do
            echo "$optional_path does not exist! Try again."
            read -e -p "Where is the optional path(OPTIONAL_PATH)? (empty to skip) = " optional_path
        done
    fi

    if [[ -f $DOT_CONFIG_PATH ]]; then
        dot_config_path=$DOT_CONFIG_PATH
    else
        echo "Run build.py to filter CONFIG_XXX."
        read -e -p "Where is the .config file(DOT_CONFIG_PATH)? (empty to skip) = " dot_config_path
        while [[ $dot_config_path ]] && [[ ! -f "$dot_config_path" ]]; do
            echo "$dot_config_path does not exist! Try again."
            read -e -p "Where is the .config file(DOT_CONFIG_PATH)? (empty to skip) = " dot_config_path
        done
    fi

    [[ $optional_path ]] && optional_path=$(readlink -f $optional_path) && echo "[NOTE] optional_path=$optional_path"
    [[ $dot_config_path ]] && dot_config_path=$(readlink -f $dot_config_path) && echo "[NOTE] .config=$dot_config_path"

    echo "[NOTE] Copy files to build ..."
    rsync -aqP --exclude=build --exclude=node_modules --exclude=.git* --delete ./ build/
    echo "[NOTE] Link node_modules ..."
    ln -nfs ../node_modules build/
    cd build && {
        if [[ -d $optional_path ]]; then
            echo "[NOTE] Copy optionals ..."
            python3 src/env/insyde/tools/combine_optional.py -y $optional_path || return 1
        else
            echo "[WARN] Cannot find optionals in $optional_path ..."
        fi
        if [[ -f $dot_config_path ]]; then
            echo "[NOTE] Run build.py ..."
            export $(grep -v "^#" $dot_config_path | xargs)
            export WEBUIOUT_VUE_DIR=./src
            export WEBUIOUT_JS_DIR=./src
            export WEBUIOUT_ESLINT_FIX=1
            export MENU_JSON=./src/env/insyde/json/menu.json
            export WEBUIOUT_MENU_JSON=./src/env/insyde/json/menu_autogen.json
            python3 src/env/insyde/tools/build.py || return 1
            cp -f ./src/env/insyde/json/menu.json ./src/env/insyde/json/menu.json.ori
            cp -f ./src/env/insyde/json/menu_autogen.json ./src/env/insyde/json/menu.json
        else
            echo "[WARN] Cannot find .config at $dot_config_path"
        fi
    }
    echo "[NOTE] Leave build settings ..."
}

main
