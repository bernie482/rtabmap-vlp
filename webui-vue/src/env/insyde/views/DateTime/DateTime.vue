<template>
  <b-container fluid="x1">
    <page-title />
    <b-row>
      <b-col cols="5">
        <b-form-group
          :label="$t('pageDateTimeInsyde.LANG_CONF_DATE_TIME_TIMEZONE')"
          label-for="timezone-options"
          class="mb-3"
        >
          <!--:items="timezoneValues"-->
          <b-form-select
            id="timezone-options"
            v-model="selected"
            :disabled="tzOptions.length === 0"
            :options="tzOptions"
            @change="onChangeSelect"
          ></b-form-select>
        </b-form-group>
      </b-col>
    </b-row>
    <b-row>
      <b-col md="12">
        <b-form-group
          :label="$t('pageDateTimeInsyde.LANG_CONF_DATE_TIME_NTP_ENABLE')"
        >
          <b-form-checkbox
            v-model="form.ntpenable"
            :items="ntpState"
            data-test-id="dateTime-checkbox-ntpenable"
            name="check-button-1"
            switch
            @change="changeNtpValue"
          >
            <!-- <span v-if="form.ntpenable">
              {{ 'Enabled' }}
            </span>
            <span v-else>
              {{ 'Disabled' }}
            </span> -->
          </b-form-checkbox>
        </b-form-group>
      </b-col>
    </b-row>
    <page-section>
      <!-- <b-form-group
          label="Configure date and time"
          :disabled="loading"
          label-sr-only
        >
        </b-form-group>
        <b-form-radio
          v-model="form.configurationSelected"
          value="ntp"
          data-test-id="dateTime-radio-configureNTP"
        >
          NTP
        </b-form-radio> -->
      <b-row>
        <b-col cols="3">
          <span> </span>
          <span
            v-if="ntpstatus == 'success'"
            class="ntpstatus-fs ntpstatus-normal"
            >{{ 'Time is synchronized.' }}</span
          >
          <span
            v-else-if="ntpstatus == 'unreachable'"
            class="ntpstatus-fs ntpstatus-unreach-error"
            >{{ 'NTP server is unreachable.' }}</span
          >
          <span
            v-else-if="ntpstatus == 'processing'"
            class="ntpstatus-fs ntpstatus-running"
          >
            {{ 'NTP service is running...' }}</span
          >
          <span
            v-else-if="ntpstatus == 'unknown_error'"
            class="ntpstatus-fs ntpstatus-unreach-error"
            >{{ 'NTP service error: Unknown error occur.' }}</span
          >
        </b-col>
      </b-row>
      <!-- <b-row class="mt-3 ml-3"> --><!-- for 縮排 -->
      <b-row>
        <b-col sm="6" lg="4" xl="3">
          <b-form-group
            :label="
              $t(
                'pageDateTimeInsyde.ntpServers.LANG_CONF_DATE_TIME_NTP_SERVER_PRI'
              )
            "
            label-for="input-ntp-1"
          >
            <b-input-group>
              <b-form-input
                id="input-ntp-1"
                v-model="form.ntp.firstAddress"
                :state="getValidationState($v.form.ntp.firstAddress)"
                :disabled="manualOptionSelected"
                data-test-id="dateTime-input-ntpServer1"
                @blur="$v.form.ntp.firstAddress.$touch()"
              />
              <b-form-invalid-feedback role="alert">
                <div v-if="!$v.form.ntp.firstAddress.required">
                  {{ $t('global.form.fieldRequired') }}
                </div>
              </b-form-invalid-feedback>
            </b-input-group>
          </b-form-group>
        </b-col>
        <b-col sm="6" lg="4" xl="3">
          <b-form-group
            :label="
              $t(
                'pageDateTimeInsyde.ntpServers.LANG_CONF_DATE_TIME_NTP_SERVER_SEC'
              )
            "
            label-for="input-ntp-2"
          >
            <b-input-group>
              <b-form-input
                id="input-ntp-2"
                v-model="form.ntp.secondAddress"
                :disabled="manualOptionSelected"
                data-test-id="dateTime-input-ntpServer2"
              />
            </b-input-group>
          </b-form-group>
        </b-col>
      </b-row>
      <!-- <b-form-radio
        v-model="form.configurationSelected"
        value="manual"
        data-test-id="dateTime-radio-configureManual"
      >
        {{ $t('pageDateTime.form.manual') }}-->
      <!-- <b-row class="mt-3 ml-3"> for 縮排 -->
      <b-row>
        <b-col sm="6" lg="4" xl="3">
          <b-form-group
            :label="$t('pageDateTime.form.date')"
            label-for="input-manual-date"
          >
            <b-form-text id="date-format-help">YYYY-MM-DD</b-form-text>
            <b-input-group>
              <b-form-input
                id="input-manual-date"
                v-model="form.manual.date"
                :state="getValidationState($v.form.manual.date)"
                :disabled="ntpOptionSelected"
                data-test-id="dateTime-input-manualDate"
                class="form-control-with-button"
                @blur="$v.form.manual.date.$touch()"
              />
              <b-form-invalid-feedback role="alert">
                <div v-if="!$v.form.manual.date.pattern">
                  {{ $t('global.form.invalidFormat') }}
                </div>
                <div v-if="!$v.form.manual.date.required">
                  {{ $t('global.form.fieldRequired') }}
                </div>
              </b-form-invalid-feedback>
              <b-form-datepicker
                v-model="form.manual.date"
                class="btn-datepicker btn-icon-only"
                button-only
                right
                :hide-header="true"
                :locale="locale"
                :label-help="
                  $t('global.calendar.useCursorKeysToNavigateCalendarDates')
                "
                :title="$t('global.calendar.selectDate')"
                :disabled="ntpOptionSelected"
                button-variant="link"
                aria-controls="input-manual-date"
              >
                <template #button-content>
                  <icon-calendar />
                  <span class="sr-only">
                    {{ $t('global.calendar.selectDate') }}
                  </span>
                </template>
              </b-form-datepicker>
            </b-input-group>
          </b-form-group>
        </b-col>
        <b-col sm="6" lg="4" xl="3">
          <b-form-group
            :label="$t('pageDateTime.form.time.timezone', { timezone })"
            label-for="input-manual-time"
          >
            <b-form-text id="time-format-help">HH:MM</b-form-text>
            <b-input-group>
              <b-form-input
                id="input-manual-time"
                v-model="form.manual.time"
                :state="getValidationState($v.form.manual.time)"
                :disabled="ntpOptionSelected"
                data-test-id="dateTime-input-manualTime"
                @blur="$v.form.manual.time.$touch()"
              />
              <b-form-invalid-feedback role="alert">
                <div v-if="!$v.form.manual.time.pattern">
                  {{ $t('global.form.invalidFormat') }}
                </div>
                <div v-if="!$v.form.manual.time.required">
                  {{ $t('global.form.fieldRequired') }}
                </div>
              </b-form-invalid-feedback>
            </b-input-group>
          </b-form-group>
        </b-col>
      </b-row>
      <b-row>
        <b-col cols="2">
          <b-button
            variant="primary"
            type="submit"
            data-test-id="dateTime-button-rtc"
            :disabled="ntpOptionSelected"
            @click="onSyncRtc"
          >
            {{ $t('pageDateTimeInsyde.LANG_CONF_DATE_TIME_SYNC_RTC') }}
          </b-button>
        </b-col>
        <b-col cols="1">
          <b-button
            variant="primary"
            type="submit"
            data-test-id="dateTime-button-save"
            @click="submitForm"
          >
            {{ $t('pageDateTimeInsyde.LANG_CONF_DATE_TIME_SAVE') }}
          </b-button>
        </b-col>
      </b-row>
    </page-section>
  </b-container>
