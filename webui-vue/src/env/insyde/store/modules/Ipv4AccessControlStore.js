import api from '@/store/api';
import i18n from '@/i18n';

const Ipv4AccessControlStore = {
  namespaced: true,
  state: {
    enabled: false,
    rules: [],
  },
  getters: {
    rules: (state) => state.rules,
    enabled: (state) => state.enabled,
  },
  mutations: {
    setRules: (state, rules) => {
      state.rules = rules;
    },
    setEnabled: (state, enabled) => {
      state.enabled = enabled;
    },
  },
  actions: {
    async setEnabled({ commit }, { value }) {
      commit('setEnabled', value);
    },

    async getRules({ commit }) {
      //console.log('async getRules');
      const data = {
        headers: { query: 'LIST' },
      };
      return await api
        .get('/cgi/config_ip_ctrl.cgi', data)
        .then((response) => {
          let enabled = response.data.ipv4?.config?.enable || false;
          const data = response.data.ipv4?.rules?.map((rule) => {
            return {
              ruleNo: rule.index,
              ruleType: rule.type,
              content: getRuleContent(rule),
              policy: rule.policy,
            };
          });
          commit('setEnabled', enabled);
          commit('setRules', data);
        })
        .catch((error) => {
          console.log('Client Session Data:', error);
        });

      function getRuleContent(rule) {
        let content = '';
        switch (rule.type) {
          case 'ipMask':
            content += rule.ipMask?.addr;
            if (rule.ipMask.mask != 0) content += '/' + rule.ipMask?.mask;
            break;
          case 'ipRange':
            content = rule.ipRange.start + ' - ' + rule.ipRange.end;
            break;
          case 'mac':
            content = rule.mac.addr;
            break;
          case 'port':
            content =
              rule.port.protocol +
              ' ' +
              rule.port.start +
              ' ~ ' +
              rule.port.end;
            break;
        }
        return content;
      }
    },

    async updateConfigEnable({ dispatch }, enabled) {
      //console.log('async updateConfigEnable', enabled);
      const data = {};
      data.enable = enabled;
      data.isV6 = false;
      return await api
        //.post('/cgi/config_ip_ctrl.cgi/CONFIG', data)
        .post('/cgi/config_ip_ctrl.cgi', data, { headers: { query: 'CONFIG' } })
        .then(() => dispatch('getRules'))
        .then(() => i18n.t('pageIpAccessControl.toast.successUpdateConfig'))
        .catch((error) => {
          console.log(error);
          const message = i18n.t('pageIpAccessControl.toast.errorUpdateConfig');
          throw new Error(message, error);
        });
    },
    async createRule({ dispatch }, formData) {
      //console.log('async createRule', formData);
      let ruleNo = formData.index;
      return await api
        .post('/cgi/config_ip_ctrl.cgi', formData, {
          headers: { query: 'RULE' },
        })
        //.post('/redfish/v1/AccountService/Accounts', data)
        .then(() => dispatch('getRules'))
        .then(() =>
          i18n.t('pageIpAccessControl.toast.successCreateRule', { ruleNo })
        )
        .catch((error) => {
          console.log(error);
          const message = i18n.t('pageIpAccessControl.toast.errorCreateRule', {
            ruleNo,
          });
          throw new Error(message);
        });
    },
    async updateRule({ dispatch }, formData) {
      //console.log('async updateRule', formData);
      let ruleNo = formData.index;
      const data = {};
      data.mode = 'modify';
      data.isV6 = false;
      data.index = formData.index;
      if (formData.type) data.type = formData.type;
      if (formData.policy) data.policy = formData.policy;
      if (formData.ipMask) data.ipMask = formData.ipMask;
      if (formData.ipRange) data.ipRange = formData.ipRange;
      if (formData.mac) data.mac = formData.mac;
      if (formData.port) data.port = formData.port;
      return await api
        .post('/cgi/config_ip_ctrl.cgi', data, {
          headers: { query: 'RULE' },
        })
        .then(() => dispatch('getRules'))
        .then(() =>
          i18n.t('pageIpAccessControl.toast.successUpdateRule', {
            ruleNo,
          })
        )
        .catch((error) => {
          console.log(error);
          const message = i18n.t('pageIpAccessControl.toast.errorUpdateRule', {
            ruleNo,
          });
          throw new Error(message);
        });
    },
    async deleteRule({ dispatch }, ruleNo) {
      // NOTE: payload must use this format
      const data = {
        headers: { query: 'RULE' },
        data: {
          index: ruleNo,
          isV6: false,
        },
      };
      //console.log('async deleteRule', ruleNo, data);
      return await api
        .delete('/cgi/config_ip_ctrl.cgi', data)
        //.then(() => dispatch('getRules'))
        .then(() =>
          i18n.t('pageIpAccessControl.toast.successDeleteRule', {
            ruleNo,
          })
        )
        .catch((error) => {
          console.log(error);
          const message = i18n.t('pageIpAccessControl.toast.errorDeleteRule', {
            ruleNo,
          });
          if (ruleNo == 0) dispatch('getRules'); // no use dispatch
          throw new Error(message);
        });
    },
    async deleteRules({ dispatch }, rules) {
      //console.log('deleteRules', rules);
      // TODO: backend should support deleteRules
      // NOTE: backend will auto orange after delete a middle order rule.
      let toastMessages = [];
      //let successCount = 0;
      let reversedRules = rules.reverse();
      for (let rule of reversedRules) {
        let ruleNo = rule.ruleNo;
        if (rules.length == 0) dispatch('getRules');
        // NOTE: payload must use this format
        const data = {
          headers: { query: 'RULE' },
          data: {
            index: ruleNo,
            isV6: false,
          },
        };
        //console.log('deleteRule', ruleNo, data);
        await api
          .delete('/cgi/config_ip_ctrl.cgi', data)
          //.then(() => dispatch('getRules'))
          .then(() => {
            const message = i18n.t(
              'pageIpAccessControl.toast.successDeleteRule',
              {
                ruleNo,
              }
            );
            toastMessages.push({ type: 'success', message });
            //successCount += 1;
          })
          .catch((error) => {
            console.log(error);
            const message = i18n.t(
              'pageIpAccessControl.toast.errorDeleteRule',
              {
                ruleNo,
              }
            );
            toastMessages.push({ type: 'error', message });
            if (rule.ruleNo == 0) dispatch('getRules');
            //throw new Error(message);
          });
      }
      //console.log('async deleteRules', successCount, '/', rules.length);
      await dispatch('getRules');
      return toastMessages;
    },
  },
};
export default Ipv4AccessControlStore;
