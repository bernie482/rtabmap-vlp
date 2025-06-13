import api from '@/store/api';
import i18n from '@/i18n';

const ADStore = {
  namespaced: true,
  state: {
    info: null,
  },
  getters: {
    minfo: (state) => state.info,
  },
  mutations: {
    mInfo: (state, attr) => {
      state.info = attr;
    },
  },
  actions: {
    async del_ad_role({ dispatch }, roleID) {
      //console.log('del_ad_role = ', roleID);
      let headConfig = {
        headers: {
          query: 'ROLE',
        },
        data: roleID,
      };
      try {
        let rsp = await api.delete('/cgi/ad.cgi', headConfig);
        await dispatch('datainfo', {
          attrs: rsp.data,
        });
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorSaveSettings'), error);
      }
    },
    async set_ad_conf({ dispatch }, configObj) {
      let headConfig = {
        headers: {
          query: 'CONFIG',
        },
      };
      try {
        let rsp = await api.post('/cgi/ad.cgi', configObj, headConfig);
        await dispatch('datainfo', {
          attrs: rsp.data,
        });
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorSaveSettings'), error);
      }
    },
    async get_ad_config({ dispatch }) {
      let headConfig = {
        headers: {
          query: 'CONFIG',
        },
      };
      try {
        let rsp = await api.get('/cgi/ad.cgi', headConfig);
        await dispatch('datainfo', {
          attrs: rsp.data,
        });
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorGetSettings'), error);
      }
    },
    async getadinfo({ dispatch }) {
      let headConfig = {
        headers: {
          query: 'ROLE',
        },
      };
      try {
        let rsp = await api.get('/cgi/ad.cgi', headConfig);
        await dispatch('datainfo', {
          attrs: rsp.data,
        });
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorGetSettings'), error);
      }
    },
    async datainfo({ commit }, attrObj) {
      try {
        let attr = attrObj.attrs;
        commit('mInfo', attr);
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorSaveSettings'), error);
      }
    },
    async saveModifiedADConfig({ dispatch }, adconfig) {
      let headConfig = {
        headers: {
          query: 'ROLE',
        },
      };
      try {
        let rsp = await api.post('/cgi/ad.cgi', adconfig, headConfig);
        await dispatch('datainfo', {
          attrs: rsp.data,
        });
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorSaveSettings'), error);
      }
    },
  },
};

export default ADStore;
