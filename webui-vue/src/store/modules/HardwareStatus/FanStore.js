import api from '@/store/api';

const FanStore = {
  namespaced: true,
  state: {
    fans: [],
  },
  getters: {
    fans: (state) => state.fans,
  },
  mutations: {
    setFanInfo: (state, data) => {
      let newFans = data.map((fan) => {
        const {
          IndicatorLED,
          Location,
          MemberId,
          Name,
          Reading,
          ReadingUnits,
          Status = {},
          PartNumber,
          SerialNumber,
        } = fan;
        return {
          id: MemberId,
          health: Status.Health,
          partNumber: PartNumber,
          serialNumber: SerialNumber,
          healthRollup: Status.HealthRollup,
          identifyLed: IndicatorLED,
          locationNumber: Location,
          name: Name,
          speed: Reading + ' ' + ReadingUnits,
          statusState: Status.State,
        };
      });
      state.fans.push(...newFans);
    },
  },
  actions: {
    async getChassisCollection() {
      return await api
        .get('/redfish/v1/Chassis')
        .then(({ data: { Members } }) =>
          Members.map((member) => member['@odata.id'])
        )
        .catch((error) => console.log(error));
    },
    async getAllFanInfo({ dispatch }) {
      const chassisUrls = await dispatch('getChassisCollection');
      if (!chassisUrls || chassisUrls.length == 0) return;
      return await api
        .all(chassisUrls.map((url) => api.get(url)))
        .then((chassisInfos) => {
          let thermalUrls = chassisInfos
            .filter((info) => info.data.Thermal)
            .map(({ data: { Thermal } }) => Thermal['@odata.id']);
          if (thermalUrls.length <= 0) return;
          return api.all(thermalUrls.map((url) => dispatch('getFanInfo', url)));
        })
        .catch((error) => console.log(error));
    },
    async getFanInfo({ commit }, fanUrl) {
      return await api
        .get(fanUrl)
        .then(({ data: { Fans = [] } }) => commit('setFanInfo', Fans))
        .catch((error) => console.log(error));
    },
  },
};

export default FanStore;
