import api from '@/store/api';
import postCodeData from '@/env/insyde/json/postcodes_str.json';
import { getField, updateField } from 'vuex-map-fields';

const PostCodeStore = {
  namespaced: true,
  state: {
    previous: {
      post: [], // bios logs
      startTime: '', // timestamp string, "Thu Jul  7 10:45:19 2022\n"
    },
    current: {
      post: [], // bios logs
      startTime: '', // timestamp string, "Thu Jul  7 10:47:14 2022"
    },
    postCodeTable: [], // post code string table
  },
  getters: {
    getField,
  },
  mutations: {
    updateField,
  },
  actions: {
    async getPreviousLogs({ state }, query = '1BYTE') {
      //console.info('getPreviousLogs');
      let config = {
        headers: {
          query,
        },
      };
      return await api
        .get('/cgi/getPreviousPostcodes.cgi', config)
        .then((response) => {
          if (response?.data?.IPMI?.PREVIOUS_POST) {
            state.previous.post = response?.data?.IPMI?.PREVIOUS_POST.POST;
            state.previous.startTime =
              response?.data?.IPMI?.PREVIOUS_POST.STARTTIME;
          }
        })
        .catch((error) => console.error(error));
    },
    async getCurrentLogs({ state }, query = '1BYTE') {
      //console.info('getCurrentLogs');
      let config = {
        headers: {
          query,
        },
      };
      return await api
        .get('/cgi/getCurrentPOSTcodes.cgi', config)
        .then((response) => {
          if (response?.data?.IPMI?.CURRENT_POST) {
            state.current.post = response?.data?.IPMI?.CURRENT_POST.POST;
            state.current.startTime =
              response?.data?.IPMI?.CURRENT_POST.STARTTIME;
          }
        })
        .catch((error) => console.error(error));
    },
    async getPostCodeTable({ state }) {
      //console.info('getPostCodeTable');
      let table = [];
      for (let el of postCodeData) {
        // PATCH: hex string, Ex: A0 -> 0xA0
        let number = Number(('0x' + el.code).slice(-4));
        table[number] = el.decode;
      }
      state.postCodeTable = table;
      console.info('getPostCodeTable');
    },
  },
};

export default PostCodeStore;
