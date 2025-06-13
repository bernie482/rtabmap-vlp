import api from '@/store/api';
import i18n from '@/i18n';

const FruStore = {
  namespaced: true,
  state: {
    fruValues: [],
  },
  getters: {
    fruValues: (state) => state.fruValues,
  },
  mutations: {
    setAttributes: (state, attributes) => {
      // state.attributes = attributes;
      // work arround
      state.fruValues = attributes;
    },
  },
  actions: {
    async getChassisCollection() {
      return await api
        .get('/redfish/v1/Chassis')
        .then(({ data: { Members } }) =>
          Members.map((member) => member['@odata.id'])
        );
    },
    async getFru({ dispatch }) {
      const chassisUrls = await dispatch('getChassisCollection');
      if (!chassisUrls || chassisUrls.length == 0) {
        throw new Error('fru url is empty');
      }
      const fruUrls = chassisUrls.filter(
        (url) => url.includes('Baseboard') || url.includes('RackMount')
      );
      return await api
        .all(fruUrls.map((url) => api.get(url)))
        .then((fruInfos) => {
          return api.all(
            fruInfos.map((fruInfo) => {
              dispatch('getAttributes', {
                attributes: fruInfo.data?.Oem?.InsydeFRUData?.FRUInfo ?? [],
                settingsUri:
                  fruInfo.data?.['@Redfish.Settings']?.SettingsObject?.[
                    '@odata.id'
                  ],
              });
            })
          );
        })
        .catch((error) => {
          console.log(error);
          throw new Error(i18n.t('global.toast.errorGetSettings'), error);
        });
    },
    async getAttributes({ commit }, attrObj) {
      try {
        let attributes = attrObj.attributes;
        commit('setAttributes', attributes);
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorGetSettings'), error);
      }
    },
  },
};

export default FruStore;
