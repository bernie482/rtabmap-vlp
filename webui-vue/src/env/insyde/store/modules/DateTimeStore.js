/* eslint-disable no-unused-vars */
import api from '@/store/api';
import i18n from '@/i18n';
const DEBUG = 'DateTime';
const timezoneOffset = [
  ['Midway', 'GMT-11:00', i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_MIDWAY')],
  [
    'Honolulu',
    'GMT-10:00',
    i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_HONOLULU'),
  ],
  [
    'Anchorage',
    'GMT-09:00',
    i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_ANCHORAGE'),
  ],
  [
    'Los Angeles',
    'GMT-08:00',
    i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_LOS_ANGELES'),
  ],
  ['Tijuana', 'GMT-08:00', i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_TIJUANA')],
  ['Phoenix', 'GMT-07:00', i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_PHOENIX')],
  [
    'Chihuahua',
    'GMT-07:00',
    i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_CHIHUAHUA'),
  ],
  ['Denver', 'GMT-07:00', i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_DENVER')],
  [
    'Costa Rica',
    'GMT-06:00',
    i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_COSTA_RICA'),
  ],
  ['Chicago', 'GMT-06:00', i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_CHICAGO')],
  [
    'Mexico City',
    'GMT-06:00',
    i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_MEXICO_CITY'),
  ],
  ['Regina', 'GMT-06:00', i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_REGINA')],
  ['Bogota', 'GMT-05:00', i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_BOGOTA')],
  [
    'New York',
    'GMT-05:00',
    i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_NEW_YORK'),
  ],
  ['Caracas', 'GMT-04:30', i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_CARACAS')],
  [
    'Barbados',
    'GMT-04:00',
    i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_BARBADOS'),
  ],
  ['Halifax', 'GMT-04:00', i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_HALIFAX')],
  ['Manaus', 'GMT-04:00', i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_MANAUS')],
  [
    'St Johns',
    'GMT-03:30',
    i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_ST_JOHNS'),
  ],
  [
    'Santiago',
    'GMT-03:00',
    i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_SANTIAGO'),
  ],
  ['Recife', 'GMT-03:00', i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_RECIFE')],
  [
    'Buenos Aires',
    'GMT-03:00',
    i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_BUENOS_AIRES'),
  ],
  ['Nuuk', 'GMT-03:00', i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_NUUK')],
  [
    'Montevideo',
    'GMT-03:00',
    i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_MONTEVIDEO'),
  ],
  [
    'Sao Paulo',
    'GMT-02:00',
    i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_SAO_PAULO'),
  ],
  [
    'South Georgia',
    'GMT-02:00',
    i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_SOUTH_GEORGIA'),
  ],
  ['Azores', 'GMT-01:00', i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_AZORES')],
  [
    'Cape Verde',
    'GMT-01:00',
    i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_CAPE_VERDE'),
  ],
  [
    'Casablanca',
    'GMT+00:00',
    i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_CASABLANCA'),
  ],
  ['London', 'GMT+00:00', i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_LONDON')],
  [
    'Amsterdam',
    'GMT+01:00',
    i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_AMSTERDAM'),
  ],
  [
    'Belgrade',
    'GMT+01:00',
    i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_BELGRADE'),
  ],
  [
    'Brussels',
    'GMT+01:00',
    i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_BRUSSELS'),
  ],
  ['Madrid', 'GMT+01:00', i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_MADRID')],
  [
    'Sarajevo',
    'GMT+01:00',
    i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_SARAJEVO'),
  ],
  [
    'Brazzaville',
    'GMT+01:00',
    i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_BRAZZAVILLE'),
  ],
  [
    'Windhoek',
    'GMT+02:00',
    i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_WINDHOEK'),
  ],
  ['Amman', 'GMT+02:00', i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_AMMAN')],
  ['Athens', 'GMT+02:00', i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_ATHENS')],
  [
    'Istanbul',
    'GMT+02:00',
    i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_ISTANBUL'),
  ],
  ['Beirut', 'GMT+02:00', i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_BEIRUT')],
  ['Cairo', 'GMT+02:00', i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_CAIRO')],
  [
    'Helsinki',
    'GMT+02:00',
    i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_HELSINKI'),
  ],
  [
    'Jerusalem',
    'GMT+02:00',
    i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_JERUSALEM'),
  ],
  ['Harare', 'GMT+02:00', i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_HARARE')],
  ['Minsk', 'GMT+03:00', i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_MINSK')],
  ['Baghdad', 'GMT+03:00', i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_BAGHDAD')],
  ['Moscow', 'GMT+03:00', i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_MOSCOW')],
  ['Kuwait', 'GMT+03:00', i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_KUWAIT')],
  ['Nairobi', 'GMT+03:00', i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_NAIROBI')],
  ['Baku', 'GMT+04:00', i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_BAKU')],
  ['Tbilisi', 'GMT+04:00', i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_TBILISI')],
  ['Yerevan', 'GMT+04:00', i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_YEREVAN')],
  ['Dubai', 'GMT+04:00', i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_DUBAI')],
  ['Kabul', 'GMT+04:30', i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_KABUL')],
  ['Karachi', 'GMT+05:00', i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_KARACHI')],
  ['Oral', 'GMT+05:00', i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_ORAL')],
  [
    'Yekaterinburg',
    'GMT+05:00',
    i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_YEKATERINBURG'),
  ],
  ['Kolkata', 'GMT+05:30', i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_KOLKATA')],
  ['Colombo', 'GMT+05:30', i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_COLOMBO')],
  [
    'Kathmandu',
    'GMT+05:45',
    i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_KATHMANDU'),
  ],
  ['Almaty', 'GMT+06:00', i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_ALMATY')],
  ['Rangoon', 'GMT+06:30', i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_RANGOON')],
  [
    'Krasnoyarsk',
    'GMT+07:00',
    i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_KRASNOYARSK'),
  ],
  ['Bangkok', 'GMT+07:00', i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_BANGKOK')],
  ['Jakarta', 'GMT+07:00', i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_JAKARTA')],
  [
    'Shanghai',
    'GMT+08:00',
    i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_SHANGHAI'),
  ],
  [
    'Hong Kong',
    'GMT+08:00',
    i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_HONG_KONG'),
  ],
  ['Irkutsk', 'GMT+08:00', i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_IRKUTSK')],
  [
    'Kuala Lumpur',
    'GMT+08:00',
    i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_KUALA_LUMPUR'),
  ],
  ['Perth', 'GMT+08:00', i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_PERTH')],
  ['Taipei', 'GMT+08:00', i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_TAIPEI')],
  ['Seoul', 'GMT+09:00', i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_SEOUL')],
  ['Tokyo', 'GMT+09:00', i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_TOKYO')],
  ['Yakutsk', 'GMT+09:00', i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_YAKUTSK')],
  ['Darwin', 'GMT+09:30', i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_DARWIN')],
  [
    'Brisbane',
    'GMT+10:00',
    i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_BRISBANE'),
  ],
  [
    'Vladivostok',
    'GMT+10:00',
    i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_VLADIVOSTOK'),
  ],
  ['Guam', 'GMT+10:00', i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_GUAM')],
  ['Magadan', 'GMT+10:00', i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_MAGADAN')],
  [
    'Adelaide',
    'GMT+10:30',
    i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_ADELAIDE'),
  ],
  ['Hobart', 'GMT+11:00', i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_HOBART')],
  ['Sydney', 'GMT+11:00', i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_SYDNEY')],
  ['Noumea', 'GMT+11:00', i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_NOUMEA')],
  ['Majuro', 'GMT+12:00', i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_MAJURO')],
  [
    'Auckland',
    'GMT+13:00',
    i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_AUCKLAND'),
  ],
  ['Fiji', 'GMT+13:00', i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_FIJI')],
  [
    'Tongatapu',
    'GMT+13:00',
    i18n.t('pageDateTimeInsyde.LANG_TIMEZONE_TONGATAPU'),
  ],
];

const DateTimeStore = {
  namespaced: true,
  state: {
    tzOptions: [],
    //deviceInfo: [],
    offset: 0,
    bmcTime: null,
    ntpenable: null,
    ntpServers: [],
    ntpStatus: null,
  },
  getters: {
    tzOptions: (state) => state.tzOptions,
    //deviceInfo: (state) => state.deviceInfo,
    offset: (state) => state.offset,
    bmcTime: (state) => state.bmcTime,
    ntpenable: (state) => state.ntpenable,
    ntpServers: (state) => state.ntpServers,
    ntpStatus: (state) => state.ntpStatus,
  },
  mutations: {
    setTimezoneOptions: (state, tzOptions) => (state.tzOptions = tzOptions),
    //setDeviceInfo: (state, deviceInfo) => (state.deviceInfo = deviceInfo),
    setOffset: (state, offset) => (state.offset = offset),
    setBmcTime: (state, bmcTime) => (state.bmcTime = bmcTime),
    setntpenable: (state, ntpenable) => (state.ntpenable = ntpenable),
    setNtpServers: (state, ntpServers) => (state.ntpServers = ntpServers),
    setNtpStatus: (state, ntpStatus) => (state.ntpStatus = ntpStatus),
  },
  actions: {
    async setEnabled({ commit }, { value }) {
      commit('setEnabled', value);
    },
    async getDatetime({ commit }) {
      initTimezone();
      const header = {
        headers: { query: 'DATETIME' },
      };
      return await api
        .get('/cgi/config_datetime.cgi', header)
        .then((response) => {
          updateDatetime(response.data.datetime);
          const bmcDateTime = response.data.datetime;
          const date = new Date(bmcDateTime);
          commit('setBmcTime', date);
          commit('setntpenable', response.data.ntp.enabled);
          let ntpservers = [];
          ntpservers.push(response.data.ntp.primaryNTPServer);
          ntpservers.push(response.data.ntp.secondaryNTPServer);
          commit('setNtpServers', ntpservers);
          if (response.data['ntp']['enabled']) {
            getNtpStatus();
          }
        })
        .catch((error) => {
          console.log(DEBUG, 'config_datetime.cgi get error:', error);
          throw new Error(
            i18n.t('pageDateTimeInsyde.toast.LANG_CONF_DATE_TIME_GETVAL'),
            error
          );
        });
      function initTimezone() {
        let offsets = aggregateSameOffset();
        let timezoneOptions = [];
        offsets.forEach((item, i) => {
          const [hints, gmt, country, offset] = item;
          timezoneOptions.push({
            value: `${offset}`,
            text: `${gmt}  |  ${country}`,
          });
        });
        commit('setTimezoneOptions', timezoneOptions);
      }
      function aggregateSameOffset() {
        // caculate GMT+08:00 to 480
        var offsets = timezoneOffset.map((item) => {
          const [, sign, hour, minute] = item[1].match(
            /GMT([+-])(\d{2}):(\d{2})/
          );
          item.push(
            parseInt(`${sign}${parseInt(hour) * 60 + parseInt(minute)}`)
          );
          return item;
        });

        // sort by last number (ex. 480)
        offsets = offsets.sort((a, b) => {
          return a[3] < b[3] ? -1 : 1;
        });

        for (let i = 0; i < offsets.length - 1; i++) {
          if (!Array.isArray(offsets[i]) || !Array.isArray(offsets[i + 1])) {
            continue;
          }
          if (offsets[i][3] == offsets[i + 1][3]) {
            offsets[i][0] += ` ${offsets[i + 1][0]}`;
            offsets[i][2] += `, ${offsets[i + 1][2]}`;
            offsets.splice(i + 1, 1);
            i--;
          }
        }
        return offsets;
      }
      function updateDatetime(datetime) {
        const [
          ,
          year,
          month,
          day,
          hour,
          minute,
          second,
          sign,
          offsetH,
          offsetM,
        ] = datetime.match(
          /(\d{3,})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})([+-])(\d{2}):(\d{2})/
        );
        commit(
          'setOffset',
          parseInt(`${sign}${parseInt(offsetH) * 60 + parseInt(offsetM)}`)
        );
        // updateYear(year);
        // $month.val(parseInt(month));
        // $day.val(parseInt(day));
        // $hour.val(parseInt(hour));
        // $minute.val(parseInt(minute));
        // $second.val(parseInt(second));
      }
      function getNtpStatus() {
        const header = {
          headers: { query: 'NTP_STATUS' },
        };
        return api
          .get('/cgi/config_datetime.cgi', header)
          .then((response) => {
            let data = response.data;
            let state = null;
            if (!data['enabled']) {
              return;
            }
            if (data['success']) {
              state = 'success';
              if (data['enabled']) {
                updateDatetime(data['datetime']);
              }
            }
            if (data['unreachable']) {
              state = 'unreachable';
            } else if (data['processing']) {
              state = 'processing';
              setTimeout(getNtpStatus, 3000);
            } else if (data['unknown_error']) {
              state = 'unknown_error';
            }
            commit('setNtpStatus', state);
          })
          .catch((error) => {
            setTimeout(getNtpStatus, 3000);
            throw new Error(
              i18n.t('pageDateTimeInsyde.toast.LANG_CONF_DATE_TIME_GETVAL'),
              error
            );
          });
      }
    },
    async syncFromRtc({ commit }) {
      const header = {
        headers: { query: 'SYNC_FROM_RTC' },
      };
      return await api
        .post('/cgi/config_datetime.cgi', { query: 'SYNC_FROM_RTC' }, header)
        .then((response) =>
          i18n.t('pageDateTimeInsyde.toast.LANG_CONF_RTC_SUCC')
        )
        .catch((error) => {
          console.log(
            DEBUG,
            'config_datetime.cgi post SYNC_FROM_RTC error:',
            error
          );
          throw new Error(
            i18n.t('pageDateTimeInsyde.toast.LANG_CONF_RTC_FAIL'),
            error
          );
        });
    },
    async updateDateTime({ state }, dateTimeForm) {
      //console.log(DEBUG, 'updateDateTime', JSON.stringify(dateTimeForm));
      const header = {
        headers: { query: 'DATETIME' },
      };
      let url = null;
      url = '/cgi/config_datetime.cgi';
      return await api
        .post(url, dateTimeForm, header)
        .then((response) => {
          return i18n.t('pageDateTimeInsyde.toast.LANG_CONF_DATE_TIME_SUCC');
        })
        .catch((error) => {
          console.log(error);
          throw new Error(
            i18n.t('pageDateTimeInsyde.toast.LANG_CONF_DATE_TIME_FAIL'),
            error
          );
        });
    },
  },
};
export default DateTimeStore;
