<template>
  <b-modal
    id="modal-global-pef"
    ref="modal"
    title="Global PEF Configuration"
    size="lg"
    glopefstatus
  >
    {{ $t('pageAlerts.glopefconfiglabel') }}
    <b-row cols="2">
      <b-col md="3">PEF Enable</b-col>
      <b-col>
        <select v-model="selected">
          <option value="glopefenable">Enable</option>
          <option value="glopefdisable">Disable</option>
        </select>
      </b-col>
    </b-row>
    <b-row cols="2">
      <b-col md="3">Log Event on Filter Action</b-col>
      <b-col>
        <b-form-checkbox v-model="eventaction" switch></b-form-checkbox>
      </b-col>
    </b-row>
    <b-row cols="4">
      <b-col md="3">PEF Action</b-col>
      <b-col><b-form-checkbox v-model="alert">Alert</b-form-checkbox></b-col>
      <b-col
        ><b-form-checkbox v-model="poweroff">Power Off</b-form-checkbox></b-col
      >
      <b-col><b-form-checkbox v-model="reset">Reset</b-form-checkbox></b-col>
    </b-row>
    <b-row cols="4">
      <b-col md="3"></b-col>
      <b-col
        ><b-form-checkbox v-model="powercycle"
          >Power Cycle</b-form-checkbox
        ></b-col
      >
      <b-col
        ><b-form-checkbox v-model="gracefuldown"
          >Graceful Shutdown</b-form-checkbox
        ></b-col
      >
      <b-col
        ><b-form-checkbox v-model="diaginterrupt"
          >Diagnostic Interrupt</b-form-checkbox
        ></b-col
      >
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
    glopefstatus: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      selected: 'glopefdisable',
      eventaction: false,
      alert: false,
      poweroff: false,
      reset: false,
      powercycle: false,
      gracefuldown: false,
      diaginterrupt: false,
    };
  },
  computed: {},
  watch: {
    glopefstatus: function (value) {
      if (value === null) return;
      this.selected = value.pefEnable ? 'glopefenable' : 'glopefdisable';
      this.eventaction = value.logEventOnAction;
      this.alert = value.pefAction & 1 ? true : false;
      this.poweroff = (value.pefAction >> 1) & 1 ? true : false;
      this.reset = (value.pefAction >> 2) & 1 ? true : false;
      this.powercycle = (value.pefAction >> 3) & 1 ? true : false;
      this.gracefuldown = (value.pefAction >> 4) & 1 ? true : false;
      this.diaginterrupt = (value.pefAction >> 5) & 1 ? true : false;
    },
  },
  validations: {},
  methods: {
    handleSubmit() {
      let glovar = this;
      let glopefstatus = {};
      let gloaction = 0;
      glopefstatus['pefEnable'] =
        glovar.selected == 'glopefenable' ? true : false;
      glopefstatus['logEventOnAction'] = glovar.eventaction;
      gloaction = glovar.diaginterrupt ? 1 : 0;
      gloaction <<= 1;
      gloaction |= glovar.gracefuldown ? 1 : 0;
      gloaction <<= 1;
      gloaction |= glovar.powercycle ? 1 : 0;
      gloaction <<= 1;
      gloaction |= glovar.reset ? 1 : 0;
      gloaction <<= 1;
      gloaction |= glovar.poweroff ? 1 : 0;
      gloaction <<= 1;
      gloaction |= glovar.alert ? 1 : 0;

      glopefstatus['pefAction'] = gloaction;
      glovar.$emit('ok', glopefstatus);
      glovar.closeModal();
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
<style>
.fontsize {
  font-size: 12px;
}
</style>
