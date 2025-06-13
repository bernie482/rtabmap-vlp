<template>
  <keep-alive>
    <b-modal id="modal-schedule" ref="modal" @hidden="closeModal">
      <template #modal-title>
        <template v-if="isNew">
          {{ $t('pagePowerSchedule.modal.addSchedule') }}
        </template>
        <template v-else>
          {{ $t('pagePowerSchedule.modal.editSchedule') }}
        </template>
      </template>
      <b-form id="form-schedule" novalidate @submit.prevent="handleSubmit">
        <b-container>
          <b-row v-if="isNew" class="mb-3">
            <b-col class="title flex-w05">
              {{ $t('pagePowerSchedule.LANG_POWER_SCHEDULE_TASK_LABEL') }}
            </b-col>
            <b-col>
              <b-form-select
                id="schedule-id"
                v-model="form.id"
                :options="availableIds"
                data-test-id="power-schedule-select-id"
              >
              </b-form-select>
            </b-col>
          </b-row>
          <b-row v-if="!isNew" class="mb-3">
            <b-col class="title flex-w05">
              {{ $t('pagePowerSchedule.LANG_POWER_SCHEDULE_TASK_LABEL') }}
            </b-col>
            <b-col> {{ form.id }} </b-col>
          </b-row>

          <b-row class="mb-3">
            <b-col class="title flex-w05">
              {{ $t('pagePowerSchedule.LANG_POWER_SCHEDULE_ENABLE_LABEL') }}
            </b-col>
            <b-col>
              <b-form-select
                id="schedule-enabled"
                v-model="form.enabled"
                :options="enabledOptions"
                @input="$v.form.enabled.$touch()"
              >
              </b-form-select>
            </b-col>
          </b-row>

          <b-row class="mb-3">
            <b-col class="title flex-w05">
              {{ $t('pagePowerSchedule.LANG_POWER_SCHEDULE_ACTION_LABEL') }}
            </b-col>
            <b-col>
              <b-form-select
                id="schedule-action"
                v-model="form.action"
                :options="powerActionOptions"
                data-test-id="power-schedule-select-action"
                @input="$v.form.action.$touch()"
              >
              </b-form-select>
            </b-col>
          </b-row>

          <b-row class="mb-3">
            <b-col class="title flex-w05">
              {{ $t('pagePowerSchedule.LANG_POWER_SCHEDULE_SCHEDULE_LABEL') }}
            </b-col>
          </b-row>

          <b-row class="mb-3 ml-2">
            <b-col class="title flex-w05">
              {{ $t('pagePowerSchedule.LANG_POWER_SCHEDULE_TIME_LABEL') }}
            </b-col>
            <b-col>
              <b-form-select
                id="schedule-timeHour"
                v-model="form.time.hour"
                :options="powerTimeHourOptions"
                style="width: 40%"
                data-test-id="power-schedule-select-timeHour"
                @input="$v.form.time.hour.$touch()"
              >
              </b-form-select>
              :
              <b-form-select
                id="schedule-timeMinute"
                v-model="form.time.minute"
                :options="powerTimeMinuteOptions"
                style="width: 40%"
                data-test-id="power-schedule-select-timeMinute"
                @input="$v.form.time.minute.$touch()"
              >
              </b-form-select>
            </b-col>
          </b-row>

          <b-row class="mb-3 ml-2">
            <b-col class="title flex-w05">
              {{ $t('pagePowerSchedule.LANG_POWER_SCHEDULE_DATE_LABEL') }}
            </b-col>
            <b-col>
              <b-form-select
                id="schedule-dateType"
                v-model="form.date.type"
                :options="powerDateTypeOptions"
                data-test-id="power-schedule-select-dateType"
                @input="$v.form.date.type.$touch()"
              >
              </b-form-select>
            </b-col>
          </b-row>

          <b-row v-if="form.date.type === 1" class="mb-3 ml-2">
            <b-col class="title flex-w05"></b-col>
            <b-col>
              <insyde-text-input
                id="schedule-date-date"
                v-model="form.date.date"
                data-test-id="power-schedule-date-date"
                type="date_selector"
                :v="$v.form.date.date"
                my-class="form-control"
              ></insyde-text-input
            ></b-col>
          </b-row>

          <b-row v-if="form.date.type === 3" class="mb-3 ml-2">
            <b-col class="title flex-w05"></b-col>
            <b-col>
              <b-form-select
                id="schedule-date-weekday"
                v-model="form.date.weeklyDay"
                :options="powerDateWeeklyDayOptions"
                data-test-id="power-schedule-select-weeklyDay"
                @input="$v.form.date.weeklyDay.$touch()"
              >
              </b-form-select>
            </b-col>
          </b-row>

          <b-row v-if="form.date.type === 4" class="mb-3 ml-2">
            <b-col class="title flex-w05"></b-col>
            <b-col>
              <b-form-select
                id="schedule-date-monthlyDay"
                v-model="form.date.monthlyDay"
                :options="powerDateMonthlyDayOptions"
                data-test-id="power-schedule-select-monthlyDay"
                @input="$v.form.date.monthlyDay.$touch()"
              >
              </b-form-select>
            </b-col>
          </b-row>

          <b-row v-if="form.date.type !== 1" class="mb-3 ml-2">
            <b-col class="title flex-w05">
              <b-form-checkbox
                v-model="form.duration.enabled"
                name="user-duration-enabled"
                data-test-id="users-radioButton-duration-enabled"
                :value="true"
                @change="$v.form.duration.enabled.$touch()"
              >
                <b>
                  {{
                    $t('pagePowerSchedule.LANG_POWER_SCHEDULE_DURATION_LABEL')
                  }}
                </b>
              </b-form-checkbox>
            </b-col>
          </b-row>

          <b-row v-if="form.date.type !== 1" class="mb-3 ml-4">
            <b-col class="title flex-w05">
              {{ $t('pagePowerSchedule.LANG_POWER_SCHEDULE_START_LABEL') }}
            </b-col>
            <b-col>
              <insyde-text-input
                id="schedule-start-date"
                v-model="form.duration.startDate"
                data-test-id="power-schedule-start-date"
                type="date_selector"
                :v="$v.form.duration.startDate"
                :disabled="!form.duration.enabled"
                my-class="form-control"
              ></insyde-text-input
            ></b-col>
          </b-row>

          <b-row v-if="form.date.type !== 1" class="mb-3 ml-4">
            <b-col class="title flex-w05">
              {{ $t('pagePowerSchedule.LANG_POWER_SCHEDULE_END_LABEL') }}
            </b-col>
            <b-col>
              <insyde-text-input
                id="schedule-end-date"
                v-model="form.duration.endDate"
                data-test-id="power-schedule-end-date"
                type="date_selector"
                :v="$v.form.duration.endDate"
                :disabled="!form.duration.enabled"
                my-class="form-control"
              ></insyde-text-input
            ></b-col>
          </b-row>
        </b-container>
      </b-form>

      <template #modal-footer="{ cancel }">
        <b-button
          variant="secondary"
          data-test-id="power-schedule-button-cancel"
          @click="cancel()"
        >
          {{ $t('global.action.cancel') }}
        </b-button>
        <b-button
          form="form-item"
          data-test-id="power-schedule-button-submit"
          type="submit"
          variant="primary"
          @click="onOk"
        >
          <template v-if="isNew">
            {{ $t('global.action.add') }}
          </template>
          <template v-else>
            {{ $t('global.action.save') }}
          </template>
        </b-button>
      </template>
    </b-modal>
  </keep-alive>
