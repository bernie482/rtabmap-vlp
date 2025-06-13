import api from '@/store/api';
import i18n from '@/i18n';

const PcieStore = {
  namespaced: true,
  state: {
    pcieComponents: [],
  },
  getters: {
    pcieComponents: (state) => state.pcieComponents,
  },
  mutations: {
    cleanComponents: (state) => (state.pcieComponents = []),
    setComponents: (state, components) => {
      state.pcieComponents = components.map((component) => {
        return {
          bdf: component.BDF,
          component: component.Component,
          device: component.Device,
          deviceId: component.DeviceId,
          vendor: component.Vendor,
          vendorId: component.VendorId,
          class: component.Class,
          subClass: component.SubClass,
          classCode: component.ClassCode,
          subsystemId: component.SubsystemId,
          subsystemVendorId: component.SubsystemVendorId,
        };
      });
    },
  },
  actions: {
    async getPcie({ dispatch, commit }) {
      try {
        const pcieFunctions = await dispatch('getPCIeFunctions');
        if (pcieFunctions.length > 0) commit('setComponents', pcieFunctions);
      } catch (e) {
        commit('cleanComponents');
        if (e.message !== 'NA') {
          // 'NA', Not available does not popup error messages.
          throw new Error(i18n.t('pageSystemComponent.toast.errorGetPcie'), e);
        }
      }
    },
    async getPCIeFunctions() {
      let systemUrl = await api.get('/redfish/v1/Systems/system');
      let pcieFucntionsUrl =
        systemUrl?.data?.Oem?.InsydePCIeFunctions?.PCIeFunctions?.['@odata.id'];
      if (pcieFucntionsUrl) {
        let resp = await api.get(pcieFucntionsUrl);
        return resp.data?.InsydePCIeInfo ?? [];
      } else {
        throw new Error('NA');
      }
    },
  },
};

export default PcieStore;
