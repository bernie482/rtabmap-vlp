import api from '@/store/api';
import i18n from '@/i18n';

const DDNSStore = {
  namespaced: true,
  state: {
    result: null,
  },
  getters: {
    result: (state) => state.result,
    ddnsinfo: (state) => state.result,
  },
  mutations: {
    rspresult: (state, attr) => {
      state.result = attr;
    },
  },
  actions: {
    async getddnsInfo({ dispatch }) {
      try {
        let rsp = await api.get('/cgi/config_ddns.cgi');
        await dispatch('configResult', {
          attrs: rsp.data,
        });
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorGetSettings'), error);
      }
    },
    async saveDDNSConfig({ dispatch }, configObj) {
      try {
        let rsp = await api.post('/cgi/config_ddns.cgi', configObj);
        await dispatch('configResult', {
          attrs: rsp.data,
        });
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorSaveSettings'), error);
      }
    },
    async configResult({ commit }, attrObj) {
      try {
        let attr = attrObj.attrs;
        commit('rspresult', attr);
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorUpdate'), error);
      }
    },
  },
};
export default DDNSStore;
