import api from '@/store/api';
import i18n from '@/i18n';
const decode = {};
decode['en-US'] = 'English';
decode['es'] = 'T_Chinese';
decode['ru-RU'] = 'S_Chinese';
const SensorReadingsStore = {
  namespaced: true,
  state: {
    sensors: null,
  },
  getters: {
    sensors: (state) => state.sensors,
  },
  mutations: {
    setAttributes: (state, attributes) => {
      state.sensors = attributes;
    },
  },
  actions: {
    async getSensors({ dispatch }, lang) {
      try {
        let req = { LANG: decode[lang] ?? 'English' };
        const Resp = await api.post('/cgi/getsensorinfo.cgi', req);
        await dispatch('getAttributes', {
          attributes: Resp.data,
        });
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorGetSettings'), error);
      }
    },
    async getAttributes({ commit }, attrObj) {
      try {
        let attributes = attrObj.attributes;
        commit('setAttributes', attributes);
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorGetSettings'), error);
      }
    },
  },
};

export default SensorReadingsStore;
