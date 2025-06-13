import api from '@/store/api';
import i18n from '@/i18n';
import { getField, updateField } from 'vuex-map-fields';

const SchedulesStore = {
  namespaced: true,
  state: {
    idOptions: [],
    allSchedules: [],
    // options
    powerActionOptions: [
      {
        value: 0xa0,
        text: i18n.t('global.power.LANG_S_POWER_CONTROL_IMMOFF'),
      },
      {
        value: 0xa1,
        text: i18n.t('global.power.LANG_S_POWER_CONTROL_ON'),
      },
      {
        value: 0xa2,
        text: i18n.t('global.power.LANG_S_POWER_CONTROL_CYCLE'),
      },
      {
        value: 0xa3,
        text: i18n.t('global.power.LANG_S_POWER_CONTROL_RESET'),
      },
      {
        value: 0xa4,
        text: i18n.t('global.power.LANG_S_POWER_CONTROL_GRACEFUL_SHUTDOWN'),
      },
    ],
    powerDateTypeOptions: [
      {
        value: 1,
        text: i18n.t('pagePowerSchedule.LANG_POWER_SCHEDULE_SPECIFIC_LABEL'),
      },
      {
        value: 2,
        text: i18n.t('pagePowerSchedule.LANG_POWER_SCHEDULE_DAILY_LABEL'),
      },
      {
        value: 3,
        text: i18n.t('pagePowerSchedule.LANG_POWER_SCHEDULE_WEEKLY_LABEL'),
      },
      {
        value: 4,
        text: i18n.t('pagePowerSchedule.LANG_POWER_SCHEDULE_MONTHLY_LABEL'),
      },
    ],
    powerDateWeeklyDayOptions: [
      {
        value: 1,
        text: i18n.t('global.weekday.LANG_MISC_NM_CONFIG_TIMERS_WEEKDAY7'),
      },
      {
        value: 2,
        text: i18n.t('global.weekday.LANG_MISC_NM_CONFIG_TIMERS_WEEKDAY1'),
      },
      {
        value: 4,
        text: i18n.t('global.weekday.LANG_MISC_NM_CONFIG_TIMERS_WEEKDAY2'),
      },
      {
        value: 8,
        text: i18n.t('global.weekday.LANG_MISC_NM_CONFIG_TIMERS_WEEKDAY3'),
      },
      {
        value: 16,
        text: i18n.t('global.weekday.LANG_MISC_NM_CONFIG_TIMERS_WEEKDAY4'),
      },
      {
        value: 32,
        text: i18n.t('global.weekday.LANG_MISC_NM_CONFIG_TIMERS_WEEKDAY5'),
      },
      {
        value: 64,
        text: i18n.t('global.weekday.LANG_MISC_NM_CONFIG_TIMERS_WEEKDAY6'),
      },
      //{
      //  value: 128,
      //  text: i18n.t('global.weekday.LANG_MISC_NM_CONFIG_TIMERS_WEEKDAY7'),
      //},
    ],
  },
  getters: {
    getField,
  },
  mutations: {
    updateField,
  },
  actions: {
    async getSchedule({ state }, i) {
      //console.info('getSchedule', i);
      let ret = null;
      let schedules = JSON.parse(JSON.stringify(state.allSchedules)); // deep copy
      let config = {
        headers: {
          QUERY: 'TASK',
        },
      };
      ret = await api
        .get('/cgi/power_schedule.cgi?index=' + i, config)
        .then((response) => {
          // hidden empty record
          if (
            response.data.enable == 0 &&
            response.data.hour == 255 &&
            response.data.minute == 255
          ) {
            return {};
          }
          response.data.index = i;
          schedules[i - 1] = response.data;
        })
        .catch((error) => {
          console.error(error);
        });
      state.allSchedules = schedules;
      return ret;
    },
    async getSchedules({ dispatch }) {
      //console.info('getSchedules');
      let ret = null;
      let n = 10; // NOTE: for SPF, able has 40 schedules.
      for (let i = 1; i <= n; i++) {
        ret = await dispatch('getSchedule', i);
      }
      return ret;
    },
    async createSchedule({ dispatch }, userInfo) {
      //console.info('createSchedule', userInfo);
      return dispatch('createSchedule', userInfo);
    },
    async updateSchedule({ dispatch }, userInfo) {
      //console.info('updateSchedule', userInfo);
      let id = userInfo.index;
      let config = {
        headers: {
          QUERY: 'TASK',
        },
      };
      return await api
        .post('/cgi/power_schedule.cgi?index=' + id, userInfo, config)
        .then(() => {
          dispatch('getSchedule', id);
          return i18n.t('global.toast.successUpdate');
        })
        .catch((error) => {
          console.error(error);
          const message = i18n.t('global.toast.errorUpdate');
          dispatch('getSchedules');
          throw new Error(message, error);
        });
    },
    async deleteSchedule({ state, dispatch }, id) {
      //console.info('deleteSchedule', id);
      let config = {
        headers: {
          QUERY: 'DELETE',
        },
        data: {
          index: [id],
        },
      };
      return await api
        .delete('/cgi/power_schedule.cgi', config)
        .then(() => {
          let schedules = JSON.parse(JSON.stringify(state.allSchedules)); // deep copy
          schedules.splice(id - 1, 1);
          state.allSchedules = schedules;
          dispatch('getSchedule', id);
        })
        .then(() => i18n.t('global.toast.successUpdate'))
        .catch((error) => {
          console.error(error);
          const message = i18n.t('global.toast.errorUpdate');
          throw new Error(message, error);
        });
    },
    async deleteSchedules({ state, dispatch }, ids) {
      //console.info('deleteSchedule', ids);
      let config = {
        headers: {
          QUERY: 'DELETE',
        },
        data: {
          index: ids,
        },
      };
      return await api
        .delete('/cgi/power_schedule.cgi', config)
        .then(() => {
          state.allSchedules = [];
          dispatch('getSchedules');
        })
        .then(() => i18n.t('global.toast.successUpdate'))
        .catch((error) => {
          console.error(error);
          const message = i18n.t('global.toast.errorUpdate');
          throw new Error(message, error);
        });
    },
  },
};

export default SchedulesStore;
