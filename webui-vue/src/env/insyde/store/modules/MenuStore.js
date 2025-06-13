import menuJson from '@/env/insyde/json/menu.json';
import i18n from '@/i18n';

const MenuStore = {
  namespaced: true,
  state: {
    menus: {},
  },
  getters: {
    menus(state) {
      return state.menus;
    },
  },
  mutations: {
    setMenu(state, menus) {
      state.menus = menus;
    },
  },
  actions: {
    async getMenu({ commit }) {
      try {
        commit('setMenu', menuJson);
      } catch (error) {
        throw new Error(i18n.t('pageSysinfo.toast.errorGetSysteminfo'), error);
      }
    },
  },
};
export default MenuStore;
