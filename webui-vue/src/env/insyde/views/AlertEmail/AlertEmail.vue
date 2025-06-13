<template>
  <b-container fluid="x1">
    <page-title />
    <!--SMTP-->
    <page-section :section-title="$t('pageAlertEmail.smtp')">
      <b-row class="mb-1">
        <b-col cols="6" sm="5" md="4" lg="4" xl="2">
          <label>SMTP Server Domain/IPv4/IPv6 Address :</label>
        </b-col>
        <b-col cols="6" sm="5" md="4" lg="4" xl="2">
          <b-form-input v-model="domain" class="textfield" type="text">
          </b-form-input>
        </b-col>
      </b-row>
      <b-row class="mb-1">
        <b-col cols="6" sm="5" md="4" lg="4" xl="2">
          <label>Sender Email Address :</label>
        </b-col>
        <b-col cols="6" sm="5" md="4" lg="4" xl="2">
          <b-form-input v-model="mailaddr" class="textfield" type="text">
          </b-form-input>
        </b-col>
      </b-row>
      <b-row class="mb-1">
        <b-col cols="6" sm="5" md="4" lg="4" xl="2">
          <label>SMTP User :</label>
        </b-col>
        <b-col cols="6" sm="5" md="4" lg="4" xl="2">
          <b-form-input v-model="user" class="textfield" type="text">
          </b-form-input>
        </b-col>
      </b-row>
      <b-row class="mb-1">
        <b-col cols="6" sm="5" md="4" lg="4" xl="2">
          <label>SMTP Password :</label>
        </b-col>
        <b-col cols="6" sm="5" md="4" lg="4" xl="2">
          <input-password-toggle>
            <b-form-input
              v-model="pwd"
              class="textfield"
              type="password"
            ></b-form-input>
          </input-password-toggle>
        </b-col>
      </b-row>
      <b-row class="mb-1">
        <b-col cols="6" sm="5" md="4" lg="4" xl="2">
          <label>SMTP Server Port Number :</label>
        </b-col>
        <b-col cols="6" sm="5" md="4" lg="4" xl="2">
          <b-form-input v-model="port" class="textfield" type="text">
          </b-form-input>
        </b-col>
      </b-row>
      <b-row cols="3">
        <b-col md="2"><label>SMTP SSL/TLS Enable :</label></b-col>
        <b-col md="1">
          <b-form-radio v-model="ssltls" name="ssl-tls" value="1">
            On
          </b-form-radio>
        </b-col>
        <b-col>
          <b-form-radio v-model="ssltls" name="ssl-tls" value="0">
            Off
          </b-form-radio>
        </b-col>
      </b-row>
      <b-row cols="3">
        <b-col md="2"><label>StartTLS Enable :</label></b-col>
        <b-col md="1">
          <b-form-radio v-model="startls" name="StartTLS" value="1">
            On
          </b-form-radio>
        </b-col>
        <b-col>
          <b-form-radio v-model="startls" name="StartTLS" value="0">
            Off
          </b-form-radio>
        </b-col>
      </b-row>
      <b-row cols="4">
        <b-col md="2"><label>Authentication Method :</label></b-col>
        <b-col md="1">
          <b-form-radio v-model="auth" name="AuthMethod" value="1">
            On
          </b-form-radio>
        </b-col>
        <b-col md="1">
          <b-form-radio v-model="auth" name="AuthMethod" value="2">
            Manual
          </b-form-radio>
        </b-col>
        <b-col>
          <b-form-radio v-model="auth" name="AuthMethod" value="0">
            Off
          </b-form-radio>
        </b-col>
      </b-row>
      <b-row v-show="auth == 2" cols="2">
        <b-col md="2"></b-col>
        <b-col><label>appointed method</label></b-col>
      </b-row>
      <b-row v-show="auth == 2" cols="4">
        <b-col md="2"></b-col>
        <b-col md="1">
          <b-form-radio v-model="ameth" name="appointedMethod" value="3">
            plain
          </b-form-radio>
        </b-col>
        <b-col md="1">
          <b-form-radio v-model="ameth" name="appointedMethod" value="4">
            cram-md5
          </b-form-radio>
        </b-col>
        <b-col md="1">
          <b-form-radio v-model="ameth" name="appointedMethod" value="5">
            external
          </b-form-radio>
        </b-col>
      </b-row>
      <b-row v-show="auth == 2" cols="2">
        <b-col md="2"></b-col>
        <b-col>
          <b-form-radio v-model="ameth" name="appointedMethod" value="6">
            login
          </b-form-radio>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <b-button variant="secondary" @click="clearConfigSave">
            {{ $t('global.action.clear') }}
          </b-button>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <b-button variant="primary" @click="smtpConfigSave">
            {{ $t('global.action.saveSettings') }}
          </b-button>
        </b-col>
      </b-row>
    </page-section>
    <!--Certificate-->
    <smtp-cert />
  </b-container>
</template>

