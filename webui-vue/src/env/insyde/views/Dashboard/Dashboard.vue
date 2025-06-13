<template>
  <b-container fluid="xl">
    <page-title />
    <page-section class="mb-1">
      <b-card-group deck>
        <virtual-front-panel />
        <date-time />
        <current-users />
      </b-card-group>
      <b-card-group deck>
        <!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN:CONFIG_WEB_PAGE_CFG_CD_ROM -->
        <virtual-media />
        <!-- WEB_CONFIG_DEPEND_FEATURE_END:CONFIG_WEB_PAGE_CFG_CD_ROM -->
        <!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN:CONFIG_WEB_PAGE_CFG_IKVM_CONS_REDIRECT -->
        <screen-preview />
        <!-- WEB_CONFIG_DEPEND_FEATURE_END:CONFIG_WEB_PAGE_CFG_IKVM_CONS_REDIRECT -->
      </b-card-group>
      <b-card-group deck>
        <sys-info />
        <dashboard-network />
      </b-card-group>
      <b-card-group deck>
        <sensor-temperature />
        <sensor-voltage />
        <sensor-fan />
      </b-card-group>
      <b-card-group deck>
        <event-log />
      </b-card-group>
      <b-card-group deck>
        <!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN:CONFIG_WEB_PAGE_CFG_POWER_STATISTICS -->
        <power-statistics />
        <!-- WEB_CONFIG_DEPEND_FEATURE_END:CONFIG_WEB_PAGE_CFG_POWER_STATISTICS -->
        <!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN:CONFIG_WEB_PAGE_CFG_POWER_TELEMETRY -->
        <power-telemetry />
        <!-- WEB_CONFIG_DEPEND_FEATURE_END:CONFIG_WEB_PAGE_CFG_POWER_TELEMETRY -->
        <!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN:CONFIG_WEB_PAGE_CFG_SERVER_H_MFP -->
        <memory-f-p />
        <!-- WEB_CONFIG_DEPEND_FEATURE_END:CONFIG_WEB_PAGE_CFG_SERVER_H_MFP -->
      </b-card-group>
    </page-section>
  </b-container>
</template>

<script>
import VirtualFrontPanel from './VirtualFrontPanel';
// <!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN:CONFIG_WEB_PAGE_CFG_CD_ROM -->
import VirtualMedia from './VirtualMedia';
// <!-- WEB_CONFIG_DEPEND_FEATURE_END:CONFIG_WEB_PAGE_CFG_CD_ROM -->
// <!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN:CONFIG_WEB_PAGE_CFG_IKVM_CONS_REDIRECT -->
import ScreenPreview from './ScreenPreview';
// <!-- WEB_CONFIG_DEPEND_FEATURE_END:CONFIG_WEB_PAGE_CFG_IKVM_CONS_REDIRECT -->
import DateTime from './DateTime';
import CurrentUsers from './CurrentUsers.vue';
import DashboardNetwork from './Network';
// <!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN:CONFIG_WEB_PAGE_CFG_POWER_TELEMETRY -->
import PowerTelemetry from './PowerTelemetry';
// <!-- WEB_CONFIG_DEPEND_FEATURE_END:CONFIG_WEB_PAGE_CFG_POWER_TELEMETRY -->
import SysInfo from './SysInfo';
import SensorTemperature from './SensorTemperature';
import SensorVoltage from './SensorVoltage';
import SensorFan from './SensorFan';
// <!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN:CONFIG_WEB_PAGE_CFG_POWER_STATISTICS -->
import PowerStatistics from './PowerStatistics';
// <!-- WEB_CONFIG_DEPEND_FEATURE_END:CONFIG_WEB_PAGE_CFG_POWER_STATISTICS -->
import EventLog from './EventLog';
// <!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN:CONFIG_WEB_PAGE_CFG_SERVER_H_MFP -->
import MemoryFP from './MemoryFP';
// <!-- WEB_CONFIG_DEPEND_FEATURE_END:CONFIG_WEB_PAGE_CFG_SERVER_H_MFP -->
import PageSection from '@/components/Global/PageSection';
import PageTitle from '@/components/Global/PageTitle';

