import api from '@/store/api';
import i18n from '@/i18n';
import { getField, updateField } from 'vuex-map-fields';

const FactoryResetStore = {
  namespaced: true,
  state: {
    usePreserve: false,
  },
  getters: {
    getField,
  },
  mutations: {
    updateField,
  },
  actions: {
    async resetSetting({ state }, payload) {
      let config = {
        headers: {
          query: 'UPDATE_STATUS',
        },
      };
      // stop FW update?
      await api.get('/cgi/config_fw_update.cgi', config).then(() => {});

      if (state.usePreserve == false) {
        config.headers.query = 'FACTORY_RESET';
      } else {
        config.headers.query = 'PRESERVE_CONFIGURATION';
      }

      let ret = await api
        .post('/cgi/system_restore.cgi', payload, config)
        .then(() => true)
        .catch((error) => {
          console.error('system_restore.cgi: ', error, payload, config);
          throw new Error(
            i18n.t('pageInsydeFactoryReset.toast.resetBmcError'),
            error
          );
        });

      // PATCH: PRESERVE_CONFIGURATION flow need to reset manually
      if (state.usePreserve == true && ret == true) {
        config.headers.query = 'BMC_RESET';
        ret = await api
          .post('/cgi/bmc_reset.cgi', undefined, config)
          .then(() => true)
          .catch((error) => {
            console.error('bmc_reset.cgi: ', error);
            throw new Error(
              i18n.t('pageInsydeFactoryReset.toast.resetBmcError'),
              error
            );
          });
      }
      return i18n.t('pageInsydeFactoryReset.toast.resetBmcSuccess');
    },
  },
};

export default FactoryResetStore;
