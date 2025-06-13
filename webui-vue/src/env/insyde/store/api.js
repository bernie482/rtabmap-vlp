import Axios from 'axios';
//Do not change store import.
//Exact match alias set to support
//dotenv customizations.
import store from '@/store';
import Cookies from 'js-cookie';

const api = Axios.create({
  withCredentials: true,
});

api.interceptors.response.use(undefined, (error) => {
  if (error.message == 'canceled' && Error.CANCEL) {
    // This is canceled event handler, we rewrite the message to bypass the toast.
    console.warn('Detecte canceled event', error);
    return Promise.reject(new Error(Error.CANCEL));
  }

  let response = error.response;
  if (response && response.status == 401) {
    if (response.config.url != '/login' && response.config.url != '/logout') {
      // Commit logout to remove XSRF-TOKEN cookie
      store.dispatch('authentication/logout');
    }
  }

  if (response && response.status == 403) {
    // Check if action is unauthorized.
    // Toast error message will appear on screen
    // when the action is unauthorized.
    store.commit('global/setUnauthorized');
  }

  return Promise.reject(error);
});

export default {
  get(path, config) {
    config = { headers: {}, ...config }; // PATCH: create when config is null
    this.insydePatchConfig(config);
    return api.get(path, config ?? {});
  },
  delete(path, config) {
    config = { headers: {}, ...config }; // PATCH: create when config is null
    this.insydePatchConfig(config);
    return api.delete(path, config);
  },
  post(path, payload, config) {
    config = { headers: {}, ...config }; // PATCH: create when config is null
    this.insydePatchConfig(config);
    return api.post(path, payload, config);
  },
  patch(path, payload, config) {
    config = { headers: {}, ...config }; // PATCH: create when config is null
    this.insydePatchConfig(config);
    return api.patch(path, payload, config);
  },
  put(path, payload, config) {
    config = { headers: {}, ...config }; // PATCH: create when config is null
    this.insydePatchConfig(config);
    return api.put(path, payload, config);
  },
  all(promises) {
    return Axios.all(promises);
  },
  spread(callback) {
    return Axios.spread(callback);
  },
  update() {
    console.error('WARNING: un-supported UPDATE method');
  },
  request(config) {
    config = { headers: {}, ...config }; // PATCH: create when config is null
    this.insydePatchConfig(config);
    return api.request(config);
  },

  insydePatchConfig(config) {
    if (process.env.VUE_APP_INSYDE_USE_SPF_CGI == 'true') {
      if (!config.headers) config.headers = {};
      config.headers['x-csrf-token'] = Cookies.get('x-csrf-token');
      config.headers['x-requested-with'] = 'XMLHttpRequest';
      config.headers['sid'] = Cookies.get('sid'); // NOTE: for REDFISH request
    }
    config.headers['x-requested-with'] = 'XMLHttpRequest';
    if (typeof config.signal == 'undefined') {
      // Assign global abort controller if signal is undefined.
      config.signal = window.abortController.signal;
    }
  },
};
