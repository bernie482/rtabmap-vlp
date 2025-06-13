import api from '@/store/api';
import i18n from '@/i18n';
var base64js = require('base64-js');
const SystemDiagnosticsStore = {
  namespaced: true,
  state: {
    debugLogStatus: {
      state: 0,
      time: -1,
      offset: 0,
    },
    acdLogStatus: {
      ACDLOG: [],
      ACDLOGENABLE: false,
      ACDLOG_ANALYZED: [],
    },
    basdLogStatus: {
      BASDLOG: [],
    },
    basdTriggerRunning: false,
  },
  getters: {
    debugLogStatus: (state) => state.debugLogStatus,
    acdLogStatus: (state) => state.acdLogStatus,
    basdLogStatus: (state) => state.basdLogStatus,
    basdTriggerRunning: (state) => state.basdTriggerRunning,
  },
  mutations: {
    setDebugLogStatus: (state, status) => (state.debugLogStatus = status),
    setAcdLogStatus: (state, status) => (state.acdLogStatus = status),
    setAcdLogSevice: (state, enable) =>
      (state.acdLogStatus.ACDLOGENABLE = enable),
    setBasdLogStatus: (state, status) => (state.basdLogStatus = status),
    basdTriggerRunning: (state, status) => (state.basdTriggerRunning = status),
  },
  actions: {
    // Debug Log
    async getDebugLogStatus({ commit }) {
      try {
        const status = await api.get('/cgi/debug_log.cgi', {
          headers: {
            Query: 'DEBUG_LOG_STATUS',
          },
        });
        commit('setDebugLogStatus', status.data);
      } catch (error) {
        throw new Error(
          i18n.t('pageSystemDiagnostics.debug.toast.errorGetDebugLogStatus'),
          error
        );
      }
    },
    async generateDebugLog(_, password) {
      let passwordArr = new Uint8Array(password.length);
      for (let i = password.length; i--; ) {
        passwordArr[i] = password.charCodeAt(i);
      }
      const payload = {
        SETPASSWORD: base64js.fromByteArray(passwordArr),
      };

      try {
        await api.post('/cgi/debug_log.cgi', payload, {
          headers: {
            Query: 'GENERATE',
          },
        });
      } catch (error) {
        throw new Error(
          i18n.t('pageSystemDiagnostics.debug.toast.errorGenearteDebugLog'),
          error
        );
      }
    },
    async downloadDebugLog() {
      try {
        return await api.get('/cgi/debug_log.cgi?download=DebugLogs.zip', {
          responseType: 'blob',
        });
      } catch (error) {
        throw new Error(
          i18n.t('pageSystemDiagnostics.toast.downloadFileFailStart') +
            'DebugLogs.zip' +
            i18n.t('pageSystemDiagnostics.toast.downloadFileFailEnd'),
          error
        );
      }
    },
    // ACD Log
    async getAcdLogStatus({ commit }) {
      try {
        const status = await api.post('/cgi/get_acd_log.cgi');
        // Fake data for debug
        // status.data = {
        //   ...status.data,
        //   ...{
        //     ACDLOG: [
        //       {
        //         FILENAME: '/tmp/acdlog/log1.txt',
        //         LOGINFO: [{ CONTENT: 'test 11111111 setest23' }],
        //       },
        //       {
        //         FILENAME: '/tmp/acdlog/log2.txt',
        //         LOGINFO: [{ CONTENT: 'test 2222222 setest23' }],
        //       },
        //     ],
        //     ACDLOG_ANALYZED: [
        //       {
        //         LOGINFO: [{ CONTENT: 'test 111111 xxxxxxxxxxx' }],
        //       },
        //       {
        //         LOGINFO: [{ CONTENT: 'test 222222 xxxxxxxxxxxx' }],
        //       },
        //     ],
        //   },
        // };
        commit('setAcdLogStatus', status.data);
      } catch (error) {
        throw new Error(
          i18n.t('pageSystemDiagnostics.acd.toast.errorGetAcdLogStatus'),
          error
        );
      }
    },
    async checkAcdLogService({ commit }) {
      try {
        const status = await api.get('/cgi/get_acd_log.cgi', {
          headers: {
            QUERY: 'CHECK_ACD_SERVICE',
          },
        });
        if (Object.prototype.hasOwnProperty.call(status.data, 'ACDLOGENABLE')) {
          commit('setAcdLogSevice', status.data.ACDLOGENABLE);
        } else {
          throw new Error();
        }
      } catch (error) {
        throw new Error(
          i18n.t('pageSystemDiagnostics.acd.toast.errorGetAcdLogStatus'),
          error
        );
      }
    },
    async setAcdLogEnable(_, enable) {
      const config = {
        url: '/cgi/get_acd_log.cgi',
        method: 'patch',
        data: `{ "ENABLE": ${enable} }`,
        headers: {
          'Content-Type': 'application/json',
        },
      };
      try {
        await api.request(config).then((response) => {
          if (response?.data?.RESULT != 'OK') {
            throw new Error();
          }
        });
      } catch (error) {
        throw new Error(
          i18n.t('pageSystemDiagnostics.acd.toast.setFail'),
          error
        );
      }
    },
    async downloadAcdLog(_, filename) {
      try {
        return await api.get(`/cgi/get_acd_log.cgi?FILE=${filename}`, {
          responseType: 'blob',
        });
      } catch (error) {
        throw new Error(
          i18n.t('pageSystemDiagnostics.toast.downloadFileFailStart') +
            filename +
            i18n.t('pageSystemDiagnostics.toast.downloadFileFailEnd'),
          error
        );
      }
    },
    // BASD Log
    async getBasdLogStatus({ commit }) {
      try {
        const status = await api.post('/cgi/get_basd_log.cgi', undefined, {
          headers: {
            Query: 'CHECK',
          },
        });
        // Fake data for debug
        // status.data = {
        //   ...status.data,
        //   ...{
        //     BASDLOG: [
        //       {
        //         TYPE: 'DebugDumpDefinition00_AutomaticTriageDebug',
        //         DESC:
        //           'Gathers basic SPS firmware info in case of CPU reported errors or critical ME Health Events',
        //         ONDEMAND: false,
        //         LOGZIP: [
        //           {
        //             FILENAME:
        //               '/nv/basd/DebugDumpDefinition00_AutomaticTriageDebug-20200818-222.zip',
        //             LOGINFO: [
        //               {
        //                 CONTENT:
        //                   '  /DebugDumpDefinition00_AutomaticTriageDebug',
        //               },
        //               {
        //                 CONTENT: 'AAAAAA',
        //               },
        //               {
        //                 CONTENT: 'BBBBBB',
        //               },
        //             ],
        //           },
        //           {
        //             FILENAME:
        //               '/nv/basd/DebugDumpDefinition00_AutomaticTriageDebug-20200818-333.zip',
        //             LOGINFO: [
        //               {
        //                 CONTENT: '20200818-333.zip',
        //               },
        //               {
        //                 CONTENT: '20200818-333.zip',
        //               },
        //             ],
        //           },
        //         ],
        //       },
        //       {
        //         TYPE: 'DebugDumpDefinition01_AutomaticPowerControlDebug',
        //         DESC: 'NM Exception Event Debug Dump definition',
        //         ONDEMAND: false,
        //         LOGZIP: [
        //           {
        //             FILENAME:
        //               '/nv/basd/DebugDumpDefinition02_AutomaticMonitoringServiceDebug-20200818-444.zip',
        //             LOGINFO: [
        //               {
        //                 CONTENT:
        //                   '  /DebugDumpDefinition02_AutomaticMonitoringServiceDebug',
        //               },
        //               {
        //                 CONTENT:
        //                   'DebugDumpDefinition02_AutomaticMonitoringServiceDebugAAAAAA',
        //               },
        //               {
        //                 CONTENT:
        //                   'DebugDumpDefinition02_AutomaticMonitoringServiceDebugBBBBBB',
        //               },
        //             ],
        //           },
        //         ],
        //       },
        //       {
        //         TYPE: 'DebugDumpDefinition02_AutomaticMonitoringServiceDebug',
        //         DESC: 'NM Health Event Debug Dump dedefinition',
        //         ONDEMAND: false,
        //         LOGZIP: [],
        //       },
        //       {
        //         TYPE: 'DebugDumpDefinition03_OnDemandGatherEverythingDebug',
        //         DESC:
        //           'On demand Debug Dump definition which gathers all predefined commands buckets',
        //         ONDEMAND: true,
        //         ONDEMAND_IN_PROGRESS: false,
        //         LOGZIP: [],
        //       },
        //     ],
        //   },
        // };
        commit('setBasdLogStatus', status.data);
      } catch (error) {
        throw new Error(
          i18n.t('pageSystemDiagnostics.basd.toast.errorGetBasdLogStatus'),
          error
        );
      }
    },
    async triggerBasdLog(_, logtype) {
      const payload = {
        ID: logtype,
      };
      try {
        await api
          .post('/cgi/get_basd_log.cgi', payload, {
            headers: {
              Query: 'TRIGGER',
            },
          })
          .then((response) => {
            if (response?.data?.RESULT != 'OK') {
              throw new Error();
            }
          });
      } catch (error) {
        throw new Error(
          i18n.t('pageSystemDiagnostics.basd.toast.errorTriggerBasdLog'),
          error
        );
      }
    },
    async downloadBasdLog(_, filename) {
      try {
        return await api.get(`/cgi/get_basd_log.cgi?download=${filename}`, {
          responseType: 'blob',
        });
      } catch (error) {
        throw new Error(
          i18n.t('pageSystemDiagnostics.toast.downloadFileFailStart') +
            filename +
            i18n.t('pageSystemDiagnostics.toast.downloadFileFailEnd'),
          error
        );
      }
    },
  },
};
export default SystemDiagnosticsStore;
