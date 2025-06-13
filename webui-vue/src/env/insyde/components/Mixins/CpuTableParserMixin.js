export const numberofcpuParser = (values) => {
  let NumOfCPU = [];
  let cpuMember;
  cpuMember = values?.Members ?? '';
  cpuMember.forEach((d) => {
    NumOfCPU.push(d['@odata.id']);
  });
  return { NumOfCPU };
};

export const cpuValuesParser = (values) => {
  let CPU_DATA = {};
  let refineName = {};
  refineName['TotalCores'] = 'Number of Cores';
  refineName['TDPWatts'] = 'TDP';
  refineName['VendorId'] = 'Version';
  refineName['IdentificationRegisters'] = 'Processor Signature';
  function processorSpeed(speed) {
    if (speed >= 1000) {
      return parseInt(speed) / 1000 + ' GHz';
    }
    return speed + ' Hz';
  }
  for (const key in values) {
    switch (key) {
      case 'Socket':
      case 'Manufacturer':
      case 'VendorId':
      case 'IdentificationRegisters':
      case 'ProcessorType':
      case 'Model':
      case 'TotalCores':
      case 'TotalThreads':
      case 'SerialNumber':
      case 'PartNumber':
      case 'TDPWatts':
      case 'InsydeProcessor':
      case 'ProcessorId':
      case 'Oem':
        if (key == 'Oem') {
          let memory_arr = values[key]?.InsydeProcessor?.ProcessorMemory ?? '';
          let psor = values[key]?.InsydeProcessor;
          memory_arr.forEach((d) => {
            CPU_DATA[d.MemoryType ?? 'Unknown'] =
              d.CapacityKB + ' KB' ?? 'None';
          });
          CPU_DATA['Speed'] = processorSpeed(psor?.CurrentSpeedMHz) ?? 'None';
          CPU_DATA['Voltage'] = psor?.VoltageVolt + ' V' ?? 'None';
          CPU_DATA['Socket Type'] = psor?.SocketType ?? 'None';
          CPU_DATA['Status'] = psor?.ProcessorStatus ?? 'None';
          CPU_DATA['Asset Tag'] = psor?.AssetTag ?? 'None';
          CPU_DATA['PPIN'] = psor?.PPIN ?? 'None';
          break;
        }
        if (key == 'ProcessorId') {
          let process_obj = values[key];
          for (const idx in process_obj) {
            if (refineName[idx]) {
              CPU_DATA[refineName[idx]] = process_obj[idx] ?? 'None';
            }
          }
          break;
        }
        CPU_DATA[refineName[key] ?? key] = values[key] ?? 'None';
        if (key == 'TDPWatts') {
          CPU_DATA[refineName[key] ?? key] += ' Watts';
        }
        break;
      default:
        break;
    }
  }
  return {
    CPU_DATA,
  };
};
