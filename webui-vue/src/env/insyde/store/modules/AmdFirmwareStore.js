import api from '@/store/api';

const AmdFirmwareStore = {
  namespaced: false,
  state: {
    AmdFirmware: [],
    AmdActiveFirmwareId: null,
  },
  getters: {
    activeAmdFirmware: (state) => {
      return (
        state.amdFirmware.find(
          (firmware) => firmware.id === state.bmcActiveFirmwareId
        ) ||
        state.amdFirmware[0] ||
        null
      );
    },
  },
  mutations: {
    setAmdFirmware: (state, firmware) => (state.amdFirmware = firmware),
    setActiveAmdFirmwareId: (state, id) => (state.amdActiveFirmwareId = id),
  },
  actions: {
    async NonComboBiosUpdate() {
      let headConfig = {
        headers: {
          SET_BIOS_TYPE: '0',
        },
      };
      try {
        const rsp = await api.patch(
          '/cgi/config_bios_update.cgi',
          '',
          headConfig
        );
        console.log(rsp.data);
        return rsp.data.length;
      } catch (error) {
        console.log(error);
      }
    },
    async ComboBiosUpdate() {
      let headConfig = {
        headers: {
          SET_BIOS_TYPE: '1',
        },
      };
      try {
        const rsp = await api.patch(
          '/cgi/config_bios_update.cgi',
          '',
          headConfig
        );
        console.log(rsp.data);
        return rsp.data.length;
      } catch (error) {
        console.log(error);
      }
    },
    async getAmdFirmwareInventory({ commit }, { url }) {
      url = url ?? '/redfish/v1/UpdateService/FirmwareInventory';
      const inventoryList = await api
        .get(url)
        .then(({ data: { Members = [] } = {} }) =>
          Members.map((item) => api.get(item['@odata.id']))
        )
        .catch((error) => console.log(error));
      await api
        .all(inventoryList)
        .then((response) => {
          const amdFirmware = [];
          response.forEach(({ data }) => {
            const firmwareType = data?.RelatedItem?.[0]?.['@odata.id']
              .split('/')
              .pop();
            const item = {
              version: data?.Version,
              id: data?.Id,
              location: data?.['@odata.id'],
              status: data?.Status?.Health,
            };
            if (firmwareType === 'cpld') {
              amdFirmware.push(item);
            }
          });
          commit('setAmdFirmware', amdFirmware);
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },
};

export default AmdFirmwareStore;
