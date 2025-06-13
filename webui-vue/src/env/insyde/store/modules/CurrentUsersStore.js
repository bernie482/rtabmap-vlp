import api, { getResponseCount } from '@/store/api';
import i18n from '@/i18n';

const CurrentUsersStore = {
  namespaced: true,
  state: {
    allConnections: [],
  },
  getters: {
    allConnections: (state) => state.allConnections,
  },
  mutations: {
    setAllConnections: (state, allConnections) =>
      (state.allConnections = allConnections),
  },
  actions: {
    async getSessionsData({ commit }) {
      let headConfig = {
        headers: {
          query: 'CURRENT_USER',
        },
      };
      return await api
        .get('/cgi/current_user.cgi', headConfig)
        //.get('/redfish/v1/SessionService/Sessions')
        .then((response) => {
          let data = response.data;
          let userDatas = [];

          // PATCH: if clild node's data is null, use parent node's data
          // find relation & patch data
          let sid_objs = []; // tmp obj, index: sid, value: parent node
          let hande_order = ['krb', 'web', 'kvm', 'vm', 'redfish'];
          if (data)
            for (let o in hande_order) {
              let category = hande_order[o];
              if (data[category])
                for (let item of data[category]) {
                  //item.category = category;   // add category info
                  sid_objs[item.sid] = item;

                  if (!item.psid) continue;
                  let pnode = sid_objs[item.psid];
                  if (pnode == null) continue; // NOTE: when parent KVM gone, but VM session still alive, the parent node will be null.

                  // patch data if clild node's data is null
                  if (!item.name) item.name = pnode.name;
                  if (!item.ip) item.ip = pnode.ip;
                  if (!item.isMe) item.isMe = pnode.isMe;
                }
            }

          // sort
          data.web.sort(function (a, b) {
            return b.isMe - a.isMe;
          });

          // merge in order
          userDatas = userDatas.concat(
            data.krb.map((data) => processUserData('krb', data))
          );
          userDatas = userDatas.concat(
            data.web.map((data) => processUserData('web', data))
          );
          userDatas = userDatas.concat(
            data.kvm.map((data) => processUserData('kvm', data))
          );
          userDatas = userDatas.concat(
            data.vm.map((data) => processUserData('vm', data))
          );
          userDatas = userDatas.concat(
            data.redfish.map((data) => processUserData('redfish', data))
          );

          commit('setAllConnections', userDatas);
          return;

          function processUserData(category, data) {
            let killedID = data.sid;
            if (category == 'kvm') killedID = data.tid;
            if (category == 'redfish') killedID = data.id;

            return {
              username: `${data.name}${data.isMe ? ' (me)' : ''}`,
              type: data.type,
              ipAddress: data.ip,
              uri: killedID,
              category: category,
            };
          }
        })
        .catch((error) => {
          console.log('Client Session Data:', error);
        });
    },
    async disconnectSessions({ dispatch }, ids = []) {
      const sessionCategory = {
        web: 1,
        kvm: 2,
        redfish: 3,
        vm: 4, // (not use)
        krb: 5,
      };
      let headConfig = {
        headers: {
          query: 'KILL_SESSION',
        },
      };
      const uri = '/cgi/current_user.cgi';
      const promises = ids.map(({ uri: id, category }) =>
        api
          .post(uri, { type: sessionCategory[category], id: id }, headConfig)
          .catch((error) => {
            //api.delete(uri).catch((error) => {
            console.log(error);
            return error;
          })
      );
      return await api
        .all(promises)
        .then((response) => {
          dispatch('getSessionsData');
          return response;
        })
        .then(
          api.spread((...responses) => {
            const { successCount, errorCount } = getResponseCount(responses);
            const toastMessages = [];

            if (successCount) {
              const message = i18n.tc(
                'pageCurrentUsers.toast.successDelete',
                successCount
              );
              toastMessages.push({ type: 'success', message });
            }

            if (errorCount) {
              const message = i18n.tc(
                'pageCurrentUsers.toast.errorDelete',
                errorCount
              );
              toastMessages.push({ type: 'error', message });
            }
            return toastMessages;
          })
        );
    },
  },
};
export default CurrentUsersStore;
