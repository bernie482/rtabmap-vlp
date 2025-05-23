#!/usr/bin/env python3

###########################################################################
# @file GenHpmFw.py
#
# @section LICENSE
#
# Copyright (c) 2003-2021, Insyde Software Corp. All Rights Reserved.
#
# You may not reproduce, distribute, publish, display, perform, modify, adapt,
# transmit, broadcast, present, recite, release, license or otherwise exploit
# any part of this publication in any form, by any means, without the prior
# written permission of Insyde Software Corp.
#
###########################################################################

from struct import *
import time
import os
import sys
import hashlib
import tarfile
import Signtool

hpmConfigFile = ''
hpmImgName = ''
firmwareName = ''
signtool = "../../prebuilts/bmc-signed-image/signtool/signtool"
devKeys = "../../configs/keystore/DevKeys/developmentKeys/developmentKeys.tar.gz"
pemFilePath = "rootKey.pem"
upgradeComponentName = ''
isSignKey = True
signKey = ''
customizedHeader = ''

debugImageHeader = False
debugHeaderChecksum = False
debugActionRecord = False
debugActionRecordChecksum = False
debugMd5 = False
debugFinalSourceFw = False

upgradeImageHeader = {
    # 8 bytes
    'Signature': 'PICMGFWU',
    # 1 byte
    'Format-Version': 0,
    # 1 byte
    'Device-ID': b'\x12',
    # 3 bytes
    'Manufacturer-ID': b'\x00\xb0\x09',
    # 2 byte
    'Product-ID': '',
    # 4 bytes
    'Time': 0,
    # 1 byte
    'Image-Capabilities': 0,
    # 1 byte
    'Components': 0,
    # 1 byte
    'Self-test-timeout': 0,
    # 1 byte
    'Rollback-timeout': 0,
    # 1 byte
    'Inaccessibility-timeout': 0,
    # 2 bytes
    'Earliest-Compatible-Revision': 0,
    # 6 bytes
    'Firmware-revision': 0,
    # 2 bytes
    'OEM-data-length': 0,
    # n bytes
    'OEM-data-descriptor-list': 0,
    # 1 byte
    'Header-checksum': 0
}

actionRecord = {
    'Action-Type': b'\x02',
    'Components': b'\x01',
    'Checksum': b'\x00',
    'Firmware-Version': b'\x03\x51\x00\x14\x00\x53',
    'Firmware-Description': 'Null',
    'Firmware-Length': 0,
}


def ReadImageHeaderFromConfig(configs):
    for config in configs:
        if '=' in config:
            keyValue = config.split('=')
        else:
            continue

        if keyValue[0] == 'Signature':
            upgradeImageHeader['Signature'] = keyValue[1]
        elif keyValue[0] == 'Format-Version':
            upgradeImageHeader['Format-Version'] = int(keyValue[1], base=16)
        elif keyValue[0] == 'Device-ID':
            upgradeImageHeader['Device-ID'] = int(keyValue[1], base=16)
        elif keyValue[0] == 'Manufacturer-ID':
            upgradeImageHeader['Manufacturer-ID'] = int(keyValue[1], base=16)
        elif keyValue[0] == 'Product-ID':
            if upgradeImageHeader['Product-ID'] == '':
                upgradeImageHeader['Product-ID'] = int(keyValue[1], base=16)
        elif keyValue[0] == 'Image-Capabilities':
            upgradeImageHeader['Image-Capabilities'] = int(keyValue[1], base=16)
        elif keyValue[0] == 'Components':
            upgradeImageHeader['Components'] = int(keyValue[1], base=16)
        elif keyValue[0] == 'Self-test-timeout':
            upgradeImageHeader['Self-test-timeout'] = int(keyValue[1], base=16)
        elif keyValue[0] == 'Rollback-timeout':
            upgradeImageHeader['Rollback-timeout'] = int(keyValue[1], base=16)
        elif keyValue[0] == 'Inaccessibility-timeout':
            upgradeImageHeader['Inaccessibility-timeout'] = int(keyValue[1], base=16)
        elif keyValue[0] == 'Earliest-Compatible-Revision':
            upgradeImageHeader['Earliest-Compatible-Revision'] = int(keyValue[1], base=16)
        elif keyValue[0] == 'Firmware-revision':
            upgradeImageHeader['Firmware-revision'] = int(keyValue[1], base=16)
        elif keyValue[0] == 'OEM-data-length':
            upgradeImageHeader['OEM-data-length'] = int(keyValue[1], base=16)
        elif keyValue[0] == 'HPM-Image-Name':
            global hpmImgName
            if hpmImgName == '':
                hpmImgName = keyValue[1]
        elif keyValue[0] == 'Upgrade-Component-Name':
            global upgradeComponentName
            upgradeComponentName = keyValue[1]
        elif keyValue[0] == 'Sign-Key':
            if keyValue[1] == 'False':
                global isSignKey
                isSignKey = False
        elif keyValue[0] == 'Customized-Header':
            global customizedHeader
            customizedHeader = keyValue[1]
        elif keyValue[0] == 'Key':
            global signKey
            signKey = keyValue[1]

    if debugImageHeader == True:
        print ("====== read image header from config ======")
        DumpHeader()


