var sensorType = [];
sensorType['0'] = 'All Sensors';
sensorType['1'] = 'Temperature Sensors';
sensorType['2'] = 'Voltage Sensors';
sensorType['3'] = 'Current Sensors';
sensorType['4'] = 'Fan Sensors';
sensorType['5'] = 'Physical Security';
sensorType['6'] = 'Platform Security Violation Attempt';
sensorType['7'] = 'Processor';
sensorType['8'] = 'Power Supply';
sensorType['9'] = 'Power Unit';
sensorType['A'] = 'Cooling Device';
sensorType['B'] = 'Other Units-based Sensor';
sensorType['C'] = 'Memory';
sensorType['D'] = 'Drive Slot';
sensorType['E'] = 'POST Memory Resize';
sensorType['F'] = 'System Firmware Progress';
sensorType['10'] = 'Event Logging Disabled';
sensorType['11'] = 'Watchdog 1';
sensorType['12'] = 'System Event';
sensorType['13'] = 'Critical Interrupt';
sensorType['14'] = 'Button / Switch';
sensorType['15'] = 'Module / Board';
sensorType['16'] = 'Microcontroller / Coprocessor';
sensorType['17'] = 'Add-in Card';
sensorType['18'] = 'Chassis';
sensorType['19'] = 'Chipset';
sensorType['1A'] = 'Other FRU';
sensorType['1B'] = 'Cable / Interconnect';
sensorType['1C'] = 'Terminator';
sensorType['1D'] = 'System Boot Initiated';
sensorType['1E'] = 'Boot Error';
sensorType['1F'] = 'OS Boot';
sensorType['20'] = 'OS Critical Stop';
sensorType['21'] = 'Slot / Connector';
sensorType['22'] = 'System ACPI Power State';
sensorType['23'] = 'Watchdog 2';
sensorType['24'] = 'Platform Alert';
sensorType['25'] = 'Entity Presence';
sensorType['26'] = 'Monitor ASIC / IC';
sensorType['27'] = 'LAN';
sensorType['28'] = 'Management Subsystem Health';
sensorType['29'] = 'Battery';
sensorType['2A'] = 'Session Audit';
sensorType['2B'] = 'Version Change';
sensorType['2C'] = 'FRU State';
sensorType['C0'] = 'OEM Sensors';

export const getERTypeOffsetLengthParser = (values) => {
  let ERType = values;
  let ERTypeOffsetLen = [3, 2, 2, 2, 2, 9, 2, 2, 9, 8, 4];
  let len = ERTypeOffsetLen[ERType - 2];
  return { len };
};

export const getSensorSpecificOffsetLengthParser = (values) => {
  let sensorType = values;
  let sensorSpecificLen = [
    0,
    0,
    0,
    0,
    0,
    7,
    6,
    13,
    8,
    8,
    0,
    0,
    11,
    9,
    0,
    3,
    7,
    8,
    6,
    12,
    5,
    0,
    0,
    0,
    0,
    2,
    0,
    2,
    0,
    8,
    5,
    11,
    6,
    10,
    15,
    9,
    4,
    3,
    0,
    2,
    6,
    3,
    4,
    8,
    8,
  ];
  let len = sensorSpecificLen[sensorType];
  return { len };
};

export const snmpsvcParser = (values) => {
  let enable = values?.ProtocolEnabled;
  let enablev1v2c =
    values?.EnableSNMPv1 && values?.EnableSNMPv2c ? true : false;
  let readonlystr = values?.CommunityStrings[0]?.CommunityString ?? '';
  let readwritestr = values?.CommunityStrings[1]?.CommunityString ?? '';
  return { enable, enablev1v2c, readonlystr, readwritestr };
};

