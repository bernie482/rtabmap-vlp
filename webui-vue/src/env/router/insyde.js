import AppLayout from '@/layouts/AppLayout.vue';
import ChangePassword from '@/views/ChangePassword';
import ConsoleLayout from '@/layouts/ConsoleLayout.vue';
import KvmConsole from '@/views/Operations/Kvm/KvmConsole';
import Login from '@/views/Login';
import LoginLayout from '@/layouts/LoginLayout';
import PageNotFound from '@/views/PageNotFound';
import ProfileSettings from '@/views/ProfileSettings';
import SerialOverLanConsole from '@/views/Operations/SerialOverLan/SerialOverLanConsole';
import i18n from '@/i18n';

// insyde custom
import menuJson from '@/env/insyde/json/menu.json';

const routes = [
  {
    path: '/login',
    component: LoginLayout,
    children: [
      {
        path: '',
        name: 'login',
        component: Login,
        meta: {
          title: i18n.t('appPageTitle.login'),
        },
      },
      {
        path: '/change-password',
        name: 'change-password',
        component: ChangePassword,
        meta: {
          title: i18n.t('appPageTitle.changePassword'),
          requiresAuth: true,
        },
      },
    ],
  },
  {
    path: '/console',
    component: ConsoleLayout,
    meta: {
      requiresAuth: true,
    },
    children: [
      {
        path: 'serial-over-lan-console',
        name: 'serial-over-lan-console',
        component: SerialOverLanConsole,
        meta: {
          title: i18n.t('appPageTitle.serialOverLan'),
        },
      },
      {
        path: 'kvm',
        name: 'kvm-console',
        component: KvmConsole,
        meta: {
          title: i18n.t('appPageTitle.kvm'),
        },
      },
    ],
  },
  {
    path: '/',
    meta: {
      requiresAuth: true,
    },
    component: AppLayout,
    children: [
      {
        path: '/profile-settings',
        name: 'profile-settings',
        component: ProfileSettings,
        meta: {
          title: i18n.t('appPageTitle.profileSettings'),
        },
      },
      {
        path: '/redirect_spf',
        name: 'redirect_spf',
        beforeEnter() {
          window.location.assign('/cgi/url_redirect.cgi');
        },
        meta: {
          noHeartBeatLogout: true,
        },
      },
      {
        path: '*',
        name: 'page-not-found',
        component: PageNotFound,
        meta: {
          title: i18n.t('appPageTitle.pageNotFound'),
        },
      },
    ],
  },
];

window.addDynamicRoute = function (base, route) {
  let baseRoute = routes.find((route) => route.path == base);
  if (!baseRoute) return;
  let wildcardRouteIndex = baseRoute.children.find(
    (route) => route.path == '*'
  );
  if (wildcardRouteIndex != -1) {
    baseRoute.children.splice(wildcardRouteIndex - 1, 0, route);
  } else {
    baseRoute.children.push(route);
  }
};

const context_ofd = require.context(
  '../../../src/views',
  true,
  /.*\.(js|vue)$/
);

const context_insyde = require.context(
  '../../../src/env/insyde/views',
  true,
  /.*\.(js|vue)$/
);

function findComponent(context, rule) {
  let reg = new RegExp(rule);
  let find = context.keys().find((e) => {
    return reg.test(e);
  });
  if (find) {
    // console.log(rule, find);
    let comp = context(find).default;
    return comp;
  } else {
    return undefined;
  }
}

function getRouteFromMenu(menuJson) {
  // Object.keys(menuJson).forEach((key) => {

  for (let key in menuJson) {
    let menuitem = menuJson[key];
    // console.log(key, menuitem);
    if (menuitem.disable) {
      continue;
    }
    if (menuitem.route && menuitem.component) {
      let rule_insyde =
        menuitem.component.replace('@/env/insyde/views', '^.') +
        '(.vue|.js|/index.js)$'; // rule_insyde => /^./Sysinfo(.vue|.js|/index.js)$/
      let rule_ofd =
        menuitem.component.replace('@/views', '^.') + '(.vue|.js|/index.js)$'; // rule_ofd => /^./Sysinfo(.vue|.js|/index.js)$/
      let comp =
        findComponent(context_insyde, rule_insyde) ||
        findComponent(context_ofd, rule_ofd);

      if (comp) {
        let routeitem = {
          path: menuitem.route,
          name: key,
          component: comp,
          meta: {
            title: i18n.t(menuitem.title || menuitem.label),
            privilege: {
              view: menuitem.view,
              change: menuitem.change,
            },
            ...(menuitem.meta ? menuitem.meta : {}),
          },
        };
        window.addDynamicRoute(
          menuitem.route.includes('/console') ? '/console' : '/',
          routeitem
        );
      } else {
        console.error(key, 'cannot find component', menuitem.component);
      }
    } else {
      if (!menuitem.children) {
        console.error(
          key,
          'does not define route/component =>',
          menuitem.route,
          '/',
          menuitem.component
        );
      }
    }
    getRouteFromMenu(menuitem.children ?? {});
  }
}
getRouteFromMenu(menuJson);

export default routes;
