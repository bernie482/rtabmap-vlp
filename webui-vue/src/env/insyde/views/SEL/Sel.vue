<template>
  <b-container fluid="x1">
    <page-title />
    <b-row>
      <b-form-radio
        v-model="selaudit"
        name="sel-audit"
        value="sel"
        class="mr-5"
        @change="refreshLog"
      >
        {{ $t('pageSystemEventLog.BMC_EVENT_SEL_STR') }}
      </b-form-radio>
      <b-form-radio
        v-model="selaudit"
        name="sel-audit"
        value="audit"
        class="mr-5"
        @change="AuditLog"
      >
        {{ $t('pageSystemEventLog.BMC_AUDIT_LOG_STR') }}
      </b-form-radio>
    </b-row>
    <page-section v-show="selaudit != 'audit'">
      <b-row>
        <div class="mr-5">
          {{ $t('pageSystemEventLog.EVENT_LOG_CATEGORY_DESC') }}
        </div>
        <select v-model="logCategory" class="select-blue">
          <option
            v-for="(items, prop, idx) in eventCategory"
            :key="idx"
            :value="prop"
          >
            {{ `${'&nbsp;'.repeat(items.level * 4)}${items.name}` }}
          </option>
        </select>
      </b-row>
      <b-row>
        <b-form-radio
          v-for="(value, idx) in owpolicy"
          :key="idx"
          v-model="owply"
          name="over-write-policy"
          :value="value"
          class="mr-5"
          @change="setOverWritePolicy"
        >
          {{ `${$t('pageSystemEventLog.EVENT_LOG_' + value.toUpperCase())}` }}
        </b-form-radio>
      </b-row>
      <b-row>
        <div class="mr-5">
          {{ $t('pageSystemEventLog.EVENT_LOG_SEVERITY_TYPE') }}
        </div>
        <b-form-checkbox
          v-model="severity['info']"
          class="mr-5"
          value="Information"
        >
          {{ $t('pageSystemEventLog.SENSOR_HEALTH_INFORMATION') }}
        </b-form-checkbox>
        <b-form-checkbox
          v-model="severity['warn']"
          class="mr-5"
          value="Warning"
        >
          {{ $t('pageSystemEventLog.SENSOR_HEALTH_WARNING') }}
        </b-form-checkbox>
        <b-form-checkbox
          v-model="severity['critical']"
          class="mr-5"
          value="Critical"
        >
          {{ $t('pageSystemEventLog.SENSOR_HEALTH_CRITICAL') }}
        </b-form-checkbox>
      </b-row>
      <b-row>
        <b-form-radio
          v-for="(items, idx) in timeZoneData"
          :key="idx"
          v-model="timeZone"
          name="timezone"
          :value="items.timezone"
          class="mr-5"
        >
          {{
            `${$t(
              'pageSystemEventLog.EVENT_OPTION_' + items.name + '_TIMEZONE'
            )}`
          }}
        </b-form-radio>
        <div id="utc_offset_lbl">
          {{ $t('pageSystemEventLog.GMT_TIMEZONE') }}{{ timezoneOffsetStr }}
        </div>
      </b-row>
      <b-row>
        <b-form-checkbox v-model="filterbytime" class="mr-5">
          {{ $t('pageSystemEventLog.EVENT_LOG_FILTER_BY_TIME') }}
        </b-form-checkbox>
      </b-row>
      <b-row class="v-center">
        <label>{{ $t('pageSystemEventLog.EVENT_LOG_FILTER_START') }}</label>
        <input
          id="start_datepicker"
          v-model="startDate"
          name="_date"
          type="date"
          class="select-blue ml-5"
          :disabled="!filterbytime"
        />
        <div class="div_hhmm ml-5">
          <input
            v-model="shour"
            name="_time"
            type="number"
            min="0"
            max="23"
            placeholder="23"
            class="time-blue"
            :disabled="!filterbytime"
          />:
          <input
            v-model="smin"
            name="_time"
            type="number"
            min="0"
            max="59"
            placeholder="00"
            class="time-blue"
            :disabled="!filterbytime"
          />
        </div>
        <label>{{ $t('pageSystemEventLog.EVENT_LOG_FILTER_END') }}</label>
        <input
          id="end_datepicker"
          v-model="endDate"
          name="_date"
          type="date"
          class="select-blue ml-5"
          :disabled="!filterbytime"
        />
        <div class="div_hhmm ml-5">
          <input
            v-model="ehour"
            name="_time"
            type="number"
            min="0"
            max="23"
            placeholder="23"
            class="time-blue"
            :disabled="!filterbytime"
          />:
          <input
            v-model="emin"
            name="_time"
            type="number"
            min="0"
            max="59"
            placeholder="00"
            class="time-blue"
            :disabled="!filterbytime"
          />
        </div>
      </b-row>
      <b-row id="control-panel" class="grid-col-3">
        <b-row class="item-d">
          <b-button variant="primary" class="btn mr-10px" @click="ConfigSave">
            {{ $t('global.action.save') }}
          </b-button>
          <b-form-checkbox v-model="chkbmc" name="sel_save" class="mr-5">
            {{ $t('pageSystemEventLog.SDR_BMC') }}
          </b-form-checkbox>
          <b-form-checkbox v-model="chkme" name="sel_save" class="mr-5">
            {{ $t('pageSystemEventLog.SDR_ME') }}
          </b-form-checkbox>
          <b-form-checkbox v-model="chksatellite" name="sel_save" class="mr-5">
            {{ $t('pageSystemEventLog.SDR_SATELLITE') }}
          </b-form-checkbox>
          <b-form-checkbox v-model="chksoft" name="sel_save" class="mr-5">
            {{ $t('pageSystemEventLog.SDR_SYSTEM_SOFTWARE') }}
          </b-form-checkbox>
        </b-row>
        <div class="item-a">
          <b-button variant="primary" class="btn mr-10px" @click="clearLog">
            {{ $t('pageSystemEventLog.EVENT_CLEARBTN') }}
          </b-button>
          <b-button variant="primary" class="btn mr-10px" @click="refreshLog">
            {{ $t('pageSystemEventLog.EVENT_REFRESHBTN') }}
          </b-button>
        </div>
        <div class="item-b grid-self-center">
          <div>
            <select id="selSelectSize" v-model="selSize" class="select-blue">
              <option
                v-for="(size, idx) in selSelectSize"
                :key="idx"
                :value="size"
              >
                {{ size }}
              </option>
            </select>
            <b-button
              variant="primary"
              class="btn"
              :disabled="paggingIndex <= 1"
              @click="pageFirst"
            >
              &lt;&lt;
            </b-button>
            <b-button
              variant="primary"
              class="btn"
              :disabled="paggingIndex <= 1"
              @click="pageUp"
            >
              &lt;
            </b-button>
            <span>{{ getPaggingIndex }} / {{ paggingMax }}</span>
            <b-button
              variant="primary"
              class="btn"
              :disabled="paggingIndex >= paggingMax"
              @click="pageDown"
            >
              &gt;
            </b-button>
            <b-button
              variant="primary"
              class="btn"
              :disabled="paggingIndex >= paggingMax"
              @click="pageEnd"
            >
              &gt;&gt;
            </b-button>
            <label id="pageSelCount"></label>
          </div>
        </div>
        <div class="grid-self-end item-c">
          <div id="log_selcount_lbl">
            {{ `${$t('pageSystemEventLog.EVENT_LOG_SELCOUNT')}: ` }}
            {{ totalsel }} {{ $t('pageSystemEventLog.EVENT_LOG_SELEntries') }}
          </div>
          <div v-if="!opf5ReleasePatches" id="selFull">
            {{
              `${$t('pageSystemEventLog.EVENT_LOG_SELPERCENT1')}
               ${percentage}
               ${$t('pageSystemEventLog.EVENT_LOG_SELPERCENT2')}`
            }}
          </div>
          <div v-if="!opf5ReleasePatches" class="meter">
            <div id="selMeter" class="meter" :style="meterStyle"></div>
          </div>
        </div>
        <!--<div id="fullNotice" class="text_alert_warning"></div>-->
      </b-row>
      <br />
      <b-row id="eventLogTable" class="table">
        <b-table
          sort-icon-left
          no-sort-reset
          hover
          sort-by="Number"
          responsive="md"
          show-empty
          :current-page="paggingIndex"
          :per-page="selSize"
          :items="filteredSelArr"
          :fields="fields"
          :sort-desc="true"
          :sort-compare="sortCompare"
          :empty-text="$t('global.table.emptyMessage')"
          :empty-filtered-text="$t('global.table.emptySearchMessage')"
        ></b-table>
      </b-row>
    </page-section>
    <bmc-audit-log v-show="selaudit != 'sel'" :auditobj="auditlog" />
  </b-container>
