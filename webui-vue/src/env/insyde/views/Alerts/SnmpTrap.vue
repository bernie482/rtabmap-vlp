<template>
  <b-container fluid="x1" snmptrap>
    <page-section :section-title="$t('pageAlerts.snmptrap')">
      <b-row>
        <b-col md="2">
          <label>{{ $t('pageAlerts.CONFALERT_LANCHANNEL') }}</label>
        </b-col>
        <b-col md="1">
          <select v-model="chn" :disabled="failover" @change="chnChange">
            <option
              v-for="(items, idx) in trapdataArr"
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
      <b-row align-v="center" cols="4">
        <b-col md="2">
          <label>{{ $t('pageAlerts.CONFALERT_SNMP_TRAP_SRV') }}</label>
        </b-col>
        <b-col v-for="(val, prop, index) in trapRev" :key="index" md="1">
          <b-form-radio v-model="trapVer" name="trap-radio" :value="val">
            {{
              `${$t('pageAlerts.CONFALERT_SNMP_TRAP_RE' + prop.toUpperCase())}`
            }}
          </b-form-radio>
        </b-col>
      </b-row>
      <b-row v-show="trapVer == '0' || trapVer == '1'" align-v="center">
        <b-col md="2">
          <label>{{ $t('pageAlerts.CONFALERT_SNMP_TRAP_COMM_STR') }}</label>
        </b-col>
        <b-col md="1">
          <input
            v-model="commstr"
            type="text"
            :style="setStyle(commstr, commstr, $v.commstr.$invalid)"
            class="textfield"
            @change="$v.commstr.$touch()"
          />
        </b-col>
      </b-row>
      <b-row v-show="trapVer == '3'">
        <b-col md="2">
          <label>{{ $t('pageAlerts.CONFALERT_SNMP_TRAP_USER_NAME') }}</label>
        </b-col>
        <b-col md="1">
          <input
            v-model="username"
            type="text"
            :style="setStyle(username, username, $v.username.$invalid)"
            class="textfield"
            @change="$v.username.$touch()"
          />
        </b-col>
      </b-row>
      <b-row v-show="trapVer == '3'" align-v="center">
        <b-col md="2">
          <label>{{ $t('pageAlerts.CONFALERT_SNMP_TRAP_AUTH_PROT') }}</label>
        </b-col>
        <b-col v-for="(val, key) in autoprotObj" :key="key" md="1">
          <b-form-radio v-model="authprot" name="authprot-radio" :value="val">
            {{ `${$t('pageAlerts.CONFALERT_SNMP_TRAP_' + key)}` }}
          </b-form-radio>
        </b-col>
      </b-row>
      <b-row v-show="trapVer == '3'">
        <b-col md="2">
          <label>{{ $t('pageAlerts.CONFALERT_SNMP_TRAP_AUTH_PASPHA') }}</label>
        </b-col>
        <b-col md="1">
          <input
            v-model="authphrase"
            type="text"
            :style="setStyle(authphrase, authphrase, $v.authphrase.$invalid)"
            class="textfield"
            @change="$v.authphrase.$touch()"
          />
        </b-col>
      </b-row>
      <b-row v-show="trapVer == '3'">
        <b-col md="2">
          <label>{{ $t('pageAlerts.CONFALERT_SNMP_TRAP_SEC_LEVEL') }}</label>
        </b-col>
        <b-col md="1">
          <b-form-radio v-model="seclv" name="seclev-radio" value="nopriv">
            {{ $t('pageAlerts.CONFALERT_SNMP_TRAP_AUTHNOPRIV') }}
          </b-form-radio>
        </b-col>
        <b-col md="1">
          <b-form-radio v-model="seclv" name="seclev-radio" value="priv">
            {{ $t('pageAlerts.CONFALERT_SNMP_TRAP_AUTHPRIV') }}
          </b-form-radio>
        </b-col>
      </b-row>
      <b-row v-show="seclv == 'priv' && trapVer == '3'">
        <b-col md="2">
          <label>{{ $t('pageAlerts.CONFALERT_SNMP_TRAP_PRIV_PROT') }}</label>
        </b-col>
        <b-col md="1">
          <b-form-radio v-model="privprot" name="privprot-radio" value="aes">
            {{ $t('pageAlerts.CONFALERT_SNMP_TRAP_AES') }}
          </b-form-radio>
        </b-col>
        <b-col md="1">
          <b-form-radio v-model="privprot" name="privprot-radio" value="des">
            {{ $t('pageAlerts.CONFALERT_SNMP_TRAP_DES') }}
          </b-form-radio>
        </b-col>
      </b-row>
      <b-row v-show="seclv == 'priv' && trapVer == '3'">
        <b-col md="2">
          <label>{{ $t('pageAlerts.CONFALERT_SNMP_TRAP_PRIV_PASPHA') }}</label>
        </b-col>
        <b-col md="1">
          <input
            v-model="privphrase"
            type="text"
            :style="setStyle(privphrase, privphrase, $v.privphrase.$invalid)"
            class="textfield"
            @change="$v.privphrase.$touch()"
          />
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <b-button variant="primary" type="button" @click="snmpTrapConfigSave">
            {{ $t('global.action.saveSettings') }}
          </b-button>
        </b-col>
      </b-row>
    </page-section>
  </b-container>
