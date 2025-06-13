import api from '@/store/api';
import i18n from '@/i18n';

const InsydeMemoryStore = {
  namespaced: true,
  state: {
    dimmsmetrics: [],
  },
  getters: {
    dimmsmetrics: (state) => state.dimmsmetrics,
  },
  mutations: {
    setMemoryInfo: (state, { dimminfos, metrics }) => {
      //console.log(dimminfos);
      //console.log(metrics);
      state.dimmsmetrics = dimminfos.map(function (data, index) {
        //console.log({ key: index, value: data });
        console.log(metrics[index]);
        //momory Location
        let location = data.Location.PartLocation.ServiceLabel;
        let memoryLocation = location !== undefined ? location : 'Unknown';
        //speed
        let speed;
        let allowspeedsmhzProperty = Object.prototype.hasOwnProperty.call(
          data,
          'AllowedSpeedsMHz'
        );
        if (allowspeedsmhzProperty && data['AllowedSpeedsMHz'].length > 0) {
          speed = data['AllowedSpeedsMHz'][0];
          for (let i = 1; i < data['AllowedSpeedsMHz'].length; i++) {
            speed += '/' + data['AllowedSpeedsMHz'][i];
          }
          speed += ' MHz';
        }
        let oemProperty = Object.prototype.hasOwnProperty.call(data, 'Oem');
        let Voltage, assetTag;
        if (oemProperty) {
          let oem = data['Oem'];
          //voltage
          if (Object.prototype.hasOwnProperty.call(oem, 'Intel_RackScale')) {
            var jsonOem = oem['Intel_RackScale'];
            if (Object.prototype.hasOwnProperty.call(jsonOem, 'VoltageVolt')) {
              Voltage = jsonOem['VoltageVolt'] + ' V';
            }
          }
          //asset Tag
          if (Object.prototype.hasOwnProperty.call(oem, 'InsydeMemory')) {
            jsonOem = oem['InsydeMemory'];
            if (Object.prototype.hasOwnProperty.call(jsonOem, 'AssetTag')) {
              assetTag = jsonOem['AssetTag'];
            }
          }
          let dcpmm;
          var identifyinfoProp = null;
          var characteristicsProp = null;
          var securityCapabilitiesProp = null;
          if (Object.prototype.hasOwnProperty.call(oem, 'InsydeDCPMM')) {
            dcpmm = oem['InsydeDCPMM'];
            //detail.IdentifyInfo
            if (Object.prototype.hasOwnProperty.call(dcpmm, 'IdentifyInfo')) {
              identifyinfoProp = dcpmm['IdentifyInfo'];
            }
            //detail.Characteristics
            if (
              Object.prototype.hasOwnProperty.call(dcpmm, 'Characteristics')
            ) {
              characteristicsProp = dcpmm['Characteristics'];
            }
            //SecurityCapabilities
            if (Object.prototype.hasOwnProperty.call(dcpmm, 'BPS')) {
              let bsp = dcpmm['BPS'];
              if (
                Object.prototype.hasOwnProperty.call(
                  bsp,
                  'SecurityCapabilities'
                )
              ) {
                securityCapabilitiesProp = bsp['SecurityCapabilities'];
              }
            }
          }
          //console.log('identifyinfoProp:', identifyinfoProp);
          //console.log('characteristicsProp:', characteristicsProp);
          //console.log('securityCapabilitiesProp:', securityCapabilitiesProp);
          console.log(securityCapabilitiesProp);
          //hadle SecurityAction, {PassphraseCapable: true, SecurityStates: "Passphraselimit"}

          //check Actions
          let actionsUrl = null;
          if (Object.prototype.hasOwnProperty.call(data, 'Actions')) {
            //TODO: Insyde is Actions.Oem
            actionsUrl = data.Actions.Oem.Quanta || data.Actions.Oem;
            console.log(actionsUrl);
          }
          const actionMapping = {
            0: '^#[^.]+.SetMasterPassphrase$',
            1: '^#[^.]+.SetPassphrase$',
            2: '^#[^.]+.SecureErase$',
            3: '^#[^.]+.DisablePassphrase$',
            4: '^#[^.]+.UnlockUnit$',
            5: '^#[^.]+.FreezeLock$',
          };
          console.log(actionMapping);
          var options = [];
          if (securityCapabilitiesProp) {
            let securityStatus = securityCapabilitiesProp.SecurityStates;
            let securityLevel = {
              // Status: [statusLevel, defaultAction]
              Disabled: [0, 0],
              Enabled: [1, 1],
              Locked: [2, 4],
              Passphraselimit: [3, -1],
              Frozen: [3, -1],
            };
            let currentLevel = securityLevel[securityStatus][0];
            console.log('currentLevel', currentLevel);
            let allAction = {
              SetMasterPassphrase: {
                label: 'Set Master Passphrase',
                value: 0,
                limitLevel: 0,
              },
              SetPassphrase: {
                label: 'Set Passphrase',
                value: 1,
                limitLevel: 1,
              },
              SecureErase: {
                label: 'Secure Erase',
                value: 2,
                limitLevel: 1,
              },
              DisablePassphrase: {
                label: 'Disable Passphrase',
                value: 3,
                onlyLevel: 1,
              },
              UnlockUnit: {
                label: 'Unlock Unit',
                value: 4,
                onlyLevel: 2,
              },
              FreezeLock: {
                label: 'Freeze Lock',
                value: 5,
                onlyLevel: 1,
              },
            };
            console.log(allAction);
            options = Object.keys(allAction)
              .filter((actionName) => {
                let action = allAction[actionName];
                console.log(action);
                //if (action.hasOwnProperty('limitLevel'))
                if (Object.prototype.hasOwnProperty.call(action, 'limitLevel'))
                  return currentLevel <= action.limitLevel;
                if (Object.prototype.hasOwnProperty.call(action, 'onlyLevel'))
                  return currentLevel == action.onlyLevel;
                return false;
              })
              .map((actionName) => {
                let action = allAction[actionName];
                console.log(action);
                if (
                  Object.prototype.hasOwnProperty.call(
                    actionMapping,
                    action.value
                  )
                ) {
                  let actualAction = Object.keys(actionsUrl).find((a) =>
                    RegExp(actionMapping[action.value]).test(a)
                  );
                  console.log(actualAction);
                  console.log(actionsUrl[actualAction].target);
                  if (actualAction)
                    return [
                      action.label,
                      action.value,
                      actionsUrl[actualAction].target,
                    ];
                }
              });
            //if options == empty, security action no show
            console.log(options, options.length);
          }
        }
        const {
          //Status = {},
          CapacityMiB,
          MemoryType,
          MemoryDeviceType,
          Manufacturer,
          SerialNumber,
          PartNumber,
          //Metrics,
        } = data;
        return {
          slotnumber: memoryLocation,
          size: CapacityMiB + ' MB',
          type: MemoryType == 'IntelOptane' ? 'DCPMM' : MemoryDeviceType,
          speed: speed,
          voltage: Voltage,
          manufacturer: Manufacturer,
          assettag: assetTag,
          serialNumber: SerialNumber,
          partNumber: PartNumber,
          identifyinfo: identifyinfoProp,
          characteristics: characteristicsProp,
          metricsinfo: metrics[index] || null,
          securityCapabilities: securityCapabilitiesProp,
          securityOptions: options,
        };
      });
      console.log(state.dimmsmetrics);
    },
  },
  actions: {
    async getDimmMetrics({ dispatch, commit }) {
      try {
        const memorys = await dispatch('getMemory');
        const dimminfos = await dispatch('getDimmInfo', memorys);
        //console.log(dimminfos);
        const metrics = await dispatch('getMetricsInfo', dimminfos);
        //console.log(metrics);
        commit('setMemoryInfo', { dimminfos, metrics });
      } catch (error) {
        console.error(error);
        throw new Error(i18n.t('pageSata.toast.errorGetMemoryMetrics'), error);
      }
    },
    async getMemory() {
      let memoryUrl = '/redfish/v1/Systems/system/Memory';
      if (memoryUrl) {
        let resp = await api.get(memoryUrl);
        //console.log(resp.data);
        return resp.data;
      } else {
        throw new Error('Memory url is empty');
      }
    },
    async getDimmInfo(context, memorys) {
      console.log(memorys);
      const dimmlist = memorys.Members.map((urlObj) => urlObj['@odata.id'])
        //.filter((url) => {
        //  console.log(url);
        //})
        .map((url) => api.get(url));
      let dimmInfo = await Promise.allSettled(dimmlist);
      dimmInfo = dimmInfo
        .filter((resp) => resp.status === 'fulfilled')
        .map((resp) => resp.value.data);
      if (dimmInfo.length > 0) {
        //console.log(dimmInfo);
        return dimmInfo;
      } else throw new Error('dimmInfo is empty');
    },
    async getMetricsInfo(context, dimminfo) {
      const metrics = dimminfo
        .map((item) => item.Metrics['@odata.id'])
        .map((url) => api.get(url));
      //console.log(metrics);
      let metricsInfo = await Promise.allSettled(metrics);
      metricsInfo = metricsInfo
        .filter((resp) => resp.status === 'fulfilled')
        .map((resp) => resp.value.data);
      if (metricsInfo.length > 0) {
        //console.log(metricsInfo);
        return metricsInfo;
      } else throw new Error('metricsInfo is empty');
    },
    async updateSecurityAction({ dispatch }, { action, Passphrase }) {
      console.log(dispatch);
      console.log(action);
      console.log(Passphrase);
      const data = {
        Passphrase: Passphrase,
      };
      console.log(data, typeof data);
      return await api
        //.get(action, data)
        .post(action, data)
        .then(() => i18n.t('pageDimm.toast.successSecurityActionUpdate'))
        .catch((error) => {
          console.log(error);
          const message = i18n.t('pageDimm.toast.errorSecurityActionUpdate');
          throw new Error(message, error);
        });
    },
    async updateSecurityActionwith3param(
      { dispatch },
      { action, CurrentPassphrase, NewPassphrase, ConfirmPassphrase }
    ) {
      console.log(dispatch);
      console.log(action);
      const data = {
        CurrentPassphrase: CurrentPassphrase,
        NewPassphrase: NewPassphrase,
        ConfirmPassphrase: ConfirmPassphrase,
      };
      console.log(data);
      return await api
        .post(action, data)
        .then(() => i18n.t('pageDimm.toast.successSecurityActionUpdate'))
        .catch((error) => {
          console.log(error);
          const message = i18n.t('pageDimm.toast.errorSecurityActionUpdate');
          throw new Error(message, error);
        });
    },
  },
};

export default InsydeMemoryStore;