</template>

<script>
import InsydeTextInput from '@/env/insyde/components/InsydeTextInput';
import { required, requiredIf, or } from 'vuelidate/lib/validators';
import { mapFields } from 'vuex-map-fields';
import Validator from '@/env/insyde/utilities/Validator';
import Date from '@/env/insyde/utilities/InsydeDate';

export default {
  components: { InsydeTextInput },
  props: {
    item: {
      type: Object,
      default: null,
    },
    userIds: {
      type: Array,
      default: null,
    },
  },
  data() {
    return {
      form: {
        id: 0,
        enabled: true,
        action: 160,
        time: {
          hour: 0,
          minute: 0,
        },
        date: {
          type: 1,
          date: this.getTodayDate(),
          weeklyDay: 1,
          monthlyDay: 1,
        },
        duration: {
          enabled: false,
          startDate: this.getTodayDate(),
          endDate: this.getTomorrowDate(),
        },
      },
      cachedId: 0, // PATCH: id will miss after reset
      // options
      enabledOptionsRef: ['Disabled', 'Enabled'],
    };
  },
  validations() {
    return {
      form: {
        enabled: {
          required,
        },
        action: {
          required,
        },
        time: {
          hour: {
            required,
          },
          minute: {
            required,
          },
        },
        date: {
          type: {
            required,
          },
          date: {
            required: requiredIf(function () {
              return this.form.date.type === 1;
            }),
            check: or(Validator.EmptyString, Validator.DateRule),
          },
          weeklyDay: {
            required: requiredIf(function () {
              return this.form.date.type === 3;
            }),
          },
          monthlyDay: {
            required: requiredIf(function () {
              return this.form.date.type === 4;
            }),
          },
        },
        duration: {
          enabled: {},
          startDate: {
            required: requiredIf(function () {
              return this.form.duration.enabled === true;
            }),
            check: or(Validator.EmptyString, Validator.DateRule),
          },
          endDate: {
            required: requiredIf(function () {
              return this.form.duration.enabled === true;
            }),
            check: or(Validator.EmptyString, Validator.DateRule),
          },
        },
      },
    };
  },
  computed: {
    ...mapFields('powerSchedule', [
      'powerActionOptions',
      'powerDateTypeOptions',
      'powerDateWeeklyDayOptions',
    ]),
    getId() {
      return this.item ? this.item.id : '';
    },
    isNew() {
      return this.item ? false : true;
    },
    availableIds() {
      let vm = this;
      let idList = Array.from({ length: 10 }, (_, i) => i + 1);
      return idList.filter(function (el) {
        return vm.userIds.indexOf(el) < 0;
      });
    },
    enabledOptions() {
      return this.enabledOptionsRef.map((el, index) => {
        return {
          value: index ? true : false,
          text: el,
        };
      });
    },
    powerTimeHourOptions() {
      let list = Array.from({ length: 24 }, (_, i) => i).map((el) => {
        return {
          value: el,
          text: ('0' + el).slice(-2),
        };
      });
      return list;
    },
    powerTimeMinuteOptions() {
      let list = Array.from({ length: 60 }, (_, i) => i).map((el) => {
        return {
          value: el,
          text: ('0' + el).slice(-2),
        };
      });
      return list;
    },
    powerDateMonthlyDayOptions() {
      let list = Array.from({ length: 31 }, (_, i) => i + 1).map((el) => {
        return {
          value: el,
          text: ('0' + el).slice(-2),
        };
      });
      return list;
    },
  },
  watch: {
    item: function () {
      this.resetForm();
    },
  },
  methods: {
    handleSubmit() {
      if (this.$v.$invalid) {
        console.warn('Submit failed. format invalid!');
        return;
      }

      let payload = {};
      payload.index = this.form.id;
      payload.enable = this.form.enabled;
      payload.action = this.form.action;
      payload.hour = this.form.time.hour;
      payload.minute = this.form.time.minute;
      payload.type = this.form.date.type;
      payload.date = new Date(this.form.date.date).getUnixTime();
      payload.start = this.form.duration.enabled
        ? new Date(this.form.duration.startDate).getUnixTime()
        : -1;
      payload.end = this.form.duration.enabled
        ? new Date(this.form.duration.endDate).getUnixTime()
        : -1;
      payload.dayOfWeek = this.form.date.weeklyDay;
      payload.dayOfMonth = this.form.date.monthlyDay;

      this.$emit('ok', { payload });
      this.closeModal();
    },
    closeModal() {
      this.resetForm();
      this.$nextTick(() => {
        this.$refs.modal.hide();
      });
    },
    resetForm() {
      // HACK: to reset form data
      Object.assign(this.$data, this.$options.data.call(this));

      // PATCH: reset id
      if (this.item) {
        // NOTE: for edit flow to init
        this.form.id = this.item.index;
        this.form.enabled = this.item.enable ? true : false;
        this.form.action = this.item.action;
        this.form.time.hour = this.item.hour;
        this.form.time.minute = this.item.minute;
        this.form.date.type = this.item.type; // NOTE: calculate the date.type
        this.form.date.date =
          this.item.StartDate == '-'
            ? this.getTodayDate()
            : this.item.StartDate;
        this.form.date.weeklyDay =
          this.item.dayOfWeek < 8 ? this.item.dayOfWeek : 1;
        this.form.date.monthlyDay =
          this.item.dayOfMonth < 32 ? this.item.dayOfMonth : 1;
        this.form.duration.enabled = this.item.duration;
        this.form.duration.startDate = this.getTodayDate();
        this.form.duration.endDate = this.getTomorrowDate();
        if (this.item.duration) {
          this.form.duration.startDate = this.item.StartDate;
          this.form.duration.endDate = this.item.EndDate;
        }
      } else {
        // NOTE: for add flow to init
        if (this.availableIds.length) {
          if (!this.availableIds.includes(this.form.id)) {
            this.form.id = this.availableIds[0];
          }
        }
      }

      this.$v.$reset();
    },
    getTodayDate() {
      return new Date().format('yyyy-mm-dd');
    },
    getTomorrowDate() {
      return new Date().addDays(1).format('yyyy-mm-dd');
    },
    onOk(bvModalEvt) {
      // prevent modal close
      bvModalEvt.preventDefault();
      this.handleSubmit();
    },
  },
};
</script>
