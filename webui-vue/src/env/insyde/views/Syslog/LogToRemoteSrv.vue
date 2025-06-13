<template>
  <b-container fluid="x1">
    <page-section :section-title="$t('appPageTitle.DIAG_SYSLOG_P8')">
      <b-row b-col="2">
        <b-col md="3">
          <label>{{ $t('pageSyslog.SYSLOG_REMOTE_SERVER_EN') }}</label>
        </b-col>
        <b-col>
          <b-form-checkbox v-model="enable" switch></b-form-checkbox>
        </b-col>
      </b-row>
      <b-row cols="2">
        <b-col md="3">
          <label>{{ $t('pageSyslog.SYSLOG_REMOTE_SERVER_ADDR') }}</label>
        </b-col>
        <b-col
          ><input v-model="ipv4addr" type="text" :disabled="!enable"
        /></b-col>
      </b-row>
      <b-row align-v="center" cols="3">
        <b-col md="3">
          <label>{{ $t('pageSyslog.SYSLOG_LOG_PROTOCOL') }}</label>
        </b-col>
        <b-col md="1">
          <b-form-radio
            v-model="protocol"
            name="protocol-radio"
            value="0"
            :disabled="!enable"
            >UDP
          </b-form-radio>
        </b-col>
        <b-col md="1">
          <b-form-radio
            v-model="protocol"
            name="protocol-radio"
            value="1"
            :disabled="!enable"
            >TCP
          </b-form-radio>
        </b-col>
      </b-row>
      <b-row b-col="2">
        <b-col md="3">
          <label>{{ $t('pageSyslog.SYSLOG_FACILITY') }}</label>
        </b-col>
        <b-col>
          <select v-model="selected" :disabled="!enable">
            <option v-for="(item, idx) in facility" :key="idx" :value="idx">
              {{ item }}
            </option>
          </select>
        </b-col>
      </b-row>
      <b-button variant="primary" @click="saveLogToSrv">
        {{ $t('global.action.save') }}
      </b-button>
    </page-section>
  </b-container>
</template>

<script>
import PageSection from '@/components/Global/PageSection';
import { getsyslogsrvParser } from '@/env/insyde/components/Mixins/SyslogSettingsParserMixin';

export default {
  name: 'LogToRemoteSrv',
  components: {
    PageSection,
  },

  data() {
    return {
      protocol: '0',
      ipv4addr: '',
      selected: '1',
      facility: {
        1: this.$t('pageSyslog.DIAG_SYSLOG_F1'),
        2: this.$t('pageSyslog.DIAG_SYSLOG_F2'),
        3: this.$t('pageSyslog.DIAG_SYSLOG_F3'),
        4: this.$t('pageSyslog.DIAG_SYSLOG_F4'),
        5: this.$t('pageSyslog.DIAG_SYSLOG_F5'),
        6: this.$t('pageSyslog.DIAG_SYSLOG_F6'),
        7: this.$t('pageSyslog.DIAG_SYSLOG_F7'),
        8: this.$t('pageSyslog.DIAG_SYSLOG_F8'),
        9: this.$t('pageSyslog.DIAG_SYSLOG_F9'),
      },
      enable: false,
    };
  },
  computed: {
    getRemoteSrv() {
      return getsyslogsrvParser(this.$store.getters['syslog/syslogremotesrv']);
    },
  },
  created() {
    const rSrv = this;
    rSrv.startLoader();
    Promise.all([
      rSrv.$store.dispatch('syslog/getremoteSrv').then(() => {
        rSrv.enable = rSrv.getRemoteSrv.renabled;
        rSrv.selected = rSrv.getRemoteSrv.rfacility.toString();
        rSrv.protocol = rSrv.getRemoteSrv.prop.toString();
        rSrv.ipv4addr = rSrv.getRemoteSrv.rsrv;
      }),
    ]).finally(() => {
      rSrv.endLoader();
    });
  },
  methods: {
    saveLogToSrv() {
      const rSrv = this;
      let configdata = {};
      configdata['enableRemote'] = rSrv.enable;
      configdata['facility'] = parseInt(rSrv.selected);
      configdata['protocol'] = parseInt(rSrv.protocol);
      configdata['remoteServer'] = rSrv.ipv4addr;
      rSrv.startLoader();
      rSrv.$store
        .dispatch('syslog/setrlogservice', configdata)
        .then(() => {
          rSrv.$store.dispatch('syslog/getremoteSrv').then((success) => {
            rSrv.enable = rSrv.getRemoteSrv.renabled;
            rSrv.selected = rSrv.getRemoteSrv.rfacility.toString();
            rSrv.protocol = rSrv.getRemoteSrv.prop.toString();
            rSrv.ipv4addr = rSrv.getRemoteSrv.rsrv;
            rSrv.successToast(success);
          });
        })
        .catch((message) => {
          rSrv.errorToast(message);
        })
        .finally(rSrv.endLoader());
    },
  },
};
</script>
