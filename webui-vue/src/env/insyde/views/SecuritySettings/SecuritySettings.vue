<template>
  <b-container fluid="x1">
    <page-title />
    <page-section :section-title="$t('pageSecuritySettings.CONF_SEC_TITLE')">
      <b-row cols="2">
        <b-col
          ><label>{{
            $t('pageSecuritySettings.CONF_LEGNED_SSL_CIPHER_POLICY_CTL')
          }}</label></b-col
        >
        <b-col></b-col>
      </b-row>
      <b-row cols="2">
        <b-col md="3"
          ><label>{{
            $t('pageSecuritySettings.CONF_SSL_CIPHER_MODE')
          }}</label></b-col
        >
        <b-col>
          <select v-model="cipherSelected">
            <option
              v-for="(type, prop) in cipherType"
              :key="prop"
              :value="prop"
            >
              {{ type }}
            </option>
          </select>
        </b-col>
      </b-row>
      <b-row cols="2">
        <b-col
          ><label>{{
            $t('pageSecuritySettings.CONF_LEGEND_IP_BLOCKING')
          }}</label></b-col
        >
        <b-col></b-col>
      </b-row>
      <b-row cols="2">
        <b-col md="3"
          ><label>{{
            $t('pageSecuritySettings.CONF_LOGIN_STR_IP_BLOCK_ENABLE')
          }}</label></b-col
        >
        <b-col
          ><b-form-checkbox v-model="enIPBlocking" switch></b-form-checkbox
        ></b-col>
      </b-row>
      <b-row cols="2">
        <b-col md="3"
          ><label>{{
            $t('pageSecuritySettings.CONF_LOGIN_STR_FAILED_ATTEMPTS')
          }}</label></b-col
        >
        <b-col
          ><input v-model="attempts" type="text" :disabled="!enIPBlocking"
        /></b-col>
      </b-row>
      <b-row cols="2">
        <b-col md="3"
          ><label>{{
            $t('pageSecuritySettings.CONF_LOGIN_STR_ATTEMPT_TIME')
          }}</label></b-col
        >
        <b-col
          ><input v-model="attInterval" type="text" :disabled="!enIPBlocking"
        /></b-col>
      </b-row>
      <b-row cols="2">
        <b-col md="3"
          ><label>{{
            $t('pageSecuritySettings.CONF_LOGIN_STR_LOCKOUT_TIME')
          }}</label></b-col
        >
        <b-col
          ><input v-model="lockTime" type="text" :disabled="!enIPBlocking"
        /></b-col>
      </b-row>
      <b-row cols="2">
        <b-col md="3"
          ><label>{{
            $t('pageSecuritySettings.CONF_LEGEND_PORT_SETTING')
          }}</label></b-col
        >
        <b-col></b-col>
      </b-row>
      <b-row cols="2">
        <b-col md="3"
          ><label>{{
            $t('pageSecuritySettings.CONF_LOGIN_STR_HTTP_SEC_PORT')
          }}</label></b-col
        >
        <b-col>
          <input v-model="httpsport" type="text" />
        </b-col>
      </b-row>
      <b-row cols="2">
        <b-col
          ><label>{{
            $t('pageSecuritySettings.CONF_LEGEND_NETWORK_SERVICES')
          }}</label></b-col
        >
        <b-col></b-col>
      </b-row>
      <b-row cols="2">
        <b-col md="3"
          ><label>{{
            $t('pageSecuritySettings.CONF_LOGIN_STR_HTTP_SERVICE')
          }}</label></b-col
        >
        <b-col
          ><b-form-checkbox v-model="enHttps" switch></b-form-checkbox
        ></b-col>
      </b-row>
      <b-row cols="2">
        <b-col md="3"
          ><label>{{
            $t('pageSecuritySettings.LANG_COMMON_WEBUI')
          }}</label></b-col
        >
        <b-col
          ><b-form-checkbox
            v-model="enWebUI"
            switch
            :disabled="!enHttps"
          ></b-form-checkbox
        ></b-col>
      </b-row>
      <b-row cols="2">
        <b-col md="3"
          ><label>{{
            $t('pageSecuritySettings.CONF_LOGIN_STR_REDFISH_SERVICE')
          }}</label></b-col
        >
        <b-col
          ><b-form-checkbox
            v-model="enRedfish"
            switch
            :disabled="!enHttps"
          ></b-form-checkbox
        ></b-col>
      </b-row>
      <b-row cols="2">
        <b-col md="3"
          ><label>{{
            $t('pageSecuritySettings.CONF_LOGIN_STR_RMCP_SERVICE')
          }}</label></b-col
        >
        <b-col
          ><b-form-checkbox v-model="enIPMI" switch></b-form-checkbox
        ></b-col>
      </b-row>
      <b-button variant="primary" @click="ConfigSave">
        {{ $t('global.action.save') }}
      </b-button>
      <b-button variant="secondary" @click="clearConfigSave">
        {{ $t('global.action.clear') }}
      </b-button>
    </page-section>
    <pam-auth-order />
  </b-container>
