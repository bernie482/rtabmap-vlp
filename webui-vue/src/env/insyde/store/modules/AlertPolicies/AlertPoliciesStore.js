import api from '@/store/api';
import i18n from '@/i18n';

const AlertPoliciesStore = {
  namespaced: true,
  state: {
    plyparm: null,
    strings: null,
    plytab: null,
    result: null,
  },
  getters: {
    policyfieldParm: (state) => state.plyparm,
    strings: (state) => state.strings,
    policies: (state) => state.plytab,
    result: (state) => state.result,
  },
  mutations: {
    policyParm: (state, attr) => {
      state.plyparm = attr;
    },
    StringsData: (state, attr) => {
      state.strings = attr;
    },
    policyTabData: (state, attr) => {
      state.plytab = attr;
    },
    setResult: (state, attr) => {
      state.result = attr;
    },
  },
  actions: {
    async putPolicyConfig({ commit }, configObj) {
      let headConfig = {
        headers: {
          oem_web_tag: 'WEB',
          query: 'CONFIG_ALERT_PLCY',
        },
      };
      try {
        await api
          .put('/cgi/config_alert_policies.cgi', configObj, headConfig)
          .then((response) => {
            commit('setResult', response.data);
          });
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorGetSettings'), error);
      }
    },
    async postPolicyParameter({ commit }) {
      let headConfig = {
        headers: {
          oem_web_tag: 'WEB',
          query: 'CONFIG_ALERT_PLCY',
        },
      };
      try {
        await api
          .post('/cgi/config_alert_policies.cgi', '', headConfig)
          .then((response) => {
            commit('policyParm', response.data);
          });
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorGetSettings'), error);
      }
    },
    async putStringKey({ commit }, configObj) {
      let headConfig = {
        headers: {
          oem_web_tag: 'WEB',
          query: 'CONFIG_ALERT_STRING_KEY',
        },
      };
      try {
        await api
          .put('/cgi/config_alert_policies.cgi', configObj, headConfig)
          .then((response) => {
            commit('setResult', response.data);
          });
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorGetSettings'), error);
      }
    },
    async postStringKey({ commit }) {
      let headConfig = {
        headers: {
          oem_web_tag: 'WEB',
          query: 'CONFIG_ALERT_STRING_KEY',
        },
      };
      try {
        await api
          .post('/cgi/config_alert_policies.cgi', '', headConfig)
          .then((response) => {
            commit('StringsData', response.data);
          });
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorGetSettings'), error);
      }
    },
    async postPolicyTab({ commit }) {
      let headConfig = {
        headers: {
          oem_web_tag: 'WEB',
        },
      };
      try {
        await api
          .post('/cgi/config_alert_policies.cgi', '', headConfig)
          .then((response) => {
            commit('policyTabData', response.data);
          });
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorGetSettings'), error);
      }
    },
  },
};

export default AlertPoliciesStore;
