import api from '@/store/api';
import i18n from '@/i18n';
const SELStore = {
  namespaced: true,
  state: {
    auditclearlog: null,
    capacity: null,
    clearlog: null,
    result: null,
    entry: {},
  },
  getters: {
    auditactions: (state) => state.auditclearlog,
    capacity: (state) => state.capacity,
    actions: (state) => state.clearlog,
    entrydata: (state) => state.entry,
    result: (state) => state.result,
  },
  mutations: {
    auditClearLog: (state, attr) => {
      state.auditclearlog = attr;
    },
    capacity: (state, attr) => {
      state.capacity = attr;
    },
    ClearLog: (state, attr) => {
      state.clearlog = attr;
    },
    entryData: (state, attr) => {
      state.entry = attr;
    },
    rspresult: (state, attr) => {
      state.result = attr;
    },
  },
  actions: {
    async fetchAudit({ commit }) {
      let headConfig = {
        headers: {
          oem_web_tag: 'WEB',
        },
      };
      return await api
        .get('/redfish/v1/Managers', headConfig)
        .then((data) => {
          return api.get(
            `${data.data['Members'][0]['@odata.id']}/LogServices/AuditLog0`,
            {
              headers: {
                oem_web_tag: 'WEB',
              },
            }
          );
        })
        .then((data) => {
          //console.log('data',data);
          let attr = data.data['Actions']['#LogService.ClearLog']['target'];
          commit('auditClearLog', attr);
          return api.get(data.data['Entries']['@odata.id'], {
            headers: {
              oem_web_tag: 'WEB',
              PREFER: 'odata.maxpagesize=-1',
            },
          });
        })
        .then((data) => {
          try {
            let attrOBJ = data.data;
            commit('entryData', attrOBJ);
          } catch (error) {
            throw new Error(i18n.t('set entry data error'), error);
          }
        })
        .catch((error) => {
          console.log('fetchAudit error', error);
        });
    },
    async postSel({ commit }, filterObj) {
      let headConfig = {
        headers: {
          oem_web_tag: 'WEB',
        },
      };
      try {
        let rsp = await api.post('/cgi/sel.cgi', filterObj, headConfig);
        let attr = rsp.data;
        commit('rspresult', attr);
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorSaveSettings'), error);
      }
    },
    async postActions({ commit }, url) {
      let headConfig = {
        headers: {
          oem_web_tag: 'WEB',
        },
      };
      try {
        let rsp = await api.post(url, '', headConfig);
        let attr = rsp.data;
        commit('rspresult', attr);
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorSaveSettings'), error);
      }
    },
    async patchCircular({ dispatch }, url) {
      let headConfig = {
        headers: {
          oem_web_tag: 'WEB, WEB',
        },
      };
      let payloadObj = {
        OverWritePolicy: 'WrapsWhenFull',
      };
      try {
        let rsp = await api.patch(url, payloadObj, headConfig);
        await dispatch('configResult', { attrs: rsp.data });
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorSaveSettings'), error);
      }
    },
    async patchLinear({ dispatch }, url) {
      let headConfig = {
        headers: {
          oem_web_tag: 'WEB, WEB',
        },
      };
      let payloadObj = {
        OverWritePolicy: 'NeverOverWrites',
      };
      try {
        let rsp = await api.patch(url, payloadObj, headConfig);
        await dispatch('configResult', { attrs: rsp.data });
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorSaveSettings'), error);
      }
    },
    async fetchSel({ commit }) {
      let headConfig = {
        headers: {
          oem_web_tag: 'WEB, WEB',
        },
      };
      return await api
        .get('/redfish/v1/Systems', headConfig)
        .then((data) => {
          //console.log('data',data);
          return api.get(
            data.data['Members'][0]['@odata.id'] + '/LogServices/ALL'
          );
        })
        .then((data) => {
          let attr = data.data['Actions']['#LogService.ClearLog']['target'];
          commit('ClearLog', attr);
          attr = data.data['MaxNumberOfRecords'];
          commit('capacity', attr);
          let headConfig = {
            headers: {
              PREFER: 'odata.maxpagesize=-1',
            },
          };
          return api.get(data.data['Entries']['@odata.id'], headConfig);
        })
        .then((data) => {
          try {
            let attrOBJ = data.data;
            commit('entryData', attrOBJ);
          } catch (error) {
            throw new Error(i18n.t('set entry data error'), error);
          }
        })
        .catch((error) => {
          console.log('fetchSel error', error);
        });
    },
    async fetchEntry({ commit }, entryObj) {
      let headConfig = {
        headers: {
          oem_web_tag: 'WEB',
          PREFER: `odata.maxpagesize=${entryObj?.pageSize ?? 12}`,
        },
      };
      return await api
        .get(`${entryObj.url}?$skip=${entryObj.lastEntry}`, headConfig)
        .then((data) => {
          try {
            //data.data['Members'].reverse();
            let attrOBJ = data.data;
            attrOBJ.Members = attrOBJ.Members.slice(
              0,
              entryObj?.pageSize ?? 12
            );
            commit('entryData', attrOBJ);
          } catch (error) {
            throw new Error(i18n.t('set entry data error'), error);
          }
        });
    },
    async configResult({ commit }, attrObj) {
      try {
        let attr = attrObj.attrs;
        commit('rspresult', attr);
      } catch (error) {
        throw new Error(i18n.t('global.toast.errorSaveSettings'), error);
      }
    },
  },
};

export default SELStore;
