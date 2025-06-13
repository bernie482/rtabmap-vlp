import i18n from '@/i18n';

// sel_decoder.c GetGeneratorName()
function getController(gid) {
  gid = gid & 0xff;
  if (gid & 1) {
    /** [1:7] System Software ID */
    if (gid >= 0x1 && gid <= 0x1f) {
      return { name: 'BIOS', filter: 'BIOS' };
    } else if (gid >= 0x21 && gid <= 0x3f) {
      return getSystemSoftwareName('SMI Handler', 'SMI');
    } else if (gid >= 0x41 && gid <= 0x5f) {
      return getSystemSoftwareName('System Management Software', 'SMS');
    } else if (gid >= 0x61 && gid <= 0x7f) {
      return getSystemSoftwareName('OEM', 'OEM');
    } else if (gid >= 0x81 && gid <= 0x8d) {
      return getSystemSoftwareName(
        'Remote Console software ' + (((gid & 0xf) >> 1) + 1),
        'REMOTE'
      );
    } else if (gid == 0x8f) {
      return getSystemSoftwareName(
        'Terminal Mode Remote Console software',
        'TERMINAL'
      );
    } else {
      return getSystemSoftwareName('Reserved', 'RESERVED');
    }
  } else {
    /** [1:7] IPMB 7-bit slave address */
    if (gid == 0x20) {
      return { name: i18n.t('pageSystemEventLog.SDR_BMC'), filter: 'BMC' };
    } else if (gid == 0x2c) {
      return { name: i18n.t('pageSystemEventLog.SDR_ME'), filter: 'ME' };
    } else if (gid == 0x68) {
      return {
        name: `${i18n.t('pageSystemEventLog.SDR_BMC')}`,
        filter: 'SATELLITE',
      };
    } else {
      return {
        name: `${i18n.t('pageSystemEventLog.SDR_SATELLITE')} (0x${gid.toString(
          16
        )})`,
        filter: 'SATELLITE',
      };
    }
  }
  function getSystemSoftwareName(name, subfilter) {
    return {
      name: `${i18n.t('pageSystemEventLog.SDR_SYSTEM_SOFTWARE')} (${name})`,
      filter: `SYSTEM-SOFTWARE-${subfilter}`,
    };
  }
}
function getManufacturer(mid, rid) {
  console.log('rid=', rid);
  /*
    if (this.hasOwnProperty('SELRefineString') && mid == SELRefineString.mid) {
      if (rid == 0xc0 || rid == 0xc1 || rid == 0xc2)
        return { name: 'BIOS', filter: 'BIOS' };
      else return { name: this.$t('SDR_BMC'), filter: 'BMC' };
    }*/

  if (mid == 0x0137) {
    // Microsoft
    return getSystemSoftwareName('System Management Software', 'SMS');
  } else if (mid == 0x0157) {
    // Intel
    return getSystemSoftwareName('System Management Software', 'SMS');
  } else {
    return getSystemSoftwareName('OEM', 'OEM');
  }
  function getSystemSoftwareName(name, subfilter) {
    return {
      name: `${i18n.t('pageSystemEventLog.SDR_SYSTEM_SOFTWARE')} (${name})`,
      filter: `SYSTEM-SOFTWARE-${subfilter}`,
    };
  }
}
function getEntryController(entry) {
  let controller = {};
  let RID = 0;
  let GID = 0;
  if (Object.prototype.hasOwnProperty.call(entry, 'GeneratorId')) {
    // oem type's sel spec is not define GeneratorId, so we need to check if exist.
    GID = parseInt(entry['GeneratorId'], 16);
    controller = getController(GID);
  } else if (Object.prototype.hasOwnProperty.call(entry, 'Oem')) {
    let oemEntry = entry['Oem'];
    if (Object.prototype.hasOwnProperty.call(oemEntry, 'InsydeLogEntry')) {
      let oemInsydeLogEntry = oemEntry['InsydeLogEntry'];
      if (
        Object.prototype.hasOwnProperty.call(
          oemInsydeLogEntry,
          'ManufacturerId'
        ) &&
        Object.prototype.hasOwnProperty.call(oemInsydeLogEntry, 'RecordType')
      ) {
        RID = oemInsydeLogEntry['RecordType'];
        controller = getManufacturer(
          parseInt(oemInsydeLogEntry['ManufacturerId'], 16),
          RID
        );
      } else {
        controller = {
          name: `${i18n.t('pageSystemEventLog.SDR_SYSTEM_SOFTWARE')} (OEM)`,
          filter: `SYSTEM-SOFTWARE-OEM`,
        };
      }
    } else {
      controller = {
        name: `${i18n.t('pageSystemEventLog.SDR_SYSTEM_SOFTWARE')} (OEM)`,
        filter: `SYSTEM-SOFTWARE-OEM`,
      };
    }
  } else {
    controller = { name: 'BIOS', filter: 'BIOS' };
  }
  return controller;
}

function getSeverity(severity) {
  switch (severity) {
    case 'OK':
      return i18n.t('pageSystemEventLog.MODALERT_INFO');
    case 'Warning':
      return i18n.t('pageSystemEventLog.MODALERT_WARN');
    case 'Critical':
      return i18n.t('pageSystemEventLog.MODALERT_CRITICAL');
    default:
      return i18n.t('pageSystemEventLog.EVENT_UNKNOWN');
  }
}
function getDescription(entry) {
  var message = entry['Message'] || 'N/A';
  return `${message}`;
}
/*
  function getSensorType(entry, rid, gid) {
    console.log(rid, gid);
    if (this.hasOwnProperty('SELRefineString')) {
      return (
        SELRefineString.record_type['0x' + rid.toString(16)] ||
        SELRefineString.generator_id['0x' + gid.toString(16)] ||
        SELRefineString.sensor_type[entry['SensorType']] ||
        (entry['SensorType'] == 'OEM'
          ? entry['OemSensorType'] && entry['OemSensorType'].length > 0
            ? entry['OemSensorType']
            : entry['SensorType']
          : entry['SensorType'] || 'N/A')
      );
    }
    return entry['SensorType'] || 'N/A';
  }*/

export const processAuditEntryParser = (values) => {
  let odataid = values['@odata.id'];
  let Maxcount = values['Members@odata.count'];
  let memberArr = values?.Members ?? [];
  let entryArr = [];
  memberArr.reverse().forEach((d) => {
    let controller = getEntryController(d);
    let temp = {
      Number: d.Id,
      timeStamp: d.Created,
      desc: getDescription(d),
      name: d?.Name ?? '',
      controller: controller?.name ?? '',
      filter: controller?.filter ?? '',
      severity: getSeverity(d?.Severity ?? 'Unknown'),
      type: d?.SensorType ?? 'N/A',
    };
    entryArr.push(temp);
  });
  return { entryArr, odataid, Maxcount };
};
export const processEntryParser = (values) => {
  //console.log(values);
  let odataid = values['@odata.id'];
  let Maxcount = values['Members@odata.count'];
  let memberArr = values?.Members ?? [];
  let entryArr = [];
  memberArr.reverse().forEach((d) => {
    let controller = getEntryController(d);
    let temp = {
      Number: d.Id,
      timeStamp: d.Created,
      desc: getDescription(d),
      name: d?.Name ?? '',
      controller: controller?.name ?? '',
      filter: controller?.filter ?? '',
      severity: getSeverity(d?.Severity ?? 'Unknown'),
      type: d?.SensorType ?? 'N/A',
    };
    entryArr.push(temp);
  });
  return { entryArr, odataid, Maxcount };
};
