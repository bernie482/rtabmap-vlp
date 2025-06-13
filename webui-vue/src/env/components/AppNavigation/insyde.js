import IconDashboard from '@carbon/icons-vue/es/dashboard/16';
import IconTextLinkAnalysis from '@carbon/icons-vue/es/text-link--analysis/16';
import IconDataCheck from '@carbon/icons-vue/es/data--check/16';
import IconSettingsAdjust from '@carbon/icons-vue/es/settings--adjust/16';
import IconSettings from '@carbon/icons-vue/es/settings/16';
import IconSecurity from '@carbon/icons-vue/es/security/16';
import IconChevronUp from '@carbon/icons-vue/es/chevron--up/16';
import IconDataBase from '@carbon/icons-vue/es/data--base--alt/16';
import IconTools from '@carbon/icons-vue/es/tools/16';
import IconVmdkDisk from '@carbon/icons-vue/es/vmdk-disk/16';
import IconSwitcher from '@carbon/icons-vue/es/switcher/16';
import { mapState } from 'vuex';

const AppNavigationMixin = {
  components: {
    iconOverview: IconDashboard,
    iconLogs: IconTextLinkAnalysis,
    iconHealth: IconDataCheck,
    iconControl: IconSettingsAdjust,
    iconSettings: IconSettings,
    iconSecurityAndAccess: IconSecurity,
    iconExpand: IconChevronUp,
    iconResourceManagement: IconDataBase,
    iconTools: IconTools,
    iconVmdkDisk: IconVmdkDisk,
    iconSwitcher: IconSwitcher,
  },
  data() {
    return {
      menus: {},
      navigationItems: [],
    };
  },
  computed: mapState({
    biosTopmenu: (state) =>
      state.bios.topmenus
        .filter((menu) => RegExp(`^./[^/]+$`).test(menu.path))
        .map((menu) => menu.displayname),
    privilege: (state) => state.authentication.privilege,
  }),
  async created() {
    this.$store
      .dispatch('menu/getMenu')
      .then(() => {
        this.menus = { ...this.menus, ...this.$store.getters['menu/menus'] };
        return this.handleDynamicMenus();
      })
      .then(() => {
        if (process.env.VUE_APP_MENU_TO_SPF === 'true') {
          this.setNavigationOnRedirectSPF();
        }
        this.menuOptionalRemove(this.menus);
        const navigations = this.menuConvert2NavigationItems(this.menus);
        this.$set(this, 'navigationItems', navigations);
      });
  },
  methods: {
    handleDynamicMenus() {
      let promises = [];
      for (let key in this.menus) {
        if (key == 'bios') {
          let pageitem = this.menus[key];
          let p = this.$store
            .dispatch('bios/getTopMenu')
            .then(() => {
              this.setNavigationOnBios(this.biosTopmenu, pageitem);
            })
            .catch((err) => console.error(err));
          promises.push(p);
        }
        // Append your own menu handler...
        // else if(key == 'xxx') ...
      }
      return Promise.all(promises);
    },
    menuOptionalRemove(menus) {
      for (let key in menus) {
        let pageitem = menus[key];
        if (pageitem.disable) {
          delete menus[key];
          continue;
        }
        if (pageitem.view) {
          if (!pageitem.view.includes(this.privilege)) {
            // privilege not sufficient for view
            // console.log(key, 'cannot view', pageitem.view);
            delete menus[key];
            continue;
          }
        }
        pageitem.canChange = true;
        if (pageitem.change) {
          if (!pageitem.change.includes(this.privilege)) {
            // privilege not sufficient for change
            // console.log(key, 'cannot change', pageitem.change);
            pageitem.canChange = false;
          }
        }
        if (pageitem.children) {
          this.menuOptionalRemove(pageitem.children);
        }
        if (
          !pageitem.route &&
          (!pageitem.children || Object.keys(pageitem.children).length === 0)
        ) {
          console.error(key, 'no route and no child');
          delete menus[key];
          continue;
        }
      }
    },
    menuConvert2NavigationItems(menus) {
      let navigations = [];
      for (let key in menus) {
        let pageitem = menus[key];
        let naviitem = { id: key, ...pageitem };
        if (naviitem.route) {
          // PATCH for special route such as '/storage/physical-devices/:id?', remove '/:id?'
          naviitem.route = naviitem.route.replace(/\/:\w+\??$/g, '');
        }
        if (naviitem.label.match(/app\w+\.\w+/)) {
          // Match appxxx.xxx
          naviitem.label = this.$t(naviitem.label); // Apply multi-language
        }
        if (pageitem.children) {
          delete naviitem.children;
          naviitem.children = this.menuConvert2NavigationItems(
            pageitem.children
          );
        }

        // Insert naviitem into navigations according to the index.
        if (naviitem.index) {
          // Find a place to put the naviitem according to the index.
          let i = 0;
          for (i = 0; i < navigations.length; i++) {
            let item = navigations[i];
            if (!item.index || item.index > naviitem.index) {
              break;
            }
          }
          // console.log('insert', naviitem.id, `into navigations[${i}]`);
          navigations.splice(i, 0, naviitem);
        } else {
          // Put naviitem to the end if no index assigned.
          // console.log('insert into end', naviitem.id);
          navigations.push(naviitem);
        }
      }
      return navigations;
    },
    setNavigationOnBios(biosNavi, pageitem) {
      if (biosNavi.length > 0) {
        const biosMenu = {
          bios: {
            ...pageitem,
            children: biosNavi.map((name) => {
              return {
                id: `bios-${name}`,
                label: name,
                route: `/bios/${name}`,
                ...(pageitem.myclass && {
                  myclass: pageitem.myclass,
                }),
              };
            }),
          },
        };
        this.menus = { ...this.menus, ...biosMenu };
      } else {
        // Hide the bios menu when no bios data is available.
        delete this.menus.bios;
      }
    },
    setNavigationOnRedirectSPF() {
      const redirectSPFMenu = {
        redirect_spf: {
          index: 99,
          label: 'appNavigation.redirectSPF',
          route: '/redirect_spf',
          icon: 'iconSwitcher',
          myclass: 'green',
        },
      };
      this.menus = { ...this.menus, ...redirectSPFMenu };
    },
  },
};

export default AppNavigationMixin;
