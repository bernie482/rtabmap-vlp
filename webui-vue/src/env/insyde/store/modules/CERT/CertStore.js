import api from '@/store/api';
import i18n from '@/i18n';

const CertStore = {
  namespaced: true,
  state: {
    certinfo: null,
    result: null,
  },
  getters: {
    certcontant: (state) => state.certinfo,
    getsslstatus: (state) => state.result,
    uploadedstatus: (state) => state.result,
    lightstatus: (state) => state.result,
    gensslstatus: (state) => state.result,
  },
  mutations: {
    certcheck: (state, attr) => {
      state.certinfo = attr;
    },
    rspresult: (state, attr) => {
      state.result = attr;
    },
  },
  actions: {
    async gensslcert({ dispatch }, configObj) {
      try {
        let rsp = await api.put('/cgi/gensslcert.cgi', configObj);
        await dispatch('configResult', {
          attrs: rsp.data,
        });
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorOperating'), error);
      }
    },
    async httpdReset({ dispatch }) {
      try {
        let rsp = await api.post('/cgi/webserverRestart.cgi');
        await dispatch('configResult', {
          attrs: rsp.data,
        });
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorOperating'), error);
      }
    },
    async getsslstatus({ dispatch }) {
      try {
        let rsp = await api.post('/cgi/getsslstatus.cgi');
        await dispatch('configResult', {
          attrs: rsp.data,
        });
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorGetSettings'), error);
      }
    },
    async getCertContant({ dispatch }) {
      let dataobj = {
        ACTION: 'VIEW',
        FILE: 0,
      };
      try {
        let rsp = await api.post('/cgi/gensslcert.cgi', dataobj);
        await dispatch('configInfo', {
          attrs: rsp.data,
        });
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorGetSettings'), error);
      }
    },
    async configInfo({ commit }, attrObj) {
      try {
        let attr = attrObj.attrs;
        commit('certcheck', attr);
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorGetSettings'), error);
      }
    },
    async uploadSSLCert({ dispatch }, certfile) {
      try {
        let rsp = await api.post('/cgi/uploadsslkey.cgi', certfile);
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
  },
};

export default CertStore;
