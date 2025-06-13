import api from '@/store/api';
import i18n from '@/i18n';
let healthString = {
  red: i18n.t('pageDashboard.sensor.LANG_SENSOR_HEALTH_CRITICAL'),
  yellow: i18n.t('pageDashboard.sensor.LANG_SENSOR_HEALTH_WARNING'),
  green: i18n.t('pageDashboard.sensor.LANG_SENSOR_HEALTH_OK'),
  unknown: i18n.t('pageDashboard.sensor.LANG_SENSOR_HEALTH_UNKNOWN'),
};
const DashboardStore = {
  namespaced: true,
  state: {
    sysinfo: {},
    vminfo: [],
    chassis: {
      powerStatus: 'unknown',
    },
    timeout: 0,
    powerInfo: [],
    sensorTemperature: [],
    sensorVoltage: [],
    sensorFan: [],
    eventlog: [],
    datetimeinfo: {},
    nicInfo: [],
    vfp: {
      status: '',
      chassis: 0,
      power: 0,
    },
  },
  getters: {
    vminfo(state) {
      return state.vminfo;
    },
    vfpinfo(state) {
      return state.vfp;
    },
    sysinfo(state) {
      return state.sysinfo;
    },
    datetimeinfo(state) {
      return state.datetimeinfo;
    },
    nicinfo(state) {
      return state.nicInfo;
    },
    chassis(state) {
      return state.chassis;
    },
    powerinfo(state) {
      return state.powerInfo;
    },
    sensorTemperatureInfo(state) {
      return state.sensorTemperature;
    },
    sensorVoltageInfo(state) {
      return state.sensorVoltage;
    },
    sensorFanInfo(state) {
      return state.sensorFan;
    },
    eventlogInfo(state) {
      return state.eventlog;
    },
  },
  mutations: {
    setVMinfo(state, vminfo) {
      state.vminfo = vminfo;
    },
    setVFPinfo(state, vfp) {
      state.vfp = vfp;
    },
    setSysinfo(state, sysinfo) {
      state.sysinfo = sysinfo;
    },
    setDatetimeInfo(state, datetimeinfo) {
      state.datetimeinfo = datetimeinfo;
    },
    setNicInfo(state, nicInfo) {
      state.nicInfo = nicInfo;
    },
    setChassis(state, chassis) {
      state.chassis = chassis;
    },
    setPowerInfo(state, powerInfo) {
      state.powerInfo = powerInfo;
    },
    setSensorTemperatureInfo(state, sensorTemperatureInfo) {
      state.sensorTemperature = sensorTemperatureInfo;
    },
    setSensorVoltageInfo(state, sensorVoltageInfo) {
      state.sensorVoltage = sensorVoltageInfo;
    },
    setSensorFanInfo(state, sensorFanInfo) {
      state.sensorFan = sensorFanInfo;
    },
    setEventLogInfo(state, eventlogInfo) {
      state.eventlog = eventlogInfo;
    },
  },
  actions: {
    async getVfpVmInfo({ commit }) {
      //TODO, TBD:
      //in spf3.5 below info is response from web sock, so in here just using hard code fake data
      //{"LED_STATUS":"0:0","LED_POWER":"1","LED_UID":"0","VM1":"0:0:0:1","VM2":"0:0:0:1","VM3":"0:0:0:1",}
      let data = {
        LED_STATUS: '0:0',
        LED_POWER: '1',
        LED_UID: '2',
        VM1: '0:0:0:1',
        VM2: '0:0:0:1',
        VM3: '0:0:0:1',
      };
      try {
        //const dt = await api.get('/cgi/config_datetime.cgi', header);
        let obj;
        obj = mapStatus(data);
        commit('setVFPinfo', obj);
      } catch (error) {
        // throw new Error(
        //   i18n.t('pageDashboard.toast.errorGetVirtualFrontPanel')
        // , error);
        console.error(error);
      }
      function mapStatus(data) {
        //status
        let obj = {};
        if (Object.prototype.hasOwnProperty.call(data, 'LED_STATUS')) {
          let status = data['LED_STATUS'];
          if (status === '1:1') obj.status = 'amberblink';
          else if (status === '0:1') obj.status = 'greenblink';
          else obj.status = 'gray';
        }
        //chassis
        if (Object.prototype.hasOwnProperty.call(data, 'LED_UID')) {
          obj.chassis = parseInt(data['LED_UID']);
        }
        //power
        if (Object.prototype.hasOwnProperty.call(data, 'LED_POWER')) {
          obj.power = parseInt(data['LED_POWER']);
        }
        return obj;
      }
    },
    async getVMInfo({ commit }) {
      //TODO, TBD:
      //in spf3.5 below info is response from web sock, so in here just using hard code fake data
      //{"LED_STATUS":"0:0","LED_POWER":"1","LED_UID":"0","VM1":"0:0:0:1","VM2":"0:0:0:1","VM3":"0:0:0:1",}
      let data = {
        LED_STATUS: '0:0',
        LED_POWER: '1',
        LED_UID: '2',
        VM1: '0:0:0:1',
        VM2: '0:0:0:1',
        VM3: '0:0:0:1',
      };
      try {
        //const dt = await api.get('/cgi/config_datetime.cgi', header);
        let obj;
        obj = mapStatus(data);
        commit('setVMinfo', obj);
      } catch (error) {
        // throw new Error(
        //   i18n.t('pageDashboard.toast.errorGetVirtualFrontPanel')
        // , error);
        console.error(error);
      }
      function mapStatus(data) {
        //status
        let status = [];
        let res = new Array(data.length).fill(0); // assume all data only contain VM status
        for (let key in data) {
          let m = key.match(/^VM(\d+)$/);
          if (m) {
            let num = m[1];
            let device = {};
            [
              device.MediaType,
              device.ConnectedVia,
              device.Inserted,
              device.WriteProtected,
            ] = data[key].split(':');
            res[num - 1] = device;
          }
        }
        let result = []; // if data contain other (not VM) status
        res.forEach((item) => {
          if (item != 0) result.push(item);
        });
        result.forEach((device) => {
          if (device.Inserted == 0) {
            status.push(
              i18n.t('pageDashboard.vm.LANG_VM_FLOPPY_NO_DISK').replace('.', '')
            );
            return;
          } else if (device.Inserted == 2) {
            status.push(
              i18n
                .t('pageDashboard.vm.LANG_VM_MOUNTING_DEVICE')
                .replace('.', '')
            );
            return;
          }
          if (device.ConnectedVia != 1) {
            status.push(
              i18n.t('pageDashboard.vm.LANG_VM_FLOPPY_OTHERS').replace('.', '')
            );
            return;
          }
          if (device.MediaType == 1) {
            status.push(
              i18n.t('pageDashboard.vm.LANG_VM_FLOPPY_HAS_IMA').replace('.', '')
            );
          } else if (device.MediaType == 2) {
            status.push(
              i18n.t('pageDashboard.vm.LANG_VM_FLOPPY_HAS_IMG').replace('.', '')
            );
          } else if (device.MediaType == 3) {
            status.push(
              i18n.t('pageDashboard.vm.LANG_VM_FLOPPY_HAS_ISO').replace('.', '')
            );
          } else {
            status.push(
              i18n.t('pageDashboard.vm.LANG_VM_FLOPPY_UNKNOW').replace('.', '')
            );
          }
        });
        const label = [];
        for (let i = 0; i < result.length; i++) {
          label.push(
            `${i18n.t('pageDashboard.vm.LANG_VM_DEVICE')} ${(i + 1).toString()}`
          );
        }
        let obj = [];
        status.forEach((data, i) => {
          obj.push({
            label: label[i],
            status: data,
          });
        });
        return obj;
      }
    },
    async getDateTime({ commit }) {
      const header = {
        headers: { query: 'DATETIME' },
      };
      try {
        const dt = await api.get('/cgi/config_datetime.cgi', header);
        commit('setDatetimeInfo', dtFormat(dt.data.datetime));
      } catch (error) {
        throw new Error(i18n.t('pageDashboard.toast.errorGetDateTime'), error);
      }
      function dtFormat(data) {
        const weekday = [
          i18n.t('pageDashboard.datetime.LANG_MISC_NM_CONFIG_TIMERS_WEEKDAY7'),
          i18n.t('pageDashboard.datetime.LANG_MISC_NM_CONFIG_TIMERS_WEEKDAY1'),
          i18n.t('pageDashboard.datetime.LANG_MISC_NM_CONFIG_TIMERS_WEEKDAY2'),
          i18n.t('pageDashboard.datetime.LANG_MISC_NM_CONFIG_TIMERS_WEEKDAY3'),
          i18n.t('pageDashboard.datetime.LANG_MISC_NM_CONFIG_TIMERS_WEEKDAY4'),
          i18n.t('pageDashboard.datetime.LANG_MISC_NM_CONFIG_TIMERS_WEEKDAY5'),
          i18n.t('pageDashboard.datetime.LANG_MISC_NM_CONFIG_TIMERS_WEEKDAY6'),
        ];
        const zeroPadding = (num) => {
          return ('00' + num).slice(-2);
        };
        var dt = new Date(data.replace(/[+-]\d{2}:\d{2}/, ''));
        let obj = {};
        obj.year = dt.getFullYear();
        obj.month = dt.getMonth() + 1;
        obj.day = dt.getDate();
        obj.hour = zeroPadding(dt.getHours());
        obj.minute = zeroPadding(dt.getMinutes());
        obj.week = weekday[dt.getDay()];
        obj.tz = data.match(/[+-]\d{2}:\d{2}/)[0].replace(/^/, 'GMT');
        return obj;
      }
    },
    async getNetwork({ commit }) {
      const header = {
        headers: { query: 'NETWORK' },
      };
      let nicArr = null;
      try {
        const network = await api.get('/cgi/dashboard.cgi', header);
        nicArr = Network(network.data);
        commit('setNicInfo', nicArr);
      } catch (error) {
        throw new Error(i18n.t('pageDashboard.toast.errorGetNetwork'), error);
      }
      function Network(data) {
        //let nic = null;
        let label = i18n.t(
          'pageDashboard.network.LANG_CONF_LAN_CHANNEL_OPT_PREFIX'
        );
        let nic = [];
        let active = false;
        data.forEach((info, idx) => {
          if (idx == 0) active = true;
          else active = false;
          label = null;
          if (info.desc == 0)
            label = `${i18n.t(
              'pageDashboard.network.LANG_CONF_LAN_DEDICATED_NIC'
            )} (${info.channel})`;
          else if (info.desc == 1)
            label = `${i18n.t(
              'pageDashboard.network.LANG_CONF_LAN_SHARE_NIC'
            )} (${info.channel})`;
          else label = label + ` (${info.channel})`;
          // static & dynamic
          let ipv6StaticArr = [];
          let ipv6DynamicArr = [];
          ipv6StaticArr = info.ipv6
            .filter((data) => data.type === 'static' && data.addr !== '::')
            .map((info) => {
              return info.addr;
            });
          if (ipv6StaticArr.length <= 0) {
            ipv6StaticArr.push('::');
          }
          ipv6DynamicArr = info.ipv6
            .filter((data) => data.type === 'dynamic' && data.addr != '::')
            .map((info) => {
              return info.addr;
            });
          if (ipv6DynamicArr.length <= 0) {
            ipv6DynamicArr.push('::');
          }
          nic.push({
            channel: label,
            ipaddr: info.ip,
            gateway: info.gateway,
            subnet: info.subnet,
            ipv6_static_addr: ipv6StaticArr,
            ipv6_dynamic_addr: ipv6DynamicArr,
            mac: info.mac || '',
            active: active,
          });
        });
        return nic;
      }
    },
    async getSysteminfo({ commit }) {
      const header = {
        headers: { query: 'SYSTEM_INFORMATION' },
      };
      try {
        const sysinfo = await api.get('/cgi/dashboard.cgi', header);
        sysinfo.data.uptime = secondsToDhms(sysinfo.data.uptime);
        commit('setSysinfo', sysinfo.data);
      } catch (error) {
        throw new Error(i18n.t('pageSysinfo.toast.errorGetSysteminfo'), error);
      }
      function secondsToDhms(seconds) {
        seconds = Number(seconds);
        var d = Math.floor(seconds / (3600 * 24));
        var h = Math.floor((seconds % (3600 * 24)) / 3600);
        var m = Math.floor((seconds % 3600) / 60);
        var s = Math.floor((seconds % 3600) % 60);

        var dDisplay = d > 0 ? d + (d == 1 ? ' day, ' : ' days, ') : '';
        var hDisplay = h > 0 ? h + (h == 1 ? ' hour, ' : ' hours, ') : '';
        var mDisplay = m > 0 ? m + (m == 1 ? ' minute, ' : ' minutes, ') : '';
        var sDisplay = s > 0 ? s + (s == 1 ? ' second' : ' seconds') : '';
        return dDisplay + hDisplay + mDisplay + sDisplay;
      }
    },
    async getPowerStatistics({ commit }) {
      const header = {
        headers: { query: 'POWER_STATISTICS' },
      };
      try {
        const powerstat = await api.get('/cgi/dashboard.cgi', header);
        let ps = [];
        powerstat.data.forEach((pwvalue, idx) => {
          let sub = null;
          if (idx == 0) sub = i18n.t('pagePowerStatistics.entirePlatform');
          if (idx == 1) sub = i18n.t('pagePowerStatistics.cpu');
          if (idx == 2) sub = i18n.t('pagePowerStatistics.memory');
          ps.push({
            subsystem: sub,
            currentwatt: pwvalue,
          });
        });
        commit('setPowerInfo', ps);
      } catch (error) {
        throw new Error(i18n.t('pageDashboard.toast.errorGetPowerStat'), error);
      }
    },
    async getSensorTemperature({ commit }) {
      const header = {
        headers: { query: 'SENSOR_HEALTH' },
      };
      try {
        const temperature = await api.get(
          '/cgi/dashboard.cgi?targetSensorType=1',
          header
        );
        let data = [];
        temperature.data.forEach((info) => {
          data.push({
            healthy: healthString[info.stateColor],
            name: info.name,
            class: info.stateColor,
          });
        });
        commit('setSensorTemperatureInfo', data);
      } catch (error) {
        throw new Error(
          i18n.t('pageDashboard.toast.errorGetSensorTemperature'),
          error
        );
      }
    },
    async getSensorVoltage({ commit }) {
      const header = {
        headers: { query: 'SENSOR_HEALTH' },
      };
      try {
        const voltage = await api.get(
          '/cgi/dashboard.cgi?targetSensorType=2',
          header
        );
        let data = [];
        voltage.data.forEach((info) => {
          data.push({
            healthy: healthString[info.stateColor],
            name: info.name,
            class: info.stateColor,
          });
        });
        commit('setSensorVoltageInfo', data);
      } catch (error) {
        throw new Error(
          i18n.t('pageDashboard.toast.errorGetSensorVoltage'),
          error
        );
      }
    },
    async getSensorFan({ commit }) {
      const header = {
        headers: { query: 'SENSOR_HEALTH' },
      };
      try {
        const fan = await api.get(
          '/cgi/dashboard.cgi?targetSensorType=4',
          header
        );
        let data = [];
        fan.data.forEach((info) => {
          data.push({
            healthy: healthString[info.stateColor],
            name: info.name,
            class: info.stateColor,
          });
        });
        commit('setSensorFanInfo', data);
      } catch (error) {
        throw new Error(i18n.t('pageDashboard.toast.errorGetSensorFan'), error);
      }
    },
    async getEventLog({ dispatch, commit }) {
      try {
        const LogServices = await dispatch('getLogServices');
        const LogServicesMember = LogServices.Members.filter(function (obj) {
          return (
            obj['@odata.id'].includes('EventLog') ||
            obj['@odata.id'].includes('ALL')
          );
        });

        let nextURL = '/redfish/v1/Systems/system/LogServices/EventLog';
        if (LogServicesMember.length) {
          nextURL = LogServicesMember[0]['@odata.id'];
        }
        const url = `${nextURL}/Entries`;
        const eventLogs = await dispatch('getEventLogs', url);

        let data = [];
        eventLogs['Members'].forEach((entry) => {
          data.push({
            eventid: entry['EventId'] || entry['Id'],
            timestamp: getClientTimestamp(new Date(entry['Created'])),
            sensorname: entry['Name'],
            controller: getController(
              Object.prototype.hasOwnProperty.call(entry, 'GeneratorId')
                ? parseInt(entry['GeneratorId'], 16)
                : Object.prototype.hasOwnProperty.call(entry, 'Oem')
                ? entry['Oem']
                : 0x1
            ),
            severity: getSeverity(entry['Severity']),
            sensortype: getSensorType(entry),
            desc: getDescription(entry),
          });
        });
        commit('setEventLogInfo', data);
      } catch (error) {
        throw new Error(i18n.t('pageDashboard.toast.errorGetEvengLog'), error);
      }
      function getClientTimestamp(dt) {
        let dts = dt.toString().split(' ');
        return `${dts[0]} ${dts[1]} ${dts[2]} ${dts[4]} ${dts[3]}`;
      }
      function get_oem_entry(oemEntry) {
        if (Object.prototype.hasOwnProperty.call(oemEntry, 'InsydeLogEntry')) {
          var oemInsydeLogEntry = oemEntry['InsydeLogEntry'];
          let a = Object.prototype.hasOwnProperty.call(
            oemInsydeLogEntry,
            'ManufacturerId'
          );
          let b = Object.prototype.hasOwnProperty.call(
            oemInsydeLogEntry,
            'RecordType'
          );
          if (a && b) {
            return getManufacturer(
              parseInt(oemInsydeLogEntry['ManufacturerId'], 16),
              oemInsydeLogEntry['RecordType']
            );
          }
        }
        return 'OEM';
      }
      function getManufacturer(mid, rid) {
        if (mid == 0x0137) {
          // Microsoft
          return 'System Management Software';
        } else if (mid == 0x0157) {
          // Intel
          return 'System Management Software';
        } else if (mid == 0x1c4c) {
          // Quanta
          if (rid == 0xc0 || rid == 0xc1 || rid == 0xc2) return 'BIOS';
          else return 'BMC';
        }
        return 'OEM';
      }
      function getController(gid) {
        if (typeof gid == 'object') {
          return get_oem_entry(gid);
        }
        gid = gid & 0xff;
        if (gid & 1) {
          /** [1:7] System Software ID */
          if (gid >= 0x1 && gid <= 0x1f) {
            return 'BIOS';
          } else if (gid >= 0x21 && gid <= 0x3f) {
            return 'SMI Handler';
          } else if (gid >= 0x41 && gid <= 0x5f) {
            return 'System Management Software';
          } else if (gid >= 0x61 && gid <= 0x7f) {
            return 'OEM';
          } else if (gid >= 0x81 && gid <= 0x8d) {
            return 'Remote Console software 1-7';
          } else if (gid == 0x8f) {
            return 'Terminal Mode Remote Console software';
          } else {
            return 'reserved';
          }
        } else {
          /** [1:7] IPMB 7-bit slave address */
          if (gid == 0x20) {
            return 'BMC';
          } else if (gid == 0x2c) {
            return 'ME';
          } else {
            return `0x${gid.toString(16)}`;
          }
        }
      }
      function getSeverity(severity) {
        switch (severity) {
          case 'OK':
            return i18n.t('pageDashboard.eventlog.LANG_MODALERT_INFO');
          case 'Warning':
            return i18n.t('pageDashboard.eventlog.LANG_MODALERT_WARN');
          case 'Critical':
            return i18n.t('pageDashboard.eventlog.LANG_MODALERT_CRITICAL');
          default:
            return i18n.t('pageDashboard.eventlog.LANG_EVENT_UNKNOWN');
        }
      }
      function getSensorType(entry) {
        return entry['SensorType'] || 'N/A';
      }
      function getDescription(entry) {
        let message = entry['Message'] || 'N/A';
        return `${message}`;
      }
    },
    async getLogServices() {
      let url = '/redfish/v1/Systems/system/LogServices';
      try {
        let resp = await api.get(url);
        return resp.data;
      } catch (error) {
        throw new Error(i18n.t('pageSysinfo.toast.errorGetEvengLog'), error);
      }
    },
    async getEventLogs(context, url) {
      if (url?.includes('ALL')) {
        // Insyde style: /redfish/v1/Systems/system/LogServices/ALL/Entries
        try {
          let resp_url = await api.get(url, {
            headers: { PREFER: 'odata.maxpagesize=1' },
          });
          let entriesCount = Number(resp_url.data['Members@odata.count']);

          const entryNumber = 8;
          let url_skip = `${url}?$skip=${
            entriesCount < entryNumber ? 0 : entriesCount - entryNumber
          }`;
          let resp_skip = await api.get(url_skip, {
            headers: { PREFER: `odata.maxpagesize=${entryNumber}` },
          });
          return resp_skip.data;
        } catch (error) {
          throw new Error(i18n.t('pageSysinfo.toast.errorGetEvengLog'), error);
        }
      } else {
        // Obmc style: /redfish/v1/Systems/system/LogServices/EventLog/Entries
        try {
          let resp = await api.get(url);
          return resp.data;
        } catch (error) {
          throw new Error(i18n.t('pageSysinfo.toast.errorGetEvengLog'), error);
        }
      }
    },
    async getChassis({ commit }) {
      try {
        const chassis = await api.get('/cgi/chassis.cgi', {
          headers: {
            Query: 'CHASSIS_STATUS',
          },
        });
        commit('setChassis', chassis.data);
      } catch (error) {
        throw new Error(i18n.t('pageSysinfo.toast.errorGetChassis'), error);
      }
    },
  },
};
export default DashboardStore;
