<template>
  <b-modal
    id="modal-modify-pef"
    ref="modal"
    title="Modify PEF Configuration"
    size="xl"
    pefstate
    pefvalue
  >
    {{ $t('pageAlerts.modifypefsection') }}
    <b-row cols="2">
      <b-col md="3">Event Filter Enable</b-col>
      <b-col
        ><b-form-checkbox v-model="evenable" switch></b-form-checkbox
      ></b-col>
    </b-row>
    <b-row cols="2">
      <b-col md="3">Alert</b-col>
      <b-col
        ><b-form-checkbox v-model="alertenable" switch></b-form-checkbox
      ></b-col>
    </b-row>
    <b-row cols="4">
      <b-col md="3">Event Filter Action</b-col>
      <b-col md="2"
        ><b-form-checkbox v-model="poweroff" switch
          >Power Off</b-form-checkbox
        ></b-col
      >
      <b-col md="1"
        ><b-form-checkbox v-model="reset" switch>Reset</b-form-checkbox></b-col
      >
      <b-col
        ><b-form-checkbox v-model="powercycle" switch
          >Power Cycle</b-form-checkbox
        ></b-col
      >
    </b-row>
    <b-row cols="4">
      <b-col md="3"></b-col>
      <b-col md="3"
        ><b-form-checkbox v-model="gshutdown" switch
          >Graceful Shutdown</b-form-checkbox
        ></b-col
      >
      <b-col
        ><b-form-checkbox v-model="interrupt" switch
          >Diagnostic Interrupt</b-form-checkbox
        ></b-col
      >
    </b-row>
    <b-row cols="2">
      <b-col md="3">Sensor Type</b-col>
      <b-col>
        <select v-model="typeselected" @change="onChangedType($event)">
          <option disabled value="0">
            {{ $t('pageAlerts.LANG_SENSOR_SNRTYPE') }}
          </option>
          <option value="255">
            {{ $t('pageAlerts.LANG_COMMON_MATCH_ALL') }}
          </option>
          <option v-for="(val, idx) in stypeArr" :key="idx" :value="val">
            {{
              $t(
                'pageAlerts.LANG_SENSOR_SNRTYPE' +
                  parseInt(val).toString(16).toUpperCase()
              )
            }}
          </option>
          <option v-for="(val, index) in stypec0Arr" :key="index" :value="val">
            {{
              `${$t('pageAlerts.LANG_SENSOR_SNRTYPEC0')} (0x${parseInt(val)
                .toString(16)
                .toUpperCase()})`
            }}
          </option>
        </select>
      </b-col>
    </b-row>
    <b-row cols="2">
      <b-col md="3">Sensor Name</b-col>
      <b-col>
        <select v-model="nameselected" @change="onChangedName($event)">
          <option value="0">
            {{ $t('pageAlerts.LANG_MODALERT_NO_SENSOR') }}
          </option>
          <option value="255">
            {{ $t('pageAlerts.LANG_COMMON_MATCH_ALL') }}
          </option>
          <option v-for="(val, id) in snameArr" :key="id" :value="val.Number">
            {{ val.Name }}
          </option>
        </select>
      </b-col>
    </b-row>
    <!--assert condition-->
    <b-row cols="2">
      <b-col md="3">Assertion Condition</b-col>
      <b-col> </b-col>
    </b-row>
    <b-row v-for="(items, idx) in assertConditionArr" :key="idx" cols="2">
      <b-col md="3"></b-col>
      <b-col>
        <b-form-checkbox v-if="sensornumber == 255" v-model="items.assert">{{
          $t('pageAlerts.LANG_MODPEF_AC_DISCRETE_BIT' + idx)
        }}</b-form-checkbox>
        <b-form-checkbox
          v-else-if="sensornumber != 255 && sensornumber != 0 && ertype == 1"
          v-model="items.assert"
          >{{
            $t('pageAlerts.LANG_MODPEF_AC_THRESHOLD_BIT' + idx)
          }}</b-form-checkbox
        >
        <b-form-checkbox
          v-else-if="
            sensornumber != 255 &&
            sensornumber != 0 &&
            ertype >= 2 &&
            ertype <= 12
          "
          v-model="items.assert"
          >{{
            $t(
              'pageAlerts.LANG_MODPEF_ERTYPE' +
                parseInt(ertype).toString(16).toUpperCase() +
                '_DISCRETE_BIT' +
                idx
            )
          }}</b-form-checkbox
        >
        <b-form-checkbox
          v-else-if="
            sensornumber != 255 &&
            sensornumber != 0 &&
            ertype == 111 &&
            sensortype >= 0 &&
            sensortype <= 44
          "
          v-model="items.assert"
          >{{
            $t(
              'pageAlerts.LANG_MODPEF_ERTYPE6F_SENSORTYPE' +
                sensortype +
                '_DISCRETE_BIT' +
                idx
            )
          }}</b-form-checkbox
        >
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
import {
  getSensorSpecificOffsetLengthParser,
  getERTypeOffsetLengthParser,
} from '@/env/insyde/components/Mixins/AlertsTableParserMixin';

