import api from '@/store/api';
import i18n from '@/i18n';

const KRBAuthStore = {
  namespaced: true,
  state: {
    krb: null,
    result: null,
  },
  getters: {
    krbinfo: (state) => state.krb,
    result: (state) => state.result,
  },
  mutations: {
    krbinfo: (state, attr) => {
      state.krb = attr;
    },
    rspresult: (state, attr) => {
      state.result = attr;
    },
  },
  actions: {
    async uploadCert({ dispatch }, configObj) {
      try {
        let rsp = await api.put('/cgi/config_krb.cgi', configObj);
        await dispatch('configResult', {
          attrs: rsp.data,
        });
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorInvalidPayload'), error);
      }
    },
    async postKRB5Info({ dispatch }) {
      try {
        let rsp = await api.post('/cgi/config_krb.cgi');
        await dispatch('KRBInfo', {
          attrs: rsp.data,
        });
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorGetSettings'), error);
      }
    },
    async configAuth({ dispatch }, configObj) {
      try {
        let rsp = await api.patch('/cgi/config_krb.cgi', configObj);
        await dispatch('configResult', {
          attrs: rsp.data,
        });
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorSaveSettings'), error);
      }
    },
    async KRBInfo({ commit }, attrObj) {
      try {
        let attr = attrObj.attrs;
        commit('krbinfo', attr);
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorGetSettings'), error);
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
export default KRBAuthStore;
