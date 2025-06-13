import i18n from '@/i18n';
var recordChartData = {};
const DELTA_Y = 30;
var err_code = {};
err_code['0x0009'] = i18n.t('sensoreadings.LANG_SENSOR_STATUS_DRIVER_ABORT');
err_code['0x000a'] = i18n.t('sensoreadings.LANG_SENSOR_STATUS_IOCTL_INVALID');
err_code['0x000b'] = i18n.t(
  'sensoreadings.LANG_SENSOR_STATUS_DEVICE_UNAVAILABLE'
);
err_code['0x0011'] = i18n.t('sensoreadings.LANG_SENSOR_STATUS_INVALID_PARAM');
err_code['0x0400'] = i18n.t('sensoreadings.LANG_SENSOR_STATUS_I2CS_BUS_ARB');
err_code['0x0402'] = i18n.t('sensoreadings.LANG_SENSOR_STATUS_I2CS_TX_NAK');
err_code['0x0403'] = i18n.t('sensoreadings.LANG_SENSOR_STATUS_I2CS_TIMEOUT');
err_code['0x0404'] = i18n.t('sensoreadings.LANG_SENSOR_STATUS_I2CS_ILLEGAL');
err_code['0x0405'] = i18n.t('sensoreadings.LANG_SENSOR_STATUS_I2CS_ERROR');
err_code['0x040a'] = i18n.t('sensoreadings.LANG_SENSOR_STATUS_I2CS_BUS_HUNG');
err_code['0x041a'] = i18n.t('sensoreadings.LANG_SENSOR_STATUS_I2CS_SLAVE_BUSY');
err_code['0x041b'] = i18n.t(
  'sensoreadings.LANG_SENSOR_STATUS_PECI_NOT_SUPPORT'
);
err_code['0x041c'] = i18n.t('sensoreadings.LANG_SENSOR_STATUS_PECI_TIMEOUT');
err_code['0x041d'] = i18n.t('sensoreadings.LANG_SENSOR_STATUS_PECI_NOVALIDRSP');
err_code['0x0c00'] = i18n.t('sensoreadings.LANG_SENSOR_STATUS_NOT_FOUND');
err_code['0x0c03'] = i18n.t('sensoreadings.LANG_SENSOR_STATUS_NOT_INITIALIZED');
err_code['0x0c04'] = i18n.t('sensoreadings.LANG_SENSOR_STATUS_SCAN_DISABLED');
err_code['0x0c0b'] = i18n.t('sensoreadings.LANG_SENSOR_STATUS_FAILED_INIT');
err_code['0x0c0c'] = i18n.t(
  'sensoreadings.LANG_SENSOR_STATUS_SEI_RDR_NOT_FOUND'
);
err_code['0x0c0d'] = i18n.t(
  'sensoreadings.LANG_SENSOR_STATUS_SEI_RDR_NOT_FOUND'
);
err_code['0x0c0f'] = i18n.t(
  'sensoreadings.LANG_SENSOR_STATUS_SEI_RDR_NOT_FOUND'
);
err_code['0x1805'] = i18n.t(
  'sensoreadings.LANG_SENSOR_STATUS_UNAVAILABLE_ERROR'
);
err_code['0x1806'] = i18n.t(
  'sensoreadings.LANG_SENSOR_STATUS_WRONG_SYSTEM_STATE'
);

