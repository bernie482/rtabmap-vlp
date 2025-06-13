import api from '@/store/api';
import Cookies from 'js-cookie';
import router from '@/router';

const AuthenticationStore = {
  namespaced: true,
  state: {
    privilege: Number(Cookies.get('privilege') ?? 0),
    TwoFAMsg: null,
    authError: false,
    xsrfCookie: Cookies.get('XSRF-TOKEN'),
    isAuthenticatedCookie: Cookies.get('IsAuthenticated'),
  },
  getters: {
    otpResult: (state) => state.TwoFAMsg,
    authError: (state) => state.authError,
    isLoggedIn: (state) => {
      return (
        state.xsrfCookie !== undefined || state.isAuthenticatedCookie == 'true'
      );
    },
    token: (state) => state.xsrfCookie,
  },
  mutations: {
    otpINF(state, attr) {
      state.TwoFAMsg = attr;
    },
    authSuccess(state) {
      state.authError = false;
      state.xsrfCookie = Cookies.get('XSRF-TOKEN');
    },
    privilege(state, privilege) {
      state.privilege = privilege;
    },
    authError(state, authError = true) {
      state.authError = authError;
    },
    logout(state) {
      Cookies.remove('XSRF-TOKEN');
      Cookies.remove('IsAuthenticated');
      Cookies.remove('x-csrf-token');
      Cookies.remove('sid');
      Cookies.remove('uid');
      Cookies.remove('privilege');
      Cookies.remove('timeout');
      Cookies.remove('SSO');
      Cookies.remove('2FA');
      Cookies.remove('OTP_MAIL');
      localStorage.removeItem('storedUsername');
      state.xsrfCookie = undefined;
      state.isAuthenticatedCookie = undefined;
    },
  },
  actions: {
    async login_otp_passcode({ commit, dispatch }, CODE) {
      commit('authError', false);
      let code = `passcode=${btoa(CODE)}`;
      await api
        .post('cgi/krb_2fa.cgi', code)
        .then((data) => {
          let attrObj = data.data ?? null;
          commit('otpINF', attrObj); // more 2fa message.
          if (attrObj?.result == 'success') {
            commit('authSuccess');
          } else {
            commit('authError');
            throw new Error('KRB Login failed');
          }
        })
        .catch((error) => {
          commit('authError');
          throw new Error(error);
        });
      if (process.env.VUE_APP_INSYDE_USE_SPF_CGI == 'true') {
        await dispatch('get_session_info').then(() => commit('authSuccess'));
      }
    },
    async sso_login({ commit }) {
      commit('authError', false);
      return await api
        .post('/cgi/login_sso.cgi')
        .then((response) => {
          if (response?.data?.result != 'success') {
            commit('authError');
            throw new Error('Login failed');
          }
        })
        .catch((error) => {
          commit('authError');
          throw new Error(error);
        });
    },
    async krbcheck({ commit }) {
      commit('authError', false);
      let headConfig = {
        headers: {
          query: 'CHECK',
        },
      };
      return await api
        .get('/cgi/config_krb_auth.cgi', headConfig)
        .then(() => {
          // ignore here.
        })
        .catch((error) => {
          // 401 status for KRB (http authentication)
          throw new Error(error);
        });
    },
    async login_reset_password({ commit }, pwdObj) {
      commit('authError', false);
      await api
        .post('/cgi/login_reset_password.cgi', pwdObj)
        .then(() => commit('authSuccess'))
        .catch((error) => {
          commit('authError');
          throw new Error(error);
        });
    },
    async login_send_email({ commit }, username) {
      let user = {};
      user['username'] = username;
      let config = {
        headers: {
          'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
      };
      commit('authError', false);
      return api
        .post('/cgi/login_send_email.cgi', user, config)
        .then(() => {
          commit('authSuccess');
        })
        .catch((error) => {
          commit('authError');
          throw new Error(error);
        });
    },
    async get_session_info({ commit }) {
      return api
        .put('cgi/get_session_info.cgi', '', {
          headers: {
            query: 'SESSION_DATA',
            'content-type': 'application/json',
          },
        })
        .then((response) => {
          if (process.env.VUE_APP_INSYDE_USE_SPF_CGI == 'true') {
            Cookies.set('XSRF-TOKEN', response.data.csrfToken);
            Cookies.set('x-csrf-token', response.data.csrfToken);
            Cookies.set('IsAuthenticated', true);
            Cookies.set('sid', response.data.s);
            Cookies.set('uid', response.data.uid);
            Cookies.set('privilege', response.data.privilege);
            Cookies.set('timeout', response.data.timeout);
          }
          commit('privilege', response.data.privilege);
        });
    },
    async login({ commit, dispatch }, { username, password }) {
      commit('authError', false);
      if (!(process.env.VUE_APP_INSYDE_USE_SPF_CGI == 'true')) {
        return api
          .post('/login', { data: [username, password] })
          .then(() => commit('authSuccess'))
          .catch((error) => {
            commit('authError');
            throw new Error(error);
          });
      } else {
        let rand = btoa(Math.random().toString(36).substring(7));
        let out = `user=${username}&${btoa(rand)}` + btoa(password);
        let config = {
          headers: {
            'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
          },
        };

        await api
          .post('/cgi/login.cgi', out, config)
          .then((response) => {
            if (response?.data?.result != 'success') {
              commit('authError');
              throw new Error('Login failed');
            }
          })
          .catch((error) => {
            commit('authError');
            throw new Error(error);
          });
        await dispatch('get_session_info').then(() => commit('authSuccess'));
      }
    },
    logout({ getters, commit }) {
      if (getters.isLoggedIn) {
        if (!(process.env.VUE_APP_INSYDE_USE_SPF_CGI == 'true')) {
          return api
            .post('/logout', { data: [] })
            .catch((error) => console.log(error))
            .finally(() => {
              commit('logout');
              router.go('/login');
            });
        } else {
          return api
            .get('/cgi/close_session.cgi')
            .catch((error) => console.log(error))
            .finally(() => {
              commit('logout');
              router.go('/login');
            });
        }
      } else {
        commit('logout');
        router.go('/login');
      }
    },
    async checkPasswordChangeRequired(_, username) {
      // PATCH: SPF use UID to access account
      if (process.env.VUE_APP_INSYDE_USE_SPF_CGI == 'true') {
        username = Cookies.get('uid');
      }
      return await api
        .get(`/redfish/v1/AccountService/Accounts/${username}`)
        .then(({ data: { PasswordChangeRequired } }) => PasswordChangeRequired)
        .catch((error) => console.log(error));
    },
    resetStoreState({ state }) {
      state.authError = false;
      state.xsrfCookie = Cookies.get('XSRF-TOKEN');
      state.isAuthenticatedCookie = Cookies.get('IsAuthenticated');
    },
  },
};

export default AuthenticationStore;
