import Vue from 'vue';
import VueRouter from 'vue-router';

//Do not change store or routes import.
//Exact match alias set to support
//dotenv customizations.
import store from '../store';
import routes from './routes';

Vue.use(VueRouter);

const router = new VueRouter({
  base: process.env.BASE_URL,
  routes,
  linkExactActiveClass: 'nav-link--current',
});

function privilegeCheck(to, next) {
  if (
    !_.get(to, 'meta.privilege.view') ||
    to.meta.privilege.view.includes(store.state.authentication.privilege)
  ) {
    if (
      !_.get(to, 'meta.privilege.change') ||
      to.meta.privilege.change.includes(store.state.authentication.privilege)
    ) {
      to.meta.viewOnly = false;
    } else {
      to.meta.viewOnly = true;
    }
    next();
  } else {
    next('/page-no-prvilege');
  }
}

router.beforeEach((to, from, next) => {
  window.abortController.doAbort();
  if (to.matched.some((record) => record.meta.noHeartBeatLogout)) {
    store.dispatch('heartbeat/ignoreLogout', true);
  }
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (store.getters['authentication/isLoggedIn']) {
      if (!store.state.authentication.privilege) {
        store
          .dispatch('authentication/get_session_info')
          .then(() => {
            privilegeCheck(to, next);
          })
          .catch((e) => {
            if (e?.response?.status == 401) {
              return; // Handle logout and login on api.js and AuthenticanStore.js to prevent showing login page twice.
            }
            next('/login');
          });
      } else {
        privilegeCheck(to, next);
      }
      return;
    }
    next('/login');
  } else {
    next();
  }
});

export default router;
