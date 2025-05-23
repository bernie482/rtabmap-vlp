#!/usr/bin/env python3
# -*- coding: utf-8 -*-

###########################################################################
# @file Signtool.py
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

import struct
import time
import os
import zlib
import sys
import argparse
from Crypto.Signature import PKCS1_v1_5
from Crypto import Hash
from Crypto.PublicKey import RSA


def get_key_size(hash_algo: str) -> int:
    """Get the key size by the given hash algorithm name

    Args:
        hash_algo (str): Hash algorithm

    Returns:
        int: Size of the hash length for the target hash algorithm name
    """
    guessing_hash_algo_list = ['sha']
    bits_size = None
    for guessing_hash_algo in guessing_hash_algo_list:
        if hash_algo.startswith(guessing_hash_algo):
            try:
                bits_size = int(hash_algo[len(guessing_hash_algo):])
            except (ValueError, AssertionError):
                pass
    return bits_size


def get_digest(data: bytes, hash_algo='sha256'):
    """Get digest for the input data

    Args:
        data (bytes): The input data
        hash_algo (str, optional): Hash algorithm. Defaults to 'sha256'.

    Returns:
        Hash Object: Digest
    """
    hash_algo_module_name = hash_algo.upper()
    hash_algo_module = Hash.__dict__[hash_algo_module_name]
    return hash_algo_module.new(data)


def sign(key, digest: bytes, hash_algo: str = 'sha256') -> bytes:
    """Sign the image, get the signature

    Args:
        key (Hash Object): Private key
        digest (bytes): Digest of the input data
        hash_algo (str, optional): Hash algorithm. Defaults to 'sha256'.

    Returns:
        bytes: Signature
    """
    return PKCS1_v1_5.new(key).sign(digest)


class Header():
    """Section header + Signature
    """
    firmware_image_data = None
    thisSSignedImageInfoStruct = None
    signature = None
    hash_algo = None

    def __init__(self, firmware_image_data: bytes, key, hash_algo: str = 'sha256', **kwargs):
        """Initial function of "class Header"

        Args:
            firmware_image_data (bytes): The input firmware image data
            key (Hash Object): Private key
            hash_algo (str, optional): Hash algorithm. Defaults to 'sha256'.
        """
        self.firmware_image_data = firmware_image_data
        self.key = key
        self.hash_algo = hash_algo
        self.thisSSignedImageInfoStruct = SSignedImageInfoStruct(
            firmware_image_data=firmware_image_data, hash_algo=hash_algo, **kwargs)

    def pack(self) -> bytes:
        """Package the datas

        Returns:
            bytes: Packed data.
        """
        digest = get_digest(
            self.thisSSignedImageInfoStruct.pack() + self.firmware_image_data, self.hash_algo)
        self.signature = sign(key=self.key, digest=digest,
                              hash_algo=self.hash_algo)

        return self.thisSSignedImageInfoStruct.pack() + self.signature


