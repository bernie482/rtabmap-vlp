<template>
  <div class="app-container">
    <app-header ref="focusTarget" class="app-header" @refresh="refresh" />
    <app-navigation class="app-navigation" />
    <page-container class="app-content">
      <router-view ref="routerView" :key="routerKey + $route.fullPath" />
      <!-- Scroll to top button -->
      <button-back-to-top />
    </page-container>
  </div>
</template>

<script>
import AppHeader from '@/components/AppHeader';
import AppNavigation from '@/components/AppNavigation';
import PageContainer from '@/components/Global/PageContainer';
import ButtonBackToTop from '@/components/Global/ButtonBackToTop';
import JumpLinkMixin from '@/components/Mixins/JumpLinkMixin';
import BVToastMixin from '@/components/Mixins/BVToastMixin';

export default {
  name: 'App',
  components: {
    AppHeader,
    AppNavigation,
    PageContainer,
    ButtonBackToTop,
  },
  mixins: [JumpLinkMixin, BVToastMixin],
  data() {
    return {
      routerKey: 0,
      boxRead: false,
    };
  },
  computed: {
    notifyMsgs() {
      return this.$store.getters['ws/notifyMsgs'];
    },
  },
  watch: {
    $route: function () {
      this.$nextTick(function () {
        this.setFocus(this.$refs.focusTarget.$el);
      });
    },
    notifyMsgs: function () {
      this.handleWsNotify();
    },
  },
  mounted() {
    // Do this to handle case websocket data ready faster then this component.
    this.handleWsNotify();
    this.$root.$on('refresh-application', () => this.refresh());
    const LANG_PREFIX = 'global.websocket.';
    this.$tm = function () {
      // Save missing handler
      let savemissing = this.$i18n.missing;
      // Overwrite missing handler
      this.$i18n.missing = function (locale, key) {
        // Remove LANG_PREFIX
        return key.replace(LANG_PREFIX, '');
      };
      // Prepend LANG_PREFIX
      arguments[0] = `${LANG_PREFIX}${arguments[0]}`;
      let msg = this.$i18n.t(...arguments);
      // Restore missing handler
      this.$i18n.missing = savemissing;
      return msg;
    };
  },
  methods: {
    refresh() {
      // Changing the component :key value will trigger
      // a component re-rendering and 'refresh' the view
      this.routerKey += 1;
    },
    handleWsNotify() {
      if (this.notifyMsgs.length > 0) {
        for (let msg of this.notifyMsgs) {
          if (typeof msg === 'string') {
            this.infoToast(this.$tm(msg));
          } else {
            if (msg?.type == 'success') {
              this.successToast(this.$tm(msg?.text));
            } else if (msg?.type === 'error') {
              this.errorToast(this.$tm(msg?.text));
            } else {
              this.infoToast(this.$tm(msg?.text));
            }
          }
        }
        this.$store.commit('ws/cleanNotifyMsgs');
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.app-container {
  display: grid;
  grid-template-columns: 100%;
  grid-template-rows: auto;
  grid-template-areas:
    'header'
    'content';

  @include media-breakpoint-up($responsive-layout-bp) {
    grid-template-columns: $navigation-width 1fr;
    grid-template-areas:
      'header header'
      'navigation content';
  }
}

.app-header {
  grid-area: header;
  position: sticky;
  top: 0;
  z-index: $zindex-fixed + 1;
}

.app-navigation {
  grid-area: navigation;
}

.app-content {
  grid-area: content;
  background-color: $white;
}
</style>