def WriteImageHeader(fileName):
    with open(fileName, "wb+") as openFile:
        openFile.write(upgradeImageHeader['Signature'].encode('ascii'))
        openFile.write(upgradeImageHeader['Format-Version'].to_bytes(1, byteorder='little'))
        openFile.write(upgradeImageHeader['Device-ID'].to_bytes(1, byteorder='little'))
        openFile.write(upgradeImageHeader['Manufacturer-ID'].to_bytes(3, byteorder='little'))
        openFile.write(upgradeImageHeader['Product-ID'].to_bytes(2, byteorder='little'))
        openFile.write(int(time.time()).to_bytes(4, byteorder='little'))
        openFile.write(upgradeImageHeader['Image-Capabilities'].to_bytes(1, byteorder='little'))
        openFile.write(upgradeImageHeader['Components'].to_bytes(1, byteorder='little'))
        openFile.write(upgradeImageHeader['Self-test-timeout'].to_bytes(1, byteorder='little'))
        openFile.write(upgradeImageHeader['Rollback-timeout'].to_bytes(1, byteorder='little'))
        openFile.write(upgradeImageHeader['Inaccessibility-timeout'].to_bytes(1, byteorder='little'))
        openFile.write(upgradeImageHeader['Earliest-Compatible-Revision'].to_bytes(2, byteorder='little'))
        openFile.write(upgradeImageHeader['Firmware-revision'].to_bytes(6, byteorder='big'))
        openFile.write(upgradeImageHeader['OEM-data-length'].to_bytes(2, byteorder='big'))

        openFile.seek(0, 0)
        headerData = openFile.read()
        headerDataSum = 0
        for data in headerData:
            headerDataSum += data
        res = 65536 - headerDataSum
        res = res.to_bytes(2, byteorder='big', signed=False)
        upgradeImageHeader['Header-checksum'] = res[1].to_bytes(1, byteorder='big', signed=False)
        openFile.write(upgradeImageHeader['Header-checksum'])

        if debugHeaderChecksum == True:
            print ("========== header checksum ==========")
            print ("sum = ", headerDataSum, ", res = ", res, ", res[1] = ", res[1])
            print ("=====================================")


def DumpRecordFromFile(record):
    print ("====== Action record read from file ======")
    print ("key[0] => ", record[0])
    print ("value[0] => ", record[1])
    print ("==========================================")


def GetFirmwareSize(fwFile):
    actionRecord['Firmware-Length'] = os.path.getsize(fwFile).to_bytes(4, byteorder='little')


