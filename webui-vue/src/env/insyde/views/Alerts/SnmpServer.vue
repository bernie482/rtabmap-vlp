<template>
  <b-container fluid="x1" redfishsnmp>
    <page-section :section-title="$t('pageAlerts.CONF_AP_SNMP_SERVER')"
      ><b-row cols="2">
        <b-col md="2">
          <label>
            {{ $t('pageAlerts.CONFALERT_SNMP_SERVER_ENABLE') }}
          </label>
        </b-col>
        <b-col>
          <b-form-checkbox
            v-model="ensnmp"
            switch
            @change="enabledChange"
          ></b-form-checkbox>
        </b-col>
      </b-row>
      <b-row v-show="ensnmp" cols="2">
        <b-col md="2">
          <label>
            {{ $t('pageAlerts.CONFALERT_SNMP_SERVER_V1_V2C_ENABLE') }}
          </label>
        </b-col>
        <b-col>
          <b-form-checkbox v-model="env1v2c" switch></b-form-checkbox>
        </b-col>
      </b-row>
      <b-row v-show="ensnmp" cols="2">
        <b-col md="2">
          <label>
            {{ $t('pageAlerts.CONFALERT_SNMP_SERVER_RO_COMM_STR') }}
          </label>
        </b-col>
        <b-col>
          <input
            v-model="readonlycommstr"
            type="text"
            :style="
              setStyle(
                readonlycommstr,
                readonlycommstr,
                $v.readonlycommstr.$invalid
              )
            "
            class="textfield"
            @change="$v.readonlycommstr.$touch()"
          />
        </b-col>
      </b-row>
      <b-row v-show="ensnmp" cols="2">
        <b-col md="2">
          <label>
            {{ $t('pageAlerts.CONFALERT_SNMP_SERVER_RW_COMM_STR') }}
          </label>
        </b-col>
        <b-col>
          <input
            v-model="readwritecommstr"
            type="text"
            :style="
              setStyle(
                readwritecommstr,
                readwritecommstr,
                $v.readwritecommstr.$invalid
              )
            "
            class="textfield"
            @change="$v.readwritecommstr.$touch()"
          />
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
import { snmpsvcParser } from '@/env/insyde/components/Mixins/AlertsTableParserMixin';
import { required, maxLength, minLength } from 'vuelidate/lib/validators';

export default {
  name: 'SnmpServer',
  components: {
    PageSection,
  },

  props: {
    redfishsnmp: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      ensnmp: false,
      env1v2c: false,
      readonlycommstr: '',
      readwritecommstr: '',
      snmpobj: {},
    };
  },
  validations: {
    readonlycommstr: {
      required,
      maxLength: maxLength(32),
      minLength: minLength(1),
    },
    readwritecommstr: {
      required,
      maxLength: maxLength(32),
      minLength: minLength(1),
    },
  },
  computed: {
    getSNMPServer() {
      return snmpsvcParser(this.$store.getters['alerts/snmpsvc']);
    },
  },
  watch: {
    redfishsnmp: function (value) {
      if (value == null) return;
      const svc = this;
      svc.snmpobj = value;
      svc.showSNMPSVCStatus(svc.snmpobj);
    },
  },
  created() {},
  methods: {
    setStyle(elm_form, elm_src, invalid) {
      //console.log('elm_form=',elm_form, elm_src);
      return invalid ? { 'border-color': '#ff0000' } : {};
    },
    showSNMPSVCStatus(svcdata) {
      const svc = this;
      svc.ensnmp = svcdata?.enable ?? false;
      svc.env1v2c = svcdata?.enablev1v2c ?? false;
      svc.readwritecommstr = svcdata?.readwritestr ?? '';
      svc.readonlycommstr = svcdata?.readonlystr ?? '';
    },
    enabledChange() {
      const svc = this;
      svc.$bvModal
        .msgBoxConfirm(
          svc.ensnmp
            ? svc.$t('pageAlerts.CONFALERT_SNMP_SERVER_DISABLE_WARNING')
            : svc.$t('pageAlerts.CONFALERT_SNMP_SERVER_ENABLE_WARNING'),
          {
            title: svc.$t('global.action.confirm'),
          }
        )
        .then((confirmed) => {
          if (confirmed) {
            svc.saveConfig();
          } else {
            svc.showSNMPSVCStatus(svc.snmpobj);
          }
        });
    },
    saveConfig() {
      const snmpsrv = this;
      let dataObj = {
        enable: snmpsrv.ensnmp,
        env1v2c: snmpsrv.env1v2c,
        readstr: snmpsrv.readonlycommstr,
        writestr: snmpsrv.readwritecommstr,
      };
      snmpsrv.startLoader();
      snmpsrv.$store
        .dispatch('alerts/patchSNMPSVC', dataObj)
        .then((success) => {
          snmpsrv.$store
            .dispatch('alerts/getSNMPsvc')
            .then(() => {
              snmpsrv.$emit('update', snmpsrv.getSNMPServer ?? null);
              snmpsrv.successToast(success);
            })
            .catch((message) => {
              snmpsrv.errorToast(message);
            })
            .finally(() => {
              snmpsrv.endLoader();
            });
        })
        .catch((message) => {
          snmpsrv.errorToast(message);
          snmpsrv.showSNMPSVCStatus(snmpsrv.snmpobj);
          snmpsrv.endLoader();
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
