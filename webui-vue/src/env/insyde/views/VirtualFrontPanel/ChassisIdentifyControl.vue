<template>
  <b-container fluid="x1">
    <page-section>
      <b-row>
        <b-col sm="auto" md="auto" lg="auto" xl="auto">
          <label>
            {{ $t('pageVirtualFrontPanel.S_POWER_CONTROL_UID_STATUS') }}
          </label>
        </b-col>
        <b-col sm="auto" md="auto" lg="auto" xl="auto">
          <label class="status">
            {{ uidStatus }}
          </label>
        </b-col>
      </b-row>
      <b-row>
        <b-col sm="auto" md="auto" lg="auto" xl="auto">
          <label>
            {{ $t('pageVirtualFrontPanel.S_POWER_CONTROL_UID_ACTION_LABEL') }}
          </label>
        </b-col>
      </b-row>
      <b-row>
        <b-col
          class="custom-radio-wrapper"
          sm="auto"
          md="auto"
          lg="auto"
          xl="auto"
        >
          <b-form-radio
            v-model="uidState"
            name="UID"
            value="off"
            @change="changedStyle"
          >
            {{ `${$t('pageVirtualFrontPanel.S_POWER_CONTROL_UID_OFF')}` }}
          </b-form-radio>
        </b-col>
      </b-row>
      <b-row>
        <b-col
          class="custom-radio-wrapper"
          sm="auto"
          md="auto"
          lg="auto"
          xl="auto"
        >
          <b-form-radio
            v-model="uidState"
            name="UID"
            value="on"
            @change="changedStyle"
          >
            {{ `${$t('pageVirtualFrontPanel.S_POWER_CONTROL_UID_ON')}` }}
          </b-form-radio>
        </b-col>
      </b-row>
      <b-row cols="3">
        <b-col
          sm="auto"
          md="auto"
          lg="auto"
          xl="auto"
          class="custom-radio-wrapper"
        >
          <b-form-radio
            v-model="uidState"
            name="UID"
            value="blinking"
            @change="changedStyle"
          >
            {{ `${$t('pageVirtualFrontPanel.S_POWER_CONTROL_UID_BLINK')}` }}
          </b-form-radio>
        </b-col>
        <b-col sm="auto" md="auto" lg="auto" xl="auto">
          <label id="lb_duration" class="ml-12 fc-disable-lbl">
            {{ `${$t('pageVirtualFrontPanel.S_POWER_CONTROL_UID_P4')}` }}
          </label>
          <input
            v-model.number="duration"
            class="mx-1 blue"
            type="number"
            min="0"
            max="255"
            :disabled="uidState != 'blinking'"
          />
        </b-col>
        <b-col sm="auto" md="auto" lg="auto" xl="auto">
          <label class="gray-info">
            {{ `1 ~ 254 Seconds, 0: Off , 255: Continuously` }}
          </label>
        </b-col>
      </b-row>
      <b-row>
        <b-col sm="auto" md="auto" lg="auto" xl="auto">
          <b-button variant="primary" @click="ConfigSave">
            {{ $t('pageVirtualFrontPanel.S_POWER_CONTROL_ACTION') }}
          </b-button>
        </b-col>
      </b-row>
    </page-section>
  </b-container>
</template>

<script>
import PageSection from '@/components/Global/PageSection';

export default {
  name: 'ChassisIdentifyControl',
  components: {
    PageSection,
  },

  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
  props: {
    uid: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      duration: 30,
      uidStatus: 'Off',
      uidState: '',
    };
  },
  computed: {},
  watch: {
    uid: {
      handler: function (value) {
        //console.log('watch uid: ', value);
        this.configUID(value);
      },
      immediate: true,
    },
  },
  created() {},
  methods: {
    changedStyle() {
      let elm = document.getElementById('lb_duration');
      elm.classList.add('fc-disable-lbl');
      if (this.uidState == 'blinking') {
        elm.classList.remove('fc-disable-lbl');
      }
    },
    configUID(leduid) {
      // 0: chassis identify state = Off
      // 1: chassis identify state = Temporary (timed) On (blink)
      // 2: chassis idenfity state = Indefinite On
      const iden = this;
      switch (leduid) {
        case 0:
          iden.uidStatus = 'Off';
          break;
        case 1:
          iden.uidStatus = 'Blinking';
          break;
        case 2:
          iden.uidStatus = 'On';
          break;
        default:
          iden.uidStatus = 'Off';
          break;
      }
    },
    ConfigSave() {
      const iden = this;
      let configOBJ = {};
      configOBJ['timeout'] = 30;
      switch (iden.uidState) {
        case 'on':
          configOBJ['state'] = 2;
          break;
        case 'off':
          configOBJ['state'] = 0;
          break;
        case 'blinking':
          configOBJ['state'] = 1;
          configOBJ['timeout'] = iden.duration;
          break;
      }
      iden.startLoader();
      iden.$store
        .dispatch('vfp/postUIDControl', configOBJ)
        .then(() => {
          let rsp = iden.$store.getters['vfp/result'];
          if (rsp?.result != 'success') {
            iden.errorToast(rsp?.msg);
          } else {
            iden.successToast();
          }
        })
        .finally(() => {
          iden.endLoader();
        });
    },
  },
};
</script>

<style lang="scss" scoped>
input[type='number'].blue {
  border: 1px solid #00608c;
  border-radius: 3px;
  padding: 3px 6px;
  font-size: 14px;
  font-weight: bold;
  line-height: 28px;
  color: #757575;
}
input[type='number'].blue:disabled {
  color: #9e9e9e;
  background-color: #f5f5f5;
  border-color: #e0e0e0;
  cursor: not-allowed;
}
input[type='number'].blue {
  padding: 3px 8px;
  cursor: default;
}
.gray-info {
  color: #b8b8b8;
}
.fc-disable-lbl {
  color: rgba(0, 0, 0, 0.25);
}
.ml-12 {
  margin-left: 8px;
}
.custom-radio-wrapper {
  display: block;
  height: 30px;
  line-height: 30px;
}
.status {
  margin-left: 8px;
  color: #0077ae;
  font-size: 14px;
}
</style>
