<template>
  <b-container fluid="x1" alertdest>
    <page-section :section-title="$t('pageAlerts.alertdest')">
      <b-row>
        <b-col md="1">
          <label>{{ $t('pageAlerts.CONFALERT_LANCHANNEL') }}</label>
        </b-col>
        <b-col md="1">
          <select v-model="chn" :disabled="failover" @change="chnChange">
            <option
              v-for="(items, idx) in alertdestArr"
              :key="idx"
              :value="items.channel"
            >
              {{
                `${
                  items.desc == 0
                    ? $t('pageDashboard.network.LANG_CONF_LAN_DEDICATED_NIC')
                    : $t('pageDashboard.network.LANG_CONF_LAN_SHARE_NIC')
                } (${items.channel})`
              }}
            </option>
          </select>
        </b-col>
      </b-row>
      <b-row cols="2">
        <b-col md="1">
          <label>{{ $t('pageAlerts.CONFALERT_ALERT_ENABLE') }}</label>
        </b-col>
        <b-col md="1">
          <b-form-checkbox v-model="destConfig.enable" switch></b-form-checkbox>
        </b-col>
      </b-row>
      <!-- alert destination #1~5-->
      <div v-for="id in destCount" :key="id">
        <b-row cols="2">
          <b-col md="2">
            <label>{{
              `${$t('pageAlerts.CONFALERT_ALERT_DEST')} #${id}`
            }}</label>
          </b-col>
        </b-row>
        <!-- SNMP -->
        <b-row align-v="center" cols="2">
          <b-col md="1">
            <b-form-radio
              v-model="destConfig.dest[id - 1].type"
              :name="`dest${id}`"
              value="snmp"
            >
              {{ $t('pageAlerts.CONFALERT_ALERT_SNMP') }}
            </b-form-radio>
          </b-col>
          <b-col md="2">
            <label>{{ $t('pageAlerts.CONFALERT_ALERT_SNMP_IP') }}</label>
          </b-col>
          <b-col md="1">
            <input
              v-model="destConfig.dest[id - 1].address"
              type="text"
              :disabled="destConfig.dest[id - 1].type != 'snmp'"
          /></b-col>
        </b-row>
        <!-- EMAIL -->
        <b-row align-v="center" cols="2">
          <b-col md="1">
            <b-form-radio
              v-model="destConfig.dest[id - 1].type"
              :name="`dest${id}`"
              value="email"
            >
              {{ $t('pageAlerts.CONFALERT_ALERT_EMAIL') }}
            </b-form-radio>
          </b-col>
          <b-col md="2">
            <label>{{ $t('pageAlerts.CONFALERT_ALERT_MAIL_TO') }}</label>
          </b-col>
          <b-col md="1"
            ><input
              v-model="destConfig.dest[id - 1].email"
              type="text"
              :disabled="destConfig.dest[id - 1].type != 'email'"
          /></b-col>
        </b-row>
      </div>
      <b-row>
        <b-col>
          <b-button
            variant="primary"
            type="button"
            @click="alertDestConfigSave"
          >
            {{ $t('global.action.saveSettings') }}
          </b-button>
        </b-col>
      </b-row>
    </page-section>
  </b-container>
</template>

<script>
import PageSection from '@/components/Global/PageSection';
import { alertdestParser } from '@/env/insyde/components/Mixins/AlertsTableParserMixin';

export default {
  name: 'AlertDest',
  components: {
    PageSection,
  },

  props: {
    alertdest: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      destConfig: {
        enable: true,
        dest: [
          {
            type: 'snmp',
            address: '',
            email: '',
          },
          {
            type: 'snmp',
            address: '',
            email: '',
          },
          {
            type: 'snmp',
            address: '',
            email: '',
          },
          {
            type: 'snmp',
            address: '',
            email: '',
          },
          {
            type: 'snmp',
            address: '',
            email: '',
          },
        ],
      },
      destCount: [1, 2, 3, 4, 5],
      failover: false,
      act_chn: 1,
      chn: '1',
      alertdestArr: [],
    };
  },
  computed: {
    alertdeststate() {
      return alertdestParser(this.$store.getters['alerts/alertconf']);
    },
  },
  watch: {
    alertdest: function (value) {
      //console.log('Alert:dest data = ', value);
      if (value == null) return;
      const alerts = this;
      alerts.alertdestArr = value.destConfigArr;
      alerts.failover = value.failover;
      alerts.act_chn = value.actchn;
      alerts.chn = alerts.act_chn.toString();
      alerts.showChnDestinationInfo(parseInt(alerts.chn));
    },
  },
  created() {},
  methods: {
    chnChange() {
      this.showChnDestinationInfo(parseInt(this.chn));
    },
    showChnDestinationInfo(channel) {
      const dest = this;
      dest.alertdestArr.forEach((chnDest) => {
        if (chnDest.channel == channel) {
          dest.destConfig.enable = chnDest.enable;
          dest.destConfig.dest.forEach((d, idx) => {
            d.type = chnDest.dest[idx].type;
            d.address =
              chnDest.dest[idx].address != '0.0.0.0'
                ? chnDest.dest[idx].address
                : '';
            d.email = chnDest.dest[idx].email;
          });
          return false;
        }
        return true;
      });
    },
    alertDestConfigSave() {
      let destConf = this;
      let destinationData = {};
      destinationData['channel'] = parseInt(destConf.chn);
      destinationData['enable'] = destConf.destConfig.enable;
      let snmpip = (destinationData['snmp'] = []);
      let smtpmail = (destinationData['smtp'] = []);
      let alert = (destinationData['alert'] = []);
      destConf.destConfig.dest.forEach((d, idx) => {
        let snmpObj = {
          address: d.address != '' ? d.address : '0.0.0.0',
          index: idx + 1,
        };
        snmpip.push(snmpObj);
        let smtpObj = {
          address: d.email,
          index: idx + 1,
        };
        smtpmail.push(smtpObj);
        let alertObj = {
          type: d.type,
          index: idx + 1,
        };
        alert.push(alertObj);
      });
      destConf.$store
        .dispatch('alerts/destinationConfigSave', destinationData)
        .then((success) => {
          destConf.$store.dispatch('alerts/getAlertDestInfo').then(() => {
            destConf.alertdestArr = destConf.alertdeststate.destConfigArr;
            destConf.failover = destConf.alertdeststate.failover;
            destConf.act_chn = destConf.alertdeststate.actchn;
            destConf.showChnDestinationInfo(parseInt(destConf.chn));
            destConf.successToast(success);
          });
        });
    },
  },
};
</script>
<style scoped></style>
