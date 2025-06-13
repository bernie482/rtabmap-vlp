import api from '@/store/api';
import i18n from '@/i18n';

const BootSettingsStore = {
  namespaced: true,
  state: {
    // for BootOption part
    overrideEnabled: 'Disabled', // string, 'Disabled', 'Once', 'Continuous'
    overrideMode: 'Legacy', // string, 'Legacy', 'UEFI'
    bootSource: 'None',
    // for option selected items
    overrideEnabledOptions: ['Disabled', 'Once', 'Continuous'], // select options
    overrideModeOptions: ['Legacy', 'UEFI'],
    bootSourceOptions: [
      'None',
      'Pxe',
      'Hdd',
      'Cd',
      'BiosSetup',
      'Usb',
      'UefiShell',
      'UefiBootNext',
      'UefiTarget',
    ],
    tpmEnabled: null,
    // Use for UefiBootNext
    bootNextOptions: [], // ref to available boot order
    bootNext: null,
    // Use for UefiTarget
    uefiTarget: null,
    // for BootOrder part
    bootOrderOptionsAll: [], // all available list in name-value pair
  },
  getters: {
    // for BootOption part
    overrideEnabled: (state) => state.overrideEnabled,
    overrideMode: (state) => state.overrideMode,
    bootSource: (state) => state.bootSource,
    overrideEnabledOptions: (state) => state.overrideEnabledOptions,
    overrideModeOptions: (state) => state.overrideModeOptions,
    bootSourceOptions: (state) => state.bootSourceOptions,
    bootNext: (state) => state.bootNext,
    bootNextOptions: (state) => state.bootNextOptions,
    uefiTarget: (state) => state.uefiTarget,
    tpmEnabled: (state) => state.tpmEnabled,
    // for BootOrder part
    bootOrderOptionsAll: (state) => state.bootOrderOptionsAll,
  },
  mutations: {
    // for BootOption part
    setBootSourceOptions: (state, value) => {
      if (value && value.length > 0) state.bootSourceOptions = value;
    },
    setOverrideModeOptions: (state, value) => {
      if (value && value.length > 0) state.overrideModeOptions = value;
    },
    setBootSource: (state, value) => (state.bootSource = value),
    setOverrideEnabled: (state, value) => {
      state.overrideEnabled = value;
    },
    setOverrideMode: (state, value) => (state.overrideMode = value),
    setBootNextOptions: (state, value) => (state.bootNextOptions = value),
    setBootNext: (state, value) => (state.bootNext = value),
    setUefiTarget: (state, value) => (state.uefiTarget = value),
    setTpmPolicy: (state, value) => (state.tpmEnabled = value),
    // for BootOrder part
    setBootOrderOptionsAll: (state, value) =>
      (state.bootOrderOptionsAll = value.sort((a, b) => {
        return a.order - b.order;
      })),
  },
  actions: {
    async getBootSettings({ commit, dispatch }) {
      try {
        let {
          data: { Boot },
        } = await dispatch('getSystems');

        // for BootOption part
        commit('setOverrideEnabled', Boot.BootSourceOverrideEnabled);
        commit('setOverrideMode', Boot.BootSourceOverrideMode);
        commit('setBootSource', Boot.BootSourceOverrideTarget);
        commit(
          'setOverrideModeOptions',
          Boot['BootSourceOverrideMode@Redfish.AllowableValues'] ?? []
        );
        commit(
          'setBootSourceOptions',
          Boot['BootSourceOverrideTarget@Redfish.AllowableValues'] ?? []
        );
        // Use for UefiBootNext
        commit('setBootNextOptions', Boot.BootOrder);
        commit('setBootNext', Boot.BootNext ?? null);
        // Use for UefiTarget
        commit('setUefiTarget', Boot.UefiTargetBootSourceOverride ?? null);

        // for BootOrder part
        return await dispatch('getBootOrder', Boot);
      } catch (e) {
        console.error('failed to get setting');
        throw new Error(i18n.t('global.toast.errorGetSettings'), e);
      }
    },
    async getSystems() {
      return await api.get('/redfish/v1/Systems/system');
    },
    async saveBootOption({ state }) {
      //console.info('saveBootOption');
      const payload = {
        Boot: {
          BootSourceOverrideEnabled: state.overrideEnabled,
          BootSourceOverrideMode: state.overrideMode,
          BootSourceOverrideTarget: state.bootSource,
          BootNext: state.bootSource === 'UefiBootNext' ? state.bootNext : '',
          UefiTargetBootSourceOverride:
            state.bootSource === 'UefiTarget' ? state.uefiTarget : '',
        },
      };

      return api
        .patch('/redfish/v1/Systems/system', payload)
        .then(() => {
          return i18n.t('global.toast.successSaveSettings');
        })
        .catch((error) => {
          console.error(error);
          throw new Error(i18n.t('global.toast.errorSaveSettings'), error);
        });
    },
    /*async getTpmPolicy({ commit }) {
      // TODO: switch to Redfish when available
      return await api
        .get('/xyz/openbmc_project/control/host0/TPMEnable')
        .then(({ data: { data: { TPMEnable } } }) =>
          commit('setTpmPolicy', TPMEnable)
        )
        .catch((error) => console.log(error));
    },
    saveTpmPolicy({ commit, dispatch }, tpmEnabled) {
      // TODO: switch to Redfish when available
      const data = { data: tpmEnabled };
      return api
        .put(
          '/xyz/openbmc_project/control/host0/TPMEnable/attr/TPMEnable',
          data
        )
        .then((response) => {
          // If request success, commit the values
          commit('setTpmPolicy', tpmEnabled);
          return response;
        })
        .catch((error) => {
          console.log(error);
          // If request error, GET saved policy
          dispatch('getTpmPolicy');
          return error;
        });
    },*/
    /*async saveBootOption(
      { dispatch },
      { bootSource, overrideEnabled, tpmEnabled }
    ) {
      const promises = [];

      if (bootSource !== null || overrideEnabled !== null) {
        promises.push(
          dispatch('saveBootSettings', { bootSource, overrideEnabled })
        );
      }
      if (tpmEnabled !== null) {
        promises.push(dispatch('saveTpmPolicy', tpmEnabled));
      }

      return await api.all(promises).then(
        api.spread((...responses) => {
          let message = i18n.t(
            'pageServerPowerOperations.toast.successSaveSettings'
          );
          responses.forEach((response) => {
            if (response instanceof Error) {
              throw new Error(
                i18n.t('pageServerPowerOperations.toast.errorSaveSettings')
              );
            }
          });
          return message;
        })
      );
    },*/

    // for BootOrder part
    async getBootOrder({ commit }, Boot) {
      //console.info('getBootOrder');
      try {
        // get device data in boot option list
        const BootOptionsListUrl = Boot.BootOptions?.['@odata.id'];
        let BootOptionsReq = await api.get(BootOptionsListUrl);
        BootOptionsReq = BootOptionsReq.data?.Members.map((member) =>
          api.get(member['@odata.id'])
        );
        let results = await Promise.allSettled(BootOptionsReq);
        results = results
          .filter((result) => result.status === 'fulfilled')
          .map((result) => result.value.data);
        let bootOrderOptions = results.map((result) => {
          return {
            name: result.DisplayName,
            value: result.BootOptionReference,
            enabled: result.BootOptionEnabled,
            order: Boot.BootOrder.findIndex(
              (el) => el == result.BootOptionReference
            ),
          };
        });
        commit('setBootOrderOptionsAll', bootOrderOptions);
      } catch (e) {
        console.error(e);
        throw new Error('boot order error', e);
      }
    },
    async saveBootOrder({ state }) {
      let promises = [];
      // Set boot order.
      const payload = {
        Boot: {
          BootOrder: state.bootOrderOptionsAll.map((el) => el.value),
        },
      };
      let p = api.patch('/redfish/v1/Systems/system', payload);
      promises.push(p);
      // Set BootOptionEnabled enable/disable.
      state.bootOrderOptionsAll.forEach((el) => {
        let p = api.patch(
          `/redfish/v1/Systems/system/BootOptions/${el.value}`,
          {
            BootOptionEnabled: el.enabled,
          }
        );
        promises.push(p);
      });
      return Promise.all(promises)
        .then(() => {
          return i18n.t('global.toast.successSaveSettings');
        })
        .catch((error) => {
          console.error(error);
          throw new Error(i18n.t('global.toast.errorSaveSettings'), error);
        });
    },
  },
};

export default BootSettingsStore;
