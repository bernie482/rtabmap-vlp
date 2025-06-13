import api from '@/store/api';
import i18n from '@/i18n';

const LdapStore = {
  namespaced: true,
  state: {
    enable: false,
    enableSSL: false,
    enableVerifyServer: false,
    enableVerifyClient: false,
    existCaCertificate: false,
    existClientCertificate: false,
    port: 389,
    hostname: '',
    bindDN: '',
    searchBase: '',
    groupFilter: {
      admin: '',
      operator: '',
      user: '',
      callback: '',
    },
  },
  getters: {
    enable(state) {
      return state.enable;
    },
    enableSSL(state) {
      return state.enableSSL;
    },
    enableVerifyServer: (state) => state.enableVerifyServer,
    enableVerifyClient: (state) => state.enableVerifyClient,
    existCaCertificate: (state) => state.existCaCertificate,
    existClientCertificate: (state) => state.existClientCertificate,
    port(state) {
      return state.port;
    },
    hostname: (state) => state.hostname,
    bindDN(state) {
      return state.bindDN;
    },
    searchBase(state) {
      return state.searchBase;
    },
    groupFilter(state) {
      return state.groupFilter;
    },
  },
  mutations: {
    stateConfig(state, config) {
      state.enable = config.enable;
      state.enableSSL = config.enableSSL;
      state.enableVerifyServer = config.enableVerifyServer;
      state.enableVerifyClient = config.enableVerifyClient;
      state.existCaCertificate = config.existCaCertificate;
      state.existClientCertificate = config.existClientCertificate;
      state.port = config.port;
      state.hostname = config.hostname;
      state.bindDN = config.bindDN;
      state.searchBase = config.searchBase;
      state.groupFilter = config.groupFilter;
    },
  },
  actions: {
    async getConfig({ commit }) {
      try {
        const config = await api.get('/cgi/ldap.cgi', {
          headers: {
            Query: 'CONFIG',
          },
        });
        commit('stateConfig', config.data);
      } catch (error) {
        throw new Error(i18n.t('pageLdapInsyde.toast.errorGetConfig'), error);
      }
    },
    async setConfig({ dispatch }, config) {
      try {
        await api
          .post('/cgi/ldap.cgi', config, {
            headers: {
              Query: 'CONFIG',
            },
          })
          .then(() => {
            return dispatch('getConfig');
          })
          .then(() => i18n.t('pageLdapInsyde.toast.successSaveLdapSettings'));
      } catch (error) {
        throw new Error(
          i18n.t('pageLdapInsyde.toast.errorSaveLdapSettings'),
          error
        );
      }
    },
    async clearConfig({ dispatch }) {
      const clearconfig = {
        enable: false,
        enableSSL: false,
        enableVerifyServer: false,
        enableVerifyClient: false,
        port: 389,
        hostname: '',
        bindPwd: '',
        bindDN: '',
        searchBase: '',
        groupFilter: {
          admin: '',
          operator: '',
          user: '',
          callback: '',
        },
      };
      return dispatch('setConfig', clearconfig);
    },
  },
};
export default LdapStore;
