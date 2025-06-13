<template>
  <b-container fluid="x1">
    <page-title />
    <page-section>
      <b-row cols="2">
        <b-col md="2"
          ><label>{{
            $t('pageDynamicDNS.LANG_CONF_DDNS_ENABLE_DDNS')
          }}</label></b-col
        >
        <b-col
          ><b-form-checkbox v-model="enable" switch></b-form-checkbox
        ></b-col>
      </b-row>
      <b-row v-show="enable" cols="2">
        <b-col md="2"></b-col>
        <b-col
          ><b-form-radio v-model="enabledTSIG" name="route" value="nsupdate">{{
            $t('pageDynamicDNS.LANG_CONF_DDNS_ENABLE_BY_NSUPDATE')
          }}</b-form-radio></b-col
        >
      </b-row>
      <b-row v-show="enable" cols="2">
        <b-col md="2"></b-col>
        <b-col>
          <b-form-radio v-model="enabledTSIG" name="route" value="fqdn">
            {{ $t('pageDynamicDNS.LANG_CONF_DDNS_DHCP_CLIENT_FQDN') }}
            <label
              v-if="enabledTSIG == 'fqdn'"
              style="color: rgb(255, 193, 7)"
              >{{
                `${$t('pageDynamicDNS.LANG_CONF_DDNS_FQDN_NEED_DHCP')}`
              }}</label
            >
          </b-form-radio>
        </b-col>
      </b-row>
      <b-row v-show="enable && enabledTSIG == 'nsupdate'" cols="2">
        <b-col md="2"
          ><label>{{
            $t('pageDynamicDNS.LANG_CONF_DDNS_DNS_IP')
          }}</label></b-col
        >
        <b-col
          ><input v-model="dns_srv_ip" type="text" :disabled="!enable"
        /></b-col>
      </b-row>
      <b-row v-show="enable && enabledTSIG == 'nsupdate'" cols="2">
        <b-col md="2"
          ><label>{{
            $t('pageDynamicDNS.LANG_CONF_DDNS_DOMAIN_NAME')
          }}</label></b-col
        >
        <b-col
          ><input v-model="domain" type="text" :disabled="!enable"
        /></b-col>
      </b-row>
      <b-row v-show="enable" cols="2">
        <b-col md="2"
          ><label>{{
            $t('pageDynamicDNS.LANG_CONF_DDNS_HOSTNAME')
          }}</label></b-col
        >
        <b-col
          ><input v-model="host_name" type="text" :disabled="!enable"
        /></b-col>
      </b-row>
      <b-row v-show="enable && enabledTSIG == 'nsupdate'" cols="2">
        <b-col md="2"
          ><label>{{
            $t('pageDynamicDNS.LANG_CONF_DDNS_EN_AUTH')
          }}</label></b-col
        >
        <b-col
          ><b-form-checkbox v-model="enabledAuth" switch
            ><label v-show="enabledAuth" style="color: rgb(255, 193, 7)">{{
              $t('pageDynamicDNS.LANG_CONF_DDNS_TSIG_TIMESTAMP_WARNING')
            }}</label></b-form-checkbox
          ></b-col
        >
      </b-row>
      <b-row v-show="enable && enabledTSIG == 'nsupdate'" cols="2">
        <b-col md="2"
          ><label>{{
            $t('pageDynamicDNS.LANG_CONF_DDNS_TSIG_KEY')
          }}</label></b-col
        >
        <b-col
          ><label>{{ keyname }}</label></b-col
        >
      </b-row>
      <b-row v-show="enable && enabledTSIG == 'nsupdate'" cols="3">
        <b-col md="2"
          ><label>{{
            $t('pageDynamicDNS.LANG_CONF_DDNS_UPLOAD_NEW_TSIG_KEY')
          }}</label></b-col
        >
        <b-col md="2"
          ><label>{{
            $t('pageDynamicDNS.LANG_CONF_DDNS_PUBKEY')
          }}</label></b-col
        >
        <b-col
          ><input type="file" :disabled="!enabledAuth" @change="tsigkeyChange"
        /></b-col>
      </b-row>
      <b-row v-show="enable && enabledTSIG == 'nsupdate'" cols="3">
        <b-col md="2"></b-col>
        <b-col md="2"
          ><label>{{
            $t('pageDynamicDNS.LANG_CONF_DDNS_PRIVKEY')
          }}</label></b-col
        >
        <b-col
          ><input
            type="file"
            :disabled="!enabledAuth"
            @change="tsigprivateChange"
        /></b-col>
      </b-row>
      <b-button variant="primary" @click="ConfigSave">
        {{ $t('global.action.saveSettings') }}
      </b-button>
    </page-section>
  </b-container>