class SSignedImageInfoStruct:
    """Section header
    """

    # Const Data
    GLOBAL = 'GLOBAL'
    SIZEOF_SSignedImageInfoStruct = 0x40
    SIGNED_IMG_REV = 0x00
    CUKY_LEN = 16
    UINT32_SIZE = 4

    # "*SignedImage*", search key when looking for structure
    SIGNED_IMG_COOKIE = "*SignedImage*".ljust(CUKY_LEN, '\0')

    # Predefined Variables
    au8Cookie = SIGNED_IMG_COOKIE[:CUKY_LEN]
    u8Version = SIGNED_IMG_REV  # Structure version = SIGNED_IMG_REV
    u8StructureSize = SIZEOF_SSignedImageInfoStruct
    u16SecVersion = 0  # security version -- cannot downgrade below this
    # extra build number information (Added in SIGNED_IMG_REV 0)
    u16BuildExtra = 0x0000
    u16Reserved = 0x0000
    u32Timestamp = int(time.time())  # unix timestamp of image creation time
    # u32Timestamp = 0x5f34e4d1  # unix timestamp of image creation time
    u8VersionMajor = 0x00  # Major boot block FW version
    u8VersionMinor = 0x00  # Minor boot block FW version
    u16BuildNumber = 0x0000  # FW Build Number or other relevant version info
    u16CertSize = 0x0000  # size of certificate, little endian
    u16SigSize = None  # size of signature, little endian
    u32ImageType = 0  # image type from config.genimage, listed above
    u32ImageFlags = 0  # composite/compressed/encrypted/etc.
    u32XferStart = 0x00000000  # offset of section within fw upd image
    u32XferSize = 0x00000000  # size of section within fw upd image
    u32ImageStart = None  # address in flash where the image data starts
    u32ImageSize = None  # size of section in flash
    u32CRC = None  # crc32 of entire header (except this field)
    u32CRCPath = 60

    # Format string for packing
    # '<' means little endian (and that the alignment of the latter is standardized)
    # 'B' means UINT8
    # 'H' means UINT16
    # 'I' means UINT32
    FORMAT_STR = "<{CUKY_LEN}BBBHHHIBBHHHIIIIIII".format(CUKY_LEN=CUKY_LEN)

    def __init__(self, firmware_image_data: bytes, hash_algo='sha256'):
        """Initial 'class SSignedImageInfoStruct'

        Args:
            firmware_image_data (bytes): Firmware image data bytes
            hash_algo (str, optional): Hash algorithm. Defaults to 'sha256'.
        """
        # Assign Value to Manifest
        self.u32ImageSize = len(firmware_image_data)

        self.u16SigSize = get_key_size(hash_algo)
        self.u32ImageStart = self.SIZEOF_SSignedImageInfoStruct + self.u16SigSize

        # Caculate CRC32
        self.u32CRC = 0
        data = bytes(self.pack())
        data = data[:self.u32CRCPath] + \
            data[(self.u32CRCPath + self.UINT32_SIZE):]

        self.u32CRC = zlib.crc32(data)

    def pack(self) -> bytes:
        """Package the datas

        Returns:
            bytes: Packed data.
        """
        try:
            au8Cookie = self.au8Cookie.encode()
        except AttributeError:
            au8Cookie = self.au8Cookie

        return struct.pack(self.FORMAT_STR, *au8Cookie, self.u8Version, self.u8StructureSize, self.u16SecVersion, self.u16BuildExtra, self.u16Reserved, self.u32Timestamp, self.u8VersionMajor, self.u8VersionMinor, self.u16BuildNumber, self.u16CertSize, self.u16SigSize, self.u32ImageType, self.u32ImageFlags, self.u32XferStart, self.u32XferSize, self.u32ImageStart, self.u32ImageSize, self.u32CRC)


def load_privatekey_from_data(key_data: bytes) -> RSA.RsaKey:
    """Get the object of the input key data

    Args:
        key_data (bytes): Private key

    Returns:
        An RSA key object (:class:`RsaKey`).
    """
    return RSA.import_key(key_data)


def GetHeader(firmware_image_data: bytes, private_key_data: bytes) -> bytes:
    """Get Section Header & Signature

    Args:
        firmware_image_data (bytes): Firmware image data bytes.
        private_key_data (bytes): Private key bytes.

    Returns:
        bytes: Signature bytes
    """
    private_key = load_privatekey_from_data(private_key_data)
    input_firmware = Header(firmware_image_data, private_key)
    return input_firmware.pack()


def SignFirmware(firmware_image_data: bytes, private_key_data: bytes) -> bytes:
    """Sign the firmware image

    Args:
        firmware_image_data (bytes): Firmware image data bytes to be signed
        private_key_data (bytes): Private key bytes.

    Returns:
        bytes: The signed firmware image bytes
    """
    return GetHeader(firmware_image_data, private_key_data) + firmware_image_data


if __name__ == "__main__":
    DEFAULT_KEYS = os.path.abspath(
        "{my_path}/../configs/keystore/DevKeys/developmentKeys.tar.gz").format(my_path=os.path.dirname(__file__))
    parser = argparse.ArgumentParser(description='Sign the HPM Firmawre')
    parser.add_argument('--firmware-image', '-i', dest='firmware_image',
                        help='Firmware image to sign', type=str, required=True)
    parser.add_argument('--key', '-k', dest='key', help="Private key's path",
                        type=str, default=DEFAULT_KEYS, required=True)
    parser.add_argument('--out', '-o', dest='out',
                        help='Output path', type=str, required=True)
    args = parser.parse_args(sys.argv[1:])

    with open(args.key, 'r') as key_file:
        key = key_file.read()

    with open(args.firmware_image, 'rb') as firmware_image_file:
        firmware_image = firmware_image_file.read()

    signed_firmware_image_data = SignFirmware(firmware_image, key)

    with open(args.out, 'wb') as signed_firmware_image_file:
        signed_firmware_image_file.write(signed_firmware_image_data)
