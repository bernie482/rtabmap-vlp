import api from '@/store/api';
import { getField, updateField } from 'vuex-map-fields';
import { objectDeepMerge } from '@/env/insyde/utilities/InsydeTools';

const VideoLogStore = {
  namespaced: true,
  state: {
    dateTime: null, // (no use)
    // ref: http://wiki.insyde.com/index.php/Supervyse_SPF_Video_Log_User_Guide
    settings: {
      // basic
      enabled: false, // enable video recording feature
      //FILE_CONF: '1', // ???
      //COMP_CODE: '0', // ???
      fps: 1, // fps, 1~2
      quality: 1, // image quality
      // trigger related
      trigger: {
        critical: false, // default: hidden
        noneCritical: false, // default: hidden
        noneRecoverableCritical: false, // default: hidden
        fanStateChanged: false, // default: hidden
        watchdogTimer: true,
        chassisOn: false, // default: hidden
        chassisOff: true,
        chassisReset: true,
        CATERR_IERR: false,
        OS_SEL: true,
        datetime: null, // (legacy) time to start video recording, null: NONE
      },
      // remote related
      remote: {
        enabled: false, // enable remote storage feature
        host: '', // host IP, Ex: 192.168.2.102
        type: '', // protocol type, Ex: '', nfs, cifs
        path: '', // protocol & path, Ex: cifs:///home/bmc/tmp/
        user: '',
        password: '',
      },
      preEvent: {
        maxDump: 1, // max pre-video, only 1 if remote feature is OFF
        maxDuration: 15, // pre-video duration
      },
      postEvent: {
        maxDump: 2, // max post-video
        maxDuration: 20, // post-video duration
      },
      dumpFiles: [
        //  { name: 'videolog1.avi', path: '/images/videolog1.avi', size: 124 },
        //  { name: 'videolog2.avi', path: '/images/videolog2.avi', size: 4560 },
      ], // generated files
    },
  },
  getters: {
    getField,
  },
  mutations: {
    updateField,
  },
  actions: {
    async getVideoLogSettings({ state }) {
      //console.info('getVideoLogSettings');
      let config = {
        headers: {
          query: 'config',
        },
      };
      return api
        .get('/cgi/crash_video_capture.cgi', config)
        .then((response) => {
          let data = response.data;
          // PATCH: remote.password encode with base64
          if (data.remote.password) {
            data.remote.password = atob(data.remote.password);
          }
          data.dumpFiles = data.dumpFiles.map((el) => {
            return {
              path: el.name,
              size: el.size,
              name: el.name,
            };
          });
          // PATCH: compatible bad data
          if (data.quality == 255) delete data.quality;
          if (data.fps == 255) delete data.fps;
          if (data.preEvent.maxDump == 255) delete data.preEvent.maxDump;
          if (data.preEvent.maxDuration == 65535)
            delete data.preEvent.maxDuration;
          if (data.postEvent.maxDump == 255) delete data.postEvent.maxDump;
          if (data.postEvent.maxDuration == 65535)
            delete data.postEvent.maxDuration;
          if (!data.remote.host) delete data.remote.enabled;

          // NOTE: combine base and response data
          objectDeepMerge(state.settings, data);
          return response;
        })
        .catch((error) => {
          console.error(error);
          return error;
        });
    },
    async saveVideoLogSettings({ state, dispatch }) {
      //console.info('saveVideoLogSettings');
      let payload = JSON.parse(JSON.stringify(state.settings)); // deep copy
      let config = {
        headers: {
          query: 'config',
        },
      };
      if (payload.remote.enabled) {
        // PATCH: remote.password encode with base64
        if (payload.remote.password)
          payload.remote.password = btoa(payload.remote.password);
      } else {
        payload.remote.host = '';
        payload.remote.type = 'NFS';
        payload.remote.path = '';
        payload.remote.user = '';
        payload.remote.password = '';
      }
      // PATCH: remove useless data
      delete payload.dumpFiles;

      return await api
        .patch('/cgi/crash_video_capture.cgi', payload, config)
        .then((response) => {
          if (response.data.RESULT == 'FAIL') {
            console.error(response.data);
            throw new Error('Failed', response.data.MOUNT);
          } else {
            dispatch('getVideoLogSettings');
          }
        });
    },
    async delVideoLogFile({ state, dispatch }, filename) {
      //console.info('delVideoLogFile');
      let newList = state.settings.dumpFiles.filter((el) => {
        return el.name != filename;
      });
      state.settings.dumpFiles = JSON.parse(JSON.stringify(newList)); // deep copy
      let config = {
        headers: {
          query: 'file',
        },
        data: { FILE: filename },
      };
      return await api
        .delete('/cgi/crash_video_capture.cgi', config)
        .then((response) => {
          if (response.data.RESULT == 'FAIL') {
            console.error(response.data);
            throw new Error('Failed', response.data.MOUNT);
          } else {
            dispatch('getVideoLogSettings');
          }
        });
    },
  },
};

export default VideoLogStore;