</template>
<script>
import PageTitle from '@/components/Global/PageTitle';

import PageSection from '@/components/Global/PageSection';
import { DDNSParser } from '@/env/insyde/components/Mixins/DDNSTableParserMixin';

export default {
  name: 'DDNS',
  components: {
    PageTitle,
    PageSection,
  },

  data() {
    return {
      dns_srv_ip: '',
      domain: '',
      host_name: '',
      keyname: '',
      enabledTSIG: '',
      enabledAuth: false,
      enable: false,
      enabledStatus: 0,
      keyfileObj: {},
    };
  },
  computed: {
    ddnsinfo() {
      return DDNSParser(this.$store.getters['ddns/ddnsinfo']);
    },
  },
  created() {
    const ddns = this;
    ddns.startLoader();
    Promise.all([
      ddns.$store.dispatch('ddns/getddnsInfo').then(() => {
        ddns.enabledStatus = ddns.ddnsinfo.enabled;
        if (ddns.enabledStatus != 0) {
          ddns.enable = true;
          switch (ddns.enabledStatus) {
            case 2:
              ddns.enabledTSIG = 'fqdn';
              break;
            default:
              ddns.enabledTSIG = 'nsupdate';
              break;
          }
        } else {
          ddns.enable = false;
          ddns.enabledTSIG = 'fqdn';
        }
        ddns.dns_srv_ip = ddns.ddnsinfo.dns;
        ddns.domain = ddns.ddnsinfo.domain;
        ddns.host_name = ddns.ddnsinfo.host;
        ddns.enabledAuth = ddns.ddnsinfo.enabledtsig;
        ddns.keyname = ddns.ddnsinfo.tsigKeyname;
      }),
    ]).finally(() => ddns.endLoader());
  },
  methods: {
    tsigkeyChange(e) {
      //this.formData.append('certfile', e.target.files[0]);
      this.keyfileObj['tsigKeyFile'] = e.target.files[0];
    },
    tsigprivateChange(e) {
      //this.formData.append('certfile', e.target.files[0]);
      this.keyfileObj['tsigPrivateFile'] = e.target.files[0];
    },
    ConfigSave() {
      let ddns = this;
      let configdata = {};
      if (ddns.enable != true) {
        configdata['enable'] = 0;
      } else {
        if (ddns.enabledTSIG == 'fqdn') {
          configdata['enable'] = 2;
          configdata['hostname'] = ddns.host_name;
        } else {
          configdata['enable'] = 1;
          configdata['hostname'] = ddns.host_name;
          configdata['dnsServer'] = ddns.dns_srv_ip;
          configdata['domainName'] = ddns.domain;
          if (ddns.enabledAuth != true) {
            configdata['enableTsig'] = false;
          } else {
            configdata['enableTsig'] = true;
            for (var attr in ddns.keyfileObj) {
              configdata[attr] = ddns.keyfileObj[attr];
            }
          }
        }
      }

      ddns.startLoader();
      ddns.$store
        .dispatch('ddns/saveDDNSConfig', configdata)
        .then((success) => {
          ddns.successToast(success);
        })
        .catch((message) => {
          ddns.errorToast(message);
        })
        .finally(() => {
          ddns.endLoader();
        });
    },
  },
};
</script>
