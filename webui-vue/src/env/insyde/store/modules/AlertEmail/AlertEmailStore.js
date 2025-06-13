import api from '@/store/api';
import i18n from '@/i18n';

const AlertEmailStore = {
  namespaced: true,
  state: {
    smtp: null,
    certstate: null,
    result: null,
  },
  getters: {
    smtpsrvdata: (state) => state.smtp,
    smtpcertstate: (state) => state.certstate,
  },
  mutations: {
    smtpdata: (state, attr) => {
      state.smtp = attr;
    },
    certcheck: (state, attr) => {
      state.certstate = attr;
    },
    rspresult: (state, attr) => {
      state.result = attr;
    },
  },
  actions: {
    async uploadSMTPCert({ dispatch }, certfile) {
      let headConfig = {
        headers: {
          query: 'UPLOAD_SMTP_CRT',
        },
      };
      try {
        let rsp = await api.post(
          '/cgi/config_alert_email_crt.cgi',
          certfile,
          headConfig
        );
        await dispatch('configResult', {
          attrs: rsp.data,
        });
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorUpdate'), error);
      }
    },
    async saveSMTPConfig({ dispatch }, configObj) {
      let headConfig = {
        headers: {
          query: 'CONFIG',
        },
      };
      try {
        let rsp = await api.post('/cgi/smtp.cgi', configObj, headConfig);
        await dispatch('configResult', {
          attrs: rsp.data,
        });
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorSaveSettings'), error);
      }
    },
    async saveCertConfig({ dispatch }, configObj) {
      let headConfig = {
        headers: {
          query: 'SET_CRT_STATE',
        },
      };
      try {
        let rsp = await api.put(
          '/cgi/config_alert_email_crt.cgi',
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
    async configResult({ commit }, attrObj) {
      try {
        let attr = attrObj.attrs;
        commit('rspresult', attr);
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorSaveSettings'), error);
      }
    },
    async getSMTPCertState({ dispatch }) {
      let headConfig = {
        headers: {
          query: 'GET_SMTP_CHECKING_STATUS',
        },
      };
      try {
        let rsp = await api.post(
          '/cgi/config_alert_email_crt.cgi',
          '',
          headConfig
        );
        await dispatch('setCertCheck', {
          attrs: rsp.data,
        });
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorGetSettings'), error);
      }
    },
    async setCertCheck({ commit }, attrObj) {
      try {
        let attr = attrObj.attrs;
        commit('certcheck', attr);
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorGetSettings'), error);
      }
    },
    async getSMTPInfo({ dispatch }) {
      let headConfig = {
        headers: {
          query: 'CONFIG',
        },
      };
      try {
        let rsp = await api.get('/cgi/smtp.cgi', headConfig);
        await dispatch('setsmtpdata', {
          attrs: rsp.data,
        });
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorGetSettings'), error);
      }
    },
    async setsmtpdata({ commit }, attrObj) {
      try {
        let attr = attrObj.attrs;
        commit('smtpdata', attr);
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorGetSettings'), error);
      }
    },
  },
};

export default AlertEmailStore;
