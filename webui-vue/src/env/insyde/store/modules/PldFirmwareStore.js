import api from '@/store/api';

const PldFirmwareStore = {
  namespaced: false,
  state: {
    pldFirmware: [],
    pldActiveFirmwareId: null,
  },
  getters: {
    activePldFirmware: (state) => {
      return (
        state.pldFirmware.find(
          (firmware) => firmware.id === state.bmcActiveFirmwareId
        ) ||
        state.pldFirmware[0] ||
        null
      );
    },
  },
  mutations: {
    setPldFirmware: (state, firmware) => (state.pldFirmware = firmware),
    setActivePldFirmwareId: (state, id) => (state.pldActiveFirmwareId = id),
  },
  actions: {
    // async getActivePldFirmware() {},
    async getPldFirmwareInventory({ commit }, { url }) {
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
          const pldFirmware = [];
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
              pldFirmware.push(item);
            }
          });
          commit('setPldFirmware', pldFirmware);
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },
};

export default PldFirmwareStore;
