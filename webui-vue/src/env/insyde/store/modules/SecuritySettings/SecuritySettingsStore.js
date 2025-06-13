import api from '@/store/api';
import i18n from '@/i18n';

const SecuritySettingsStore = {
  namespaced: true,
  state: {
    ciphertype: null,
    service: null,
    https: null,
    blockout: null,
    pamOrder: undefined, // The undefined here means no support, and the PAM auth order is initially hidden.
    result: null,
  },
  getters: {
    cipher: (state) => state.ciphertype,
    service: (state) => state.service,
    ports: (state) => state.https,
    userblockout: (state) => state.blockout,
    PAMOrder: (state) => state.pamOrder,
    result: (state) => state.result,
  },
  mutations: {
    cipherctl: (state, attr) => {
      state.ciphertype = attr;
    },
    service: (state, attr) => {
      state.service = attr;
    },
    gethttpsport: (state, attr) => {
      state.https = attr;
    },
    getuserblockout: (state, attr) => {
      state.blockout = attr;
    },
    setpamData: (state, pamdata) => {
      state.pamOrder = pamdata;
    },
    rspresult: (state, attr) => {
      state.result = attr;
    },
  },
  actions: {
    async getcipherctl({ dispatch }) {
      let headConfig = {
        headers: {
          query: 'CIPHER',
        },
      };
      try {
        let rsp = await api.get('/cgi/sslCipherCtl.cgi', headConfig);
        await dispatch('setcipher', {
          attrs: rsp.data,
        });
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorGetSettings'), error);
      }
    },
    async setcipher({ commit }, attrObj) {
      try {
        let attr = attrObj.attrs;
        commit('cipherctl', attr);
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorGetSettings'), error);
      }
    },
    async getnetservice({ dispatch }) {
      try {
        let rsp = await api.post('/cgi/netservice.cgi');
        await dispatch('setservice', {
          attrs: rsp.data,
        });
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorGetSettings'), error);
      }
    },
    async setservice({ commit }, attrObj) {
      try {
        let attr = attrObj.attrs;
        commit('service', attr);
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorGetSettings'), error);
      }
    },
    async getHttpsPort({ dispatch }) {
      let payloadObj = {
        GET_PORT: 1,
      };
      try {
        let rsp = await api.post('/cgi/nsportscfg.cgi', payloadObj);
        await dispatch('httpsport', {
          attrs: rsp.data,
        });
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorGetSettings'), error);
      }
    },
    async httpsport({ commit }, attrObj) {
      try {
        let attr = attrObj.attrs;
        commit('gethttpsport', attr);
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorGetSettings'), error);
      }
    },
    async getUserBlockout({ dispatch }) {
      try {
        let rsp = await api.post('/cgi/config_user_blockout.cgi');
        await dispatch('blockoutData', {
          attrs: rsp.data,
        });
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorGetSettings'), error);
      }
    },
    async blockoutData({ commit }, attrObj) {
      try {
        let attr = attrObj.attrs;
        commit('getuserblockout', attr);
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorGetSettings'), error);
      }
    },
    async setPAMList({ dispatch }, pamOrderArr) {
      let headConfig = {
        headers: {
          oem_web_tag: 'WEB',
        },
      };
      let payloadObj = {
        Oem: {
          InsydePAMSettings: {
            PAMOrder: pamOrderArr,
          },
        },
      };
      return await api
        .patch('/redfish/v1/AccountService', payloadObj, headConfig)
        .then(() => dispatch('getPAMList'))
        .catch((error) => {
          console.log(error);
          throw new Error(i18n.t('global.toast.errorSaveSettings'), error);
        });
    },
    async getPAMList({ commit }) {
      let headConfig = {
        headers: {
          oem_web_tag: 'WEB',
        },
      };
      return await api
        .get('/redfish/v1/AccountService', headConfig)
        .then((response) => {
          const pamSettings = response?.data?.Oem?.InsydePAMSettings;
          commit('setpamData', pamSettings);
        })
        .catch((error) => {
          console.log(error);
          throw new Error(i18n.t('global.toast.errorGetSettings'), error);
        });
    },
    async confighttpsport({ dispatch }, port) {
      let payloadObj = {
        HTTPS_PORT: port,
        isRestart: true,
      };
      try {
        await api
          .patch('/cgi/nsportscfg.cgi', payloadObj)
          .then(() => dispatch('getHttpsPort'));
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorSaveSettings'), error);
      }
    },
    async configipblocking({ dispatch }, payloadObj) {
      try {
        await api
          .patch('/cgi/config_user_blockout.cgi', payloadObj)
          .then(() => dispatch('getUserBlockout'));
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorSaveSettings'), error);
      }
    },
    async configcipher({ dispatch }, configString) {
      let headConfig = {
        headers: {
          query: 'CIPHER',
        },
      };
      let payloadObj = {
        CIPHER_TYPE: configString,
      };
      try {
        await api
          .post('/cgi/sslCipherCtl.cgi', payloadObj, headConfig)
          .then(() => dispatch('getcipherctl'));
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorSaveSettings'), error);
      }
    },
    async configsvc({ dispatch }, configObj) {
      try {
        await api
          .patch('/cgi/netservice.cgi', configObj)
          .then(() => dispatch('getnetservice'));
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorSaveSettings'), error);
      }
    },
    async configResult({ commit }, attrObj) {
      try {
        let attr = attrObj.attrs;
        commit('rspresult', attr);
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorGetSettings'), error);
      }
    },
  },
};
export default SecuritySettingsStore;
