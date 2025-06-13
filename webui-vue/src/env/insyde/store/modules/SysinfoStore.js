import api from '@/store/api';
import i18n from '@/i18n';

const SysInfoStore = {
  namespaced: true,
  state: {
    sysinfo: {},
    chassis: {
      powerStatus: 'unknown',
    },
    timeout: 0,
    biosinfo: {
      BIOSFW_VERSION: '',
      BIOSFW_BUILDTIME: '',
    },
  },
  getters: {
    sysinfo(state) {
      return state.sysinfo;
    },
    chassis(state) {
      return state.chassis;
    },
    timeout(state) {
      return state.timeout;
    },
    biosinfo(state) {
      return state.biosinfo;
    },
  },
  mutations: {
    setSysinfo(state, sysinfo) {
      state.sysinfo = sysinfo;
    },
    setChassis(state, chassis) {
      state.chassis = chassis;
    },
    setTimeout(state, timeout) {
      state.timeout = timeout;
    },
    setBiosInfo(state, biosinfo) {
      state.biosinfo = biosinfo;
    },
  },
  actions: {
    async getStatus({ dispatch }) {
      await dispatch('getSysteminfo');
      await dispatch('getChassis');
    },
    async getSysteminfo({ commit }) {
      try {
        const sysinfo = await api.post('/cgi/getsysteminfo.cgi', undefined);
        commit('setSysinfo', sysinfo.data);
      } catch (error) {
        throw new Error(i18n.t('pageSysinfo.toast.errorGetSysteminfo'), error);
      }
    },
    async getChassis({ commit }) {
      try {
        const chassis = await api.get('/cgi/chassis.cgi', {
          headers: {
            Query: 'CHASSIS_STATUS',
          },
        });
        commit('setChassis', chassis.data);
      } catch (error) {
        throw new Error(i18n.t('pageSysinfo.toast.errorGetChassis'), error);
      }
    },
    async getSessionTimeout({ commit }) {
      try {
        const timeout = await api.get('/cgi/get_session_info.cgi', {
          headers: {
            Query: 'TIMEOUT',
          },
        });
        commit('setTimeout', timeout.data.timeout);
      } catch (error) {
        throw new Error(i18n.t('pageSysinfo.toast.errorGetTimeout'), error);
      }
    },
    async setSessionTimeout({ dispatch }, timeout) {
      switch (timeout) {
        case 240:
          timeout = 0xc1;
          break;
        case 480:
          timeout = 0xc2;
          break;
        case 1440:
          timeout = 0xc3;
          break;
      }
      try {
        let config = {
          url: '/cgi/config_session_timeout.cgi',
          method: 'patch',
          data: `{"TOUTTIME": ${timeout}}`,
          headers: {
            'Content-Type': 'application/json',
          },
        };
        await api.request(config).then(() => {
          return dispatch('getSessionTimeout');
        });
      } catch (error) {
        throw new Error(i18n.t('pageSysinfo.toast.errorSetTimeout'), error);
      }
    },
    async setHostInterface(/*{ dispatch }*/ _, enable) {
      try {
        let config = {
          url: '/cgi/getsysteminfo.cgi',
          method: 'patch',
          data: `{ "ENABLE": ${enable} }`,
          headers: {
            'Content-Type': 'application/json',
            QUERY: 'HOSTINTERFACE',
          },
        };
        await api.request(config).then(() => {
          // Workaround: Setting the host interface may clear the session and cause incoming requests to fail.
          // Here, do not obtain systeminfo in one step, but obtain it in two steps.
          // return dispatch('getSysteminfo');
        });
      } catch (error) {
        throw new Error(
          i18n.t('pageSysinfo.toast.errorSetHostInterface'),
          error
        );
      }
    },
    async getBiosInfo({ commit }) {
      try {
        const rsp = await api.post('/cgi/getsystembiosinfo.cgi');
        commit('setBiosInfo', rsp.data);
      } catch (error) {
        throw new Error(i18n.t('pageSysinfo.toast.errorGetBiosInfo'), error);
      }
    },
  },
};
export default SysInfoStore;
