<template>
  <b-container fluid="xl">
    <page-title />
    <sysinfo-summary />
    <sysinfo-timeout />
    <!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN:CONFIG_INSYDE_BIOS_JOINT_FEATURE_SMBIOS -->
    <sysinfo-system-firmware />
    <!-- WEB_CONFIG_DEPEND_FEATURE_END:CONFIG_INSYDE_BIOS_JOINT_FEATURE_SMBIOS -->
  </b-container>
</template>

<script>
import PageTitle from '@/components/Global/PageTitle';

import SysinfoSummary from './SysinfoSummary';
import SysinfoTimeout from './SysinfoTimeout';
// <!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN:CONFIG_INSYDE_BIOS_JOINT_FEATURE_SMBIOS -->
import SysinfoSystemFirmware from './SysinfoSystemFirmware';
// <!-- WEB_CONFIG_DEPEND_FEATURE_END:CONFIG_INSYDE_BIOS_JOINT_FEATURE_SMBIOS -->

export default {
  components: {
    PageTitle,
    SysinfoSummary,
    SysinfoTimeout,
    // <!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN:CONFIG_INSYDE_BIOS_JOINT_FEATURE_SMBIOS -->
    SysinfoSystemFirmware,
    // <!-- WEB_CONFIG_DEPEND_FEATURE_END:CONFIG_INSYDE_BIOS_JOINT_FEATURE_SMBIOS -->
  },

  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
  data() {
    return {};
  },
  computed: {},
  created() {
    this.startLoader();
    const summaryPromise = new Promise((resolve) => {
      this.$root.$on('sysinfo-summary-complete', () => resolve());
    });
    const timeoutPromise = new Promise((resolve) => {
      this.$root.$on('sysinfo-timeout-complete', () => resolve());
    });
    // <!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN:CONFIG_INSYDE_BIOS_JOINT_FEATURE_SMBIOS -->
    const systemfwPromise = new Promise((resolve) => {
      this.$root.$on('sysinfo-systemfw-complete', () => resolve());
    });
    // <!-- WEB_CONFIG_DEPEND_FEATURE_END:CONFIG_INSYDE_BIOS_JOINT_FEATURE_SMBIOS -->
    Promise.all([
      summaryPromise,
      timeoutPromise,
      // <!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN:CONFIG_INSYDE_BIOS_JOINT_FEATURE_SMBIOS -->
      systemfwPromise,
      // <!-- WEB_CONFIG_DEPEND_FEATURE_END:CONFIG_INSYDE_BIOS_JOINT_FEATURE_SMBIOS -->
    ]).finally(() => this.endLoader());
  },
  methods: {},
};
</script>
