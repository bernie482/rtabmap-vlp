import api from '@/store/api';
import i18n from '@/i18n';

const FactoryResetStore = {
  namespaced: true,
  actions: {
    async resetToDefaults() {
      return await api
        .post('/redfish/v1/Managers/bmc/Actions/Manager.ResetToDefaults', {
          ResetToDefaultsType: 'ResetAll',
        })
        .then(() => i18n.t('pageFactoryReset.toast.resetToDefaultsSuccess'))
        .catch((error) => {
          console.log('Factory Reset: ', error);
          throw new Error(
            i18n.t('pageFactoryReset.toast.resetToDefaultsError')
          );
        });
    },
    async resetBios() {
      return await api
        .post('/redfish/v1/Systems/system/Bios/Actions/Bios.ResetBios')
        .then(() => i18n.t('pageFactoryReset.toast.resetBiosSuccess'))
        .catch((error) => {
          console.log('Factory Reset: ', error);
          throw new Error(i18n.t('pageFactoryReset.toast.resetBiosError'));
        });
    },
    async resetNetwork() {
      return await api
        .post(
          '/cgi/system_restore.cgi',
          {
            SDR: true,
            SEL: true,
            NETWORK: false,
            SNMP: true,
            SSH: true,
            User: true,
            SYSLOG: true,
            WEB: true,
            OEM: true,
          },
          {
            headers: {
              QUERY: 'PRESERVE_CONFIGURATION',
            },
          }
        )
        .then(() => {
          return api.post('/cgi/bmc_reset.cgi', undefined, {
            headers: {
              QUERY: 'BMC_RESET',
            },
          });
        })
        .then(() => i18n.t('pageFactoryReset.toast.resetNetworkSuccess'))
        .catch((error) => {
          console.log('Factory Reset: ', error);
          throw new Error(i18n.t('pageFactoryReset.toast.resetNetworkError'));
        });
    },
  },
};

export default FactoryResetStore;