def ReadActionRecordFromConfig(configs):
    for config in configs:
        if '=' in config:
            keyValue = config.split('=')
        else:
            continue

        if debugActionRecord == True:
            DumpRecordFromFile(keyValue)

        if keyValue[0] == 'Action-Type':
            actionRecord['Action-Type'] = int(keyValue[1], 16).to_bytes(1, byteorder='big')
        if keyValue[0] == 'Components':
            actionRecord['Components'] = int(keyValue[1], 16).to_bytes(1, byteorder='big')
        if keyValue[0] == 'Firmware-Version':
            actionRecord['Firmware-Version'] = int(keyValue[1], 16).to_bytes(6, byteorder='big')
        if keyValue[0] == 'Firmware-Description':
            fwDesc = keyValue[1]
            if (len(fwDesc) < 21):
                fwDesc += '\0' * (21 - len(fwDesc))
            elif (len(fwDesc) > 21):
                fwDesc = fwDesc[:(21 - len(fwDesc))]
            actionRecord['Firmware-Description'] = fwDesc;
        if keyValue[0] == 'Firmware-Name':
            global firmwareName
            if firmwareName == '':
                firmwareName = keyValue[1]


def GenRecordChecksum():
    checksum = 0
    for data in actionRecord:
        if data == 'Firmware-Description':
            fwDescInt = [ord(char) for char in actionRecord[data]]
            for descInt in fwDescInt:
                checksum += descInt
        else:
             for index in range(len(actionRecord[data])):
                checksum += int(actionRecord[data][index])

    checksum = 65536 - checksum
    actionRecord['Checksum'] = checksum.to_bytes(2, byteorder='big')[1].to_bytes(1, byteorder='big')

    if debugActionRecordChecksum == True:
        print ("Action record checksum = ", actionRecord['Checksum'])


def ReadConfigFile():
    with open(hpmConfigFile, 'r') as configFile:
        configs = configFile.read().splitlines()
    return configs


def WriteActionRecordToHpmImage(fileName):
    with open(fileName, "ab+") as openFile:
        openFile.write(actionRecord['Action-Type'])
        openFile.write(actionRecord['Components'])
        openFile.write(actionRecord['Checksum'])
        openFile.write(actionRecord['Firmware-Version'])

        descArray = [ord(char) for char in actionRecord['Firmware-Description']]
        for descChar in descArray:
            openFile.write(descChar.to_bytes(1, byteorder='big'))

        openFile.write(actionRecord['Firmware-Length'])

    if debugActionRecord == True:
        DumpRecord()


def GetFirmware(fw):
    with open(fw, 'rb') as fwImage:
        return fwImage.read()


def GetPrivateKey(keys=devKeys):
    with tarfile.open(keys, mode='r:gz') as keys_tar_gz:
        return keys_tar_gz.extractfile(pemFilePath).read()


def SignFirmware(fw, key, signedFw):
    fwData = GetFirmware(fw)
    fwImageData = Signtool.SignFirmware(fwData, key)

    with open(signedFw, 'wb') as fwImage:
        fwImage.write(fwImageData)


def AppendCustomizedHeader(fw, header, fwWithHeader):
    fwData = GetFirmware(fw)
    with open(fwWithHeader, 'w') as newFw:
        print ("customizede header: ", header)
        newFw.write(header + '\n')
    with open(fwWithHeader, 'ab') as newFw:
        newFw.write(fwData)


def AppendImage(fw, hpmImgFile):
    with open(fw, "rb") as sourceImg:
        sourceData = sourceImg.read()
        with open(hpmImgFile, "ab") as hpmImg:
            hpmImg.write(sourceData)


def AppendMd5CheckSum(hpmImg):
    m = hashlib.md5()
    with open(hpmImg, "rb+") as hpmFile:
        sourceData = hpmFile.read()
        m.update(sourceData)
        if debugMd5 == True:
            print ("md5 = {}".format(m.hexdigest()))
        hpmFile.write(int(m.hexdigest(), 16).to_bytes(16, byteorder='big'))

def DumpHeader():
    print ("====== Image Header ======")
    for key in upgradeImageHeader:
        print ("key:", key , "; value:", upgradeImageHeader[key])
    print ("===========================")


def DumpRecord():
    print ("====== Action record ======")
    for key in actionRecord:
        print ("key:", key , "; value:", actionRecord[key])
    print ("===========================")


def DumpRecordFromFile(record):
    print ("====== Action record read from file ======")
    print ("key[0] => ", record[0])
    print ("value[0] => ", record[1])
    print ("==========================================")


