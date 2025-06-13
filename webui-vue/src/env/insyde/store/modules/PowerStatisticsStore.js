import api from '@/store/api';
import i18n from '@/i18n';

const PowerStatisticsStore = {
  namespaced: true,
  state: {
    // <!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN:CONFIG_NM_OFFLOAD -->
    domainIdData: null,
    collection: null,
    // <!-- WEB_CONFIG_DEPEND_FEATURE_END:CONFIG_NM_OFFLOAD -->
    currentPowerData: [],
    historyData: { week: [], month: [], year: [] },
  },
  getters: {
    // <!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN:CONFIG_NM_OFFLOAD -->
    domainData: (state) => state.domainIdData,
    domains: (state) => state.collection,
    // <!-- WEB_CONFIG_DEPEND_FEATURE_END:CONFIG_NM_OFFLOAD -->
    currentPowerData: (state) => state.currentPowerData,
    historyData: (state) => state.historyData,
  },
  mutations: {
    // <!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN:CONFIG_NM_OFFLOAD -->
    setDomains: (state, attr) => (state.domainIdData = attr),
    domainCollection: (state, attr) => {
      state.collection = attr;
    },
    // <!-- WEB_CONFIG_DEPEND_FEATURE_END:CONFIG_NM_OFFLOAD -->
    setPowerData: (state, currentPowerData) =>
      (state.currentPowerData = currentPowerData),
    sethistoryData: (state, historyData) => (state.historyData = historyData),
  },
  actions: {
    // <!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN:CONFIG_NM_OFFLOAD -->
    async getDomains({ commit }, domainName) {
      try {
        let rsp = await api.get(
          `/redfish/v1/Managers/bmc/NodeManager/Domains/${domainName}`
        );
        commit('setDomains', rsp.data);
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorGetSettings'), error);
      }
    },
    async getDomainCollection({ commit }) {
      try {
        let rsp = await api.get('/redfish/v1/Managers/bmc/NodeManager/Domains');
        commit('domainCollection', rsp.data);
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorGetSettings'), error);
      }
    },
    // <!-- WEB_CONFIG_DEPEND_FEATURE_END:CONFIG_NM_OFFLOAD -->
    async fetchCurrentReading({ dispatch, commit }) {
      try {
        await dispatch('checkDeviceId');
        const promiseCurrent = await dispatch('getCurrentPower');
        await Promise.all(promiseCurrent).then(function () {
          //console.log(
          //  'await ###, all done, current Data ========>',
          //  promiseCurrent
          //);
          commit('setPowerData', promiseCurrent);
        });
      } catch (error) {
        console.error(error);
        throw new Error(
          i18n.t('pagePowerStatistics.toast.meNotAvailable'),
          error
        );
      }
    },
    async checkDeviceId() {
      const data = {
        headers: { query: 'DEVICE_ID' },
      };
      return await api
        .get('/cgi/node_manager.cgi', data)
        .then((response) => {
          console.log(response.data);
        })
        .catch((error) => {
          console.log('node_manager.cgi', error);
          throw new Error(
            i18n.t('pagePowerStatistics.toast.meNotAvailable'),
            error
          );
        });
    },
    async getCurrentPower() {
      const data = {
        headers: { query: 'POWER_STATISTICS' },
      };
      return await api
        .get('/cgi/node_manager.cgi', data)
        .then((response) => {
          //console.log('POWER_STATISTICS', response.data);
          return response.data;
        })
        .catch((error) => {
          //console.log('node_manager.cgi', error);
          throw new Error(
            i18n.t('pagePowerStatistics.toast.meNotAvailable'),
            error
          );
        });
    },
    // below is for PowerHistory
    async getTimeZone({ dispatch, commit }) {
      try {
        const dtdata = await dispatch('getTime');
        const [
          ,
          year,
          month,
          day,
          hour,
          minute,
          second,
          sign,
          offsetH,
          offsetM,
        ] = dtdata.datetime.match(
          /(\d{3,})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})([+-])(\d{2}):(\d{2})/
        );
        console.log(year, month, day, hour, minute, second);
        const timeZone = parseInt(
          `${sign}${parseInt(offsetH) * 60 + parseInt(offsetM)}`
        );
        console.log('timeZone', timeZone);
        let historyTimeRange = ['week', 'month', 'year'];
        var history = {
          week: [],
          month: [],
          year: [],
        };
        const promisesfetchhistory = historyTimeRange.map((range) =>
          fetchHistory(range)
        );
        //console.log('await, promises', promisesfetchhistory);
        await Promise.all(promisesfetchhistory).then(function () {
          //console.log(
          //  'await 0, all done, historyData ========>',
          //  history,
          //  history.week.length
          //);
          commit('sethistoryData', history);
        });
        //console.log('await promise.all done');
        // eslint-disable-next-line no-inner-declarations
        async function fetchHistory(range) {
          var arr = [];
          try {
            arr = await dispatch('queryHistoryData', range);
            console.log('await 1', range, arr);
            history[range] = arr;
          } catch (error) {
            console.error(error);
            throw new Error('fetchHistory error!!', error);
          }
        }
      } catch (error) {
        //console.error(error);
        throw new Error(i18n.t('global.toast.errorGetSettings'), error);
      }
    },
    async getTime() {
      const header = {
        headers: { query: 'DATETIME' },
      };
      return await api
        .get('/cgi/config_datetime.cgi', header)
        .then((response) => {
          //console.log(response.data);
          return response.data;
        })
        .catch((error) => {
          //console.log('config_datetime.cgi', error);
          throw new Error('config_datetime.cgi ajax error', error);
        });
    },
    async queryHistoryData({ dispatch }, range) {
      console.log(dispatch, range);
      const header = {
        headers: {
          query: `HISTORY_${String.prototype.toUpperCase.call(range)}`,
        },
      };
      //console.log(header);
      return await api
        .get('/cgi/node_manager.cgi', header)
        .then((response) => {
          let arr = response.data[range];
          if (!Array.isArray(arr)) arr = [];
          else {
            arr.forEach((data, index) => {
              data.time = data.time * 1000;
              data.index = index;
            });
          }
          return arr;
        })
        .catch((error) => {
          //console.log('node_manager.cgi', error);
          throw new Error('node_manager.cgi ajax error', error);
        });
    },
  },
};
export default PowerStatisticsStore;
