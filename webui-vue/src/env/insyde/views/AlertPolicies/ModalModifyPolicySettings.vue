<template>
  <b-modal
    id="modal-modify-policy"
    ref="modal"
    :title="$t('pageAlertPolicies.CONFALERT_POLICY_TABLE')"
    size="xl"
    fieldparm
    fieldvalue
  >
    <b-row cols="2">
      <b-col md="3">
        <label class="title">
          {{ $t('pageAlertPolicies.CONFALERT_POLICIES_GROUP_NUMBER') }}
        </label>
      </b-col>
      <b-col>
        <select v-model="groupNO" class="select">
          <option v-for="(val, idx) in gnumberMax" :key="idx" :value="val">
            {{ val + 1 }}
          </option>
        </select>
      </b-col>
    </b-row>
    <b-row cols="2">
      <b-col md="3">
        <label class="title">
          {{ $t('pageAlertPolicies.CONFALERT_POLICIES_ENABLE') }}
        </label>
      </b-col>
      <b-col>
        <b-form-checkbox v-model="alertEnable" switch></b-form-checkbox>
      </b-col>
    </b-row>
    <b-row cols="2">
      <b-col md="3">
        <label class="title">
          {{ $t('pageAlertPolicies.CONFALERT_POLICIES_ACTION') }}
        </label>
      </b-col>
      <b-col>
        <select v-model="plyact" class="select">
          <option v-for="(val, idx) in actionMax" :key="idx" :value="val">
            {{
              $t(
                'pageAlertPolicies.CONFALERT_POLICIES_ACTION_POLICY' +
                  val.toString(10)
              )
            }}
          </option>
        </select>
      </b-col>
    </b-row>
    <b-row cols="2">
      <b-col md="3">
        <label class="title">
          {{ $t('pageAlerts.CONFALERT_LANCHANNEL') }}
        </label>
      </b-col>
      <b-col>
        <select v-model="actChn" :disabled="failover" class="select">
          <option
            v-for="(items, idx) in nicInfo"
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
      <b-col md="3">
        <label class="title">
          {{ $t('pageAlertPolicies.CONFALERT_POLICIES_DESTINATION_SELECTOR') }}
        </label>
      </b-col>
      <b-col>
        <select v-model="destSelector" class="select">
          <option v-for="(val, id) in selectorMax" :key="id" :value="val">
            {{ val + 1 }}
          </option>
        </select>
      </b-col>
    </b-row>
    <b-row cols="2">
      <b-col md="3">
        <label class="title">
          {{
            $t('pageAlertPolicies.CONFALERT_POLICIES_EVENT_SPEC_ALERT_STRING')
          }}
        </label>
      </b-col>
      <b-col>
        <b-form-checkbox v-model="evtspcstring" switch></b-form-checkbox>
      </b-col>
    </b-row>
    <b-row cols="2">
      <b-col md="3">
        <label class="title">
          {{ $t('pageAlertPolicies.CONFALERT_POLICIES_ALERT_STRING_KEY') }}
        </label>
      </b-col>
      <b-col>
        <select v-model="stringskey" class="select">
          <option v-for="(val, idx) in keyMax" :key="idx" :value="val">
            {{ val + 1 }}
          </option>
        </select>
      </b-col>
    </b-row>
    <!--button-->
    <template #modal-footer="{ cancel }">
      <b-button variant="secondary" @click="cancel()">
        {{ $t('global.action.cancel') }}
      </b-button>
      <b-button variant="primary" @click="onOk">
        {{ $t('global.action.save') }}
      </b-button>
    </template>
  </b-modal>
</template>
<script>
export default {
  components: {},
  props: {
    fieldparm: {
      type: Object,
      default: null,
    },
    fieldvalue: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      ID: 1,
      destSelector: 0,
      plyact: 0,
      groupNO: 0,
      stringskey: 0,
      lanselected: 0,
      evtspcstring: false,
      alertEnable: false,
      failover: false,
      actChn: 1,
      nicInfo: [],
      selectorMax: [],
      keyMax: [],
      actionMax: [],
      gnumberMax: [],
    };
  },
  computed: {},
  watch: {
    fieldvalue: function (value) {
      //console.log('fieldvalue', value);
      if (value === null) return;
      this.ID = value?.entryNumber;
      this.actChn = value?.LANChn != 'N/A' ? value?.LANChn : 1;
      this.stringskey =
        value?.AlertStrKey != 'N/A' ? value?.AlertStrKey - 1 : 0;
      this.evtspcstring = value?.EvtSpecAlertStr != 'No' ? true : false;
      this.destSelector =
        value?.DESTSelector != 'N/A' ? value?.DESTSelector - 1 : 0;
      this.groupNO = value?.groupNumber != 'N/A' ? value?.groupNumber - 1 : 0;
      this.alertEnable = value?.enableAlert != 'No' ? true : false;
      let temp = value?.PolicyValue;
      this.plyact = (parseInt(temp.substr(5, 1), 16) & 0x7).toString();
    },
    fieldparm: function (value) {
      //console.log('fieldparm', value);
      if (value === null) return;
      this.gnumberMax = [...Array(value?.groupNumberMAX ?? 15).keys()];
      this.actionMax = value?.action ?? [...Array(5).keys()];
      this.failover = value?.failover ?? false;
      this.actChn = value?.workchn ?? 1;
      this.nicInfo = value?.nicinfo ?? [];
      this.selectorMax = [...Array(value?.selectorMAX ?? 5).keys()];
      this.keyMax = [...Array(value?.stringkeyMAX ?? 40).keys()];
    },
  },
  created() {},
  validations: {},
  methods: {
    handleSubmit() {
      let configObj = {
        ID: this.ID,
        groupNum: this.groupNO + 1,
        enable: this.alertEnable != true ? 0 : 1,
        action: parseInt(this.plyact),
        channel: this.actChn,
        selector: this.destSelector + 1,
        alertStrEnable: this.evtspcstring != true ? 0 : 1,
        stringKey: this.stringskey + 1,
      };
      //console.log('handleSubmit = ', configObj);
      this.$emit('ok', configObj);
      this.closeModal();
    },
    closeModal() {
      this.$nextTick(() => {
        this.$refs.modal.hide();
      });
    },
    onOk(bvModalEvt) {
      bvModalEvt.preventDefault();
      this.handleSubmit();
    },
  },
};
</script>
<style lang="scss" scoped>
label.title {
  position: relative;
  top: 2px;
  min-width: 250px;
  user-select: none;
  -o-user-select: none;
  -moz-user-select: -moz-none;
  -webkit-user-select: none;
}

.select:disabled {
  border-color: #696969;
  background-color: #ffffff;
  color: #000000;
  cursor: not-allowed;
}

.select {
  border: 2px solid #0077ae;
  padding: 2.5px 10px 6.5px;
  text-align: center;
  text-align-last: center;
  font-weight: normal;
  font-variant: normal;
  text-transform: none;
  border-radius: 5px;
  background-color: #ffffff;
  outline: none;
  width: 158px;
  cursor: pointer;
  font-size: 15px;
  min-width: 230px;
}

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

.fontsize {
  font-size: 12px;
}
</style>