def ShowUsage():
    print("Usage: GenHpmFw.py -i input_firmware -o output_image -conf config_file")
    print("Parameters:")
    print("               -i        input firmware of the target component")
    print("               -o        output HPM image tool")
    print("               -conf     the config file for creating the out HPM image")
    print("               -id       the BMC product ID")
    print("               -custom   append the customized header")
    print("               -sign     append the security header")


def main():
    signedFw = ''
    finalSourceFw = ''
    enableSecureFwUpdate = False
    hasInputFw = 0
    hasOutputImg = 0
    hasConfFile = 0

    for index in range(len(sys.argv)):
        if sys.argv[index] == '-i':
            global firmwareName
            firmwareName = sys.argv[index + 1]
            hasInputFw = 1
        elif sys.argv[index] == '-o':
            global hpmImgName
            hpmImgName = sys.argv[index + 1]
            hasOutputImg = 1;
        elif sys.argv[index] == '-id':
            upgradeImageHeader['Product-ID'] = int(sys.argv[index + 1], base=16)
        elif sys.argv[index] == '-conf':
            global hpmConfigFile
            hpmConfigFile = sys.argv[index + 1]
            hasConfFile = 1

    # check the config file exist
    if not hpmConfigFile:
        print ("Need a config file")
        return
    if not os.path.isfile(hpmConfigFile):
        print ("The config file does not exist. Config file: ", hpmConfigFile)
        return

    # read configurations from the configuration file
    configs = ReadConfigFile()

    # parse image header data from configurations
    ReadImageHeaderFromConfig(configs)

    # check the output file name is not empty
    if not hpmImgName:
        print ("Lack HPM-Image-Name in the config file: ", hpmConfigFile)
        return

    if isSignKey:
        if not signKey:
            print ("Need a key for signing key")
            return
        if not os.path.isfile(signKey):
            print ("The key file does not exist: ", signKey)
            return

    # create folder for the output file
    outputFolder = os.path.dirname(hpmImgName)
    os.makedirs(outputFolder, exist_ok=True)

    if not upgradeComponentName:
        print ("Lack Upgrade-Component-Name in the config file: ", hpmConfigFile)
        return

    # write image hader data to the HPM upgrade image
    WriteImageHeader(hpmImgName)

    # parse action record data from configurations
    ReadActionRecordFromConfig(configs)

    if not firmwareName or not os.path.isfile(firmwareName):
        print ("Lack Firmware-Name in the config file: ", hpmConfigFile)
        return

    finalSourceFw = firmwareName

    # Generate the signed firmware
    if isSignKey:
        signedFw = outputFolder + '/sign-' + os.path.basename(firmwareName)
        finalSourceFw = signedFw
        key = GetPrivateKey(signKey)
        SignFirmware(firmwareName, key, signedFw)
        print ("Generate the singed firmware: ", signedFw)

    # Append the customized header to the input firmware
    if customizedHeader:
        fwWithHeader = outputFolder + '/custom-header-' + os.path.basename(firmwareName)
        finalSourceFw = fwWithHeader
        AppendCustomizedHeader(firmwareName, customizedHeader, fwWithHeader)

        # sign the input firmware
        if isSignKey:
            signedFw = outputFolder + '/sign-custom-header-' + os.path.basename(firmwareName)
            finalSourceFw = signedFw
            key = GetPrivateKey(signKey)
            SignFirmware(fwWithHeader, key, signedFw)

    # Calculate firmware size
    GetFirmwareSize(finalSourceFw)

    # Calculate checksum of the Record header
    GenRecordChecksum()

    # write action record data to the HPM upgrade image
    WriteActionRecordToHpmImage(hpmImgName)

    # Append the source firmware to the end of the action record
    AppendImage(finalSourceFw, hpmImgName)

    if debugFinalSourceFw:
        print ("Final source firmware:", finalSourceFw)

    # Append the MD5 checksum of the whole HPM image to the end of the image.
    AppendMd5CheckSum(hpmImgName)

    print ("Generate the HPM upgrade image: ", hpmImgName)

    # remove the customized firmware
    if customizedHeader:
        if os.path.isfile(fwWithHeader):
            os.remove(fwWithHeader)
        if enableSecureFwUpdate:
            if os.path.isfile(signedFw):
                os.remove(signedFw)

if __name__ == "__main__":
    main()
