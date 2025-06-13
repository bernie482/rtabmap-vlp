import i18n from '@/i18n';
// <!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN:CONFIG_IKVM -->
import { insydeWS } from '@/env/insyde/store/plugins/InsydeWSPlugin';
// <!-- WEB_CONFIG_DEPEND_FEATURE_END:CONFIG_IKVM -->

const WSStore = {
  namespaced: true,
  state: {
    status: {
      CUR_USER_KVM: [],
      CUR_USER_REDFISH: [],
      CUR_USER_WEB: [],
      LED_POWER: '0',
      LED_STATUS: '0:0',
      LED_UID: '0',
      // VM1: '0:0:0:1',
      // VM2: '0:0:0:1',
      // VM3: '0:0:0:1',
      // VM4: '0:0:0:1',
      // VM5: '0:0:0:1',
    },
    msgBox: [],
    notifyMsgs: [],
    bios: {
      lock: false,
    },
    kvm: {
      imageGenerate: 0,
      imageReadyNotify: 0,
    },
    acd: {
      readyNotify: 0,
    },
    basd: {
      readyNotify: 0,
    },
    raid: {
      initDoneNotify: 0,
      cacheDoneNotify: 0,
      initStartNotify: 0,
      initFailNotify: 0,
    },
  },
  getters: {
    status: (state) => state.status,
    notifyMsgs: (state) => state.notifyMsgs,
    msgBox: (state) => state.msgBox,
    biosLock: (state) => state.bios.lock,
    kvmImageGenerate: (state) => state.kvm.imageGenerate,
    vminfo: (state) => {
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
      return mapStatus(state.status);
    },
    vfpinfo: (state) => {
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
      return mapStatus(state.status);
    },
  },
  mutations: {
    status: (state, status) => (state.status = status),
    addNotifyMsgs: (state, msg) => state.notifyMsgs.push(msg),
    cleanNotifyMsgs: (state) => (state.notifyMsgs = []),
    addBox: (state, msg) => {
      state.notifyMsgs.push(msg);
      state.msgBox.push(msg);
    },
    delBox: (state, msg) => {
      state.msgBox = state.msgBox.filter((m) => m != msg);
    },
    cleanBox: (state) => (state.msgBox = []),
    biosLock: (state, lock) => (state.bios.lock = lock),
    kvmImageGenerateInc: (state) => state.kvm.imageGenerate++,
    kvmImageGenerateDec: (state) => state.kvm.imageGenerate--,
    kvmImageReadyNotify: (state) =>
      (state.kvm.imageReadyNotify =
        (state.kvm.imageReadyNotify + 1) % Number.MAX_SAFE_INTEGER),
    acdReadyNotify: (state) =>
      (state.acd.readyNotify =
        (state.acd.readyNotify + 1) % Number.MAX_SAFE_INTEGER),
    basdReadyNotify: (state) =>
      (state.basd.readyNotify =
        (state.basd.readyNotify + 1) % Number.MAX_SAFE_INTEGER),
    raidInitDoneNotify: (state) =>
      (state.raid.initDoneNotify =
        (state.raid.initDoneNotify + 1) % Number.MAX_SAFE_INTEGER),
    raidCacheDoneNotify: (state) =>
      (state.raid.cacheDoneNotify =
        (state.raid.cacheDoneNotify + 1) % Number.MAX_SAFE_INTEGER),
    raidInitStartNotify: (state) =>
      (state.raid.initStartNotify =
        (state.raid.initStartNotify + 1) % Number.MAX_SAFE_INTEGER),
    raidInitFailNotify: (state) =>
      (state.raid.initFailNotify =
        (state.raid.initFailNotify + 1) % Number.MAX_SAFE_INTEGER),
    raidClearNotify: (state) => (state.raid.cacheDoneNotify = 0),
  },
  actions: {
    generatePreviewImage(
      // <!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN:CONFIG_IKVM -->
      { commit, getters },
      enable
      // <!-- WEB_CONFIG_DEPEND_FEATURE_END:CONFIG_IKVM -->
    ) {
      // Do IKVM preview when IKVM service enabled.
      // <!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN:CONFIG_IKVM -->
      let lastValue = getters['kvmImageGenerate'];
      if (enable) {
        commit('kvmImageGenerateInc');
      } else {
        commit('kvmImageGenerateDec');
      }
      try {
        if (lastValue == 0 && enable) {
          console.log('preview', 'GENERATE_SCREEN_PREVIEW');
          insydeWS.send(JSON.stringify({ CMD: 'GENERATE_SCREEN_PREVIEW' }));
        } else if (lastValue == 1 && !enable) {
          console.log('preview', 'CLOSE_SCREEN_PREVIEW');
          insydeWS.send(JSON.stringify({ CMD: 'CLOSE_SCREEN_PREVIEW' }));
        }
      } catch (e) {
        // If the send is not ready, the websocket will send again when it is opened.
        console.warn(e);
      }
      // <!-- WEB_CONFIG_DEPEND_FEATURE_END:CONFIG_IKVM -->
    },
  },
};

export default WSStore;
