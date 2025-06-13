import api from '@/store/api';
import i18n from '@/i18n';

const SyslogStore = {
  namespaced: true,
  state: {
    result: null,
    syslogbasicInfo: null,
  },
  getters: {
    syslogbasic: (state) => state.syslogbasicInfo,
    syslogremotesrv: (state) => state.result,
    status: (state) => state.result,
  },
  mutations: {
    rspresult: (state, attr) => {
      state.result = attr;
    },
    sysloginfo: (state, attr) => {
      state.syslogbasicInfo = attr;
    },
  },
  actions: {
    async exportConfFile() {
      try {
        return await api.get('/cgi/syslog_settings.cgi');
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorOperating'), error);
      }
    },
    async importConfig({ dispatch }, file_str) {
      let headConfig = {
        headers: {
          query: 'IMPORT_CONFIG',
        },
      };
      try {
        let rsp = await api.post(
          '/cgi/syslog_settings.cgi',
          file_str,
          headConfig
        );
        await dispatch('configResult', {
          attrs: rsp.data,
        });
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorOperating'), error);
      }
    },
    async syslog_reset_default({ dispatch }, nullconfig) {
      let headConfig = {
        headers: {
          query: 'SYSLOG_RESET',
        },
      };
      try {
        let rsp = await api.post(
          '/cgi/syslog_settings.cgi',
          nullconfig,
          headConfig
        );
        await dispatch('configResult', {
          attrs: rsp.data,
        });
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorOperating'), error);
      }
    },
    async setrlogservice({ dispatch }, configObj) {
      let headConfig = {
        headers: {
          query: 'SYSLOG_REMOTE',
        },
      };
      try {
        let rsp = await api.post(
          '/cgi/syslog_settings.cgi',
          configObj,
          headConfig
        );
        await dispatch('configResult', {
          attrs: rsp.data,
        });
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorSaveSettings'), error);
      }
    },
    async setsyslogBasic({ dispatch }, configObj) {
      let headConfig = {
        headers: {
          query: 'SYSLOG_BASIC',
        },
      };
      try {
        let rsp = await api.post(
          '/cgi/syslog_settings.cgi',
          configObj,
          headConfig
        );
        await dispatch('configResult', {
          attrs: rsp.data,
        });
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorSaveSettings'), error);
      }
    },
    async getremoteSrv({ dispatch }) {
      let headConfig = {
        headers: {
          query: 'SYSLOG_REMOTE',
        },
      };
      try {
        let rsp = await api.get('/cgi/syslog_settings.cgi', headConfig);
        await dispatch('configResult', {
          attrs: rsp.data,
        });
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorGetSettings'), error);
      }
    },
    async getsyslogBasic({ dispatch }) {
      let headConfig = {
        headers: {
          query: 'SYSLOG_BASIC',
        },
      };
      try {
        let rsp = await api.get('/cgi/syslog_settings.cgi', headConfig);
        await dispatch('basicinfo', {
          attrs: rsp.data,
        });
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorGetSettings'), error);
      }
    },
    async basicinfo({ commit }, attrObj) {
      try {
        let attr = attrObj.attrs;
        commit('sysloginfo', attr);
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorGetSettings'), error);
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

export default SyslogStore;
