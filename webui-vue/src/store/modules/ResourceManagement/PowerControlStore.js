import api from '@/store/api';
import i18n from '@/i18n';

const PowerControlStore = {
  namespaced: true,
  state: {
    powerControlUrl: null,
    powerCapValue: null,
    powerConsumptionValue: null,
  },
  getters: {
    powerCapValue: (state) => state.powerCapValue,
    powerConsumptionValue: (state) => state.powerConsumptionValue,
  },
  mutations: {
    setPowerControlUrl: (state, powerControlUrl) =>
      (state.powerControlUrl = powerControlUrl),
    setPowerCapValue: (state, powerCapValue) =>
      (state.powerCapValue = powerCapValue),
    setPowerConsumptionValue: (state, powerConsumptionValue) =>
      (state.powerConsumptionValue = powerConsumptionValue),
  },
  actions: {
    setPowerCapUpdatedValue({ commit }, value) {
      commit('setPowerCapValue', value);
    },
    async getPowerControlUrl({ commit }) {
      return await api
        .get('/redfish/v1/Chassis')
        .then(({ data: { Members = [] } }) =>
          Members.map((member) => member['@odata.id']).filter(
            (url) => url.indexOf('_Chassis') > 0
          )
        )
        .then((urls) => {
          let url = urls.length > 0 ? urls[0] : null;
          commit('setPowerControlUrl', url);
        });
    },
    async getPowerControl({ state, commit, dispatch }) {
      if (!state.powerControlUrl) await dispatch('getPowerControlUrl');
      if (!state.powerControlUrl) {
        throw new Error(
          i18n.t('pageServerPowerOperations.toast.errorNoPowerUrl')
        );
      }
      return await api
        .get(`${state.powerControlUrl}/Power`)
        .then((response) => {
          const powerControl = response.data.PowerControl;
          const powerCap = powerControl[0].PowerLimit.LimitInWatts;
          // If system is powered off, power consumption does not exist in the PowerControl
          const powerConsumption = powerControl[0].PowerConsumedWatts || null;

          commit('setPowerCapValue', powerCap);
          commit('setPowerConsumptionValue', powerConsumption);
        })
        .catch((error) => {
          console.log('Power control', error);
        });
    },
    async setPowerControl({ state, dispatch }, powerCapValue) {
      if (!state.powerControlUrl) await dispatch('getPowerControlUrl');
      if (!state.powerControlUrl) {
        throw new Error(
          i18n.t('pageServerPowerOperations.toast.errorNoPowerUrl')
        );
      }
      const data = {
        PowerControl: [{ PowerLimit: { LimitInWatts: powerCapValue } }],
      };

      return await api
        .patch(`${state.powerControlUrl}/Power`, data)
        .then(() =>
          i18n.t('pageServerPowerOperations.toast.successSaveSettings')
        )
        .catch((error) => {
          console.log(error);
          throw new Error(
            i18n.t('pageServerPowerOperations.toast.errorSaveSettings')
          );
        });
    },
  },
};

export default PowerControlStore;
