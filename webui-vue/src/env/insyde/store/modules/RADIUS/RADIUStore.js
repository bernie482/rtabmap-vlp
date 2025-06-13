import api from '@/store/api';
import i18n from '@/i18n';

const RADIUStore = {
  namespaced: true,
  state: {
    netstat: null,
    radiuscfg: null,
    result: null,
  },
  getters: {
    netstat: (state) => state.netstat,
    radiuscfg: (state) => state.radiuscfg,
    result: (state) => state.result,
  },
  mutations: {
    netstatdata: (state, attr) => {
      state.netstat = attr;
    },
    radiusdata: (state, attr) => {
      state.radiuscfg = attr;
    },
    rspresult: (state, attr) => {
      state.result = attr;
    },
  },
  actions: {
    async checkUsedPort({ dispatch }) {
      try {
        let rsp = await api.post('/cgi/netstat.cgi');
        await dispatch('chkResult', {
          attrs: rsp.data,
        });
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorGetSettings'), error);
      }
    },
    async saveRADIUSConfig({ dispatch }, configObj) {
      let headConfig = {
        headers: {
          query: 'SET_RADIUS_CFG',
        },
      };
      try {
        let rsp = await api.post('/cgi/radiuscfg.cgi', configObj, headConfig);
        await dispatch('configResult', {
          attrs: rsp.data,
        });
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorSaveSettings'), error);
      }
    },
    async chkResult({ commit }, attrObj) {
      try {
        let attr = attrObj.attrs;
        commit('netstatdata', attr);
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorGetSettings'), error);
      }
    },
    async configResult({ commit }, attrObj) {
      try {
        let attr = attrObj.attrs;
        commit('rspresult', attr);
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorSaveSettings'), error);
      }
    },
    async getRADIUSInfo({ dispatch }) {
      let headConfig = {
        headers: {
          query: 'GET_RADIUS_CFG',
        },
      };
      try {
        let rsp = await api.get('/cgi/radiuscfg.cgi', headConfig);
        await dispatch('setradiusdata', {
          attrs: rsp.data,
        });
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorGetSettings'), error);
      }
    },
    async setradiusdata({ commit }, attrObj) {
      try {
        let attr = attrObj.attrs;
        commit('radiusdata', attr);
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorSaveSettings'), error);
      }
    },
  },
};

export default RADIUStore;
