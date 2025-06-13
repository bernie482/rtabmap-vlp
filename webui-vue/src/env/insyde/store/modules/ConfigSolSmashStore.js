import api from '@/store/api';
import { getField, updateField } from 'vuex-map-fields';

const ConfigSolSmashStore = {
  namespaced: true,
  state: {
    solInfo: [],
    solSsh: {
      port: 66,
      enabled: false,
      timeout: 600,
    },
    smashSsh: {
      port: 22,
      enabled: false,
      timeout: 600,
    },
  },
  getters: {
    getField,
  },
  mutations: {
    updateField,
  },
  actions: {
    // for SOL part
    async getSolSettings({ state }) {
      //console.info('getSolSettings');
      let config = {
        headers: { query: 'GET_SOL_CFG' },
      };
      return api
        .get('/cgi/sol.cgi', config)
        .then((response) => {
          state.solInfo = response.data.solInfo;
          return response;
        })
        .catch((error) => {
          console.log(error);
          return error;
        });
    },
    async saveSolSettings({ commit }, data) {
      //console.info('saveSolSettings');
      if (!commit) console.log('debug'); // PATCH: this line for patch eslint error
      await api.post('/cgi/sol.cgi', data).catch((error) => {
        console.log(error);
        return error;
      });
    },
    // for SOL SSH part
    async getSolSshSettings({ state }) {
      //console.info('getSolSshSettings');
      let payload = { GET_PORT: 2 };
      /*let config = {
        headers: { query: 'GET_PORT=2' }, // PATCH: for mock server use query, real machine use payload
        data: payload,
      };*/
      await api
        .post('/cgi/nsportscfg.cgi', payload)
        .then((response) => {
          state.solSsh.port = response.data.SOL_PORT;
          state.smashSsh.port = response.data.SMASH_PORT;
          return response;
        })
        .catch((error) => {
          console.log(error);
          return error;
        });
      return await api
        .post('/cgi/netservice.cgi')
        .then((response) => {
          state.solSsh.enabled = response.data.SOL_SSH_SERVICE;
          state.solSsh.timeout = response.data.SOL_SSH_TIMEOUT;
          state.smashSsh.enabled = response.data.SMASH_SSH_SERVICE;
          state.smashSsh.timeout = response.data.SMASH_SSH_TIMEOUT;
          return response;
        })
        .catch((error) => {
          console.log(error);
          return error;
        });
    },
    async saveSolSshSettings({ state }) {
      //console.info('saveSolSshSettings');
      let payload = {
        ENABLED_SOL_SSH_SERVICE: state.solSsh.enabled,
        SOL_SSH_TIMEOUT: state.solSsh.timeout,
      };
      let ret = await api
        .patch('/cgi/netservice.cgi', payload)
        .catch((error) => {
          console.log(error);
          return error;
        });
      if (!ret) return ret;

      payload = {
        SOL_PORT: state.solSsh.port,
        isRestart: false,
      };
      await api.patch('/cgi/nsportscfg.cgi', payload).catch((error) => {
        console.log(error);
        return error;
      });
    },
    async saveSmashSshSettings({ state }) {
      //console.info('saveSolSshSettings');
      let payload = {
        ENABLED_SMASH_SSH_SERVICE: state.smashSsh.enabled,
        SMASH_SSH_TIMEOUT: state.smashSsh.timeout,
      };
      let ret = await api
        .patch('/cgi/netservice.cgi', payload)
        .catch((error) => {
          console.log(error);
          return error;
        });
      if (!ret) return ret;

      payload = {
        SMASH_PORT: state.smashSsh.port,
        isRestart: true,
      };
      await api.patch('/cgi/nsportscfg.cgi', payload).catch((error) => {
        console.log(error);
        return error;
      });
    },
  },
};

export default ConfigSolSmashStore;