export const sensorsValuesParser = (values, category) => {
  let SensorCategory = [
    'SENSOR_INFO_BMC',
    'SENSOR_INFO_SATELLITE',
    'SENSOR_INFO_ME',
  ];
  let data = values[SensorCategory[parseInt(category)]];
  let message = '';
  let bmc = null;
  if (data['RESULT'] === 'FAIL') {
    message = this.$t('message.LANG_NULLXML_SESSION_TIMEOUT');
  } else if (data['RESULT'] === 'EMPTY') {
    message = this.$t('message.LANG_SENSOR_REPOSITORY_EMPTY');
  } else {
    bmc = getSensorOwnerBmc(data ?? null);
  }

  function getSensorOwnerBmc(data) {
    if (data == null) return;
    let SensorType = [];
    let SensorTypeOEM = [];
    let SensorRecords = [];

    data.forEach((sensor) => {
      let record = {
        name: sensor.NAME ?? 'N/A',
        status: '',
        currentValue: 0,
        Low_NR: 'N/A',
        Low_CT: 'N/A',
        Low_NC: 'N/A',
        High_NC: 'N/A',
        High_CT: 'N/A',
        High_NR: 'N/A',
        units: '',
        SensorType: sensor.STYPE ? parseInt(sensor.STYPE, 16) : 'N/A',
      };

      if (SensorType.indexOf(sensor.STYPE) == -1) {
        if (
          0xc0 <= parseInt(sensor.STYPE, 16) &&
          parseInt(sensor.STYPE, 16) <= 0xff
        ) {
          if (SensorTypeOEM.indexOf('c0') == -1) {
            SensorTypeOEM.push('c0');
          }
        } else {
          SensorType.push(sensor.STYPE);
        }
      }
      if (!(parseInt(sensor.OPTION, 16) & 0x40) || sensor.RAW_READING == null) {
        if (sensor.ERR_READING != 0 && sensor.ERR_READING != null) {
          let err_reading =
            err_code[sensor.ERR_READING] ??
            i18n.t('sensoreadings.LANG_SENSOR_STATUS_NOT_AVAILABLE');
          record = {
            ...record,
            Healthy: `<div class="sensor-state unknown" style="background: #f5f5f0;text-align: center;"><label>${i18n.t(
              'sensoreadings.LANG_SENSOR_HEALTH_UNKNOWN'
            )}</label></div>`,
            Status: err_reading,
            currentValue: parseInt(sensor.SCANNING_DISABLED, 16)
              ? i18n.t('sensoreadings.LANG_SENSOR_READING_DISABLED')
              : i18n.t('sensoreadings.LANG_SENSOR_READING_NA'),
          };
        } else {
          record = {
            ...record,
            Healthy: `<div class="sensor-state white" style="background: #f5f5f0;text-align: center;">
            <label>${i18n.t('sensoreadings.LANG_SENSOR_HEALTH_UNKNOWN')}</div>`,
            Status: i18n.t('sensoreadings.LANG_SENSOR_STATUS_NOT_AVAILABLE'),
            currentValue: parseInt(sensor.SCANNING_DISABLED, 16)
              ? i18n.t('sensoreadings.LANG_SENSOR_READING_DISABLED')
              : i18n.t('sensoreadings.LANG_SENSOR_READING_NA'),
          };
        }
      } else {
        let proc =
          parseInt(sensor.ERTYPE, 16) == 0x01
            ? ProcThresholdSensor(sensor)
            : ProcDiscreteSensor(sensor);
        record = {
          ...record,
          ...proc,
        };
      }

      SensorRecords.push(record);
    });
    return {
      SensorRecords,
      SensorType,
      SensorTypeOEM,
    };

    function getHealthyState(data) {
      let color = 'background: #f5f5f0;';
      let divClass = 'unknown',
        text = 'sensoreadings.LANG_SENSOR_HEALTH_UNKNOWN';
      data = data.replace(/^bgcolor=/, '');
      switch (data) {
        case 'green':
          color = 'background: #24bd62;';
          divClass = 'normal';
          text = 'sensoreadings.LANG_SENSOR_HEALTH_OK';
          break;
        case 'yellow':
          color = 'background: #fff100;';
          divClass = 'warning';
          text = 'sensoreadings.LANG_SENSOR_HEALTH_WARNING';
          break;
        case 'red':
          color = 'background: #dc2929;';
          divClass = 'critical';
          text = 'sensoreadings.LANG_SENSOR_HEALTH_CRITICAL';
          break;
      }
      return `
        <div class="sensor-state ${divClass}" style="${color}text-align: center;">
          <label>${i18n.t(text)}</label>
        </div>
      `;
    }
    function ProcDiscreteSensor(sensor) {
      let ERTYPE = parseInt(sensor.ERTYPE, 16);
      if (
        (0x02 <= ERTYPE && ERTYPE <= 0x0c) ||
        ERTYPE == 0x6f ||
        (0x70 <= ERTYPE && ERTYPE <= 0x7f)
      ) {
        let HumanReading = sensor.HUMAN_READING;
        HumanReading = HumanReading != null ? '0x' + HumanReading : null;
        /*if(sensor.STYPE === "05"){
          //let SensorReading = sensor.RAW_READING.substr(0, 2);
          let $btn_ChassisIntrusion = $('#btn_ChassisIntrusion');
          if(SensorReading === "00"){
            $btn_ChassisIntrusion.css("visibility", 'hidden');
          } else {
            $btn_ChassisIntrusion.prop("disabled", false);
          }
        }*/
        return {
          Healthy: getHealthyState('bgcolor=' + sensor.STATE_COLOR),
          Status: sensor.STATUS,
          currentValue: HumanReading,
        };
      } else {
        return {
          Healthy: getHealthyState('bgcolor=white'),
          Status: i18n.t('sensoreadings.LANG_SENSOR_STATUS_NOT_SUPPORTED'),
          currentValue: i18n.t('sensoreadings.LANG_SENSOR_READING_NA'),
        };
      }
    }
    function ProcThresholdSensor(sensor) {
      let Unit = '';
      switch (parseInt(sensor.UNIT, 16)) {
        case 0x00: //add new type 00
          Unit = i18n.t('sensoreadings.LANG_SENSOR_UNIT00');
          break;
        case 0x01:
          Unit = i18n.t('sensoreadings.LANG_SENSOR_UNIT01');
          break;
        case 0x02:
          Unit = i18n.t('sensoreadings.LANG_SENSOR_UNIT02');
          break;
        case 0x03:
          Unit = i18n.t('sensoreadings.LANG_SENSOR_UNIT03');
          break;
        case 0x04:
          Unit = i18n.t('sensoreadings.LANG_SENSOR_UNIT04');
          break;
        case 0x05:
          Unit = i18n.t('sensoreadings.LANG_SENSOR_UNIT05');
          break;
        case 0x06:
          Unit = i18n.t('sensoreadings.LANG_SENSOR_UNIT06');
          break;
        case 0x07:
          Unit = i18n.t('sensoreadings.LANG_SENSOR_UNIT07');
          break;
        case 0x11:
          Unit = i18n.t('sensoreadings.LANG_SENSOR_UNIT11');
          break;
        case 0x12:
          Unit = i18n.t('sensoreadings.LANG_SENSOR_UNIT12');
          break;
        case 0x13:
          Unit = i18n.t('sensoreadings.LANG_SENSOR_UNIT13');
          break;
        default:
          break;
      }
      let sensorName = sensor.NAME.split(' ')
        .join('_')
        .replace(/[%|+.]/g, '');
      if (recordChartData[sensorName] == null) {
        recordChartData[sensorName] = {
          READING: new Array(),
          TIMESTAMP: new Array(),
          UNIT: Unit,
          LNR: sensor.LNR,
          LCT: sensor.LC,
          LNC: sensor.LNC,
          HNC: sensor.UNC,
          HCT: sensor.UC,
          HNR: sensor.UNR,
        };
      }
      recordChartData[sensorName].TIMESTAMP.push(new Date().getTime()); // created timestamp
      if (
        parseInt(sensor.OPTION, 16) != 0x00 &&
        sensor.STYPE === '04' &&
        sensor.RAW_READING === '00'
      ) {
        recordChartData[sensorName].READING.push('0');
      } else {
        recordChartData[sensorName].READING.push(sensor.HUMAN_READING);
      }
      if (recordChartData[sensorName].READING.length > DELTA_Y) {
        // remove head value
        recordChartData[sensorName].READING.shift();
        recordChartData[sensorName].TIMESTAMP.shift();
      }
      return {
        Healthy: getHealthyState('bgcolor=' + sensor.STATE_COLOR),
        Status: sensor.STATUS,
        currentValue: `<div id='d3_div_${sensorName}' class='line-chart'>
                        <span>${
                          parseInt(sensor.OPTION, 16) != 0x00 &&
                          sensor.STYPE === '04' &&
                          sensor.RAW_READING === '00'
                            ? '0 ' + Unit
                            : sensor.HUMAN_READING + ' ' + Unit
                        }</span></div>`,
        Low_NR: sensor.LNR,
        Low_CT: sensor.LC,
        Low_NC: sensor.LNC,
        High_NC: sensor.UNC,
        High_CT: sensor.UC,
        High_NR: sensor.UNR,
      };
    }
  }
  return {
    data,
    message,
    bmc,
    recordChartData,
  };
};
