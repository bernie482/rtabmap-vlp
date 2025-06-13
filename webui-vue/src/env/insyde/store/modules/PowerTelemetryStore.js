import api from '@/store/api';
//import i18n from '@/i18n';

const PowerTelemetryStore = {
  namespaced: true,
  state: {
    deviceOption: [],
    deviceInfo: [],
  },
  getters: {
    deviceOption: (state) => state.deviceOption,
    deviceInfo: (state) => state.deviceInfo,
  },
  mutations: {
    setOptions: (state, deviceOption) => (state.deviceOption = deviceOption),
    setDeviceInfo: (state, deviceInfo) => (state.deviceInfo = deviceInfo),
  },
  actions: {
    async setEnabled({ commit }, { value }) {
      commit('setEnabled', value);
    },
    async getAllDeviceOptions({ commit }) {
      //console.log('async getAllDeviceOptions');
      const data = {
        headers: { query: 'DEVICE_LIST' },
      };
      return await api
        .get('/cgi/nmpowertelemetry.cgi', data)
        .then((response) => {
          console.log(response.data);
          let deviceOption = [];
          response.data.device.forEach((device) => {
            let typeString = null;
            switch (device.type) {
              case 0:
                typeString = 'PSU';
                break;
              case 1:
                typeString = 'Memory VR';
                break;
              case 2:
                typeString = 'CPU VR';
                break;
              case 3:
                typeString = 'INA220';
                break;
              case 4:
                typeString = 'ADM1275';
                break;
              case 5:
                typeString = 'CPLD';
                break;
              case 6:
                typeString = 'XRP';
                break;
              case 7:
                typeString = 'INA3221';
                break;
              default:
                typeString = 'Undefined';
            }
            deviceOption.push({
              value: `${device.index}`,
              text: `Device ID: ${device.index} - ${typeString}`,
            });
            //console.log(deviceOption, JSON.stringify(deviceOption));
          });
          //TODO: how to alert if devicdOption.length == 0
          /*deviceOption = [];
          console.log(deviceOption.length);
          if (deviceOption.length == 0) {
            const message = i18n.t('pagePowerTelemetry.toast.meNotAvailable');
            throw new Error(message);
          }*/
          commit('setOptions', deviceOption);
        })
        .catch((error) => {
          console.log('nmpowertelemetry.cgi', error);
        });
    },
    async getDeviceInfoByIndex({ commit, dispatch }, index) {
      console.log(dispatch, index, typeof index);
      //console.log(data);
      //for fake data
      /*const data = {
        headers: { query: index.index },
      };*/
      //for real data
      const data = {
        index: index.index,
      };
      return await api
        //for fake data
        //.get('/cgi/nmpowertelemetry.cgi', data)
        //for real data
        .post('/cgi/nmpowertelemetry.cgi', data, {
          headers: {
            query: 'DEVICE_INFO',
          },
        })
        .then((response) => {
          //console.log(response.data);
          if (Object.prototype.hasOwnProperty.call(response.data, 'register')) {
            let ConvertEnergy = function (val) {
              return (val / 1000000000).toFixed(9);
            };
            const registerData = response.data.register.map((register) => {
              return {
                index: register.index,
                address: register.address,
                energy: ConvertEnergy(register.energy),
                timeStamp: register.timestamp,
              };
            });
            //console.log(registerData);
            commit('setDeviceInfo', registerData);
          }
        })
        .catch((error) => {
          console.log('getDeviceInfoByIndex()', error);
        });
    },
  },
};
export default PowerTelemetryStore;
