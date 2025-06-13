import api from '@/store/api';
import i18n from '@/i18n';

const SolLogStore = {
  namespaced: true,
  state: {
    enable: false,
    contents: [],
  },
  getters: {
    enable: (state) => state.enable,
    contents: (state) => state.contents,
  },
  mutations: {
    setEnable: (state, data) => {
      state.enable = data.solLogEnable;
    },
    setContent: (state, contents) => {
      state.contents = contents;
    },
  },
  actions: {
    async getStatus({ dispatch }) {
      try {
        await dispatch('getConfig');
        await dispatch('getContent');
      } catch (error) {
        console.error(error);
        throw new Error(i18n.t('pageSolLog.toast.errorGetStatus'), error);
      }
    },
    async getConfig({ commit }) {
      try {
        const solEnable = await api.get('/cgi/sol_log.cgi', {
          headers: {
            Query: 'SOL_LOG_ENABLE_STATE',
          },
        });
        commit('setEnable', solEnable.data);
      } catch (error) {
        console.error(error);
        throw new Error(i18n.t('pageSolLog.toast.errorGetConfig'), error);
      }
    },
    async getContent({ commit }) {
      try {
        let solContent = await api.get('/cgi/sol_log.cgi', {
          headers: {
            Query: 'SOL_LOG_DUMP',
          },
        });
        solContent = atob(solContent.data.solLog);
        if (solContent[solContent.length - 1] === '\n') {
          solContent = solContent.slice(0, -1);
        }
        if (solContent.length > 0) solContent = solContent.split('\n');
        else solContent = [];
        commit('setContent', solContent);
      } catch (error) {
        console.error(error);
        throw new Error(i18n.t('pageSolLog.toast.errorGetContent'), error);
      }
    },
    async downloadLog() {
      try {
        await api.get(`/cgi/sol_log.cgi`, {
          headers: {
            Query: 'GENERATE_LOG',
          },
        });
        return await api.get(`/cgi/sol_log.cgi`);
      } catch (error) {
        console.error(error);
        throw new Error(i18n.t('pageSolLog.toast.errorDownloadLog'), error);
      }
    },
    async clearLog() {
      return await api
        .post('/cgi/sol_log.cgi', undefined, {
          headers: {
            Query: 'CLEAR_LOG',
          },
        })
        .catch((error) => {
          console.log(error);
          throw new Error(i18n.t('pageSolLog.toast.errorClearLog'), error);
        });
    },
    async setLogEnDisable(_, { solLogEnable }) {
      const data = {
        solLogEnable: solLogEnable,
      };
      return await api
        .post('/cgi/sol_log.cgi', data, {
          headers: {
            Query: 'SOL_LOG_ENABLE_STATE',
          },
        })
        .catch((error) => {
          console.log(error);
          throw new Error(i18n.t('pageSolLog.toast.errorSetConfig'), error);
        });
    },
  },
};

export default SolLogStore;