export default {
  components: {},
  props: {
    pefstate: {
      type: Object,
      default: null,
    },
    pefvalue: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      evenable: false,
      alertenable: false,
      poweroff: false,
      reset: false,
      powercycle: false,
      gshutdown: false,
      interrupt: false,
      sensortype: 0,
      sensornumber: '',
      assertvalue: 0,
      assertion_condition_len: 0,
      assertConditionArr: [],
      stypeArr: [],
      stypec0Arr: [],
      typeselected: '0',
      nameselected: '0',
      snameArr: [],
      constsnameArr: [],
      ertype: 0,
      pefno: 0,
    };
  },
  computed: {
    ERTypeOffset() {
      return getERTypeOffsetLengthParser(this.ertype);
    },
    SensorSpecificOffset() {
      return getSensorSpecificOffsetLengthParser(this.sensortype);
    },
  },
  watch: {
    pefvalue: function (value) {
      //console.log('pefvalue', value);
      this.pefno = value?.Number;
      let pefValue = value?.PefValue ?? 0;
      let pefData = {
        enable: parseInt(pefValue.substr(4, 2), 16),
        event_action: parseInt(pefValue.substr(6, 2), 16),
        sensor_type: parseInt(pefValue.substr(16, 2), 16),
        sensor_number: parseInt(pefValue.substr(18, 2), 16),
        assertion_condition: parseInt(
          pefValue.substr(24, 2) + pefValue.substr(22, 2),
          16
        ),
      };
      this.evenable = pefData.enable & 0x80 ? true : false;
      this.alertenable = pefData.event_action & 0x01 ? true : false;
      let evFilterAct = pefData.event_action & 0x3e;
      this.poweroff = evFilterAct & 0x2 ? true : false;
      this.reset = evFilterAct & 0x4 ? true : false;
      this.powercycle = evFilterAct & 0x8 ? true : false;
      this.gshutdown = evFilterAct & 0x10 ? true : false;
      this.interrupt = evFilterAct & 0x20 ? true : false;
      // sensor type
      this.sensortype = pefData.sensor_type;
      this.typeselected = pefData.sensor_type;
      // sensor name
      this.sensornumber = value?.SensorNumber;
      this.nameselected = pefData.sensor_number;
      // assert
      this.assertion_condition_len = this.SensorSpecificOffset.len;
      // rebuild sensor name option
      let currTypeSensors = this.constsnameArr;
      if (!(pefData.sensor_type == 0 || pefData.sensor_type == 255)) {
        currTypeSensors = this.constsnameArr.filter(function (sensor) {
          return sensor.SType === pefData.sensor_type;
        });
      }
      this.snameArr = currTypeSensors;

      let sensorChoosen = !(
        pefData.sensor_number == 0 || pefData.sensor_number == 255
      );
      let currSensor;
      if (sensorChoosen) {
        currSensor = this.constsnameArr.find(function (sensor) {
          return sensor.Number === pefData.sensor_number;
        });
        this.ertype = currSensor.ERType;
      }
      this.assertvalue = pefData.assertion_condition;
      //console.log('pefData.sensor_number= ', pefData.sensor_number, currSensor);
      this.buildAssertCondition(pefData.sensor_number, currSensor);
    },
    pefstate: function (value) {
      //console.log(value.sensors); // sensorType, sensors
      if (value === null) return;
      let tmp = [];
      let tmpc0 = [];
      value.sensorTypes
        .sort(function (a, b) {
          return a <= b ? -1 : 1;
        })
        .forEach(function (stype) {
          if (stype >= 192 && stype < 255) {
            //0xc0 0xff
            tmpc0.push(stype);
          } else {
            tmp.push(stype);
          }
        });
      this.stypeArr = tmp;
      this.stypec0Arr = tmpc0;
      // build sensor name select option for all.
      this.constsnameArr = this.snameArr = value.sensors;
    },
  },
  created() {},
  validations: {},
  methods: {
    onChangedType(value) {
      //console.log(value.target.value);
      let sensorNumber = this.sensornumber;
      this.sensortype = value.target.value;
      let sensorType = value.target.value;
      // rebuild sensor name selection
      let currTypeSensors = this.constsnameArr;
      if (!(sensorType == 0 || sensorType == 255)) {
        currTypeSensors = this.constsnameArr.filter(function (sensor) {
          return sensor.SType === parseInt(sensorType);
        });
      }
      this.snameArr = currTypeSensors;
      let sensorChoosen = !(sensorNumber == 0 || sensorNumber == 255);
      let currSensor;
      if (sensorChoosen) {
        currSensor = this.constsnameArr.find(function (sensor) {
          return sensor.Number === sensorNumber;
        });
        if (sensorType !== 255) {
          sensorNumber =
            currSensor !== undefined
              ? currSensor.SType == sensorType
                ? sensorNumber
                : 0
              : 0;
        }
        this.ertype = currSensor.ERType;
      }
      this.buildAssertCondition(sensorNumber, currSensor);
    },
    onChangedName(value) {
      let sensorType = this.sensortype;
      let sensorNumber = (this.sensornumber = parseInt(value.target.value));
      let sensorChoosen = !(sensorNumber == 0 || sensorNumber == 255);
      //console.log('selName= ', value.target.value, ' ', sensorChoosen);
      let currSensor;
      if (sensorChoosen) {
        currSensor = this.constsnameArr.find(function (sensor) {
          return sensor.Number === sensorNumber;
        });
        if (sensorType !== 255) {
          sensorNumber =
            currSensor !== undefined
              ? currSensor.SType == sensorType
                ? sensorNumber
                : 0
              : 0;
        }
        this.ertype = currSensor.ERType;
      }
      //console.log('currSensor= ', currSensor);
      this.buildAssertCondition(sensorNumber, currSensor);
    },
    switchSensorSpecific() {
      //console.log('switchSensorSpecific!!');
      let curEventLen = this.SensorSpecificOffset.len;
      let tmp = {};
      for (let i = 0; i < curEventLen; i++) {
        tmp = {};
        tmp['assert'] = this.assertvalue & (1 << i) ? true : false;
        this.assertConditionArr.push(tmp);
      }
    },
    switchERType() {
      //console.log('switchERType!!');
      let curEventLen = this.ERTypeOffset.len;
      let tmp = {};
      for (let i = 0; i < curEventLen; i++) {
        tmp = {};
        tmp['assert'] = this.assertvalue & (1 << i) ? true : false;
        this.assertConditionArr.push(tmp);
      }
    },
    switchThreshold() {
      //console.log('switchThreshold!!');
      let tmp = {};
      for (let i = 0; i < 12; i++) {
        tmp = {};
        tmp['assert'] = this.assertvalue & (1 << i) ? true : false;
        this.assertConditionArr.push(tmp);
      }
    },
    switchAllAssertion() {
      //console.log('switchAllAssertion!!');
      let tmp = {};
      for (let i = 0; i < 15; i++) {
        tmp = {};
        tmp['assert'] = this.assertvalue & (1 << i) ? true : false;
        this.assertConditionArr.push(tmp);
      }
    },
    buildAssertCondition(sensorNum, curSensor) {
      // build assert condition checkbox
      this.assertConditionArr = [];
      if (sensorNum == 0) {
        this.assertConditionArr = [];
      } else if (sensorNum == 255) {
        this.switchAllAssertion();
      } else {
        if (curSensor.ERType == 1) {
          // Threshold
          this.switchThreshold();
        } else if (curSensor.ERType >= 2 && curSensor.ERType <= 12) {
          // Generic
          this.switchERType();
        } else if (curSensor.ERType == 111) {
          // sensor-specific
          if (this.sensortype >= 0 && this.sensortype <= 44) {
            // match the sensor-type in ipmi-spec(Table 42-3)
            this.switchSensorSpecific();
          } else {
            this.switchAllAssertion();
          }
        } else {
          // oem, unspecified, error
          //console.log('oem, unspecified, error ERType= ', curSensor.ERType);
          this.assertConditionArr = [];
        }
      }
    },
    handleSubmit() {
      let pefdata = {};
      let payload = (pefdata['PEF'] = {});
      let assertConditionValue = 0x0000; //0:14
      payload['ID'] = this.pefno;
      this.assertConditionArr.forEach((d, idx) => {
        assertConditionValue |= (d.assert ? 1 : 0) << idx;
      });
      this.assertvalue = assertConditionValue;
      payload['ASSERTION_CONDITION'] = this.assertvalue;
      payload['EN_FILTER'] = this.evenable ? 1 : 0;
      if (
        this.sensortype != 0 ||
        this.sensornumber != 0 ||
        this.sensortype != 255 ||
        this.sensornumber != 255
      )
        payload['ERTYPE'] = this.ertype;
      let eventfilteract = 0;
      eventfilteract |= this.interrupt ? 1 : 0;
      eventfilteract <<= 1;
      eventfilteract |= this.gshutdown ? 1 : 0;
      eventfilteract <<= 1;
      eventfilteract |= this.powercycle ? 1 : 0;
      eventfilteract <<= 1;
      eventfilteract |= this.reset ? 1 : 0;
      eventfilteract <<= 1;
      eventfilteract |= this.poweroff ? 1 : 0;
      eventfilteract <<= 1;
      eventfilteract |= this.alertenable ? 1 : 0;
      payload['EVENT_FILTER_ACTION'] = eventfilteract;
      payload['POLICY_NO'] = 1; // fixed
      payload['SENSOR_NUMBER'] = this.sensornumber ?? 0;
      payload['SENSOR_TYPE'] = this.sensortype ?? 0;
      //console.log('handleSubmit = ', pefdata);
      this.$emit('ok', pefdata);
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
<style>
.fontsize {
  font-size: 12px;
}
</style>
