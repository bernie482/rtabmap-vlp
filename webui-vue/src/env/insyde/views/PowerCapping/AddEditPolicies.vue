<template>
  <b-container fluid="x1" confsettings>
    <page-section :section-title="$t('pagePowerCapping.MISC_NM_ADD')">
      <b-row>
        <b-col cols="6" sm="5" md="4" lg="4" xl="2">
          <label>
            {{ $t('pagePowerCapping.MISC_NM_CONFIG_POLICY_NUM') }}
          </label>
          <b-form-input
            v-model="plyid"
            type="number"
            min="1"
            max="255"
            :disabled="disabledPolicyNum"
            :state="getValidationState($v.plyid)"
            @change="$v.plyid.$touch()"
          >
          </b-form-input>
        </b-col>
        <b-col cols="6" sm="5" md="4" lg="4" xl="2">
          <b-form-checkbox v-model="enable">
            {{ $t('pagePowerCapping.MISC_NM_CONFIG_ENABLE') }}
          </b-form-checkbox>
        </b-col>
        <b-col cols="6" sm="5" md="4" lg="4" xl="2">
          <b-form-checkbox v-model="shutdown">{{
            $t('pagePowerCapping.MISC_NM_CONFIG_SHUTDOWN')
          }}</b-form-checkbox>
        </b-col>
        <b-col cols="6" sm="5" md="4" lg="4" xl="2">
          <b-form-checkbox v-model="logevt">{{
            $t('pagePowerCapping.MISC_NM_CONFIG_LOG_EVENT')
          }}</b-form-checkbox>
        </b-col>
      </b-row>
      <b-row>
        <b-col cols="6" sm="5" md="4" lg="4" xl="2">
          <label>
            {{ $t('pagePowerCapping.LANG_MISC_NM_COLUMN_TITLE6') }}
          </label>
        </b-col>
        <b-col cols="6" sm="5" md="4" lg="4" xl="2">
          <b-form-radio
            v-model="domain"
            value="entire"
            :disabled="domain != 'entire' && btn_disabled_entire"
          >
            {{ $t('pagePowerCapping.POWER_STATISTICS_ENTIRE_PLATFORM') }}
          </b-form-radio>
        </b-col>
        <b-col cols="6" sm="5" md="4" lg="4" xl="2">
          <b-form-radio
            v-model="domain"
            value="cpu"
            :disabled="domain != 'cpu' && btn_disabled_cpu"
          >
            {{ $t('pagePowerCapping.POWER_STATISTICS_CPU') }}
          </b-form-radio>
        </b-col>
        <b-col cols="6" sm="5" md="4" lg="4" xl="2">
          <b-form-radio
            v-model="domain"
            value="memory"
            :disabled="domain != 'memory' && btn_disabled_mem"
          >
            {{ $t('pagePowerCapping.POWER_STATISTICS_MEMORY') }}
          </b-form-radio>
        </b-col>
      </b-row>
      <b-row>
        <b-col cols="6" sm="5" md="4" lg="4" xl="2">
          <label>
            {{ $t('pagePowerCapping.LANG_MISC_NM_COLUMN_TITLE5') }}
          </label>
          <b-form-input
            v-model="powerlimit"
            type="number"
            min="0"
            max="32767"
            :state="getValidationState($v.powerlimit)"
            @change="$v.powerlimit.$touch()"
          >
          </b-form-input>
        </b-col>
      </b-row>
      <b-row v-show="SPS">
        <b-col cols="6" sm="5" md="4" lg="4" xl="2">
          <label>
            {{ $t('pagePowerCapping.MISC_NM_CONFIG_USE_SUSPEND_TIMERS') }}
          </label>
        </b-col>
        <b-col cols="6" sm="5" md="4" lg="4" xl="2">
          <b-form-radio v-model="suspend" value="yes">
            {{ $t('pagePowerCapping.MISC_NM_CONFIG_USE_TIMERS_YES') }}
          </b-form-radio>
        </b-col>
        <b-col cols="6" sm="5" md="4" lg="4" xl="2">
          <b-form-radio v-model="suspend" value="no">
            {{ $t('pagePowerCapping.MISC_NM_CONFIG_USE_TIMERS_NO') }}
          </b-form-radio>
        </b-col>
      </b-row>
      <!-- Use Policy Suspend Timers -->
      <b-row v-show="suspend != 'no'" cols="5">
        <!-- Timer1 ~ Timer5 -->
        <b-col v-for="(timer, index) in suspendTimer" :key="index" md="1">
          <!-- Timer ID -->
          <b-row>
            <b-col align="center">
              <b-form-checkbox v-model="chktimer[timer]">
                {{
                  `${$t(
                    'pagePowerCapping.MISC_NM_CONFIG_TIMERS_' + (index + 1)
                  )}`
                }}
              </b-form-checkbox>
            </b-col>
          </b-row>

          <!-- Week day -->
          <b-row v-for="(item, idx) in suspendweekday" :key="idx">
            <b-col>
              <b-form-checkbox
                v-model="chkweekday[index][item]"
                :disabled="!chktimer[timer]"
              >
                {{
                  `${$t(
                    'pagePowerCapping.MISC_NM_CONFIG_TIMERS_WEEKDAY' + (idx + 1)
                  )}`
                }}
              </b-form-checkbox>
            </b-col>
          </b-row>

          <!-- Time -->
          <b-row>
            <b-col align="center">
              <label>
                {{ $t('pagePowerCapping.MISC_NM_CONFIG_START_TIME') }} </label
              ><br />
              <select v-model="start_hour[timer]" :disabled="!chktimer[timer]">
                <option v-for="(item, idx) in shour" :key="idx" :value="idx">
                  {{ item }}
                </option>
              </select>
              :
              <select v-model="start_min[timer]" :disabled="!chktimer[timer]">
                <option
                  v-for="(item, idx) in min"
                  :key="idx"
                  :value="parseInt(item)"
                >
                  {{ item }}
                </option></select
              ><br />
              <label>
                {{ $t('pagePowerCapping.MISC_NM_CONFIG_START_END') }} </label
              ><br />
              <select
                v-model="end_hour[timer]"
                :disabled="!chktimer[timer]"
                @change="onChange_endhour($event)"
              >
                <option v-for="(item, idx) in ehour" :key="idx" :value="idx">
                  {{ item }}
                </option>
              </select>
              :
              <select
                v-model="end_min[timer]"
                :disabled="!chktimer[timer] || end_hour[timer] == 24"
              >
                <option
                  v-for="(item, idx) in min"
                  :key="idx"
                  :value="parseInt(item)"
                >
                  {{ item }}
                </option>
              </select>
            </b-col>
          </b-row>
        </b-col>
      </b-row>
      <!--button-->
      <b-button
        variant="primary"
        class="button"
        :disabled="$v.$invalid"
        @click="onOk"
      >
        {{ $t('global.action.save') }}
      </b-button>
      <b-button
        variant="primary"
        class="button"
        :disabled="btn_disabled"
        @click="onDelete"
      >
        {{ $t('global.action.delete') }}
      </b-button>
      <b-button
        variant="secondary"
        class="button"
        :disabled="btn_disabled"
        @click="onCancel"
      >
        {{ $t('global.action.cancel') }}
      </b-button>
    </page-section>
  </b-container>
