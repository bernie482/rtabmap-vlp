<template>
  <b-container fluid="xl">
    <page-title />
    <system-diagnostics-debug v-if="!opf5ReleasePatches" />
    <!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN:CONFIG_ACD_ENABLE -->
    <system-diagnostics-acd />
    <!-- WEB_CONFIG_DEPEND_FEATURE_END:CONFIG_ACD_ENABLE -->
    <!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN:CONFIG_BASD_ENABLE -->
    <system-diagnostics-basd v-if="!opf5ReleasePatches" />
    <!-- WEB_CONFIG_DEPEND_FEATURE_END:CONFIG_BASD_ENABLE -->
  </b-container>
</template>

<script>
import PageTitle from '@/components/Global/PageTitle';

import SystemDiagnosticsDebug from './SystemDiagnosticsDebug';
// <!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN:CONFIG_ACD_ENABLE -->
import SystemDiagnosticsAcd from './SystemDiagnosticsAcd';
// <!-- WEB_CONFIG_DEPEND_FEATURE_END:CONFIG_ACD_ENABLE -->
// <!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN:CONFIG_BASD_ENABLE -->
import SystemDiagnosticsBasd from './SystemDiagnosticsBasd';
// <!-- WEB_CONFIG_DEPEND_FEATURE_END:CONFIG_BASD_ENABLE -->

export default {
  components: {
    PageTitle,
    SystemDiagnosticsDebug,
    // <!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN:CONFIG_ACD_ENABLE -->
    SystemDiagnosticsAcd,
    // <!-- WEB_CONFIG_DEPEND_FEATURE_END:CONFIG_ACD_ENABLE -->
    // <!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN:CONFIG_BASD_ENABLE -->
    SystemDiagnosticsBasd,
    // <!-- WEB_CONFIG_DEPEND_FEATURE_END:CONFIG_BASD_ENABLE -->
  },

  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
  data() {
    return {};
  },
  computed: {
    opf5ReleasePatches: () => process.env.VUE_APP_OPF5_RELEASE_PATCHES,
  },
  created() {
    this.startLoader();
    const mainPromise = new Promise((resolve) => {
      this.$root.$on('system-diagnostics-main-complete', () => resolve());
    });
    // <!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN:CONFIG_ACD_ENABLE -->
    const acdPromise = new Promise((resolve) => {
      this.$root.$on('system-diagnostics-acd-complete', () => resolve());
    });
    // <!-- WEB_CONFIG_DEPEND_FEATURE_END:CONFIG_ACD_ENABLE -->
    // <!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN:CONFIG_BASD_ENABLE -->
    const basdPromise = new Promise((resolve) => {
      this.$root.$on('system-diagnostics-basd-complete', () => resolve());
    });
    // <!-- WEB_CONFIG_DEPEND_FEATURE_END:CONFIG_BASD_ENABLE -->
    Promise.all([
      ...(this.opf5ReleasePatches ? [] : [mainPromise]),
      // <!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN:CONFIG_ACD_ENABLE -->
      acdPromise,
      // <!-- WEB_CONFIG_DEPEND_FEATURE_END:CONFIG_ACD_ENABLE -->
      // <!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN:CONFIG_BASD_ENABLE -->
      ...(this.opf5ReleasePatches ? [] : [basdPromise]),
      // <!-- WEB_CONFIG_DEPEND_FEATURE_END:CONFIG_BASD_ENABLE -->
    ]).finally(() => this.endLoader());
  },
  methods: {},
};
</script>
