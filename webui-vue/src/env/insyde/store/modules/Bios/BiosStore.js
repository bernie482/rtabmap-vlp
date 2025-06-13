import api from '@/store/api';
import i18n from '@/i18n';

const BiosStore = {
  namespaced: true,
  state: {
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
    async getBios({ dispatch }) {
      try {
        const biosResp = await api.get('/redfish/v1/Systems/system/Bios');
        await dispatch('getAttributes', {
          attributes: biosResp.data?.Attributes,
          settingsUri:
            biosResp.data?.['@Redfish.Settings']?.SettingsObject?.['@odata.id'],
        });
        await dispatch('getRegistry', biosResp.data.AttributeRegistry);
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
    async getRegistry({ commit }, registryUri) {
      try {
        const registryResp = await api.get(registryUri);
        commit('setRegistry', {
          menus: registryResp.data?.RegistryEntries?.Menus ?? [],
          dependencies: registryResp.data?.RegistryEntries?.Dependencies ?? [],
          attributes: registryResp.data?.RegistryEntries?.Attributes ?? [],
          version: registryResp.data?.RegistryEntries?.RegsitryVersion ?? null,
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