export default {
  name: 'Dashboard',
  components: {
    VirtualFrontPanel,
    // <!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN:CONFIG_WEB_PAGE_CFG_CD_ROM -->
    VirtualMedia,
    // <!-- WEB_CONFIG_DEPEND_FEATURE_END:CONFIG_WEB_PAGE_CFG_CD_ROM -->
    // <!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN:CONFIG_WEB_PAGE_CFG_IKVM_CONS_REDIRECT -->
    ScreenPreview,
    // <!-- WEB_CONFIG_DEPEND_FEATURE_END:CONFIG_WEB_PAGE_CFG_IKVM_CONS_REDIRECT -->
    DateTime,
    CurrentUsers,
    DashboardNetwork,
    // <!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN:CONFIG_WEB_PAGE_CFG_POWER_TELEMETRY -->
    PowerTelemetry,
    // <!-- WEB_CONFIG_DEPEND_FEATURE_END:CONFIG_WEB_PAGE_CFG_POWER_TELEMETRY -->
    SysInfo,
    SensorTemperature,
    SensorVoltage,
    SensorFan,
    // <!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN:CONFIG_WEB_PAGE_CFG_POWER_STATISTICS -->
    PowerStatistics,
    // <!-- WEB_CONFIG_DEPEND_FEATURE_END:CONFIG_WEB_PAGE_CFG_POWER_STATISTICS -->
    EventLog,
    // <!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN:CONFIG_WEB_PAGE_CFG_SERVER_H_MFP -->
    MemoryFP,
    // <!-- WEB_CONFIG_DEPEND_FEATURE_END:CONFIG_WEB_PAGE_CFG_SERVER_H_MFP -->
    PageSection,
    PageTitle,
  },

  data() {
    return {
      showDumps: process.env.VUE_APP_ENV_NAME === 'ibm',
    };
  },
  created() {
    this.startLoader();
    // <!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN:CONFIG_WEB_PAGE_CFG_IKVM_CONS_REDIRECT -->
    const spPromise = new Promise((resolve) => {
      this.$root.$on('screen-preview-complete', () => resolve());
    });
    // <!-- WEB_CONFIG_DEPEND_FEATURE_END:CONFIG_WEB_PAGE_CFG_IKVM_CONS_REDIRECT -->
    const vfpPromise = new Promise((resolve) => {
      this.$root.$on('virtual-front-panel-complete', () => resolve());
    });
    // <!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN:CONFIG_WEB_PAGE_CFG_CD_ROM -->
    const vmPromise = new Promise((resolve) => {
      this.$root.$on('virtual-media-complete', () => resolve());
    });
    // <!-- WEB_CONFIG_DEPEND_FEATURE_END:CONFIG_WEB_PAGE_CFG_CD_ROM -->
    const datetimePromise = new Promise((resolve) => {
      this.$root.$on('date-time-complete', () => resolve());
    });
    // <!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN:CONFIG_WEB_PAGE_CFG_POWER_STATISTICS -->
    const power_statics_Promise = new Promise((resolve) => {
      this.$root.$on('powerstatistics-complete', () => resolve());
    });
    // <!-- WEB_CONFIG_DEPEND_FEATURE_END:CONFIG_WEB_PAGE_CFG_POWER_STATISTICS -->
    const inventoryPromise = new Promise((resolve) => {
      this.$root.$on('current-users-complete', () => resolve());
    });
    const networkPromise = new Promise((resolve) => {
      this.$root.$on('dashboard-network-complete', () => resolve());
    });
    // <!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN:CONFIG_WEB_PAGE_CFG_POWER_TELEMETRY -->
    const powertmPromise = new Promise((resolve) => {
      this.$root.$on('power-telemetry-complete', () => resolve());
    });
    // <!-- WEB_CONFIG_DEPEND_FEATURE_END:CONFIG_WEB_PAGE_CFG_POWER_TELEMETRY -->
    const sensor_temperature_Promise = new Promise((resolve) => {
      this.$root.$on('sensor-temperature-complete', () => resolve());
    });
    const sensor_voltage_Promise = new Promise((resolve) => {
      this.$root.$on('sensor-voltage-complete', () => resolve());
    });
    const sensor_fan_Promise = new Promise((resolve) => {
      this.$root.$on('sensor-fan-complete', () => resolve());
    });
    const sysinfoPromise = new Promise((resolve) => {
      this.$root.$on('sys-info-complete', () => resolve());
    });
    const eventlogPromise = new Promise((resolve) => {
      this.$root.$on('event-log-complete', () => resolve());
    });

    let promises = [
      // <!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN:CONFIG_WEB_PAGE_CFG_IKVM_CONS_REDIRECT -->
      spPromise,
      // <!-- WEB_CONFIG_DEPEND_FEATURE_END:CONFIG_WEB_PAGE_CFG_IKVM_CONS_REDIRECT -->
      vfpPromise,
      // <!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN:CONFIG_WEB_PAGE_CFG_CD_ROM -->
      vmPromise,
      // <!-- WEB_CONFIG_DEPEND_FEATURE_END:CONFIG_WEB_PAGE_CFG_CD_ROM -->
      datetimePromise,
      // <!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN:CONFIG_WEB_PAGE_CFG_POWER_STATISTICS -->
      power_statics_Promise,
      // <!-- WEB_CONFIG_DEPEND_FEATURE_END:CONFIG_WEB_PAGE_CFG_POWER_STATISTICS -->
      inventoryPromise,
      networkPromise,
      // <!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN:CONFIG_WEB_PAGE_CFG_POWER_TELEMETRY -->
      powertmPromise,
      // <!-- WEB_CONFIG_DEPEND_FEATURE_END:CONFIG_WEB_PAGE_CFG_POWER_TELEMETRY -->
      sensor_temperature_Promise,
      sensor_voltage_Promise,
      sensor_fan_Promise,
      sysinfoPromise,
      eventlogPromise,
    ];

    Promise.all(promises).finally(() => this.endLoader());
  },
};
</script>
<style lang="scss" scoped></style>