export const modifypefParser = (values) => {
  let sensorTypes = [];
  let sensors = [];
  let tmp = values?.SENSOR_INFO?.SENSOR;
  tmp.forEach((d) => {
    let currSensorType = parseInt(d.STYPE);
    if (sensorTypes.indexOf(currSensorType) == -1) {
      sensorTypes.push(currSensorType);
    }
    sensors.push({
      ID: d.ID,
      Name: d.NAME,
      Number: parseInt(d.NUMBER),
      SType: currSensorType,
      ERType: parseInt(d.ERTYPE),
      EvM: parseInt(d.EvM),
      State: parseInt(d.STATE),
    });
  });
  return { sensorTypes, sensors };
};

export const globalpefParser = (values) => {
  let enable, filteraction, action, glopefobj;
  glopefobj = values;
  enable = values?.pefEnable ?? false;
  filteraction = values?.logEventOnAction ?? false;
  action = values?.pefAction;
  return {
    enable,
    filteraction,
    action,
    glopefobj,
  };
};

export const snmptrapParser = (values) => {
  let failover = values?.failover ?? false;
  let actchn = values?.act_chl ?? 1;
  let trapArr = values?.trap ?? [];
  return {
    failover,
    actchn,
    trapArr,
  };
};

export const smtpmailParser = (values) => {
  let emailArr = values?.destination ?? '';
  return { emailArr };
};

export const snmpParser = (values) => {
  let snmpArr = values?.destination ?? '';
  return { snmpArr };
};

export const alertdestParser = (values) => {
  let failover = values?.failover ?? false;
  let actchn = values?.act_chl ?? 1;
  let destConfigArr = values?.destination ?? [];
  return { failover, actchn, destConfigArr };
};

export const pefParser = (values) => {
  let pefNames = values?.PEF_SENSOR ?? '';
  let pefValues = values?.PEF_TABLE ?? '';
  let pefdata = [];

  function SensorTypeChange(val) {
    if (val == 0xff) {
      return 'All Sensors';
    } else if (val == 0x00) {
      return 'No Select';
    } else if (val >= 0xc0 && val <= 0xff) {
      return 'OEM Sensors';
    } else if (val > 0x2c && val < 0xc0) {
      return 'Reserve';
    } else {
      return sensorType[val.toString(16).toUpperCase()] ?? 'error';
    }
  }
  function AssertionConditionChange(byte0, byte1) {
    let value = parseInt(byte0 + byte1, 16);
    let result = '';
    for (let i = 0; i < 15; i++) {
      let state = 1 << i;
      if (value & state) {
        result += result !== '' ? ',' + i : i;
      }
    }
    if (result === '') {
      return 'N/A';
    } else {
      return 'state:' + result;
    }
  }
  function ActionChange(val) {
    let result = '';
    if (val & 0x1) {
      result += 'Alerts' + ';';
    }
    if (val & 0x2) {
      result += 'PowerOff' + ';';
    }
    if (val & 0x4) {
      result += 'Reset' + ';';
    }
    if (val & 0x8) {
      result += 'PowerCycle' + ';';
    }
    if (val & 0x10) {
      result += 'Graceful Shutdown' + ';';
    }
    if (val & 0x20) {
      result += 'Diagnostic Interrupt' + ';';
    }
    if (result === '') {
      result = 'N/A';
    }
    return result;
  }
  let idx = 1;
  for (const key in pefValues) {
    let val = pefValues[key];
    let record = {
      Number: idx++,
      PefEnable: parseInt(val.substr(4, 2), 16) & 0x80 ? 'Yes' : 'No',
      SensorType: SensorTypeChange(parseInt(val.substr(16, 2), 16)),
      SensorName: pefNames[key],
      SensorNumber: parseInt(val.substr(18, 2), 16),
      AssertionCond: AssertionConditionChange(
        val.substr(24, 2),
        val.substr(22, 2)
      ),
      PefAction: ActionChange(parseInt(val.substr(6, 2), 16)),
      PefValue: pefValues[key],
    };
    pefdata.push(record);
  }
  return { pefdata };
};
