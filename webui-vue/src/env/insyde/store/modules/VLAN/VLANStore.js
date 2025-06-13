import api from '@/store/api';
import i18n from '@/i18n';

const VLANStore = {
  namespaced: true,
  state: {
    vlan: null,
    result: null,
  },
  getters: {
    vlancfgdata: (state) => state.vlan,
    result: (state) => state.result,
  },
  mutations: {
    vlandata: (state, attr) => {
      state.vlan = attr;
    },
    rspresult: (state, attr) => {
      state.result = attr;
    },
  },
  actions: {
    async postVLANConfig({ dispatch }, configObj) {
      let headConfig = {
        headers: {
          Query: 'Config',
        },
      };
      try {
        let rsp = await api.post('/cgi/vlan.cgi', configObj, headConfig);
        await dispatch('configResult', {
          attrs: rsp.data,
        });
      } catch (error) {
        throw new Error(i18n.t('pageVLAN.toast.errorSetAttribute'), error);
      }
    },
    async getVLANConfig({ dispatch }) {
      let headConfig = {
        headers: {
          Query: 'Config',
        },
      };
      try {
        let rsp = await api.get('/cgi/vlan.cgi', headConfig);
        await dispatch('setvlandata', {
          attrs: rsp.data,
        });
      } catch (error) {
        throw new Error(i18n.t('pageVLAN.toast.errorGetAttribute'), error);
      }
    },
    async setvlandata({ commit }, attrObj) {
      try {
        let attr = attrObj.attrs;
        commit('vlandata', attr);
      } catch (error) {
        throw new Error(i18n.t('pageVLAN.toast.errorGetAttribute'), error);
      }
    },
    async configResult({ commit }, attrObj) {
      try {
        let attr = attrObj.attrs;
        commit('rspresult', attr);
      } catch (error) {
        throw new Error(i18n.t('pageVLAN.toast.errorSetAttribute'), error);
      }
    },
  },
};

export default VLANStore;
