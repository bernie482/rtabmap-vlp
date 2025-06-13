import api from '@/store/api';
import i18n from '@/i18n';

const UnitResetStore = {
  namespaced: true,
  actions: {
    async resetBmc() {
      let config = {
        headers: {
          query: 'UPDATE_STATUS',
        },
      };
      // stop FW update?
      await api.get('/cgi/config_fw_update.cgi', config).then(() => {});

      return await api
        .post('/cgi/reset.cgi')
        .then(() => i18n.t('pageUnitReset.toast.resetBmcSuccess'))
        .catch((error) => {
          console.log('Unit Reset: ', error);
          throw new Error(i18n.t('pageUnitReset.toast.resetBmcError'), error);
        });
    },
  },
};

export default UnitResetStore;