<script>
import PageTitle from '@/components/Global/PageTitle';

import PageSection from '@/components/Global/PageSection';
import InputPasswordToggle from '@/components/Global/InputPasswordToggle';
import SmtpCert from './SmtpCert';
import { SMTPsrvInfoParser } from '@/env/insyde/components/Mixins/AlertEmailTableParserMixin';

export default {
  name: 'AlertEmail',
  components: {
    InputPasswordToggle,
    PageTitle,
    PageSection,
    SmtpCert,
  },

  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
  data() {
    return {
      domain: '',
      mailaddr: '',
      user: '',
      pwd: '',
      port: '',
      smtpinfobj: {},
      ssltls: '',
      startls: '',
      auth: '',
      ameth: '',
    };
  },
  computed: {
    smtpsrvinfo() {
      return SMTPsrvInfoParser(this.$store.getters['alertemail/smtpsrvdata']);
    },
  },
  created() {
    const alertemail = this;
    alertemail.startLoader();
    Promise.all([
      alertemail.$store.dispatch('alertemail/getSMTPInfo').then(() => {
        alertemail.configSMTP(alertemail.smtpsrvinfo);
      }),
    ]).finally(() => alertemail.endLoader());
  },
  methods: {
    configSMTP(smtpdata) {
      let alertemail = this;
      alertemail.smtpinfobj = smtpdata.smtpobj;
      alertemail.domain = smtpdata?.domain != '0.0.0.0' ? smtpdata.domain : '';
      alertemail.mailaddr = smtpdata.senderaddr;
      alertemail.user = smtpdata.username;
      alertemail.pwd = smtpdata.username.length != 0 ? '***' : '';
      alertemail.port = smtpdata.portnum.toString();
      alertemail.ssltls = smtpdata.ssltls ? '1' : '0';
      alertemail.startls = smtpdata.startls ? '1' : '0';
      alertemail.auth = smtpdata.authmethod.toString();
      alertemail.ameth = smtpdata.method.toString();
    },
    clearConfigSave() {
      let configsmtp = this;
      configsmtp.startLoader();
      configsmtp.$bvModal
        .msgBoxConfirm(configsmtp.$t('pageAlertEmail.warningtodefault'), {
          title: configsmtp.$t('global.action.confirm'),
        })
        .then((confirmed) => {
          if (confirmed) {
            let configdata = {};
            configdata['domain'] = '';
            configdata['senderAddress'] = '';
            configdata['authUserName'] = '';
            configdata['port'] = 25;
            configdata['tlsEnable'] = false;
            configdata['startTlsEnable'] = false;
            configdata['authMethod'] = 0;
            configsmtp.$store
              .dispatch('alertemail/saveSMTPConfig', configdata)
              .then((success) => {
                configsmtp.successToast(success);
                configsmtp.setdefault();
              })
              .catch((message) => {
                configsmtp.errorToast(message);
              })
              .finally(() => {
                configsmtp.endLoader();
              });
          }
        });
    },
    setdefault() {
      let configsmtp = this;
      configsmtp.domain = '';
      configsmtp.mailaddr = '';
      configsmtp.user = '';
      configsmtp.pwd = '';
      configsmtp.port = '25';
      configsmtp.ssltls = false;
      configsmtp.startls = false;
      configsmtp.ameth = '';
    },
    smtpConfigSave() {
      let configsmtp = this;
      configsmtp.startLoader();
      let configdata = {};
      configdata['domain'] = configsmtp.domain;
      configdata['senderAddress'] = configsmtp.mailaddr;
      configdata['authUserName'] = configsmtp.user;
      if (configsmtp.pwd.length != 0 && configsmtp.pwd != '***') {
        configdata['authUserPwd'] = btoa(configsmtp.pwd);
      }
      configdata['port'] = parseInt(configsmtp.port);
      configdata['tlsEnable'] = configsmtp.ssltls == '1' ? true : false;
      configdata['startTlsEnable'] = configsmtp.startls != 0 ? true : false;
      if (configsmtp.auth == '2') {
        configdata['authMethod'] = parseInt(configsmtp.ameth);
      } else {
        configdata['authMethod'] = parseInt(configsmtp.auth);
      }
      configsmtp.$store
        .dispatch('alertemail/saveSMTPConfig', configdata)
        .then((success) => {
          configsmtp.successToast(success);
          configsmtp.$store
            .dispatch('alertemail/getSMTPInfo')
            .then(() => {
              configsmtp.configSMTP(configsmtp.smtpsrvinfo);
            })
            .finally(() => {
              configsmtp.endLoader();
            });
        })
        .catch((message) => {
          configsmtp.errorToast(message);
        });
    },
  },
};
</script>
<style lang="scss" scoped>
.textfield {
  font-size: 12px;
  line-height: 28px;
  position: relative;
  border: 2px solid #0077ae;
  border-radius: 3px;
  outline: none;
  padding: 0px 4px;
}
</style>
