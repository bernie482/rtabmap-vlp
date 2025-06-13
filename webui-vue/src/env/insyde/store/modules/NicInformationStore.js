import api from '@/store/api';
import i18n from '@/i18n';
import pciData from '@/env/insyde/json/pci_ids.json';
import { getField, updateField } from 'vuex-map-fields';

const NicInformationStore = {
  namespaced: true,
  state: {
    rawNCSIs: [],
    NCSIs: [],
    packages: [],
    pciIds: {}, // ref: '/json/pci_ids.json'
    //  IANA Enterprise Number
    iana: {
      28874: 'Solarflare Communications Inc.',
      343: 'Intel Corporation',
      4413: 'Broadcom Corporation',
      33049: 'Mellanox Technologies LTD',
      10488: 'Chelsio Communications',
      7244: 'Quanta Computer Inc.',
      11946: 'Quanta Network Systems Inc.',
      44294: 'Quanta-Computing',
      15694: 'Silicom',
      40092: 'Wiwynn Corporation',
      47196: 'Hewlett Packard Enterprise',
      19046: 'Lenovo Enterprise Business Group',
      674: 'Dell Inc.',
      3873: 'QLogic',
      46033: 'Cavium Inc.',
      20495: 'Marvell Semiconductor Israel, Ltd',
      26696: 'Marvell Semiconductor Inc.',
    },
  },
  getters: {
    getField,
  },
  mutations: {
    updateField,
  },
  actions: {
    async getPciIdsData({ state }) {
      //console.info('getPciIdsData');
      // NOTE: only fetch data once
      if (state.pciIds && Object.keys(state.pciIds).length) return;
      // 1) Get json data from the backend.
      //return await api
      //.get('/json/pci_ids.json')
      //.then((response) => {
      //    state.pciIds = response.data;
      //  })
      //  .catch((error) => {
      //    console.error(error);
      //  });
      // 2) Get json data from the frontend.
      state.pciIds = pciData;
    },
    async getData({ state }) {
      //console.info('getData');
      let packageUrls = [];
      return await api
        .get('/redfish/v1/Systems/system/Oem/Insyde/Ncsi')
        .then((response) =>
          response.data.Members.map((item) => item['@odata.id'])
        )
        .then((urls) => api.all(urls.map((item) => api.get(item))))
        .then((records) => {
          //console.info('getData', records);
          if (records) {
            state.rawNCSIs = records.map((record) => record.data);

            // convert to human data
            let counter = 0;
            state.NCSIs = state.rawNCSIs.map((data) => {
              let vid = _.get(data, 'VersionID.PCIVID');
              if (vid)
                vid = ('0000' + vid.replace('0x', '')).slice(-4).toLowerCase();
              let did = _.get(data, 'VersionID.PCIDID');
              if (did)
                did = ('0000' + did.replace('0x', '')).slice(-4).toLowerCase();
              let svid = _.get(data, 'VersionID.PCISVID');
              if (svid)
                svid = ('0000' + svid.replace('0x', ''))
                  .slice(-4)
                  .toLowerCase();
              let ssid = _.get(data, 'VersionID.PCISSID');
              if (ssid)
                ssid = ('0000' + ssid.replace('0x', ''))
                  .slice(-4)
                  .toLowerCase();

              // Set up location
              let location = data.DeviceType || 'N/A';
              if (data.DeviceType == 'PCIe') {
                // PCI Bus 0, Device 0, Function 0
                location = data.PhysicalAddress || 'N/A';
                if (data.PhysicalAddress) {
                  let addr = (
                    '0000' + data.PhysicalAddress.replace('0x', '')
                  ).slice(-4);
                  let df = parseInt(addr.slice(-2), 16);
                  let d = (df & 0xf8) >> 3;
                  let f = df & 7;
                  location =
                    'PCI Bus ' +
                    parseInt(addr.slice(0, 2), 16) +
                    ', Device ' +
                    d +
                    ', Function ' +
                    f;
                }
                //QCT request, no other detial info.
                location = 'PCI';
              } else if (data.DeviceType == 'SMBus') {
                // I2C Channel 0xXX, Slave Address 0xXX
                if (data.I2CPhysicalChannel) {
                  location = 'I2C Channel ' + data.I2CPhysicalChannel;
                } else {
                  location = 'I2C Channel N/A';
                }
                if (data.PhysicalAddress) {
                  location += ', Slave Address ' + data.PhysicalAddress;
                } else {
                  location += ', Slave Address N/A';
                }
                //QCT request, no other detial info.
                location = data.DeviceType;
              }

              let manufacturerID = _.get(
                data,
                'VersionID.ManufacturerID',
                'N/A'
              );

              return {
                index: counter++, // virtual field
                vendorName: _.get(state.pciIds, `PCI_DEVICE[${vid}].DESC`),
                deviceName: _.get(
                  state.pciIds,
                  `PCI_DEVICE[${vid}][${did}].DESC`
                ),
                location,
                deviceType: data.DeviceType,
                channelDescription: i18n.t(
                  'pageNicInformation.LANG_SYS_NIC_TOTAL_CHANNEL'
                ),
                subsystemName: _.get(
                  state.pciIds,
                  `PCI_DEVICE[${vid}][${did}][${svid}][${ssid}].DESC`
                ),
                firmwareName: data.VersionID.FirmwareName,
                firmwareVersion: data.VersionID.FirmwareVersion,
                manufacturer:
                  state.iana[parseInt(manufacturerID)] || manufacturerID,
                totalNicNum: 0,
                vendor: vid,
                device: did,
                subvendor: svid,
                subdevice: ssid,
              };
            });
            //console.info('state.NCSIs', state.NCSIs);

            // NOTE: assume one NIC only use a package. So that they are mapped in index order.
            // request package data
            packageUrls = records.map((record) =>
              record.data.Package.map((item) => item['@odata.id'])
            );
            api
              .all(packageUrls.map((item) => api.get(item)))
              .then((records) => {
                state.packages = records.map((record) => record.data);
                //console.info('state.packages', state.packages);
              });
          }
        })
        .catch((error) => {
          console.error(error);
          const message = i18n.t('pageUsers.toast.errorLoadUsers');
          throw new Error(message, error);
        });
    },
  },
};

export default NicInformationStore;
