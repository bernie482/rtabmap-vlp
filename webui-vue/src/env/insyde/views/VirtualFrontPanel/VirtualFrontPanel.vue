<template>
  <b-container fluid="x1">
    <page-title />
    <page-section
      :section-title="$t('pageVirtualFrontPanel.S_POWER_CONTROL_CAPTION')"
    >
      <b-row>
        <b-col v-model="powerState" sm="auto" md="auto">
          <label v-if="powerState != 1" id="current-state" class="state-off">
            {{ $t('pageVirtualFrontPanel.S_POWER_CONTROL_STATUS_OFF') }}
          </label>
          <label v-else id="current-state" class="state-on">
            {{ $t('pageVirtualFrontPanel.S_POWER_CONTROL_STATUS_ON') }}
          </label>
        </b-col>
      </b-row>
      <b-row>
        <b-col class="custom-radio-wrapper">
          <b-form-radio
            v-model="poweract"
            name="power"
            value="reset"
            :disabled="normalDisable"
          >
            {{ `${$t('pageVirtualFrontPanel.S_POWER_CONTROL_RESET')}` }}
          </b-form-radio>
        </b-col>
      </b-row>
      <b-row>
        <b-col class="custom-radio-wrapper">
          <b-form-radio
            v-model="poweract"
            name="power"
            value="nmi"
            :disabled="normalDisable"
          >
            {{ `${$t('pageVirtualFrontPanel.S_POWER_CONTROL_PULSE_DIAG')}` }}
          </b-form-radio>
        </b-col>
      </b-row>
      <b-row>
        <b-col class="custom-radio-wrapper">
          <b-form-radio
            v-model="poweract"
            name="power"
            value="off"
            :disabled="normalDisable"
          >
            {{ `${$t('pageVirtualFrontPanel.S_POWER_CONTROL_IMMOFF')}` }}
          </b-form-radio>
        </b-col>
      </b-row>
      <b-row>
        <b-col class="custom-radio-wrapper">
          <b-form-radio
            v-model="poweract"
            name="power"
            value="shutdown"
            :disabled="normalDisable"
          >
            {{
              `${$t('pageVirtualFrontPanel.S_POWER_CONTROL_GRACEFUL_SHUTDOWN')}`
            }}
          </b-form-radio>
        </b-col>
      </b-row>
      <b-row>
        <b-col class="custom-radio-wrapper">
          <b-form-radio
            v-model="poweract"
            name="power"
            value="on"
            :disabled="!normalDisable"
          >
            {{ `${$t('pageVirtualFrontPanel.S_POWER_CONTROL_ON')}` }}
          </b-form-radio>
        </b-col>
      </b-row>
      <b-row>
        <b-col class="custom-radio-wrapper">
          <b-form-radio
            v-model="poweract"
            name="power"
            value="cycle"
            :disabled="normalDisable"
          >
            {{ `${$t('pageVirtualFrontPanel.S_POWER_CONTROL_CYCLE')}` }}
          </b-form-radio>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <b-button variant="primary" @click="ConfigSave">
            {{ $t('pageVirtualFrontPanel.S_POWER_CONTROL_ACTION') }}
          </b-button>
        </b-col>
      </b-row>
    </page-section>
    <page-section
      :section-title="$t('pageVirtualFrontPanel.CHASSIS_IDENTIFY_UID_CAPTION')"
    >
      <chassis-identify-control :uid="uid" />
    </page-section>
  </b-container>
</template>

<script>
import PageTitle from '@/components/Global/PageTitle';

import PageSection from '@/components/Global/PageSection';
import ChassisIdentifyControl from './ChassisIdentifyControl';
export default {
  name: 'VirtualFrontPanel',
  components: {
    PageTitle,
    PageSection,
    ChassisIdentifyControl,
  },

  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
  data() {
    return {
      uid: 0,
      normalDisable: false,
      poweract: 'on',
      allStatus: {},
      powerState: 0,
    };
  },
  computed: {},
  watch: {
    '$store.state.ws.status.LED_POWER': function () {
      this.configPowerState(this.$store.getters['ws/status']);
    },
    '$store.state.ws.status.LED_UID': function () {
      this.configUIDState(this.$store.getters['ws/status']);
    },
  },
  created() {
    //console.log(this.$store.getters['ws/status']);
    const vfp = this;
    vfp.configPowerState(vfp.$store.getters['ws/status']);
    vfp.configUIDState(vfp.$store.getters['ws/status']);
  },
  methods: {
    configUIDState(state) {
      const vfp = this;
      vfp.allStatus = state;
      vfp.uid = parseInt(vfp.allStatus?.LED_UID);
    },
    configPowerState(state) {
      const vfp = this;
      vfp.allStatus = state;
      vfp.allStatus?.LED_POWER != '0'
        ? (vfp.powerState = 1)
        : (vfp.powerState = 0);
      vfp.allStatus?.LED_POWER != '0'
        ? (vfp.normalDisable = false)
        : (vfp.normalDisable = true);
      vfp.poweract = vfp.allStatus?.LED_POWER != '0' ? 'shutdown' : 'on';
    },
    ConfigSave() {
      const vfp = this;
      let configOBJ = {};
      switch (vfp.poweract) {
        case 'on':
          configOBJ['powerControl'] = 'powerUp';
          break;
        case 'off':
          configOBJ['powerControl'] = 'powerDown';
          break;
        case 'reset':
          configOBJ['powerControl'] = 'hardReset';
          break;
        case 'shutdown':
          configOBJ['powerControl'] = 'softShutdown';
          break;
        case 'nmi':
          configOBJ['powerControl'] = 'pulseDiagnosis';
          break;
        case 'cycle':
          configOBJ['powerControl'] = 'powerCycle';
          break;
      }
      vfp.startLoader();
      vfp.$store
        .dispatch('vfp/postHostState', configOBJ)
        .then(() => {
          let rsp = vfp.$store.getters['vfp/result'];
          if (rsp?.result != 'success') {
            vfp.errorToast(rsp?.msg);
          } else {
            vfp.successToast();
          }
        })
        .finally(() => {
          vfp.endLoader();
        });
    },
  },
};
</script>

<style lang="scss" scoped>
#current-state {
  font-size: 16px;
  margin-bottom: 12px;
  color: #9e9e9e;
  cursor: default;
}
#current-state.state-on {
  color: #24bd62;
}
#current-state.state-off {
  color: #990000;
}
.custom-radio-wrapper {
  display: block;
  height: 30px;
  line-height: 30px;
}
</style>
