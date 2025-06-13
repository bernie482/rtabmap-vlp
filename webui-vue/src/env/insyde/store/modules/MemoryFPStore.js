import api from '@/store/api';
import i18n from '@/i18n';
import { getField, updateField } from 'vuex-map-fields';

const MemoryFPStore = {
  namespaced: true,
  state: {
    dimms: [
      /* data format
      {
          "@odata.context": "/redfish/v1/$metadata#Memory.Memory",
          "@odata.id": "/redfish/v1/Systems/123456789abcdef/Memory/Dimm1",
          "@odata.type": "#Memory.v1_12_0.Memory",
          "Id": "Dimm1",
          "Name": "Dimm 1",
          "Description": "System Memory",
          "MemoryType": "DRAM",
          "BaseModuleType": "RDIMM",
          "MemoryDeviceType": "DDR4",
          "CapacityMiB": 32768,
          "DataWidthBits": 64,
          "BusWidthBits": 72,
          "Manufacturer": "Micron",
          "SerialNumber": "1733-184D32D2",
          "PartNumber": "36ASF4G72PZ-2G6D1   ",
          "AllowedSpeedsMHz": [
              2666
          ],
          "MemoryMedia": [
              "DRAM"
          ],
          "RankCount": 2,
          "Location": {
              "PartLocation": {
                  "ServiceLabel": "CPU0_DIMM_B1"
              }
          },
          "Links": {
              "Processors": [
                  {
                      "@odata.id": "/redfish/v1/Systems/123456789abcdef/Processors/CPU1"
                  }
              ]
          },
          "MemoryLocation": {
              "Channel": 1,
              "MemoryController": 0,
              "Slot": 1,
              "Socket": 2
          },
          "ErrorCorrection": "MultiBitECC",
          "OperatingSpeedMhz": 2666,
          "OperatingMemoryModes": [
              "Volatile"
          ],
          "FirmwareRevision": "0000 ",
          "ModuleManufacturerID": "0x2c80",
          "ModuleProductID": "0x0000",
          "MemorySubsystemControllerManufacturerID": "0x0000",
          "MemorySubsystemControllerProductID": "0x0000",
          "NonVolatileSizeMiB": 0,
          "VolatileSizeMiB": 33554432,
          "CacheSizeMiB": 0,
          "LogicalSizeMiB": 0,
          "Metrics": {
              "@odata.id": "/redfish/v1/Systems/123456789abcdef/Memory/Dimm1/MemoryMetrics"
          },
          "Oem": {
              "InsydeMemory": {
                  "@odata.type": "#InsydeOEMExtensions.Memory",
                  "AssetTag": " ",
                  "HealthScore": 100
              }
          },
          "Status": {
              "State": "Enabled",
              "Health": "OK",
              "HealthRollup": "OK"
          },
          "@odata.etag": "008d5123463f31352d59ba073cab0133"
      }*/
    ],
  },
  getters: {
    getField,
  },
  mutations: {
    updateField,
  },
  actions: {
    async getMemoryAll({ state }) {
      //console.info('getMemoryAll');
      return await api
        .get('/redfish/v1/Systems/system/Memory')
        .then((response) =>
          response.data.Members.map((item) => item['@odata.id'])
        )
        .then((urls) => api.all(urls.map((item) => api.get(item))))
        .then((records) => {
          state.dimms = records.map((record) => record.data);
        })
        .catch((error) => {
          console.error(error);
          const message = i18n.t('pageUsers.toast.errorLoadUsers');
          throw new Error(message, error);
        });
    },
  },
};

export default MemoryFPStore;
