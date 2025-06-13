import api from '@/store/api';
import i18n from '@/i18n';

const VFPStore = {
  namespaced: true,
  state: {
    result: null,
  },
  getters: {
    result: (state) => state.result,
  },
  mutations: {
    setResult: (state, attr) => {
      state.result = attr;
    },
  },
  actions: {
    async postHostState({ commit }, configObj) {
      let headConfig = {
        headers: {
          oem_web_tag: 'WEB',
          query: 'CHASSIS_CONTROL',
        },
      };
      try {
        await api
          .post('/cgi/chassis.cgi', configObj, headConfig)
          .then((response) => {
            commit('setResult', response.data);
          });
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorGetSettings'), error);
      }
    },
    async postUIDControl({ commit }, configObj) {
      let headConfig = {
        headers: {
          oem_web_tag: 'WEB',
          query: 'SET_UID_CONTROL_STATUS',
        },
      };
      try {
        await api
          .post('/cgi/chassis.cgi', configObj, headConfig)
          .then((response) => {
            commit('setResult', response.data);
          });
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorGetSettings'), error);
      }
    },
  },
};

export default VFPStore;
