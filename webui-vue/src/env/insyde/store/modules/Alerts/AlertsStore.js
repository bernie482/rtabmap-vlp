import api from '@/store/api';
import i18n from '@/i18n';

const AlertsStore = {
  namespaced: true,
  state: {
    snmpsvc: null,
    pefs: null,
    alertconf: null,
    snmpconf: null,
    smtpconf: null,
    trapconf: null,
    gpefstatus: null,
    mpefItem: null,
  },
  getters: {
    snmpsvc: (state) => state.snmpsvc,
    pef: (state) => state.pefs,
    alertconf: (state) => state.alertconf,
    snmpconf: (state) => state.snmpconf,
    smtpconf: (state) => state.smtpconf,
    trapconf: (state) => state.trapconf,
    globalpefstatus: (state) => state.gpefstatus,
    mpefstatus: (state) => state.mpefItem,
  },
  mutations: {
    setSNMPData: (state, attr) => {
      state.snmpsvc = attr;
    },
    setPef: (state, attr) => {
      state.pefs = attr;
    },
    alertConfInfo: (state, attr) => {
      state.alertconf = attr;
    },
    snmpConfInfo: (state, attr) => {
      state.snmpconf = attr;
    },
    smtpConfInfo: (state, attr) => {
      state.smtpconf = attr;
    },
    trapConfInfo: (state, attr) => {
      state.trapconf = attr;
    },
    gpefConfInfo: (state, attr) => {
      state.gpefstatus = attr;
    },
    mpefInfo: (state, attr) => {
      state.mpefItem = attr;
    },
  },
  actions: {
    async patchSNMPSVC({ dispatch }, dataobj) {
      console.log(dispatch);
      let headConfig = {
        headers: {
          oem_web_tag: 'WEB',
        },
      };
      let payloadObj = null;
      if (dataobj.enable != AlertsStore.state.snmpsvc.ProtocolEnabled) {
        payloadObj = {
          SNMP: {
            ProtocolEnabled: dataobj.enable,
          },
        };
      } else {
        payloadObj = {
          SNMP: {
            CommunityStrings: [
              {
                AccessMode: 'Limited',
                CommunityString: dataobj.readstr,
              },
              {
                AccessMode: 'Full',
                CommunityString: dataobj.writestr,
              },
            ],
            EnableSNMPv1: dataobj.env1v2c,
            EnableSNMPv2c: dataobj.env1v2c,
          },
        };
      }
      return await api.get('/redfish/v1/Managers', headConfig).then((d) => {
        let uri;
        if (d.data['Members@odata.count'] > 0) {
          uri = d.data.Members.find((elm) =>
            elm['@odata.id'].toUpperCase().includes('BMC')
          );
        }
        return api
          .patch(
            `${uri['@odata.id'] + '/NetworkProtocol'}`,
            payloadObj,
            headConfig
          )
          .catch((error) => {
            console.log(error);
            throw new Error(i18n.t('global.toast.errorSaveSettings'), error);
          });
      });
    },
    async getSNMPsvc({ commit }) {
      let headConfig = {
        headers: {
          oem_web_tag: 'WEB',
        },
      };
      return await api
        .get('/redfish/v1/Managers', headConfig)
        .then((d) => {
          let uri;
          if (d.data['Members@odata.count'] > 0) {
            uri = d.data.Members.find((elm) =>
              elm['@odata.id'].toUpperCase().includes('BMC')
            );
          }
          return api.get(`${uri['@odata.id'] + '/NetworkProtocol'}`);
        })
        .then((response) => {
          const snmpsvc = response.data?.SNMP ?? {};
          commit('setSNMPData', snmpsvc);
        })
        .catch((error) => {
          console.log(error);
          throw new Error(i18n.t('global.toast.errorGetSettings'), error);
        });
    },
    async saveModifiedpefConfig({ dispatch }, mpefobj) {
      console.log(dispatch);
      //console.log('saveModifiedpefConfig = ', mpefobj);
      try {
        await api.put('/cgi/config_pef.cgi', mpefobj);
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorSaveSettings'), error);
      }
    },
    async getModifyPef({ dispatch }) {
      try {
        let rsp = await api.post('/cgi/config_modify_pef.cgi');
        await dispatch('mpefstate', {
          attrs: rsp.data,
        });
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorGetSettings'), error);
      }
    },
    async mpefstate({ commit }, attrObj) {
      try {
        let attr = attrObj.attrs;
        commit('mpefInfo', attr);
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorGetSettings'), error);
      }
    },
    async saveGlobalpefConfig({ dispatch }, gpefobj) {
      console.log(dispatch);
      //console.log(gpefobj);
      let headConfig = {
        headers: {
          query: 'SET_PEF_CONFIG',
        },
      };
      try {
        await api.post('/cgi/config_global_pef.cgi', gpefobj, headConfig);
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorSaveSettings'), error);
      }
    },
    async getGlobalPefStatus({ dispatch }) {
      let headConfig = {
        headers: {
          query: 'GET_PEF_CONFIG',
        },
      };
      try {
        let rsp = await api.get('/cgi/config_global_pef.cgi', headConfig);
        await dispatch('getgpefAttrs', {
          attrs: rsp.data,
        });
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorGetSettings'), error);
      }
    },
    async getgpefAttrs({ commit }, attrObj) {
      try {
        let attr = attrObj.attrs;
        commit('gpefConfInfo', attr);
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorGetSettings'), error);
      }
    },
    async destinationConfigSave({ dispatch }, destobj) {
      //console.log(destobj);
      console.log(dispatch);
      let headConfig = {
        headers: {
          query: 'DEST',
        },
      };
      let alerthead = {
        headers: {
          query: 'DEST_CONFIG',
        },
      };
      let snmpdata = {};
      snmpdata['channel'] = destobj?.channel ?? 1;
      snmpdata['destination'] = destobj?.snmp;
      let smtpdata = {};
      smtpdata['channel'] = destobj?.channel ?? 1;
      smtpdata['destination'] = destobj?.smtp;
      let alertdata = {};
      alertdata['channel'] = destobj?.channel ?? 1;
      alertdata['enable'] = destobj?.enable;
      alertdata['destination'] = destobj?.alert;
      try {
        await api.post('/cgi/snmp.cgi', snmpdata, headConfig);
        await api.post('/cgi/smtp.cgi', smtpdata, headConfig);
        await api.post('/cgi/alert.cgi', alertdata, alerthead);
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorSaveSettings'), error);
      }
    },
    async trapConfigSave({ dispatch }, dataobj) {
      //console.log(dispatch);
      let headConfig = {
        headers: {
          query: 'TRAP_CONFIG',
        },
      };
      try {
        await api
          .post('/cgi/snmp.cgi', dataobj, headConfig)
          .then(() => dispatch('getTrapConfigInfo'));
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorSaveSettings'), error);
      }
    },
    async getPef({ dispatch }) {
      try {
        let rsp = await api.post('/cgi/config_pef.cgi', '');
        await dispatch('getPefAttrs', {
          attrs: rsp.data,
        });
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorGetSettings'), error);
      }
    },
    async getPefAttrs({ commit }, attrObj) {
      try {
        let attr = attrObj.attrs;
        commit('setPef', attr);
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorGetSettings'), error);
      }
    },
    async getTrapConfigInfo({ dispatch }) {
      let headConfig = {
        headers: {
          query: 'TRAP_CONFIG',
        },
      };
      try {
        let rsp = await api.get('/cgi/snmp.cgi', headConfig);
        await dispatch('getTrapConf', {
          attr: rsp.data,
        });
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorGetSettings'), error);
      }
    },
    async getTrapConf({ commit }, attrObj) {
      try {
        let attr = attrObj.attr;
        commit('trapConfInfo', attr);
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorGetSettings'), error);
      }
    },
    async getAlertDestInfo({ dispatch }) {
      /*
      let headConfig = {
        headers: {
          query: 'DEST',
        },
      };*/
      let alertConf = {
        headers: {
          query: 'DEST_CONFIG',
        },
      };
      try {
        let rsp_alert = await api.get('/cgi/alert.cgi', alertConf);
        await dispatch('getAlertConf', {
          attr: rsp_alert.data,
        });
        /*
        let rsp_snmp = await api.get('/cgi/snmp.cgi', headConfig);
        await dispatch('getSnmpConf', {
          attr: rsp_snmp.data,
        });
        let rsp_smtp = await api.get('/cgi/smtp.cgi', headConfig);
        await dispatch('getSmtpConf', {
          attr: rsp_smtp.data,
        });
        */
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorGetSettings'), error);
      }
    },
    async getSnmpConf({ commit }, attrObj) {
      try {
        let attr = attrObj.attr;
        commit('snmpConfInfo', attr);
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorGetSettings'), error);
      }
    },
    async getSmtpConf({ commit }, attrObj) {
      try {
        let attr = attrObj.attr;
        commit('smtpConfInfo', attr);
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorGetSettings'), error);
      }
    },
    async getAlertConf({ commit }, attrObj) {
      try {
        let attr = attrObj.attr;
        commit('alertConfInfo', attr);
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorGetSettings'), error);
      }
    },
  },
};

export default AlertsStore;