</template>

<script>
import PageSection from '@/components/Global/PageSection';
import { snmptrapParser } from '@/env/insyde/components/Mixins/AlertsTableParserMixin';
import { required, maxLength, minLength } from 'vuelidate/lib/validators';

export default {
  name: 'SnmpTrap',
  components: {
    PageSection,
  },

  props: {
    snmptrap: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      autoprotObj: {
        MD5: 1,
        SHA96: 2,
        SHA224: 3,
        SHA256: 4,
        SHA384: 5,
        SHA512: 6,
      },
      failover: false,
      act_chn: 1,
      trapRev: {
        v1: 0,
        v2c: 1,
        v3: 3,
      },
      chn: '1',
      trapVer: '0',
      commstr: '',
      username: '',
      authprot: '',
      authphrase: '',
      seclv: '',
      privprot: '',
      privphrase: '',
      trapdataArr: [],
    };
  },
  validations: {
    commstr: {
      required: required,
      maxLength: maxLength(18),
    },
    username: {
      required: required,
      maxLength: maxLength(10),
    },
    authphrase: {
      required: required,
      maxLength: maxLength(12),
      minLength: minLength(8),
    },
    privphrase: {
      required: required,
      maxLength: maxLength(12),
      minLength: minLength(8),
    },
  },
  computed: {
    snmptrapinfo() {
      return snmptrapParser(this.$store.getters['alerts/trapconf']);
    },
  },
  watch: {
    snmptrap: function (value) {
      //console.log('SNMP:trap data = ', value);
      if (value == null) return;
      const trap = this;
      trap.failover = value.failover;
      trap.act_chn = value.actchn;
      trap.chn = trap.act_chn.toString();
      trap.trapdataArr = value.trapArr;
      trap.showTRAPInfo(trap.trapdataArr);
    },
  },
  created() {},
  methods: {
    setStyle(elm_form, elm_src, invalid) {
      //console.log('elm_form=',elm_form, elm_src);
      return invalid ? { 'border-color': '#ff0000' } : {};
    },
    chnChange() {
      this.showTRAPInfo(this.trapdataArr);
    },
    showTRAPInfo(trapArray) {
      const trap = this;
      let IdxOfArray = 0;
      trapArray.forEach((d, idx) => {
        if (d.channel != parseInt(trap.chn)) {
          return true; // continue
        } else {
          IdxOfArray = idx;
          return false;
        }
      });

      trap.trapVer = trapArray[IdxOfArray].version.toString();
      trap.commstr = trapArray[IdxOfArray].communityString;
      trap.username = trapArray[IdxOfArray].username;
      let authprot = trapArray[IdxOfArray]?.authentication?.protocol ?? 0;
      trap.authprot = authprot.toString();
      trap.authphrase = atob(
        trapArray[IdxOfArray]?.authentication?.passphrase ?? ''
      );
      let seclevel = trapArray[IdxOfArray]?.securityLevel ?? 0;
      if (seclevel == 1) {
        trap.seclv = 'nopriv';
      } else if (seclevel == 3) {
        trap.seclv = 'priv';
      }
      let priprot = trapArray[IdxOfArray]?.privacy?.protocol ?? 0;
      if (priprot == 1) {
        trap.privprot = 'aes';
      } else if (priprot == 2) {
        trap.privprot = 'des';
      }
      trap.privphrase = atob(trapArray[IdxOfArray]?.privacy?.passphrase ?? '');
    },
    snmpTrapConfigSave() {
      let trapConf = this;
      let trapdata = {
        channel: parseInt(trapConf.chn),
        version: parseInt(trapConf.trapVer),
      };
      if (trapConf.trapVer === '3') {
        trapdata['username'] = trapConf.username;
        let seculevel = (trapdata['securityLevel'] =
          trapConf.seclv == 'nopriv' ? 1 : 3);
        let authProt = (trapdata['authentication'] = {});
        authProt['passphrase'] = btoa(trapConf.authphrase); // encode base64
        authProt['protocol'] = parseInt(trapConf.authprot);
        if (seculevel != 1) {
          let privProt = (trapdata['privacy'] = {});
          privProt['passphrase'] = btoa(trapConf.privphrase); // encode base64
          privProt['protocol'] = trapConf.privprot == 'aes' ? 1 : 2;
        }
      } else if (trapConf.trapVer == '0' || trapConf.trapVer == '1') {
        trapdata['communityString'] = trapConf.commstr;
      }
      trapConf.$store
        .dispatch('alerts/trapConfigSave', trapdata)
        .then((success) => {
          trapConf.trapdataArr = trapConf.snmptrapinfo.trapArr;
          trapConf.showTRAPInfo(trapConf.trapdataArr);
          trapConf.successToast(success);
        });
    },
  },
};
</script>
<style scoped>
.textfield {
  font-size: 12px;
  line-height: 28px;
  position: relative;
  border: 2px solid #0077ae;
  border-radius: 3px;
  outline: none;
  padding: 0px 4px;
  min-width: 230px;
}
</style>
