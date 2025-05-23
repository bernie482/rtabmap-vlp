/**
***************************************************************************
* @config.h
*
* @section LICENSE
*
* Copyright (c) 2013-2019, Insyde Software Corp. All Rights Reserved.
*
* You may not reproduce, distribute, publish, display, perform, modify, adapt,
* transmit, broadcast, present, recite, release, license or otherwise exploit
* any part of this publication in any form, by any means, without the prior
* written permission of Insyde Software Corp.
*
*****************************************************************************/

#define CFG_PROJ_FSAFE_IMG_SIZE 0x3700000
#define CFG_PROJ_UNSIGNED_REGION_SIZE 0x800000
#define NVD_DEFAULT_START1 0x3EB0000
#define NVD_DEFAULT_LENGTH1 0x40000
#define NVD_DEFAULT_START2 0x3EF0000
#define NVD_DEFAULT_LENGTH2 0x40000
#define SDR_DEFAULT_START 0x3F30000
#define SDR_DEFAULT_LENGTH 0x10000
#define FW_IMG_LEN 0x3800000
#define FW_IMG_2_START 0x4000000
#define FW_IMG_2_END 0x7700000
#define FW_IMG_2_BASE_ADDR 0x3F00000
#define COMMON_AREA_LEN CFG_PROJ_UNSIGNED_REGION_SIZE
#define ACTIVE_MANIFEST_ADDR 0x37FF000
#define RUBIX_IMAGE_END 0x00100000
#define FLASH_OFFSET_MFST ACTIVE_MANIFEST_ADDR
#define FLASH_OFFSET_FWID 0x000FE000
#define FLASH_OFFSET_LKRG 0x37FD000
#define CONFIG_ENV_SIZE 0x10000
#define CONFIG_ENV_OFFSET 0x3A00000
#define FlashSize 0x4000000
#define ROOT_PUBLIC_KEY_ADDR_K1 0x000FB000
#define ROOT_PUBLIC_KEY_ADDR_K2 0xFC000
#define ROOT_PUBLIC_KEY_ADDR_K3 0xFD000
#define IMG_BUFFER_SIZE 0x3800000
