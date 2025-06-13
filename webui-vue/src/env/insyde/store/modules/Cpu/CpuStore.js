import api from '@/store/api';
import i18n from '@/i18n';

const CpuStore = {
  namespaced: true,
  state: {
    cpuValues: null,
    cpuID: [],
  },
  getters: {
    cpuValues: (state) => state.cpuValues,
    cpuID: (state) => state.cpuID,
  },
  mutations: {
    setAttributes: (state, attributes) => {
      state.cpuValues = attributes;
    },
    setCpuMemberID: (state, attributes) => {
      state.cpuID = attributes;
    },
  },
  actions: {
    async getNumOfcpu({ dispatch }) {
      try {
        let processorCollection = 'redfish/v1/Systems/system/Processors';
        if (processorCollection) {
          const cpuCollectionResp = await api.get(processorCollection);
          await dispatch('setupcpuid', {
            attributes: cpuCollectionResp.data,
          });
        }
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorGetSettings'), error);
      }
    },
    async getCpu({ dispatch }, cpuUrl) {
      try {
        if (cpuUrl) {
          const cpuResp = await api.get(cpuUrl);
          await dispatch('getAttributes', {
            attributes: cpuResp.data,
          });
        } else {
          throw new Error('cpu url is empty');
        }
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorGetSettings'), error);
      }
    },
    async setupcpuid({ commit }, attrObj) {
      try {
        let attributes = attrObj.attributes;
        commit('setCpuMemberID', attributes);
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorSaveSettings'), error);
      }
    },
    async getAttributes({ commit }, attrObj) {
      try {
        let attributes = attrObj.attributes;
        commit('setAttributes', attributes);
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorGetSettings'), error);
      }
    },
  },
};

export default CpuStore;