</template>

<script>
import { mapState } from 'vuex';
import PageTitle from '@/components/Global/PageTitle';
import IconCalendar from '@carbon/icons-vue/es/calendar/20';
import PageSection from '@/components/Global/PageSection';
import { requiredIf, helpers } from 'vuelidate/lib/validators';

import LocalTimezoneLabelMixin from '@/components/Mixins/LocalTimezoneLabelMixin';

const isoDateRegex = /([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/;
const isoTimeRegex = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;

const DEBUG = 'DateTime';
export default {
  name: 'DateTimeInsyde',
  components: { PageTitle, IconCalendar, PageSection },
  mixins: [LocalTimezoneLabelMixin],
  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
  data() {
    return {
      selected: this.$store.getters['datetimestore/offset'], //default select index
      locale: this.$store.getters['global/languagePreference'],
      form: {
        configurationSelected: 'manual',
        manual: {
          date: '',
          time: '',
        },
        ntp: { firstAddress: '', secondAddress: '', thirdAddress: '' },
        ntpenable: this.$store.getters['datetimestore/ntpenable'],
      },
      ntpstatus: null,
    };
  },
  validations() {
    return {
      form: {
        manual: {
          date: {
            required: requiredIf(function () {
              return this.form.ntpenable === false;
            }),
            pattern: helpers.regex('pattern', isoDateRegex),
          },
          time: {
            required: requiredIf(function () {
              return this.form.ntpenable === false;
            }),
            pattern: helpers.regex('pattern', isoTimeRegex),
          },
        },
        ntp: {
          firstAddress: {
            required: requiredIf(function () {
              return this.form.ntpenable === true;
            }),
          },
        },
      },
    };
  },
  computed: {
    ...mapState('datetimestore', ['tzOptions', 'ntpServers']),
    timezoneValues() {
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      this.selected = this.$store.getters['datetimestore/offset'];
      console.log(
        DEBUG,
        'computed: timezoneValues(), this.selected',
        this.selected
      );
      return this.selected;
    },
    bmcTime() {
      console.log(DEBUG, this.$store.getters['datetimestore/bmcTime']);
      console.log(DEBUG, this.$store.getters['datetimestore/ntpServers']);
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      this.form.ntpenable = this.$store.getters['datetimestore/ntpenable'];
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      this.ntpstatus = this.$store.getters['datetimestore/ntpStatus'];
      //console.log(DEBUG, this.$store.getters['datetimestore/ntpStatus']);
      //console.log(DEBUG, 'this.ntpstatus', this.ntpstatus);
      return this.$store.getters['datetimestore/bmcTime'];
    },
    // eslint-disable-next-line vue/return-in-computed-property
    ntpState() {
      //console.log(DEBUG, this.$store.getters['datetimestore/ntpenable']);
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      //this.form.ntpenable = this.$store.getters['datetimestore/ntpenable'];
      //return this.form.ntpenable;
    },
    ntpOptionSelected() {
      //return this.form.configurationSelected === 'ntp';
      console.log(DEBUG, 'this.form.ntpenable', this.form.ntpenable);
      return this.form.ntpenable === true;
    },
    manualOptionSelected() {
      //return this.form.configurationSelected === 'manual';
      console.log(DEBUG, 'this.form.ntpenable', this.form.ntpenable);
      return this.form.ntpenable === false;
    },
    isUtcDisplay() {
      return this.$store.getters['global/isUtcDisplay'];
    },
    timezone() {
      if (this.isUtcDisplay) {
        return 'UTC';
      }
      return this.localOffset();
    },
  },
  watch: {
    ntpServers() {
      this.setNtpValues();
    },
    bmcTime() {
      this.form.manual.date = this.$options.filters.formatDate(
        this.$store.getters['datetimestore/bmcTime']
      );
      console.log(DEBUG, 'form.manual.date', this.form.manual.date);
      this.form.manual.time = this.$options.filters
        .formatTime(this.$store.getters['datetimestore/bmcTime'])
        .slice(0, 5);
      console.log(DEBUG, 'form.manual.time', this.form.manual.time);
      this.form.ntpenable = this.$store.getters['datetimestore/ntpenable'];
      console.log(DEBUG, 'form.ntpenable', this.form.ntpenable);
    },
  },
  created() {
    this.startLoader();
    this.setNtpValues();
    let payload = JSON.parse('{}');
    payload.index = 0;
    Promise.all([this.$store.dispatch('datetimestore/getDatetime')]).finally(
      () => {
        this.selected = this.$store.getters['datetimestore/offset'];
        console.log(DEBUG, 'this.selected', this.selected);
        this.endLoader();
      }
    );
    console.log(DEBUG, 'created()');
  },
  methods: {
    onChangeSelect(selectedOption) {
      console.log('submitForm', 'onChangeSelect', selectedOption);
      this.selected = selectedOption;
      /*let payload = JSON.parse('{}');
      payload.index = Number(selectedOption);
      console.log(payload);
      this.startLoader();
      this.$store
        .dispatch('datetimestore/getDeviceInfoByIndex', payload)
        .catch(({ message }) => this.errorToast(message))
        .finally(() => this.endLoader());*/
    },
    setNtpValues() {
      [this.form.ntp.firstAddress = '', this.form.ntp.secondAddress = ''] = [
        this.ntpServers[0],
        this.ntpServers[1],
      ];
      console.log(DEBUG, this.ntpServers[0], this.ntpServers[1]);
      console.log(DEBUG, [
        this.form.ntp.firstAddress,
        this.form.ntp.secondAddress,
      ]);
    },
    submitForm() {
      this.$v.$touch();
      if (this.$v.$invalid) return;
      this.startLoader();

      let dateTimeForm = {};
      let ntp = {};
      let isNTPEnabled = this.form.ntpenable === true;
      console.log(DEBUG, 'isNTPEnabled', isNTPEnabled);
      if (!isNTPEnabled) {
        //const isUtcDisplay = this.$store.getters['global/isUtcDisplay'];
        //console.log(DEBUG, isUtcDisplay);
        let date;
        //if (isUtcDisplay) {
        // Create UTC Date
        //date = this.getUtcDate(this.form.manual.date, this.form.manual.time);
        //} else {
        // Create local Date
        date = new Date(`${this.form.manual.date} ${this.form.manual.time}`);
        //}
        console.log(DEBUG, date);
        //date = date.toISOString();
        //covert to epoch
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        date.setMinutes(date.getMinutes() - this.selected);
        console.log(parseInt(date.getTime() / 1000));
        dateTimeForm.epoch = parseInt(date.getTime() / 1000);
      }
      ntp.enabled = isNTPEnabled;
      ntp.primaryNTPServer = this.form.ntp.firstAddress;
      ntp.secondaryNTPServer = this.form.ntp.secondAddress;
      dateTimeForm.ntp = ntp;
      dateTimeForm.offset = Number(this.selected);
      console.log(
        DEBUG,
        'dateTimeForm',
        dateTimeForm,
        JSON.stringify(dateTimeForm)
      );
      this.$store
        .dispatch('datetimestore/updateDateTime', dateTimeForm)
        .then((success) => {
          this.successToast(success);
        })
        .then(() => {
          this.$store.dispatch('global/getBmcTime');
        })
        .catch(({ message }) => this.errorToast(message))
        .finally(() => {
          this.$v.form.$reset();
          this.endLoader();
        });
    },
    onSyncRtc() {
      this.startLoader();
      this.$store
        .dispatch('datetimestore/syncFromRtc')
        .then((success) => {
          console.log(success);
          this.successToast(success);
          Promise.all([
            this.$store.dispatch('datetimestore/getDatetime'),
          ]).finally(() => this.endLoader());
        })
        .catch(({ message }) => this.errorToast(message))
        .finally(() => this.endLoader());
    },
    changeNtpValue(ntpenable) {
      console.log(DEBUG, ntpenable);
    },
  },
};
</script>

<style scoped>
.ntpstatus-fs {
  font-style: italic;
}
.ntpstatus-normal {
  color: #8bc34a;
}
.ntpstatus-unreach-error {
  color: #f44336;
}
.ntpstatus-running {
  color: #2196f3;
}
</style>
