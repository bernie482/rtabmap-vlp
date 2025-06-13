import api from '@/store/api';
import i18n from '@/i18n';

const PfrInfoStore = {
  namespaced: true,
  state: {
    pfrinfo: {},
  },
  getters: {
    pfrinfo(state) {
      return state.pfrinfo;
    },
  },
  mutations: {
    setPfrinfo(state, pfrinfo) {
      state.pfrinfo = pfrinfo;
    },
  },
  actions: {
    async getStatus({ dispatch }) {
      await dispatch('getPfrinfo');
    },
    async getPfrinfo({ commit }) {
      try {
        const pfrinfo = await api.get('/cgi/getsyspfr.cgi', undefined);
        commit('setPfrinfo', pfrinfo.data);
      } catch (error) {
        throw new Error(i18n.t('pagePfrinfo.errorGetPfrinfo'), error);
      }
    },
  },
};
export default PfrInfoStore;
