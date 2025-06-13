import api from '@/store/api';
import fileApiConfig from '@/env/insyde/components/Mixins/FileProcessMixin';
import i18n from '@/i18n';

const BiosLogStore = {
  namespaced: true,
  state: {
    number: 0,
    contents: [],
  },
  getters: {
    number: (state) => state.number,
    contents: (state) => state.contents,
  },
  mutations: {
    setNumber: (state, number) => {
      state.number = number;
    },
    setContent: (state, contentObj) => {
      state.contents[contentObj.position] = contentObj.content;
    },
  },
  actions: {
    async getStatus({ state, commit, dispatch }) {
      try {
        let biosCheckResp = await api.post('/cgi/check_bios_log.cgi', {
          ACTION: 'CHECK',
          FILE: '0',
        });
        biosCheckResp = biosCheckResp.data?.CHECKBIOSLOG ?? {};
        commit('setNumber', parseInt(biosCheckResp.FILE_COUNT));

        if (state.number > 0) await dispatch('getContents');
      } catch (error) {
        console.error(error);
        throw new Error(i18n.t('pageBiosLog.toast.errorGetStatus'), error);
      }
    },
    async getContents({ commit }, number) {
      number = number ?? 0;
      let realcgi = '/cgi/check_bios_log.cgi';
      try {
        let biosContentResp = await api.post(realcgi, {
          ACTION: 'VIEW',
          FILE: number.toString(),
        });
        biosContentResp = biosContentResp.data?.BIOSLOG ?? {};
        if (biosContentResp?.LOG?.length > 0) {
          commit('setContent', {
            position: number,
            content: biosContentResp.LOG.map((log) => window.atob(log.CONTENT)),
          });
        } else {
          throw new Error('error loading content 111');
        }
      } catch (error) {
        throw new Error('error loading content 222', error);
      }
    },
    async exportLog({ getters }, number) {
      let realUrl = `/cgi/check_bios_log.cgi?FILE=${number - 1}&TYPE=CURRENT`;
      let realAllUrl = `/cgi/check_bios_log.cgi?FILE=${getters.number}&TYPE=ALL`;
      try {
        if (typeof number === 'number' && number >= 0) {
          // export one file
          return await api.get(realUrl, fileApiConfig);
        } else {
          //export all
          return await api.get(realAllUrl, fileApiConfig);
        }
      } catch (error) {
        console.error(error);
        throw new Error(i18n.t('pageBiosLog.toast.errorExportLog'), error);
      }
    },
  },
};

export default BiosLogStore;
