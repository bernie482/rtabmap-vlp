import api from '@/store/api';
import i18n from '@/i18n';

const BiosStore = {
  namespaced: true,
  state: {
    topmenus: [],
    registry: {
      version: null,
      attributes: [],
      menus: [],
      dependencies: [],
    },
    attributes: {},
  },
  getters: {
    registryMenus: (state) => state.registry.menus,
    registryAttributes: (state) => state.registry.attributes,
    registryDependencies: (state) => state.registry.dependencies,
    attributes: (state) => state.attributes,
  },
  mutations: {
    setTopMenu: (state, menus) => {
      state.topmenus = menus;
    },
    setRegistry: (state, registry) => {
      state.registry.version = registry.version;
      state.registry.menus = registry.menus;
      state.registry.attributes = registry.attributes;
      state.registry.dependencies = registry.dependencies;
    },
    setAttributes: (state, attributes) => {
      state.attributes = attributes;
    },
  },
  actions: {
    async getTopMenu({ commit }) {
      try {
        const topMenusResp = await api.post('/cgi/rf_bios.cgi', {
          CMD: 'GET_TOP_MENU_JSON',
          LOCALE: 'en-US',
        });
        commit('setTopMenu', topMenusResp.data?.BIOS_REGISTRY?.Menus ?? []);
      } catch (error) {
        console.error(error);
        throw new Error(i18n.t('pageBios.toast.errorGetTopMenu'), error);
      }
    },
    async getBios({ dispatch }) {
      try {
        const biosResp = await api.get('/redfish/v1/Systems/system/Bios');
        await dispatch('getAttributes', {
          attributes: biosResp.data?.Attributes,
          settingsUri:
            biosResp.data?.['@Redfish.Settings']?.SettingsObject?.['@odata.id'],
        });
        await dispatch('getRegistry');
      } catch (error) {
        console.error(error);
        throw new Error(i18n.t('pageBios.toast.errorGetBios'), error);
      }
    },
    async getAttributes({ commit }, attrObj) {
      try {
        let attributes = attrObj.attributes;
        if (attrObj.settingsUri) {
          const biosSettingsResp = await api.get(attrObj.settingsUri);
          attributes = biosSettingsResp.data.Attributes;
        }
        commit('setAttributes', attributes);
      } catch (error) {
        console.error(error);
        throw new Error(i18n.t('pageBios.toast.errorGetAttribute'), error);
      }
    },
    async getRegistry({ commit }) {
      try {
        // PATCH: add query header to pass mock test.
        const menusResp = await api.post('/cgi/rf_bios.cgi', {
          CMD: 'GET_MENUS_JSON',
          LOCALE: 'en-US',
        });
        const attributesResp = await api.post('/cgi/rf_bios.cgi', {
          CMD: 'GET_ATTRIBUTES_JSON',
          LOCALE: 'en-US',
        });
        const dependenciesResp = await api.post('/cgi/rf_bios.cgi', {
          CMD: 'GET_DEPENDENCIES_JSON',
          LOCALE: 'en-US',
        });
        commit('setRegistry', {
          menus: menusResp.data?.Menus ?? [],
          dependencies: dependenciesResp.data ?? [],
          attributes: attributesResp.data ?? [],
          version: menusResp.data?.RegistryVersion ?? null,
        });
      } catch (error) {
        console.error(error);
        throw new Error(i18n.t('pageBios.toast.errorGetRegistry'), error);
      }
    },
    async saveBiosSettings({ dispatch }, attributes) {
      return await api
        .patch('/redfish/v1/Systems/system/Bios/Settings', {
          Attributes: attributes,
        })
        .then(() => dispatch('getBios'))
        .then(() => i18n.t('pageBios.toast.successSaveBios'))
        .catch((error) => {
          console.log(error);
          throw new Error(i18n.t('pageBios.toast.errorSaveBios'), error);
        });
    },
  },
};

export default BiosStore;