</template>
<script>
import PageSection from '@/components/Global/PageSection';
import { required, between } from 'vuelidate/lib/validators';
import {
  nmsuspendtimersParser,
  // <!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN:!CONFIG_NM_OFFLOAD -->
  nmpolicyParser,
  // <!-- WEB_CONFIG_DEPEND_FEATURE_END:!CONFIG_NM_OFFLOAD -->
  policyMembersParser,
  policyEntryStateParser,
} from '@/env/insyde/components/Mixins/PowerCappingParserMixin';

export default {
  name: 'AddEditPolicies',
  components: {
    PageSection,
  },

  props: {
    confsettings: {
      type: Array,
      default: null,
    },
  },
  validations: {
    plyid: {
      required,
      between: between(1, 255),
    },
    powerlimit: {
      required,
      between: between(0, 32767),
    },
  },
  data() {
    return {
      disabledPolicyNum: false,
      btn_disabled_entire: false,
      btn_disabled_cpu: false,
      btn_disabled_mem: false,
      existPlyid: [],
      SPS: false, // expect to 2023
      chkweekday: [
        {
          weekday1: false,
          weekday2: false,
          weekday3: false,
          weekday4: false,
          weekday5: false,
          weekday6: false,
          weekday7: false,
        },
        {
          weekday1: false,
          weekday2: false,
          weekday3: false,
          weekday4: false,
          weekday5: false,
          weekday6: false,
          weekday7: false,
        },
        {
          weekday1: false,
          weekday2: false,
          weekday3: false,
          weekday4: false,
          weekday5: false,
          weekday6: false,
          weekday7: false,
        },
        {
          weekday1: false,
          weekday2: false,
          weekday3: false,
          weekday4: false,
          weekday5: false,
          weekday6: false,
          weekday7: false,
        },
        {
          weekday1: false,
          weekday2: false,
          weekday3: false,
          weekday4: false,
          weekday5: false,
          weekday6: false,
          weekday7: false,
        },
      ],
      chktimer: {
        timer1: false,
        timer2: false,
        timer3: false,
        timer4: false,
        timer5: false,
      },
      start_hour: {
        timer1: 0,
        timer2: 0,
        timer3: 0,
        timer4: 0,
        timer5: 0,
      },
      start_min: {
        timer1: 0,
        timer2: 0,
        timer3: 0,
        timer4: 0,
        timer5: 0,
      },
      end_hour: {
        timer1: 0,
        timer2: 0,
        timer3: 0,
        timer4: 0,
        timer5: 0,
      },
      end_min: {
        timer1: 0,
        timer2: 0,
        timer3: 0,
        timer4: 0,
        timer5: 0,
      },
      shour: [
        '00',
        '01',
        '02',
        '03',
        '04',
        '05',
        '06',
        '07',
        '08',
        '09',
        '10',
        '11',
        '12',
        '13',
        '14',
        '15',
        '16',
        '17',
        '18',
        '19',
        '20',
        '21',
        '22',
        '23',
      ],
      ehour: [
        '00',
        '01',
        '02',
        '03',
        '04',
        '05',
        '06',
        '07',
        '08',
        '09',
        '10',
        '11',
        '12',
        '13',
        '14',
        '15',
        '16',
        '17',
        '18',
        '19',
        '20',
        '21',
        '22',
        '23',
        '24',
      ],
      min: ['00', '06', '12', '18', '24', '30', '36', '42', '48', '54'],
      suspendTimer: ['timer1', 'timer2', 'timer3', 'timer4', 'timer5'],
      suspendweekday: [
        'weekday1',
        'weekday2',
        'weekday3',
        'weekday4',
        'weekday5',
        'weekday6',
        'weekday7',
      ],
      btn_disabled: true,
      suspend: 'no',
      enable: false,
      shutdown: false,
      logevt: false,
      powerlimit: '',
      domain: '',
      plyid: '',
      selected: {},
      suspendtimers: [],
    };
  },
  computed: {
    getPolicyEntryState() {
      return policyEntryStateParser(
        this.$store.getters['powercapping/policyentry']
      );
    },
    policiesMember() {
      return policyMembersParser(
        this.$store.getters['powercapping/policycollection']
      );
    },
    // <!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN:!CONFIG_NM_OFFLOAD -->
    nmpolicy() {
      return nmpolicyParser(this.$store.getters['powercapping/policy']);
    },
    // <!-- WEB_CONFIG_DEPEND_FEATURE_END:!CONFIG_NM_OFFLOAD -->
    timers() {
      return nmsuspendtimersParser(
        this.$store.getters['powercapping/policytimers']
      );
    },
  },
  watch: {
    confsettings: function (value) {
      let nm = this;
      nm.btn_disabled = true;
      nm.clearAllField();
      if (value === null || value.length == 0) {
        nm.disabledPolicyNum = false;
        nm.btn_disabled_entire = false;
        nm.btn_disabled_cpu = false;
        nm.btn_disabled_mem = false;
        return;
      }
      //console.log('selected: ', value);
      nm.btn_disabled = false;
      nm.selected = value[0]; // Array is single, so array size is 1.
      nm.showpolicyInfo(nm.selected);
      if (nm.selected?.timers != undefined && nm.selected?.timers != 0) {
        // get nm suspend periods data.
        nm.suspend = 'yes';
        let payloadObj = {
          NM_POLICY: nm.selected.id,
          NM_DOMAIN: nm.selected.domain,
        };
        nm.$store
          .dispatch('powercapping/nmsuspendperiods', payloadObj)
          .then(() => {
            //console.log(nm.timers.suspendTimersArr);
            nm.suspendtimers = nm.timers.suspendTimersArr;
            nm.showsuspendTimers(nm.suspendtimers);
          });
      } else {
        nm.suspend = 'no';
      }
    },
  },
  methods: {
    checkbtnstate() {
      const nm = this;
      let checkifexist = nm.policiesMember;
      if (!checkifexist[parseInt(nm.plyid)]) {
        nm.btn_disabled_entire = false;
        nm.btn_disabled_cpu = false;
        nm.btn_disabled_mem = false;
      } else {
        nm.btn_disabled_entire = true;
        nm.btn_disabled_cpu = true;
        nm.btn_disabled_mem = true;
      }
    },
    getValidationState(model) {
      //console.log(model);
      this.checkbtnstate();
      const { $invalid } = model;
      return !$invalid;
    },
    onChange_endhour(event) {
      //console.log(event.target.value);
      let hour = event.target.value;
      if (hour != 24) return;
      let nm = this;
      let id = 0;
      for (id = 0; id < 5; id++) {
        if (nm.end_hour[`timer${id + 1}`] != 24) continue;
        nm.end_min[`timer${id + 1}`] = 0;
      }
    },
    showpolicyInfo(selected) {
      let nm = this;
      nm.disabledPolicyNum = true;
      nm.plyid = selected.id;
      nm.domain = nm.parserDomainString(selected.domain);
      nm.enable = Boolean(selected.enable);
      nm.shutdown = Boolean(selected.shutdown);
      nm.logevt = Boolean(selected.logevent);
      nm.powerlimit = selected.powerlimit;
    },
    showsuspendTimers(timers) {
      let nm = this;
      //console.log('timers: ', timers);
      let idx = 0;
      // timer id
      for (var key in nm.chktimer) {
        nm.chktimer[key] = timers[idx] != null ? true : false;
        if (nm.chktimer[key]) {
          let weekday = timers[idx]?.NM_SUSPEND_DAYS;
          let nm_start = timers[idx]?.NM_SUSPEND_START;
          let nm_end = timers[idx]?.NM_SUSPEND_END;
          nm.updateScheduleInfo(idx, nm_start, nm_end, weekday);
        } else {
          let week = 0;
          for (week = 0; week < 7; week++) {
            nm.chkweekday[idx][`weekday${week + 1}`] = false;
          }
          // clear start/end time
          nm.start_hour[key] = '0';
          nm.start_min[key] = '0';
          nm.end_hour[key] = '0';
          nm.end_min[key] = '0';
        }
        idx++;
      }
    },
    updateScheduleInfo(timer_id, start, end, weekdays) {
      // update suspend timers.
      //console.log(timer_id, start, end, weekdays);
      let nm = this;
      let idx = 0;
      let mask = 0;
      let maskCheck = 0;
      let hour = 0;
      let minute = 0;
      for (idx = 0; idx < 7; idx++) {
        mask = 0x01 << idx;
        maskCheck = parseInt(weekdays) & mask;
        if (maskCheck > 0) {
          nm.chkweekday[timer_id][`weekday${idx + 1}`] = true;
        } else {
          nm.chkweekday[timer_id][`weekday${idx + 1}`] = false;
        }
      }
      hour = parseInt(parseInt(start) / 10);
      nm.start_hour[`timer${timer_id + 1}`] = hour;
      minute = parseInt(parseInt(start) % 10) * 6;
      nm.start_min[`timer${timer_id + 1}`] = minute;

      hour = parseInt(parseInt(end) / 10);
      nm.end_hour[`timer${timer_id + 1}`] = hour;
      minute = parseInt(parseInt(end) % 10) * 6;
      nm.end_min[`timer${timer_id + 1}`] = minute;
    },
    parserDomainString(domainNum) {
      let id = ['entire', 'cpu', 'memory'];
      return id[domainNum] ?? 'entire';
    },
    parserDomainInt(domainStr) {
      let domainObj = {
        entire: 0,
        cpu: 1,
        memory: 2,
      };
      return domainObj[domainStr] ?? 0;
    },
    updateTableItems() {
      let nm = this;
      nm.$store.dispatch('powercapping/nmpolicy').then(() => {
        nm.$emit('update', nm.nmpolicy.policyArr);
      });
    },
    usePolicySuspendTimers() {
      let nm = this;
      let payloadObj = {
        NM_POLICY: parseInt(nm.plyid),
        NM_DOMAIN: nm.parserDomainInt(nm.domain),
      };
      let periodsArr = [];
      let id = 0;
      let timerid = 0;
      for (var key in nm.chktimer) {
        if (nm.chktimer[key]) {
          let suspendObj = {};
          let day = 0;
          let start = 0;
          let end = 0;
          for (var idx = 0; idx < 7; idx++) {
            day <<= 1;
            nm.chkweekday[timerid][`weekday${7 - idx}`] ? (day |= 0x01) : day;
          }
          start =
            (parseInt(nm.start_hour[key]) * 60 + parseInt(nm.start_min[key])) /
            6;
          end =
            (parseInt(nm.end_hour[key]) * 60 + parseInt(nm.end_min[key])) / 6;
          suspendObj['NM_SUSPEND_START'] = start;
          suspendObj['NM_SUSPEND_END'] = end;
          suspendObj['NM_SUSPEND_DAYS'] = day;
          suspendObj['CUR_PERIOD'] = id++;
          periodsArr.push(suspendObj);
          // error handle
          if (start == end) {
            nm.errorToast(nm.$t('pagePowerCapping.MISC_NM_CONFIG_ERR3'));
            return;
          }
        }
        timerid++;
      }
      if (nm.suspend != 'no') {
        payloadObj['SUSPEND_PERIOD'] = periodsArr;
        payloadObj['NUM_PERIODS'] = periodsArr.length;
      }
      nm.$store
        .dispatch('powercapping/setsuspendTimer', payloadObj)
        .then(() => {
          nm.updateTableItems();
        })
        .catch((message) => {
          nm.errorToast(message);
        })
        .finally(() => {});
    },
    onOk() {
      let nm = this;
      let payloadObj = {
        CONFIG_ACTION: 1,
        NM_POLICY: parseInt(nm.plyid),
        NM_DOMAIN: nm.parserDomainInt(nm.domain),
        NM_ENABLED: nm.enable ? 1 : 0,
        NM_SHUTDOWN: nm.shutdown ? 1 : 0,
        NM_ALERT: nm.logevt ? 1 : 0,
        NM_POWERLIMIT: parseInt(nm.powerlimit),
      };
      // <!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN:!CONFIG_NM_OFFLOAD -->
      nm.startLoader();
      nm.$store
        .dispatch('powercapping/nmsave', payloadObj)
        .then((success) => {
          nm.usePolicySuspendTimers();
          nm.updateTableItems();
          nm.successToast(success);
        })
        .catch((message) => {
          nm.errorToast(message);
        })
        .finally(() => nm.endLoader());
      // <!-- WEB_CONFIG_DEPEND_FEATURE_END:!CONFIG_NM_OFFLOAD -->
      // <!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN:CONFIG_NM_OFFLOAD -->
      let checkifexist = nm.policiesMember;
      if (nm.shutdown && nm.logevt) {
        payloadObj['LIMExc'] = 'Oem';
      } else {
        if (nm.shutdown) {
          payloadObj['LIMExc'] = 'HardPowerOff';
        }
        if (nm.logevt) {
          payloadObj['LIMExc'] = 'LogEventOnly';
        }
      }
      if (!checkifexist[parseInt(nm.plyid)]) nm.createPolicy(payloadObj);
      else {
        // do update policy entry, first to check policy id state for changeState.
        let uri = `/redfish/v1/Managers/bmc/NodeManager/Policies/${nm.plyid}`;
        nm.$store
          .dispatch('powercapping/getPolicyEntry', uri)
          .then(() => {
            nm.updatePolicy(payloadObj);
          })
          .catch((message) => {
            // check policy state error.
            nm.errorToast(message);
          });
      }
      // <!-- WEB_CONFIG_DEPEND_FEATURE_END:CONFIG_NM_OFFLOAD -->
    },
    updatePolicy(payload) {
      let nm = this;
      nm.startLoader();
      nm.$store
        .dispatch('powercapping/patchPolicyEntry', payload)
        .then((success) => {
          //nm.usePolicySuspendTimers();
          let curPlyState = nm.getPolicyEntryState != 'Enabled' ? 0 : 1;
          if (curPlyState != payload.NM_ENABLED)
            nm.$store
              .dispatch('powercapping/changePolicyState', payload)
              .then((success) => {
                nm.$emit('ok', 'updated policy!!');
                nm.successToast(success);
              })
              .catch((message) => {
                //nm.errorToast(message);
                throw message;
              })
              .finally(() => {
                nm.endLoader();
              });
          else {
            nm.$emit('ok', 'updated policy!!');
            nm.successToast(success);
            nm.endLoader();
          }
        })
        .catch((message) => {
          nm.errorToast(message);
          nm.endLoader();
        });
    },
    createPolicy(payload) {
      let nm = this;
      nm.startLoader();
      nm.$store
        .dispatch('powercapping/postPolicies', payload)
        .then((success) => {
          //nm.usePolicySuspendTimers();
          nm.$emit('ok', 'created new policy!!');
          nm.successToast(success);
        })
        .catch((message) => {
          nm.errorToast(message);
        })
        .finally(() => {
          nm.endLoader();
        });
    },
    onDelete() {
      let nm = this;
      // <!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN:!CONFIG_NM_OFFLOAD -->
      let payloadObj = {
        CONFIG_ACTION: 0,
        NM_POLICY: nm.selected.id,
        NM_DOMAIN: nm.selected.domain,
      };
      nm.startLoader();
      nm.$store
        .dispatch('powercapping/nmdelete', payloadObj)
        .then((success) => {
          nm.updateTableItems();
          nm.successToast(success);
        })
        .catch((message) => {
          nm.errorToast(message);
        })
        .finally(() => {
          nm.endLoader();
        });
      // <!-- WEB_CONFIG_DEPEND_FEATURE_END:!CONFIG_NM_OFFLOAD -->
      // <!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN:CONFIG_NM_OFFLOAD -->
      let checkifexist = nm.policiesMember;
      if (checkifexist[parseInt(nm.plyid)]) nm.deletePolicy();
      else nm.errorToast('id does not exist');
      // <!-- WEB_CONFIG_DEPEND_FEATURE_END:CONFIG_NM_OFFLOAD -->
    },
    deletePolicy() {
      let nm = this;
      let id = nm.plyid;
      nm.startLoader();
      nm.$store
        .dispatch('powercapping/deletePolicyEntry', id)
        .then((success) => {
          nm.$emit('ok', 'deleted policy entry!!');
          nm.successToast(success);
        })
        .catch((message) => {
          nm.errorToast(message);
        })
        .finally(() => {
          nm.endLoader();
        });
    },
    clearAllField() {
      let nm = this;
      nm.plyid = '';
      nm.powerlimit = '';
      nm.enable = false;
      nm.shutdown = false;
      nm.logevt = false;
      nm.domain = '';
    },
    onCancel() {
      let nm = this;
      nm.clearAllField();
      nm.$emit('clearsel', 'clear table selected');
    },
  },
};
</script>
<style lang="scss" scoped>
.fontsize {
  font-size: 12px;
}
.button {
  font-size: 12px;
  font-weight: bold;
  padding: 5px 10px;
  text-align: center;
  background-color: #2e9fd3;
  border-left-style: none;
  border-right-style: none;
  border-bottom: 2px solid #41a2e2;
  border-radius: 3px;
  color: white;
  outline: 0;
  margin: 5px 3px;
  transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out,
    border-color 0.15s ease-in-out;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
</style>
