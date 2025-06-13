import api from '@/store/api';
import i18n from '@/i18n';

const BackupRestoreStore = {
  namespaced: true,
  state: {
    FW_ROM: {
      STATUS: 0,
      PERCENT: 0,
    },
    backupstate: null,
    result: null,
    mutableCfg: [],
    redfishurl: null,
    downloadJson: [],
    backupBiosResult: null,
  },
  getters: {
    getFlashRom: (state) => state.FW_ROM,
    backuprestorestate: (state) => state.backupstate,
  },
  mutations: {
    setFlashRom: (state, value) => (state.FW_ROM = value),
    certcheck: (state, attr) => {
      state.backupstate = attr;
    },
    rspresult: (state, attr) => {
      state.result = attr;
    },
  },
  actions: {
    async uploadRestoreFile(_, backupfile) {
      try {
        let rsp = await api.patch(
          '/cgi/ipmiconf_backup_restore.cgi',
          backupfile
        );
        return rsp.data.RESULT;
      } catch (error) {
        throw new Error(
          i18n.t('pageBackupRestore.toast.errorUploadFile'),
          error
        );
      }
    },
    async getBackupBiosStatus({ state }) {
      let payload = {
        CMD: 'GET_ATTRIBUTES_JSON',
        LOCALE: 'en-US',
      };
      try {
        const rsp = await api.post('/cgi/rf_bios.cgi', payload);
        for (var i = 0; i < rsp.data.length; i++) {
          state.mutableCfg[rsp.data[i].AttributeName] =
            rsp.data[i].CurrentValue;
        }
        return rsp.data.length;
      } catch (error) {
        throw new Error(
          i18n.t('pageBackupRestore.toast.errorBackupSettings'),
          error
        );
      }
    },
    async getRedfishStatus({ state }) {
      try {
        state.redfishurl = '/redfish/v1/Systems/';
        const rsp = await api.get(state.redfishurl);
        state.redfishurl = rsp.data.Members[0]['@odata.id'];
        return rsp;
      } catch (error) {
        throw new Error(
          i18n.t('pageBackupRestore.toast.errorBackupSettings'),
          error
        );
      }
    },
    async getFlashRomStatus({ commit }) {
      let headConfig = {
        headers: {
          query: 'STATUS',
        },
      };
      try {
        const status = await api.post(
          '/cgi/ipmiconf_backup_rom.cgi',
          '',
          headConfig
        );
        commit('setFlashRom', status.data.FW_ROM);
      } catch (error) {
        throw new Error(
          i18n.t('pageBackupRestore.toast.errorBackupSettings'),
          error
        );
      }
    },
    async backupBmcRom() {
      let headConfig = {
        headers: {
          query: 'BACKUP',
        },
      };
      try {
        let rsp = await api.post(
          '/cgi/ipmiconf_backup_rom.cgi',
          '',
          headConfig
        );
        return rsp.data.result;
      } catch (error) {
        throw new Error(
          i18n.t('pageBackupRestore.toast.errorBackupSettings'),
          error
        );
      }
    },
    async delFlashRom() {
      let headConfig = {
        headers: {
          query: 'DEL',
        },
      };
      try {
        let rsp = await api.post(
          '/cgi/ipmiconf_backup_rom.cgi',
          '',
          headConfig
        );
        return rsp.data.result;
      } catch (error) {
        throw new Error(
          i18n.t('pageBackupRestore.toast.errorBackupSettings'),
          error
        );
      }
    },
    async restoreBmcSettings() {
      return await api
        .post('/cgi/ipmiconf_backup_restore.cgi', {
          IPMI_CONF: 0,
        })
        .then(() => {
          return api.post('/cgi/bmc_reset.cgi', undefined, {
            headers: {
              QUERY: 'BMC_RESET',
            },
          });
        })
        .then(() => i18n.t('pageFactoryReset.toast.successRestoreSettings'))
        .catch((error) => {
          console.log('Restore BMC Settings: ', error);
          throw new Error(
            i18n.t('pageBackupRestore.toast.errorBackupSettings'),
            error
          );
        });
    },
    async backupBmcSettings() {
      let dataobj = {
        IPMI_CONF: 1,
      };
      try {
        let rsp = await api.post('/cgi/ipmiconf_backup_restore.cgi', dataobj);
        return rsp.data.RESULT;
      } catch (error) {
        throw new Error(
          i18n.t('pageBackupRestore.toast.errorBackupSettings'),
          error
        );
      }
    },
    async restoreBiosSettings({ state }, restorefile) {
      try {
        let rsp = await api.put(
          state.redfishurl + '/Bios/Settings',
          restorefile
        );
        return rsp.data.error.message;
      } catch (error) {
        throw new Error(
          i18n.t('pageBackupRestore.toast.errorBackupSettings'),
          error
        );
      }
    },
    async backupBiosSettings({ state, dispatch }) {
      try {
        await api.get(state.redfishurl + '/Bios/Settings').then((response) => {
          let currSetting = response.data.Attributes;
          let saveCfg = {};
          for (var prop in state.mutableCfg) {
            if (Object.prototype.hasOwnProperty.call(currSetting, prop)) {
              saveCfg[prop] = currSetting[prop];
            }
          }
          state.downloadJson = {
            Oem: {
              InsydeBios: {
                DeployNumber: response.data.Oem.InsydeBios.DeployNumber,
              },
            },
            Attributes: saveCfg,
          };
        });
        await dispatch('backupBiosConfig');
      } catch (error) {
        console.error(error);
        throw new Error(
          i18n.t('pageBackupRestore.toast.errorBackupSettings'),
          error
        );
      }
    },
    async backupBiosConfig({ state }) {
      try {
        let rsp = await api.post(
          '/cgi/backup_bios_config.cgi',
          state.downloadJson
        );
        state.backupBiosResult = rsp.data.result;
      } catch (error) {
        throw new Error(
          i18n.t('pageBackupRestore.toast.errorBackupSettings'),
          error
        );
      }
    },
  },
};

export default BackupRestoreStore;
