import api from '@/store/api';
import i18n from '@/i18n';

const AssemblyStore = {
  namespaced: true,
  state: {
    assemblies: [],
  },
  getters: {
    assemblies: (state) => state.assemblies,
  },
  mutations: {
    setAssemblyInfo: (state, data) => {
      let newAssemblies = data.map((assembly) => {
        const {
          MemberId,
          PartNumber,
          SerialNumber,
          SparePartNumber,
          Model,
          Name,
          Location,
          LocationIndicatorActive,
        } = assembly;
        return {
          id: MemberId,
          partNumber: PartNumber,
          serialNumber: SerialNumber,
          sparePartNumber: SparePartNumber,
          model: Model,
          name: Name,
          locationNumber: Location?.PartLocation?.ServiceLabel,
          identifyLed: LocationIndicatorActive,
          uri: assembly['@odata.id'],
        };
      });
      state.assemblies.push(...newAssemblies);
    },
  },
  actions: {
    async getChassisCollection() {
      return await api
        .get('/redfish/v1/Chassis')
        .then(({ data: { Members } }) =>
          Members.map((member) => member['@odata.id'])
        )
        .catch((error) => console.log(error));
    },
    async getAllAssemblyInfo({ dispatch }) {
      const chassisUrls = await dispatch('getChassisCollection');
      if (!chassisUrls || chassisUrls.length == 0) return;
      return await api
        .all(chassisUrls.map((url) => api.get(url)))
        .then((chassisInfos) => {
          let thermalUrls = chassisInfos
            .filter((info) => info.data.Assembly)
            .map(({ data: { Assembly } }) => Assembly['@odata.id']);
          if (thermalUrls.length <= 0) return;
          return api.all(
            thermalUrls.map((url) => dispatch('getAssemblyInfo', url))
          );
        })
        .catch((error) => console.log(error));
    },
    async getAssemblyInfo({ commit }, chassisUrl) {
      return await api
        .get(chassisUrl)
        .then(({ data }) => commit('setAssemblyInfo', data?.Assemblies))
        .catch((error) => console.log(error));
    },
    async updateIdentifyLedValue({ dispatch }, led) {
      const uri = led.uri;
      const updatedIdentifyLedValue = {
        LocationIndicatorActive: led.identifyLed,
      };
      return await api.patch(uri, updatedIdentifyLedValue).catch((error) => {
        dispatch('getAssemblyInfo');
        console.log('error', error);
        if (led.identifyLed) {
          throw new Error(i18n.t('pageInventory.toast.errorEnableIdentifyLed'));
        } else {
          throw new Error(
            i18n.t('pageInventory.toast.errorDisableIdentifyLed')
          );
        }
      });
    },
  },
};

export default AssemblyStore;