</template>
<script>
import PageTitle from '@/components/Global/PageTitle';
import TableSortMixin from '@/components/Mixins/TableSortMixin';

import PageSection from '@/components/Global/PageSection';
import {
  processEntryParser,
  processAuditEntryParser,
} from '@/env/insyde/components/Mixins/SELParserMixin';
import { fileDownloader } from '@/env/insyde/utilities/InsydeTools';
import BmcAuditLog from './BmcAuditLog';
import { mapState } from 'vuex';
import Date from '@/env/insyde/utilities/InsydeDate';

export default {
  name: 'Sel',
  components: {
    PageTitle,
    PageSection,
    BmcAuditLog,
  },
  mixins: [TableSortMixin],
  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
  data() {
    return {
      selSize: 12,
      timeZoneData: [
        {
          name: 'BMC',
          timezone: 'UTC',
        },
        {
          name: 'CLIENT',
          timezone: 'Asia/Taipei',
        },
      ],
      selSelectSize: [12, 20, 50, 100, 250, 500],
      selaudit: 'sel',
      logCategory: 'ALL',
      owpolicy: ['circular', 'linear'],
      eventCategory: {
        ALL: {
          name: '\u25CF ' + this.$t('pageSystemEventLog.EVENT_OPTION_ALL'),
          level: 0,
        },
        BMC: {
          name: '\u25CB ' + this.$t('pageSystemEventLog.EVENT_OPTION_BMC'),
          level: 1,
        },
        ME: {
          name: '\u25CB ' + this.$t('pageSystemEventLog.EVENT_OPTION_ME'),
          level: 1,
        },
        SATELLITE: {
          name:
            '\u25CB ' + this.$t('pageSystemEventLog.EVENT_OPTION_SATELLITE'),
          level: 1,
        },
        BIOS: {
          name:
            '\u25CB ' +
            this.$t('pageSystemEventLog.EVENT_OPTION_SOFTWARE_BIOS'),
          level: 1,
        },
        'SYSTEM-SOFTWARE': {
          name: '\u25CB ' + this.$t('pageSystemEventLog.EVENT_OPTION_SOFTWARE'),
          level: 1,
        },
        'SYSTEM-SOFTWARE-SMI': {
          name:
            '\u25A0 ' + this.$t('pageSystemEventLog.EVENT_OPTION_SOFTWARE_SMI'),
          level: 2,
        },
        'SYSTEM-SOFTWARE-SMS': {
          name:
            '\u25A0 ' + this.$t('pageSystemEventLog.EVENT_OPTION_SOFTWARE_SMS'),
          level: 2,
        },
        'SYSTEM-SOFTWARE-OEM': {
          name:
            '\u25A0 ' + this.$t('pageSystemEventLog.EVENT_OPTION_SOFTWARE_OEM'),
          level: 2,
        },
        'SYSTEM-SOFTWARE-REMOTE': {
          name:
            '\u25A0 ' +
            this.$t('pageSystemEventLog.EVENT_OPTION_SOFTWARE_REMOTE'),
          level: 2,
        },
        'SYSTEM-SOFTWARE-TERMINAL': {
          name:
            '\u25A0 ' +
            this.$t('pageSystemEventLog.EVENT_OPTION_SOFTWARE_TERMINAL'),
          level: 2,
        },
      },
      fields: [
        {
          key: 'Number',
          label: this.$t('pageSystemEventLog.EVENT_TABLE_HEADTITLE0'),
          sortable: true,
        },
        {
          key: 'timeStamp',
          formatter: (value) => {
            return this.getdatetimeString(value);
          },
          label: this.$t('pageSystemEventLog.EVENT_TABLE_HEADTITLE1'),
          sortable: false,
          tdClass: 'text-nowrap',
        },
        {
          key: 'name',
          formatter: (value) => {
            // getSensorName(entry, RID)
            return value;
          },
          label: this.$t('pageSystemEventLog.EVENT_TABLE_HEADTITLE2'),
          sortable: false,
          tdClass: 'text-nowrap',
        },
        {
          key: 'controller',
          formatter: (value) => {
            // controller.name
            return value;
          },
          label: this.$t('pageSystemEventLog.EVENT_TABLE_HEADTITLE3'),
          sortable: false,
          tdClass: `text-nowrap`,
        },
        {
          key: 'filter',
          formatter: (value) => {
            return value;
          },
          label: '',
          sortable: false,
          tdClass: `text-nowrap d-none`,
          thClass: `d-none`,
        },
        {
          key: 'severity',
          formatter: (value) => {
            // getSeverity(entry['Severity'])
            return value;
          },
          label: this.$t('pageSystemEventLog.EVENT_TABLE_HEADTITLE4'),
          sortable: false,
          tdClass: 'text-nowrap',
        },
        {
          key: 'type',
          formatter: (value) => {
            // getSensorType(entry, RID, GID)
            return value;
          },
          label: this.$t('pageSystemEventLog.EVENT_TABLE_HEADTITLE5'),
          sortable: false,
          tdClass: 'text-nowrap',
        },
        {
          key: 'desc',
          formatter: (value) => {
            // getDescription(entry)
            return value;
          },
          label: this.$t('pageSystemEventLog.EVENT_TABLE_HEADTITLE6'),
          sortable: false,
          tdClass: 'text-nowrap',
        },
      ],
      chkbmc: true,
      chkme: true,
      chksatellite: true,
      chksoft: true,
      filterbytime: false,
      severity: {
        info: 'Information',
        warn: 'Warning',
        critical: 'Critical',
      },
      owply: 'circular',
      startDate: '',
      endDate: '',
      shour: {
        type: Number,
      },
      smin: {
        type: Number,
      },
      ehour: {
        type: Number,
      },
      emin: {
        type: Number,
      },
      timeZone: 'Asia/Taipei',
      url: '',
      showtz: 'GMT+08:00',
      totalsel: 0,
      paggingIndex: 1,
      allselArr: [],
      auditlog: {},
      percentage: 0,
      meterStyle: {},
    };
  },
  computed: {
    ...mapState('sel', ['entry', 'capacity']),
    filteredSelArr() {
      return this.filterTable();
    },
    getPaggingIndex() {
      if (this.paggingMax == 0) return 0;
      return this.paggingIndex;
    },
    totalSel() {
      if (!this.entry || !this.entry.Members) return 0;
      return this.entry.Members.length;
    },
    totalSelFiltered() {
      if (!this.entry || !this.filteredSelArr) return 0;
      return this.filteredSelArr.length;
    },
    paggingMax() {
      return Math.ceil(this.totalSelFiltered / this.selSize);
    },
    auditentry() {
      return processAuditEntryParser(this.$store.getters['sel/entrydata']);
    },
    selentry() {
      return processEntryParser(this.$store.getters['sel/entrydata']);
    },
    timezoneOffsetStr() {
      let sign = this.timezoneOffset >= 0 ? '+' : '-';
      let hr = Math.ceil(this.timezoneOffset / 60);
      let minute = this.timezoneOffset % 60;
      if (hr < 10) hr = '0' + hr;
      if (minute < 10) minute = '0' + minute;
      return sign + hr + ':' + minute;
    },
    timezoneOffset() {
      // unit: minutes
      if (this.timeZone == 'UTC') {
        return this.$store.getters['datetimestore/offset'];
      }
      return -1 * new Date().getTimezoneOffset();
    },
    opf5ReleasePatches: () => process.env.VUE_APP_OPF5_RELEASE_PATCHES,
  },
  watch: {
    paggingMax: function () {
      this.paggingIndex =
        this.paggingIndex > this.paggingMax ? 1 : this.paggingIndex;
    },
  },
  created() {
    const sel = this;
    sel.startDate = sel.getTodayDate();
    sel.shour = '00';
    sel.smin = '00';
    sel.endDate = sel.getTodayDate();
    sel.ehour = '23';
    sel.emin = '59';
    sel.startLoader();
    sel.$store.dispatch('datetimestore/getDatetime');
    sel.$store
      .dispatch('sel/fetchSel')
      .then(() => {
        sel.url = sel.selentry.odataid;
        sel.totalsel = sel.selentry.Maxcount;
      })
      .then(() => {
        let entryobj = {
          url: sel.url,
          lastEntry: sel.totalsel,
        };
        // Reset SEL array
        sel.allselArr = [];
        sel.fetchEntry(entryobj);
      });
  },
  methods: {
    AuditLog() {
      const audit = this;
      audit.$store.dispatch('sel/fetchAudit').then(() => {
        //console.log(audit.auditentry);
        audit.auditlog = {
          url: audit.auditentry.odataid,
          maxcount: parseInt(audit.auditentry.Maxcount),
        };
      });
    },
    pageFirst() {
      this.paggingIndex = 1;
    },
    pageEnd() {
      this.paggingIndex = this.paggingMax;
    },
    pageUp() {
      this.paggingIndex -= 1;
    },
    pageDown() {
      this.paggingIndex += 1;
    },
    updateSelfulllbl(totalRows) {
      const sel = this;
      let _capacity = sel.$store.getters['sel/capacity'];
      if (_capacity < 100) {
        _capacity = 100;
      }
      this.percentage = ((totalRows * 100) / _capacity).toFixed(2);
      this.meterStyle = {
        width: `${2 * parseInt(this.percentage)}px`,
      };
    },
    getTodayDate() {
      let date = new Date();
      let day = ('0' + date.getDate()).slice(-2);
      let month = ('0' + (date.getMonth() + 1)).slice(-2);
      let today = date.getFullYear() + '-' + month + '-' + day;
      return today;
    },
    clearLog() {
      const sel = this;
      sel.$bvModal
        .msgBoxConfirm(`${sel.$t('pageSystemEventLog.EVENT_CLEAN_PROMPT')} ?`, {
          title: `${sel.$t('global.action.confirm')} ?`,
        })
        .then((confirmed) => {
          if (confirmed) {
            const url = sel.$store.getters['sel/actions'];
            sel.startLoader();
            sel.$store
              .dispatch('sel/postActions', url)
              .then((success) => {
                sel.successToast(success);
                sel.refreshLog();
              })
              .catch((message) => {
                sel.errorToast(message);
              })
              .finally(() => sel.endLoader());
          }
        });
    },
    refreshLog() {
      const sel = this;
      window.abortController.doAbort();
      sel.logCategory = 'ALL';
      sel.severity['info'] = 'Information';
      sel.severity['warn'] = 'Warning';
      sel.severity['critical'] = 'Critical';
      sel.filterbytime = false;
      sel.startLoader();
      sel.$store
        .dispatch('sel/fetchSel')
        .then(() => {
          sel.totalsel = sel.selentry.Maxcount;
        })
        .then(() => {
          let entryobj = {
            url: sel.url,
            lastEntry: sel.totalsel,
          };
          // Reset SEL array
          sel.allselArr = [];
          sel.fetchEntry(entryobj);
        });
    },
    fetchEntry(entryObj) {
      const sel = this;
      if (entryObj.lastEntry === 0) return;
      let pageSize = sel.selSize;
      let startFrom = entryObj.lastEntry - pageSize;
      if (startFrom < 0) {
        pageSize += startFrom; // page size 15, only fetch 0 ~ 12
        startFrom = 0;
      }
      sel.$store
        .dispatch('sel/fetchEntry', {
          url: sel.url,
          lastEntry: startFrom,
          pageSize: pageSize,
        })
        .then(() => {
          sel.allselArr = sel.allselArr.concat(sel.selentry.entryArr);
          sel.updateSelfulllbl(sel.allselArr.length);
          if (startFrom > 0 && sel.totalsel > 0) {
            sel.fetchEntry({ lastEntry: startFrom });
          } else {
            sel.endLoader();
          }
        });
    },
    setOverWritePolicy() {
      const sel = this;
      const url = sel.url.match(
        '/redfish/v1/Systems/[a-z|0-9]*/LogServices/ALL'
      );
      //console.log('url url url: ', url[0]);
      if (sel.owply != 'linear') {
        sel.$store.dispatch('sel/patchCircular', url[0]).then().finally();
      } else {
        sel.$store.dispatch('sel/patchLinear', url[0]).then().finally();
      }
    },
    getdatetimeString(str) {
      if (!str) return '';
      let d = new Date(Date.parse(str));
      let offset = this.timezoneOffset;
      d.addSeconds(offset * 60);
      return d.format('ddd mmm dd HH:MM:ss yyyy');
    },
    filterTable() {
      let sel = this;
      let filterArr = this.allselArr;
      // log category
      if (sel.logCategory != 'ALL') {
        filterArr = filterArr.filter((value) => {
          return value?.filter.includes(sel.logCategory);
        });
      }
      // severity
      let currentCheckedSeverity = '';
      for (var prop in sel.severity) {
        if (sel.severity[prop] != false) {
          currentCheckedSeverity += sel.severity[prop];
        }
      }
      //console.log('currentCheckedSeverity= ',currentCheckedSeverity);
      filterArr = filterArr.filter((value) => {
        return currentCheckedSeverity.includes(value?.severity);
      });
      // filter by date time
      if (sel.filterbytime) {
        //console.log(sel.startDate, sel.shour, sel.smin, sel.endDate, sel.ehour, sel.emin);
        let StartTime = new Date(
          sel.startDate + ' ' + sel.shour + ':' + sel.smin
        );
        let EndTime = new Date(sel.endDate + ' ' + sel.ehour + ':' + sel.emin);
        //console.log('StartTime = ', StartTime,'EndTime= ', EndTime);
        let startTimeStamp = StartTime.getTime();
        let endTimeStamp = EndTime.getTime();
        //console.log('startTimeStamp= ', startTimeStamp, 'endTimeStamp= ', endTimeStamp);
        if (startTimeStamp > endTimeStamp) {
          let currentDate = new Date();
          sel.errorToast(sel.$t('pageSystemEventLog.EVENT_LOG_FILTER_WARNING'));
          sel.startDate = sel.getTodayDate();
          sel.shour = '00';
          sel.smin = '00';
          sel.endDate = sel.getTodayDate();
          sel.ehour = '23';
          sel.emin = '59';
          startTimeStamp = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            currentDate.getDay(),
            0,
            0,
            0,
            0
          ).getTime();
          endTimeStamp = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            currentDate.getDay(),
            23,
            59,
            0,
            0
          ).getTime();
        }
        filterArr = filterArr.filter((value) => {
          let currentTimeStamp = new Date(value.timeStamp).getTime();
          return (
            currentTimeStamp >= startTimeStamp &&
            currentTimeStamp <= endTimeStamp
          );
        });
      }
      return filterArr;
    },
    ConfigSave() {
      // save
      const sel = this;
      let payloadObj = {
        Filter: [
          {
            bmc: !sel.chkbmc ? '1' : '0',
          },
          {
            me: !sel.chkme ? '1' : '0',
          },
          {
            satellite: !sel.chksatellite ? '1' : '0',
          },
          {
            software: !sel.chksoft ? '1' : '0',
          },
        ],
      };
      sel.startLoader();
      sel.$store
        .dispatch('sel/postSel', payloadObj)
        .then((success) => {
          fileDownloader({
            url: '/cgi/sel.cgi',
            filename: 'SELLOG.zip',
          });
          sel.successToast(success);
        })
        .finally(() => {
          sel.endLoader();
        });
    },
    sortCompare(a, b, key) {
      if (key === 'severity') {
        return this.sortStatus(a, b, key);
      }
    },
  },
};
</script>
<style scoped>
.row {
  /*align-items: flex-end !important;*/
  margin-left: 0px !important;
}
.table {
  display: inline-block;
  height: 38vh;
  /*overflow-y: scroll;*/
}
#selMeter {
  width: 0px;
  border: none;
  background-color: rgb(244, 67, 54);
}
.meter {
  width: 200px;
  height: 10px;
  border: 1px solid black;
  box-sizing: content-box;
}
#fullNotice {
  grid-area: notice;
}
.text_alert_warning {
  color: #bd6202;
}
.grid-self-end {
  justify-self: end;
}
.item-c {
  grid-area: capacity;
}
.item-b {
  grid-area: pagger;
}
.grid-self-center {
  justify-self: center;
}
.item-a {
  grid-area: action;
}
.item-d {
  grid-area: savesel;
}
#control-panel {
  grid-template-areas:
    'notice notice notice '
    'savesel savesel capacity'
    'action pagger capacity';
  margin-top: 24px;
}
.grid-col-3 {
  display: grid;
  grid-gap: 5px;
  grid-template-columns: auto auto auto;
  /* grid-template-rows: auto; */
  align-items: end;
}
.btn {
  display: inline-block;
  padding: 7px 14px;
  margin: 5px;
  border-radius: 3px;
  border: none;
  text-align: center;
  vertical-align: middle;
  cursor: pointer;
  background-color: #2e9fd3;
  border: 1px solid #2e9fd3;
  color: #fff;
  outline: none;
  transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out,
    border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  font-style: normal;
  font-variant-ligatures: normal;
  font-variant-caps: normal;
  font-variant-numeric: normal;
  font-variant-east-asian: normal;
  font-weight: bold;
  font-stretch: normal;
  font-size: 12px;
  line-height: normal;
  font-family: 'Segoe UI', Arial, Helvetica, 'Microsoft YaHei',
    'Microsoft JhengHei', sans-serif;
}
select {
  background-color: #fff;
}
.select-blue {
  border: 2px solid #0077ae;
  text-align-last: center;
  padding: 5px 12px;
  font-size: 12px;
  font-weight: bold;
  text-align: center;
  border-radius: 5px;
  outline: none;
}
.time-blue {
  border: none;
  text-align-last: center;
  padding: 5px 12px;
  font-size: 12px;
  font-weight: bold;
  text-align: center;
  outline: none;
}
.mr-10px {
  margin-right: 10px;
}
.div_hhmm_disabled {
  color: gray;
  border-color: rgba(0, 119, 174, 0.5);
  border-color: #e0e0e0;
  cursor: not-allowed;
}
.div_hhmm {
  border: 2px solid #0077ae;
  border-radius: 5px;
}
.select-blue {
  border: 2px solid #0077ae;
  text-align-last: center;
  padding: 5px 12px;
  font-size: 12px;
  font-weight: bold;
  text-align: center;
  border-radius: 5px;
  outline: none;
}
.ml-5 {
  margin-left: 5px !important;
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
</style>
