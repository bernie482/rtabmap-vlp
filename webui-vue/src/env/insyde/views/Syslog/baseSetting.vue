<template>
  <b-container fluid="x1">
    <page-section :section-title="$t('appPageTitle.DIAG_SYSLOG_P2')">
      <b-row b-col="2">
        <b-col md="2">
          <label>{{ $t('pageSyslog.DIAG_SYSLOG_P3') }}</label></b-col
        >
        <b-col>
          <b-form-checkbox v-model="enable" switch></b-form-checkbox>
        </b-col>
      </b-row>
      <b-row b-col="2">
        <b-col md="2">
          <label>{{ $t('pageSyslog.DIAG_SYSLOG_P5') }}</label></b-col
        >
        <b-col>
          <select v-model="selected" :disabled="!enable">
            <option v-for="(item, idx) in Loglevel" :key="idx" :value="idx">
              {{ item }}
            </option>
          </select>
        </b-col>
      </b-row>
      <b-button variant="primary" @click="saveConfig">
        {{ $t('global.action.save') }}
      </b-button>
    </page-section>
  </b-container>
</template>

<script>
import PageSection from '@/components/Global/PageSection';
import { getsyslogbasicParser } from '@/env/insyde/components/Mixins/SyslogSettingsParserMixin';

export default {
  name: 'BaseSetting',
  components: {
    PageSection,
  },

  data() {
    return {
      selected: '4',
      Loglevel: {
        1: this.$t('pageSyslog.DIAG_SYSLOG_L1'),
        2: this.$t('pageSyslog.DIAG_SYSLOG_L2'),
        3: this.$t('pageSyslog.DIAG_SYSLOG_L3'),
        4: this.$t('pageSyslog.DIAG_SYSLOG_L4'),
        5: this.$t('pageSyslog.DIAG_SYSLOG_L5'),
        6: this.$t('pageSyslog.DIAG_SYSLOG_L6'),
        7: this.$t('pageSyslog.DIAG_SYSLOG_L7'),
        8: this.$t('pageSyslog.DIAG_SYSLOG_L8'),
      },
      enable: false,
    };
  },
  computed: {
    syslogBasic() {
      return getsyslogbasicParser(this.$store.getters['syslog/syslogbasic']);
    },
  },
  created() {
    const syslog = this;
    syslog.startLoader();
    Promise.all([
      syslog.$store.dispatch('syslog/getsyslogBasic').then(() => {
        syslog.enable = syslog.syslogBasic.enabled;
        syslog.selected = syslog.syslogBasic.loglevel;
      }),
    ]).finally(() => {
      syslog.endLoader();
    });
  },
  methods: {
    saveConfig() {
      const syslog = this;
      let configdata = {};
      configdata['enableSyslog'] = syslog.enable;
      configdata['level'] = parseInt(syslog.selected);
      syslog.startLoader();
      syslog.$store
        .dispatch('syslog/setsyslogBasic', configdata)
        .then(() => {
          syslog.$store.dispatch('syslog/getsyslogBasic').then((success) => {
            syslog.enable = syslog.syslogBasic.enabled;
            syslog.selected = syslog.syslogBasic.loglevel;
            syslog.successToast(success);
          });
        })
        .catch((message) => {
          syslog.errorToast(message);
        })
        .finally(syslog.endLoader());
    },
  },
};
</script>
