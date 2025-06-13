import api from '@/store/api';
import i18n from '@/i18n';

const PowerCappingStore = {
  namespaced: true,
  state: {
    // <!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN:CONFIG_NM_OFFLOAD -->
    collection: null,
    entry: null,
    // <!-- WEB_CONFIG_DEPEND_FEATURE_END:CONFIG_NM_OFFLOAD -->
    result: null,
    policy: null,
    policysuspendtimers: null,
  },
  getters: {
    // <!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN:CONFIG_NM_OFFLOAD -->
    policycollection: (state) => state.collection,
    policyentry: (state) => state.entry,
    // <!-- WEB_CONFIG_DEPEND_FEATURE_END:CONFIG_NM_OFFLOAD -->
    policytimers: (state) => state.policysuspendtimers,
    policy: (state) => state.policy,
    state: (state) => state.result,
  },
  mutations: {
    // <!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN:CONFIG_NM_OFFLOAD -->
    policyCollection: (state, attr) => {
      state.collection = attr;
    },
    policyEntry: (state, attr) => {
      state.entry = attr;
    },
    // <!-- WEB_CONFIG_DEPEND_FEATURE_END:CONFIG_NM_OFFLOAD -->
    status: (state, attr) => {
      state.result = attr;
    },
    suspendtimers: (state, attr) => {
      state.policysuspendtimers = attr;
    },
    policyInfo: (state, attr) => {
      state.policy = attr;
    },
  },
  actions: {
    // <!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN:CONFIG_NM_OFFLOAD -->
    async changePolicyState({ commit }, payloadObj) {
      let payload = {
        State: payloadObj?.NM_ENABLED ? 'Enabled' : 'Disabled',
      };
      try {
        let rsp = await api.post(
          `/redfish/v1/Managers/bmc/NodeManager/Policies/${
            payloadObj?.NM_POLICY ?? ''
          }/Actions/Policy.ChangeState`,
          payload
        );
        commit('status', rsp.data);
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorSaveSettings'), error);
      }
    },
    async patchPolicyEntry({ commit }, payloadObj) {
      let payload = {
        CorrectionInMs: 6000,
        Limit: payloadObj.NM_POWERLIMIT,
        PolicyStorage: 'Volatile',
        PowerCorrectionType: 'Auto',
        LimitException: payloadObj?.LIMExc ?? 'NoAction',
        ComponentId: 255,
        Trigger: {
          TriggerLimit: 0,
          TriggerType: 'AlwaysOn',
        },
      };
      try {
        let rsp = await api.patch(
          `/redfish/v1/Managers/bmc/NodeManager/Policies/${(
            payloadObj?.NM_POLICY ?? ''
          ).toString()}`,
          payload
        );
        commit('status', rsp.data);
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorSaveSettings'), error);
      }
    },
    async deletePolicyEntry({ commit }, ID) {
      try {
        let rsp = await api.delete(
          `/redfish/v1/Managers/bmc/NodeManager/Policies/${ID}`
        );
        commit('status', rsp.data);
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorSaveSettings'), error);
      }
    },
    async postPolicies({ dispatch }, payloadObj) {
      let domainName = [
        'ACTotalPlatformPower',
        'CPUSubsystem',
        'MemorySubsystem',
        'DCTotalPlatformPower',
        'PCIe',
      ];
      let payload = {
        Id: payloadObj.NM_POLICY.toString(),
        Domain: domainName[payloadObj.NM_DOMAIN],
        CorrectionInMs: 6000,
        Limit: payloadObj.NM_POWERLIMIT,
        PolicyStorage: 'Volatile',
        PowerCorrectionType: 'Auto',
        StatisticsReportingPeriod: 'PT1S',
        LimitException: payloadObj?.LIMExc ?? 'NoAction',
        ComponentId: 255,
        Trigger: {
          TriggerLimit: 0,
          TriggerType: 'AlwaysOn',
        },
        Status: {
          State: payloadObj.NM_ENABLED ? 'Enabled' : 'Disabled',
        },
      };
      try {
        let rsp = await api.post(
          '/redfish/v1/Managers/bmc/NodeManager/Policies',
          payload
        );
        await dispatch('result', {
          attrs: rsp.data,
        });
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorSaveSettings'), error);
      }
    },
    async getPolicyEntry({ commit }, uri) {
      try {
        let rsp = await api.get(uri);
        commit('policyEntry', rsp.data);
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorGetSettings'), error);
      }
    },
    async getPolicyCollection({ commit }) {
      try {
        let rsp = await api.get(
          '/redfish/v1/Managers/bmc/NodeManager/Policies'
        );
        commit('policyCollection', rsp.data);
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorGetSettings'), error);
      }
    },
    // <!-- WEB_CONFIG_DEPEND_FEATURE_END:CONFIG_NM_OFFLOAD -->
    async setsuspendTimer({ dispatch }, payloadObj) {
      try {
        let rsp = await api.put('/cgi/nmsuspendperiods.cgi', payloadObj);
        await dispatch('result', {
          attrs: rsp.data,
        });
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorSaveSettings'), error);
      }
    },
    async nmsave({ dispatch }, payloadObj) {
      try {
        let rsp = await api.put('/cgi/nmpolicy.cgi', payloadObj);
        await dispatch('result', {
          attrs: rsp.data,
        });
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorSaveSettings'), error);
      }
    },
    async nmdelete({ dispatch }, payloadObj) {
      try {
        let rsp = await api.patch('/cgi/nmpolicy.cgi', payloadObj);
        await dispatch('result', {
          attrs: rsp.data,
        });
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorUpdate'), error);
      }
    },
    async result({ commit }, attrObj) {
      try {
        let attr = attrObj.attrs;
        commit('status', attr);
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorUpdate'), error);
      }
    },
    async nmsuspendperiods({ dispatch }, payloadObj) {
      try {
        let rsp = await api.post('/cgi/nmsuspendperiods.cgi', payloadObj);
        await dispatch('suspendtime', {
          attrs: rsp.data,
        });
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorGetSettings'), error);
      }
    },
    async suspendtime({ commit }, attrObj) {
      try {
        let attr = attrObj.attrs;
        commit('suspendtimers', attr);
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorGetSettings'), error);
      }
    },
    async nmpolicy({ dispatch }) {
      let payloadObj = {
        NM_POLICY: 0,
        NM_DOMAIN: 0,
      };
      try {
        let rsp = await api.post('/cgi/nmpolicy.cgi', payloadObj);
        await dispatch('policy', {
          attrs: rsp.data,
        });
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorGetSettings'), error);
      }
    },
    async policy({ commit }, attrObj) {
      try {
        let attr = attrObj.attrs;
        commit('policyInfo', attr);
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorGetSettings'), error);
      }
    },
  },
};
export default PowerCappingStore;
