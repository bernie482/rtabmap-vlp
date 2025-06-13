import api from '@/store/api';
import i18n from '@/i18n';

//todo: ref converter.js in spf(/internal/util/converter.js)
/*var size2byte = function(size){
  if(!(Validator.StringType(size) || Validator.NumberType(size))) return -1;
  // only include number
  if (Validator.NumberRule(size) || Validator.HexRule(size)) return parseInt(size);
  let strLen = size.length;
  // include KB/MB/GB/TB/PB/EB/ZB/YB (SI)
  if (Validator.ContainSizeStr_SI(size)) {
      return parseInt(size.slice(0, strLen - 2)) * Math.pow(10, (sizeMountStr.indexOf(size[strLen-2]) + 1) * 3);
  }
  // include KiB/MiB/GiB/TiB/PiB/EiB/ZiB/YiB (IEC 60027-2)
  else if (Validator.ContainSizeStr_IEC60027_2(size)) {
      return parseInt(size.slice(0, strLen - 3)) * Math.pow(2, (sizeMountStr.indexOf(size[strLen-3]) + 1) * 10);
  } else {
      return -1;
  }
}*/

const NvmeStore = {
  namespaced: true,
  state: {
    drives: [],
  },
  getters: {
    nvme: (state) => state.drives,
  },
  mutations: {
    setDrives: (state, drives) => {
      function trace(data, str) {
        str = str.replace(/\[(\w+)\]/g, '.$1');
        str = str.replace(/^\./, '');
        let part = str.split('.');
        for (let i = 0, n = part.length; i < n; i++) {
          let param = part[i];
          if (
            data !== null &&
            Object.prototype.hasOwnProperty.call(data, param)
          ) {
            data = data[param];
          } else {
            return undefined;
          }
        }
        return data;
      }
      function ifNullThenNA(data, transfer) {
        return data === undefined || data === null
          ? 'N/A'
          : transfer !== undefined
          ? transfer(data)
          : data;
      }
      //位元組轉成相對應合適的單位(kilobytes, megabytes, gigabytes)
      // function formatBytes(bytes) {
      //   let sizeArr = Converter.ByteNumberToSizeSIStr(bytes, 3);
      //   return `${sizeArr[0]} ${sizeArr[1]}`;
      // }
      state.drives = drives.map((drive) => {
        console.log(drive);
        let detailObj = {};
        detailObj.Model = ifNullThenNA(trace(drive, 'Model'));
        detailObj.Manufacturer = ifNullThenNA(trace(drive, 'Manufacturer'));
        detailObj.SerialNumber = ifNullThenNA(trace(drive, 'SerialNumber'));
        detailObj.PartNumber = ifNullThenNA(trace(drive, 'PartNumber'));
        detailObj.FirmwareVersion = ifNullThenNA(trace(drive, 'Revision'));
        detailObj.AssetTag = ifNullThenNA(trace(drive, 'AssetTag'));
        detailObj.StatusIndicator = ifNullThenNA(
          trace(drive, 'StatusIndicator')
        );
        console.log('OverallHealthState', drive.Status.HealthRollup);
        detailObj.OverallHealthState = ifNullThenNA(
          trace(drive, 'Status.HealthRollup')
        );
        console.log(
          'detailObj.OverallHealthState',
          detailObj.OverallHealthState
        );
        detailObj.PCIeNegotiatedLinkSpeed = ifNullThenNA(
          trace(drive, 'PCIeNegotiatedLinkSpeed')
        );
        detailObj.PredictedMediaLifeLeftPercent = ifNullThenNA(
          trace(drive, 'PredictedMediaLifeLeftPercent'),
          function (d) {
            return `${100 - d} %`;
          }
        );
        detailObj.PCIeVendorID = ifNullThenNA(
          trace(drive, 'Oem.InsydeNVMeState.PCIeVendorID')
        );
        detailObj.PCIeDeviceID = ifNullThenNA(
          trace(drive, 'Oem.InsydeNVMeState.PCIeDeviceID')
        );
        detailObj.PCIeSubsystemVendorID = ifNullThenNA(
          trace(drive, 'Oem.InsydeNVMeState.PCIeSubsystemVendorID')
        );
        detailObj.PCIeSubsystemDeviceID = ifNullThenNA(
          trace(drive, 'Oem.InsydeNVMeState.PCIeSubsystemDeviceID')
        );
        detailObj.PCIeBusNumber = ifNullThenNA(
          trace(drive, 'Oem.InsydeNVMeState.PCIeBusNumber')
        );
        detailObj.PCIe0LinkSpeed = ifNullThenNA(
          trace(drive, 'Oem.InsydeNVMeState.PCIe0LinkSpeed'),
          function (d) {
            return `${d} GT/s`;
          }
        );
        detailObj.PCIe0LinkWidth = ifNullThenNA(
          trace(drive, 'Oem.InsydeNVMeState.PCIe0LinkWidth')
        );
        console.log('PCIeLinkActive', drive.Oem.InsydeNVMeState.PCIeLinkActive);
        //todo fix boolean check
        detailObj.PCIeLinkActive = ifNullThenNA(
          trace(drive, 'Oem.InsydeNVMeState.PCIeLinkActive'),
          function (d) {
            console.log(d);
            if (d) {
              return i18n.t('pageNvme.table.detail.ON_STATE');
            } else {
              return i18n.t('pageNvme.table.detail.OFF_STATE');
            }
          }
        );
        detailObj.Powered = ifNullThenNA(
          trace(drive, 'Oem.InsydeNVMeState.Powered'),
          function (d) {
            if (d) {
              return i18n.t('pageNvme.table.detail.ON_STATE');
            } else {
              return i18n.t('pageNvme.table.detail.OFF_STATE');
            }
          }
        );
        detailObj.Functional = ifNullThenNA(
          trace(drive, 'Oem.InsydeNVMeState.Functional'),
          function (d) {
            //return new Boolean(d)
            //  ? i18n.t('pageNvme.table.detail.FUNCTIONAL_STATE')
            //  : i18n.t('pageNvme.table.detail.NON_FUNCTIONAL_STATE');
            if (d) {
              return i18n.t('pageNvme.table.detail.FUNCTIONAL_STATE');
            } else {
              return i18n.t(
                'pageNvme.table.detail.OFFNON_FUNCTIONAL_STATE_STATE'
              );
            }
          }
        );
        detailObj.ResetRequired = ifNullThenNA(
          trace(drive, 'Oem.InsydeNVMeState.ResetRequired'),
          function (d) {
            //return new Boolean(d)
            //  ? i18n.t('pageNvme.table.detail.NEED_STATE')
            //  : i18n.t('pageNvme.table.detail.NO_NEED_STATE');
            if (d) {
              return i18n.t('pageNvme.table.detail.NEED_STATE');
            } else {
              return i18n.t('pageNvme.table.detail.NO_NEED_STATE');
            }
          }
        );
        //todo: add degree 49 C
        detailObj.Temperature = ifNullThenNA(
          trace(drive, 'Oem.InsydeNVMeState.CompositeTemperature')
        );
        detailObj.AvailableSpareThreshold = ifNullThenNA(
          trace(
            drive,
            'Oem.InsydeNVMeState.SmartWarning.AvailableSpareThreshold'
          )
        );
        detailObj.TemperatureThreshold = ifNullThenNA(
          trace(drive, 'Oem.InsydeNVMeState.SmartWarning.TemperatureThreshold')
        );
        detailObj.ReliabilityDegraded = ifNullThenNA(
          trace(drive, 'Oem.InsydeNVMeState.SmartWarning.ReliabilityDegraded')
        );
        detailObj.MediaReadOnly = ifNullThenNA(
          trace(drive, 'Oem.InsydeNVMeState.SmartWarning.MediaReadOnly')
        );
        detailObj.VolatileMemoryBackupFailed = ifNullThenNA(
          trace(
            drive,
            'Oem.InsydeNVMeState.SmartWarning.VolatileMemoryBackupFailed'
          )
        );
        detailObj.DeviceType = ifNullThenNA(
          trace(drive, 'Oem.InsydeBusInfo.DeviceType')
        );
        detailObj.I2CPhysicalChannel = ifNullThenNA(
          trace(drive, 'Oem.InsydeBusInfo.I2CPhysicalChannel')
        );
        detailObj.PhysicalAddress = ifNullThenNA(
          trace(drive, 'Oem.InsydeBusInfo.PhysicalAddress')
        );
        console.log(detailObj);
        return {
          id: drive?.Id,
          name: drive?.Name,
          state: drive?.Status.State,
          health: ifNullThenNA(trace(drive, 'Status.Health')),
          size: ifNullThenNA(trace(drive, 'CapacityBytes')),
          protocol: drive?.Protocol,
          mediatype: drive?.MediaType,
          detail: detailObj,
        };
      });
    },
  },
  actions: {
    async getNvme({ dispatch, commit }) {
      try {
        const storages = await dispatch('getStorage');
        const systemDisks = await dispatch('getSystemDiskInfo', storages);
        const drives = await dispatch('getNvmeInfo', systemDisks);
        commit('setDrives', drives);
      } catch (e) {
        console.error({ e });
        if (e?.message?.includes('NA-')) {
          // 'NA', Not available does not popup error messages.
          throw new Error(Error.IGNORE, e);
        } else {
          throw new Error(i18n.t('global.toast.errorGetSettings'), e);
        }
      }
    },
    async getStorage() {
      //let storageUrl = await api.get('/redfish/v1/Systems/system');
      //storageUrl = storageUrl?.data?.Storage?.['@odata.id'];
      let storageUrl = '/redfish/v1/Systems/system/Storage';
      if (storageUrl) {
        let resp = await api.get(storageUrl);
        //console.log(resp.data);
        return resp.data;
      } else {
        throw new Error('NA-storage');
      }
    },
    async getSystemDiskInfo(context, storages) {
      const systemDisks = storages.Members.map((urlObj) => urlObj['@odata.id'])
        .filter((url) => {
          let urlTokens = url.split('/');
          //PCH connected SATA devices (SystemDisk1, SystemDisk2, ...), otherwise RAID.
          return Boolean(
            urlTokens[urlTokens.length - 1].indexOf('SystemDisk') == 0
          );
        })
        .map((url) => api.get(url));
      let systemDisksInfo = await Promise.allSettled(systemDisks);
      systemDisksInfo = systemDisksInfo
        .filter((resp) => resp.status === 'fulfilled')
        .map((resp) => resp.value.data);
      if (systemDisksInfo.length > 0) {
        //console.log(systemDisksInfo);
        return systemDisksInfo;
      } else throw new Error('NA-systemdisk');
    },
    async getNvmeInfo(context, systemDisks) {
      const SataRe = /^nvme/i;
      const drives = systemDisks
        .reduce((currDrives, systemDisk) => {
          return currDrives.concat(
            systemDisk.Drives.map((drive) => drive?.['@odata.id']).filter(
              (url) => {
                if (!url) return false;
                let urlTokens = url.split('/');
                return RegExp(SataRe).test(urlTokens[urlTokens.length - 1]);
              }
            )
          );
        }, [])
        .map((url) => api.get(url));
      let drivesInfo = await Promise.allSettled(drives);
      drivesInfo = drivesInfo
        .filter((resp) => resp.status === 'fulfilled')
        .map((resp) => resp.value.data);
      if (drivesInfo.length > 0) {
        //console.log(drivesInfo);
        return drivesInfo;
      } else throw new Error('NA-drive');
    },
  },
};

export default NvmeStore;