</template>
<script>
import PageTitle from '@/components/Global/PageTitle';

import PageSection from '@/components/Global/PageSection';
import PamAuthOrder from './PamAuthOrder';
import {
  CipherParser,
  NETServiceParser,
  HTTPSPortParser,
  IPBlockingParser,
} from '@/env/insyde/components/Mixins/SecuritySettingsParserMixin';

export default {
  name: 'SecuritySettings',
  components: {
    PageTitle,
    PageSection,
    PamAuthOrder,
  },

  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
  data() {
    return {
      httpsport: '',
      lockTime: '',
      attInterval: '',
      attempts: '',
      enIPMI: true,
      enRedfish: true,
      enWebUI: true,
      enHttps: true,
      enIPBlocking: true,
      cipherSelected: 'advanced',
      cipherType: {
        advanced: this.$t(
          'pageSecuritySettings.CONF_SSL_CIPHER_POLICY_ADVANCED'
        ),
        broad: this.$t('pageSecuritySettings.CONF_SSL_CIPHER_POLICY_BROAD'),
        wedest: this.$t('pageSecuritySettings.CONF_SSL_CIPHER_POLICY_WIDEST'),
        legacy: this.$t('pageSecuritySettings.CONF_SSL_CIPHER_POLICY_LEGACY'),
      },
    };
  },
  computed: {
    getcipherstate() {
      return CipherParser(this.$store.getters['securitysettings/cipher']);
    },
    getnetsvc() {
      return NETServiceParser(this.$store.getters['securitysettings/service']);
    },
    gethttpsport() {
      return HTTPSPortParser(this.$store.getters['securitysettings/ports']);
    },
    getblockingstate() {
      return IPBlockingParser(
        this.$store.getters['securitysettings/userblockout']
      );
    },
  },
  created() {
    const settings = this;
    settings.startLoader();
    Promise.all([
      settings.$store.dispatch('securitysettings/getUserBlockout').then(() => {
        settings.showIPBlockInfo(settings.getblockingstate);
      }),
      settings.$store.dispatch('securitysettings/getHttpsPort').then(() => {
        settings.showHTTPSPort(settings.gethttpsport);
      }),
      settings.$store.dispatch('securitysettings/getnetservice').then(() => {
        settings.showNETState(settings.getnetsvc);
      }),
      settings.$store.dispatch('securitysettings/getcipherctl').then(() => {
        settings.showCipherState(settings.getcipherstate.type);
      }),
    ]).finally(() => settings.endLoader());
  },
  methods: {
    showCipherState(typestring) {
      const settings = this;
      settings.cipherSelected = typestring.toLowerCase();
    },
    showNETState(serviceobj) {
      const settings = this;
      settings.enHttps = serviceobj.httpsvc;
      settings.enWebUI = serviceobj.webuisvc;
      settings.enRedfish = serviceobj.redfishsvc;
      settings.enIPMI = serviceobj.ipmioverlansvc;
    },
    showHTTPSPort(portstr) {
      const settings = this;
      settings.httpsport = portstr;
    },
    showIPBlockInfo(blockinfo) {
      const settings = this;
      settings.enIPBlocking = blockinfo.blocking;
      settings.attempts = blockinfo.badnumoftime.toString();
      settings.attInterval = blockinfo.failinterval.toString();
      settings.lockTime = blockinfo.lockouttime.toString();
    },
    clearConfigSave() {
      const settings = this;
      settings.$bvModal
        .msgBoxConfirm(
          settings.$t('pageSecuritySettings.LANG_MODALERT_CLEAR_CONFIRM'),
          {
            title: `${settings.$t('global.action.confirm')} ?`,
          }
        )
        .then((confirmed) => {
          if (confirmed) {
            settings.showIPBlockInfo(settings.getblockingstate);
            settings.showHTTPSPort(settings.gethttpsport);
            settings.showNETState(settings.getnetsvc);
            settings.showCipherState(settings.getcipherstate.type);
          }
        });
    },
    ConfigSave() {
      const config = this;
      config.startLoader();
      if (config.gethttpsport != config.httpsport)
        config.$bvModal
          .msgBoxConfirm(
            config.$t('pageSecuritySettings.CONF_LOGIN_PORT_WARN'),
            {
              title: `${config.$t('global.action.confirm')} ?`,
            }
          )
          .then((confirmed) => {
            if (confirmed) {
              config.$store
                .dispatch(
                  'securitysettings/confighttpsport',
                  parseInt(config.httpsport)
                )
                .then((success) => {
                  config.successToast(success);
                })
                .catch((message) => {
                  config.errorToast(message);
                });
            }
          });
      let configObj = {
        DISABLED_HTTP_SERVICE: !config.enHttps,
        DISABLED_REDFISH_SERVICE: !config.enRedfish,
        DISABLED_RMCP_SERVICE: !config.enIPMI,
        DISABLED_WEBUI_SERVICE: !config.enWebUI,
        ENABLED_HTTP_SERVICE: config.enHttps,
        ENABLED_REDFISH_SERVICE: config.enRedfish,
        ENABLED_RMCP_SERVICE: config.enIPMI,
        ENABLED_WEBUI_SERVICE: config.enWebUI,
      };
      config.$store
        .dispatch('securitysettings/configsvc', configObj)
        .then(() => {
          if (
            config.getcipherstate.type.toLowerCase() != config.cipherSelected
          ) {
            config.$store
              .dispatch('securitysettings/configcipher', config.cipherSelected)
              .then((success) => {
                config.successToast(success);
              })
              .catch((message) => {
                config.errorToast(message);
              });
          }
        })
        .then(() => {
          if (
            config.enIPBlocking != config.getblockingstate.blocking ||
            config.attempts !=
              config.getblockingstate.badnumoftime.toString() ||
            config.attInterval !=
              config.getblockingstate.failinterval.toString() ||
            config.lockTime != config.getblockingstate.lockouttime.toString()
          ) {
            let payloadObj = {
              ATTEMPTINTERVAL: parseInt(config.attInterval),
              BADTHRESHOLD: parseInt(config.attempts),
              IPBLOCKING: config.enIPBlocking,
              LOCKOUTINTERVAL: parseInt(config.lockTime),
            };
            config.$store
              .dispatch('securitysettings/configipblocking', payloadObj)
              .then((success) => {
                config.successToast(success);
              })
              .catch((message) => {
                config.errorToast(message);
              });
          }
        })
        .then((success) => {
          config.successToast(success);
        })
        .catch((message) => {
          config.errorToast(message);
        })
        .finally(() => {
          config.endLoader();
        });
    },
  },
};
</script>
