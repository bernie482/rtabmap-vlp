import api from '@/store/api';
import i18n from '@/i18n';

const Networks = {
  namespaced: true,
  state: {
    activeChannel: 0,
    failover: false,
    ipv4Nics: [],
    ipv6Nics: [],
    vlan: [],
  },
  getters: {
    getActiveChannel(state) {
      return state.activeChannel;
    },
    getFailover(state) {
      return state.failover;
    },
    getIpv4NicInfo(state) {
      return state.ipv4Nics;
    },
    getIpv6NicInfo(state) {
      return state.ipv6Nics;
    },
    getVlanInfo(state) {
      return state.vlan;
    },
  },
  mutations: {
    setActiveChannel(state, activeChannel) {
      state.activeChannel = activeChannel;
    },
    setFailover(state, failover) {
      state.failover = failover;
    },
    setIpv4NicInfo(state, ipv4Nics) {
      state.ipv4Nics = ipv4Nics;
    },
    setIpv6NicInfo(state, ipv6Nics) {
      state.ipv6Nics = ipv6Nics;
    },
    setVlanInfo(state, vlan) {
      state.vlan = vlan;
    },
  },
  actions: {
    async getIPv4ConfigInfo({ commit }) {
      return await api
        .get('/cgi/netip4cfg.cgi')
        .then((response) => {
          if (response.data) {
            commit('setIpv4NicInfo', response.data.nic);
            commit('setActiveChannel', response.data.act_chl);
            commit('setFailover', response.data.failover);
          }
        })
        .catch((error) => {
          console.log(error);
          throw new Error(error, error);
        });
    },
    async getIPv6ConfigInfo({ commit }) {
      return await api
        .get('/cgi/netip6cfg.cgi')
        .then((response) => {
          if (response.data) {
            commit('setIpv6NicInfo', response.data.nic);
            commit('setActiveChannel', response.data.act_chl);
            commit('setFailover', response.data.failover);
          }
        })
        .catch((error) => {
          console.log(error);
          throw new Error(error, error);
        });
    },
    async getVlanConfigInfo({ commit }) {
      return await api
        .get('/cgi/vlan.cgi', {
          headers: {
            Query: 'Config',
          },
        })
        .then((response) => {
          if (response.data) {
            commit('setVlanInfo', response.data.vlan);
          }
        })
        .catch((error) => {
          console.log(error);
          throw new Error(error, error);
        });
    },
    async updateIPv4ChannelSettings({ dispatch }, channelSettingsForm) {
      let data = {
        failover: channelSettingsForm.failover,
        channel: channelSettingsForm.channel,
        hostname: channelSettingsForm.hostname,
        enable: channelSettingsForm.enable,
        dynamicEnable: channelSettingsForm.dhcp,
      };

      // If DHCP disabled, update static DNS or static ipv4
      if (data.enable && !data.dynamicEnable) {
        if (channelSettingsForm?.staticIpv4) {
          data.ip = channelSettingsForm.staticIpv4.address;
          data.subnet = channelSettingsForm.staticIpv4.subnetMask;
          data.gateway = channelSettingsForm.staticIpv4.gateway;
        }
        // static ipv4 dns server
        if (channelSettingsForm?.staticNameServers?.[0]) {
          data.ip4dns1 = channelSettingsForm.staticNameServers[0];
        }
        if (channelSettingsForm?.staticNameServers?.[1]) {
          data.ip4dns2 = channelSettingsForm.staticNameServers[1];
        }
      }

      return await api
        .patch(`/cgi/netip4cfg.cgi`, data)
        .then(() => {
          Promise.all([dispatch('getIPv4ConfigInfo')]);
          return; // return -> Connection lost after setting change. Don't wait for dispatch results.
        })
        .then(() => {
          return i18n.t('pageNetworks.toast.successSaveNetworkSettings', {
            setting: i18n.t('pageNetwork.network'),
          });
        })
        .catch((error) => {
          console.log(error);
          throw new Error(
            i18n.t('pageNetworks.toast.errorSaveNetworkSettings', {
              setting: i18n.t('pageNetwork.network'),
            })
          );
        });
    },
    async updateIPv6ChannelSettings({ dispatch }, channelSettingsForm) {
      let data = {
        failover: channelSettingsForm.failover,
        channel: channelSettingsForm.channel,
        ip6enable: channelSettingsForm.enable,
        ip6DynamicEnable: channelSettingsForm.dhcp,
        ip6dns1: '',
        ip6dns2: '',
      };

      data.ip6addr = channelSettingsForm.staticIpv6.address;
      if (data.ip6enable) {
        data.ip6addr_prefixlen = channelSettingsForm.staticIpv6.prefixLen;
      } else {
        data.ip6addr_prefixlen =
          channelSettingsForm.staticIpv6.prefixLen == 0
            ? 64
            : channelSettingsForm.staticIpv6.prefixLen;
      }
      data.ip6gateway = channelSettingsForm.staticIpv6.gateway;
      data.ip6gatewayEnable = Boolean(data.ip6gateway.length > 0);
      // static ipv6 dns server
      if (channelSettingsForm.staticNameServers[0]) {
        data.ip6dns1 = channelSettingsForm.staticNameServers[0];
      }
      if (channelSettingsForm.staticNameServers[1]) {
        data.ip6dns2 = channelSettingsForm.staticNameServers[1];
      }

      return await api
        .patch(`/cgi/netip6cfg.cgi`, data)
        .then(() => {
          Promise.all([dispatch('getIPv6ConfigInfo')]);
          return; // return -> Connection lost after setting change. Don't wait for dispatch results.
        })
        .then(() => {
          return i18n.t('pageNetworks.toast.successSaveNetworkSettings', {
            setting: i18n.t('pageNetwork.network'),
          });
        })
        .catch((error) => {
          console.log(error);
          throw new Error(
            i18n.t('pageNetworks.toast.errorSaveNetworkSettings', {
              setting: i18n.t('pageNetwork.network'),
            })
          );
        });
    },
    async updateVlanSettings({ dispatch }, data) {
      return await api
        .post('/cgi/vlan.cgi', data, {
          headers: {
            Query: 'Config',
          },
        })
        .then(() => {
          dispatch('getVlanConfigInfo');
          return; // return -> Connection lost after setting change. Don't wait for dispatch results.
        })
        .then(() => {
          return i18n.t('pageNetworks.toast.successSaveVlanSettings');
        })
        .catch((error) => {
          console.log(error);
          throw new Error(
            i18n.t('pageNetworks.toast.errorSaveVlanSettings'),
            error
          );
        });
    },
  },
};

export default Networks;
