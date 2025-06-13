<template>
  <overview-card
    :title="$t('pageDashboard.systemInformation')"
    :to="`/hardware-status/sysinfo`"
  >
    <div class="dashboard-refresh">
      <icon-restart class="pointer" @click="onIconAction($event)" />
    </div>
    <div class="dashboard-info">
      <b-row class="mt-2">
        <b-col sm="6">
          <dt>{{ $t('pageDashboard.sysinfo.LANG_SYS_INFO_UPTIME') }}</dt>
        </b-col>
        <b-col sm="6">
          <dd>
            {{ sysinfo.uptime }}
          </dd>
        </b-col>
      </b-row>
      <b-row class="mt-2">
        <b-col sm="6">
          <dt>{{ $t('pageDashboard.sysinfo.LANG_SYS_INFO_BUILD_TIME') }}</dt>
        </b-col>
        <b-col sm="6">
          <dd>
            {{ sysinfo.buildTime }}
          </dd>
        </b-col>
      </b-row>
      <b-row class="mt-2">
        <b-col sm="6">
          <dt>{{ $t('pageDashboard.sysinfo.LANG_SYS_INFO_FW_REV') }}</dt>
        </b-col>
        <b-col sm="6">
          <dd>
            {{ sysinfo.firmwareVersion }}
          </dd>
        </b-col>
      </b-row>
      <b-row class="mt-2">
        <b-col sm="6">
          <dt>{{ $t('pageDashboard.sysinfo.LANG_SYS_INFO_BIOS_ID') }}</dt>
        </b-col>
        <b-col sm="6">
          <dd>
            {{ sysinfo.deviceId }}
          </dd>
        </b-col>
      </b-row>
      <b-row class="mt-2">
        <b-col sm="6">
          <dt>{{ $t('pageDashboard.sysinfo.LANG_SYS_INFO_BMC_CHIPSET') }}</dt>
        </b-col>
        <b-col sm="6">
          <dd>
            {{ sysinfo.bmcChipset }}
          </dd>
        </b-col>
      </b-row>
      <b-row class="mt-2">
        <b-col sm="6">
          <dt>
            {{ $t('pageDashboard.sysinfo.LANG_SYS_INFO_FAN_TABLE_VERSION') }}
          </dt>
        </b-col>
        <b-col sm="6">
          <dd>
            {{ sysinfo.fanVersion }}
          </dd>
        </b-col>
      </b-row>
    </div>
  </overview-card>
</template>

<script>
import OverviewCard from './OverviewCard';
import DataFormatterMixin from '@/components/Mixins/DataFormatterMixin';
import IconRestart from '@carbon/icons-vue/es/restart/24';
//import { mapState } from 'vuex';

export default {
  name: 'SysInfo',
  components: {
    OverviewCard,
    IconRestart,
  },
  mixins: [DataFormatterMixin],
  computed: {
    sysinfo() {
      return this.$store.getters['dashboardstore/sysinfo'];
    },
  },
  created() {
    this.$store
      .dispatch('dashboardstore/getSysteminfo')
      .catch(({ message }) => this.errorToast(message))
      .finally(() => {
        this.$root.$emit('sys-info-complete');
      });
  },
  methods: {
    onIconAction() {
      this.$store
        .dispatch('currentUsers/getSessionsData')
        .catch(({ message }) => this.errorToast(message))
        .finally(() => {
          this.$root.$emit('current-users-complete');
        });
    },
  },
};
</script>
