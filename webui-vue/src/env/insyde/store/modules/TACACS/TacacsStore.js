import api from '@/store/api';
import i18n from '@/i18n';

const TACACSStore = {
  namespaced: true,
  state: {
    result: null,
    data: null,
  },
  getters: {
    result: (state) => state.result,
    data: (state) => state.data,
  },
  mutations: {
    setResult: (state, attr) => {
      state.result = attr;
    },
    setData: (state, attr) => {
      state.data = attr;
    },
  },
  actions: {
    async getTACACS({ commit }) {
      let headConfig = {
        headers: {
          oem_web_tag: 'WEB',
          query: 'CONFIG',
        },
      };
      try {
        await api.get('/cgi/tacacs.cgi', headConfig).then((response) => {
          commit('setData', response.data);
        });
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorGetSettings'), error);
      }
    },
    async postTACACS({ commit }, configObj) {
      let headConfig = {
        headers: {
          oem_web_tag: 'WEB',
          query: 'CONFIG',
        },
      };
      try {
        await api
          .post('/cgi/tacacs.cgi', configObj, headConfig)
          .then((response) => {
            commit('setResult', response.data?.result ?? 'error');
          });
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorSaveSettings'), error);
      }
    },
  },
};

export default TACACSStore;
