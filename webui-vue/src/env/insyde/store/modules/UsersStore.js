import api from '@/store/api';
import i18n from '@/i18n';
import { getField, updateField } from 'vuex-map-fields';

function assertSpecialRfError(error, options) {
  let errmsg = error?.response?.data;
  if (errmsg) {
    if (
      errmsg?.['Password@Message.ExtendedInfo']?.[0]?.Message?.includes(
        'property Password is of a different format than the property can accept'
      )
    ) {
      throw new Error(i18n.t('pageUsers.toast.errorPasswordFormat'));
    } else if (
      errmsg?.['UserName@Message.ExtendedInfo']?.[0]?.Message?.match(
        /property UserName with the value .* already exists/
      )
    ) {
      throw new Error(i18n.t('pageUsers.toast.errorUserExists', options));
    }
  }
}

function assertSpecialCgiError(error, options) {
  let errmsg = error?.response?.data;
  if (errmsg) {
    if (
      errmsg?.msg?.includes('mci_set_user_password set passwd fail, ret = 204')
    ) {
      throw new Error(i18n.t('pageUsers.toast.errorPasswordFormat'));
    } else if (errmsg?.msg?.includes('mci_set_user_name fail, ret = 204')) {
      throw new Error(i18n.t('pageUsers.toast.errorUserExists', options));
    }
  }
}

const UsersStore = {
  namespaced: true,
  state: {
    channelSelected: 0,
    channelOptions: [],
    allUsers: [],
    accountRoles: [],
    // AccountService
    maxPasswordLength: 0,
    minPasswordLength: 16,
    // NOTE: mapping privilege string to int
    privTable: {
      NoAccess: 0,
      Guest: 1,
      User: 2,
      Operator: 3,
      Administrator: 4,
    },
  },
  getters: {
    getField,
  },
  mutations: {
    updateField,
  },
  actions: {
    async getChannels({ state }) {
      return await api
        .get('/cgi/configs.cgi')
        .then((response) => {
          state.channelOptions = response.data.LAN_CHANNELS?.CHANNELS || [];
          let found = state.channelOptions.find(
            (item) => item === state.channelSelected
          );
          if (!found) state.channelSelected = state.channelOptions[0];
        })
        .catch((error) => {
          console.error(error);
        });
    },
    async getUsers({ state }) {
      return await api
        .get('/redfish/v1/AccountService/Accounts')
        .then((response) =>
          response.data.Members.map((user) => user['@odata.id'])
        )
        .then((userIds) => api.all(userIds.map((user) => api.get(user))))
        .then((users) => {
          const userData = users.map((user) => user.data);
          state.allUsers = userData;
        })
        .catch((error) => {
          console.error(error);
          const message = i18n.t('pageUsers.toast.errorLoadUsers');
          throw new Error(message, error);
        });
    },
    getAccountSettings({ state }) {
      api
        .get('/redfish/v1/AccountService')
        .then(({ data }) => {
          state.minPasswordLength = data.MinPasswordLength;
          state.maxPasswordLength = data.MaxPasswordLength;
        })
        .catch((error) => {
          console.error(error);
          const message = i18n.t('pageUsers.toast.errorLoadAccountSettings');
          throw new Error(message, error);
        });
    },
    getAccountRoles({ state }) {
      api
        .get('/redfish/v1/AccountService/Roles')
        .then(({ data: { Members = [] } = {} }) => {
          const roles = Members.map((role) => {
            return role['@odata.id'].split('/').pop();
          });
          state.accountRoles = roles;
          // console.info(roles);
        })
        .catch((error) => console.log(error));
    },
    async createUser({ dispatch }, userInfo) {
      //console.info('createUser', userInfo);
      let username = userInfo.name;
      let config = {
        headers: {
          query: 'USER_ADD',
        },
      };
      return await api
        .post('/cgi/user.cgi', userInfo, config)
        .then(() => dispatch('getUsers'))
        .then(() =>
          i18n.t('pageUsers.toast.successCreateUser', {
            username,
          })
        )
        .catch((error) => {
          console.error(error);
          assertSpecialCgiError(error, { username });
          const message = i18n.t('pageUsers.toast.errorCreateUser', {
            username,
          });
          throw new Error(message);
        });
    },
    async updateUser({ dispatch }, userInfo) {
      //console.info('updateUser', userInfo);
      let id = userInfo.id;
      let originalUsername = userInfo.originalUsername;
      delete userInfo.id;
      delete userInfo.originalUsername;
      return await api
        .patch(`/redfish/v1/AccountService/Accounts/${id}`, userInfo)
        .then(() => dispatch('getUsers'))
        .then(() =>
          i18n.t('pageUsers.toast.successUpdateUser', {
            username: originalUsername,
          })
        )
        .catch((error) => {
          console.error(error);
          assertSpecialRfError(error, { username: userInfo.UserName });
          const message = i18n.t('pageUsers.toast.errorUpdateUser', {
            username: originalUsername,
          });
          throw new Error(message);
        });
    },
    async deleteUser({ dispatch }, username) {
      return await api
        .delete(`/redfish/v1/AccountService/Accounts/${username}`)
        .then(() => dispatch('getUsers'))
        .then(() =>
          i18n.t('pageUsers.toast.successDeleteUser', {
            username,
          })
        )
        .catch((error) => {
          console.error(error);
          const message = i18n.t('pageUsers.toast.errorDeleteUser', {
            username,
          });
          throw new Error(message);
        });
    },
  },
};

export default UsersStore;
