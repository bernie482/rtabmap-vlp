<template>
  <b-container fluid="x1">
    <page-title />
    <page-section>
      <b-row cols="2">
        <b-col md="2"><label>Enable RADIUS</label></b-col>
        <b-col
          ><b-form-checkbox v-model="enable" switch></b-form-checkbox
        ></b-col>
      </b-row>
      <b-row cols="2">
        <b-col md="2"><label>Port</label></b-col>
        <b-col><input v-model="port" type="text" :disabled="!enable" /></b-col>
      </b-row>
      <b-row cols="2">
        <b-col md="2"><label>IPv4 Address</label></b-col>
        <b-col
          ><input v-model="ipv4addr" type="text" :disabled="!enable"
        /></b-col>
      </b-row>
      <b-row cols="2">
        <b-col md="2"><label>IPv6 Address</label></b-col>
        <b-col
          ><input v-model="ipv6addr" type="text" :disabled="!enable"
        /></b-col>
      </b-row>
      <b-row cols="2">
        <b-col md="2"><label>Secret</label></b-col>
        <b-col
          ><input v-model="secret" type="password" :disabled="!enable"
        /></b-col>
      </b-row>
      <b-row cols="2">
        <b-col md="2"><label>Admin Vendor Specific</label></b-col>
        <b-col
          ><input v-model="vendorAdmin" type="text" :disabled="!enable"
        /></b-col>
      </b-row>
      <b-row cols="2">
        <b-col md="2"><label>Operator Vendor Specific</label></b-col>
        <b-col
          ><input v-model="vendorOperator" type="text" :disabled="!enable"
        /></b-col>
      </b-row>
      <b-row cols="2">
        <b-col md="2"><label>User Vendor Specific</label></b-col>
        <b-col
          ><input v-model="vendorUser" type="text" :disabled="!enable"
        /></b-col>
      </b-row>
      <b-row cols="2">
        <b-col md="2"><label>Callback Vendor Specific</label></b-col>
        <b-col
          ><input v-model="vendorCallback" type="text" :disabled="!enable"
        /></b-col>
      </b-row>
      <b-button variant="primary" @click="ConfigSave">
        {{ $t('global.action.saveSettings') }}
      </b-button>
      <b-button variant="secondary" @click="clearConfigSave">
        {{ $t('global.action.clear') }}
      </b-button>
    </page-section>
  </b-container>
</template>
<script>
import PageTitle from '@/components/Global/PageTitle';

import PageSection from '@/components/Global/PageSection';
import {
  RADIUSParser,
  netstatParser,
} from '@/env/insyde/components/Mixins/RADIUSTableParserMixin';

export default {
  name: 'RADIUS',
  components: {
    PageTitle,
    PageSection,
  },

  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
  data() {
    return {
      usedPorts: [],
      cfgobj: null,
      enable: false,
      ipv4addr: '',
      ipv6addr: '',
      port: '',
      secret: '',
      vendorAdmin: '',
      vendorOperator: '',
      vendorUser: '',
      vendorCallback: '',
    };
  },
  computed: {
    netstatinfo() {
      return netstatParser(this.$store.getters['radius/netstat']);
    },
    radiusinfo() {
      return RADIUSParser(this.$store.getters['radius/radiuscfg']);
    },
  },
  created() {
    const radius = this;
    radius.startLoader();
    Promise.all([
      radius.$store.dispatch('radius/checkUsedPort').then(() => {
        radius.usedPorts = radius.netstatinfo.usedPorts;
      }),
      radius.$store.dispatch('radius/getRADIUSInfo').then(() => {
        radius.configRADIUS(radius.radiusinfo);
      }),
    ]).finally(() => radius.endLoader());
  },
  methods: {
    configRADIUS(cfginfo) {
      let radius = this;
      radius.cfgobj = cfginfo.cfgobj;
      radius.enable = cfginfo.enabled;
      radius.ipv4addr = cfginfo.v4addr != '0.0.0.0' ? cfginfo.v4addr : '';
      radius.ipv6addr = cfginfo.v6addr != '::' ? cfginfo.v6addr : '';
      radius.port = cfginfo.port.toString();
      radius.secret =
        cfginfo.admin.length != 0 ||
        cfginfo.oper.length != 0 ||
        cfginfo.user.length != 0 ||
        cfginfo.callback.length != 0
          ? '***'
          : '';
      radius.vendorUser = cfginfo.user;
      radius.vendorAdmin = cfginfo.admin;
      radius.vendorOperator = cfginfo.oper;
      radius.vendorCallback = cfginfo.callback;
    },
    clearConfigSave() {
      let radius = this;
      radius.$bvModal
        .msgBoxConfirm(radius.$t('pageAlertEmail.warningtodefault'), {
          title: radius.$t('global.action.confirm'),
        })
        .then((confirmed) => {
          if (confirmed) {
            radius.startLoader();
            let configdata = {};
            configdata['enable'] = false;
            configdata['ipv4Address'] = '0.0.0.0';
            configdata['ipv6Address'] = '';
            configdata['port'] = 1812;
            let vendorObj = (configdata['vendor'] = {});
            vendorObj['admin'] = '';
            vendorObj['operator'] = '';
            vendorObj['user'] = '';
            vendorObj['callback'] = '';
            radius.$store
              .dispatch('radius/saveRADIUSConfig', configdata)
              .then((success) => {
                radius.successToast(success);
                radius.setdefault();
              })
              .catch((message) => {
                radius.errorToast(message);
              })
              .finally(() => {
                radius.endLoader();
              });
          }
        });
    },
    setdefault() {
      let radius = this;
      radius.enable = false;
      radius.ipv4addr = '';
      radius.ipv6addr = '';
      radius.port = '1812';
      radius.secret = '';
      radius.vendorAdmin = '';
      radius.vendorOperator = '';
      radius.vendorUser = '';
      radius.vendorCallback = '';
    },
    ConfigSave() {
      let radius = this;
      let configdata = {};
      configdata['enable'] = radius.enable;
      configdata['ipv4Address'] = radius.ipv4addr;
      configdata['ipv6Address'] = radius.ipv6addr;
      if (radius.usedPorts.includes(parseInt(radius.port))) {
        radius.errorToast(radius.$t('pageDashboard.toast.errorRADIUSPORTERR'));
        return;
      } else {
        configdata['port'] = parseInt(radius.port);
      }
      let vendorObj = (configdata['vendor'] = {});
      vendorObj['admin'] = radius.vendorAdmin;
      vendorObj['operator'] = radius.vendorOperator;
      vendorObj['user'] = radius.vendorUser;
      vendorObj['callback'] = radius.vendorCallback;
      if (radius.secret.length != 0 && radius.secret != '***') {
        configdata['secret'] = btoa(radius.secret);
      }

      radius.startLoader();
      radius.$store
        .dispatch('radius/saveRADIUSConfig', configdata)
        .then((success) => {
          radius.successToast(success);
        })
        .catch((message) => {
          radius.errorToast(message);
        })
        .finally(() => {
          radius.endLoader();
        });
    },
  },
};
</script>
