<template>
  <b-container fluid="x1">
    <page-section>
      <b-row id="control-panel" class="grid-col-3">
        <b-row>
          <b-button variant="primary" class="btn mr-10px" @click="Save">
            {{ $t('global.action.save') }}
          </b-button>
          <b-button variant="primary" class="btn mr-10px" @click="clearLog">
            {{ $t('pageSystemEventLog.EVENT_CLEARBTN') }}
          </b-button>
          <b-button variant="primary" class="btn mr-10px" @click="refreshLog">
            {{ $t('pageSystemEventLog.EVENT_REFRESHBTN') }}
          </b-button>
        </b-row>
        <div class="grid-self-center">
          <div>
            <select
              id="selSelectSize"
              v-model="auditSize"
              class="select-blue"
              @change="changeSizePage"
            >
              <option
                v-for="(size, idx) in selSelectSize"
                :key="idx"
                :value="size"
              >
                {{ size }}
              </option>
            </select>
            <b-button variant="primary" class="btn" @click="pageTop">
              &lt;&lt;
            </b-button>
            <b-button variant="primary" class="btn" @click="pageUp">
              &lt;
            </b-button>
            <span id="auditSelect">1 / 1</span>
            <b-button variant="primary" class="btn" @click="pageDown">
              &gt;
            </b-button>
            <b-button variant="primary" class="btn" @click="pageBottom">
              &gt;&gt;
            </b-button>
            <label id="pageSelCount"></label>
          </div>
        </div>
        <div class="grid-self-end">
          <div id="log_selcount_lbl">
            {{ `${$t('pageSystemEventLog.BMC_AUDIT_LOG_COUNT')}: ` }}
            {{ total }}
            {{ $t('pageSystemEventLog.BMC_AUDIT_LOG_EVENT_COUNT_STR') }}
          </div>
        </div>
      </b-row>
      <b-row class="table">
        <b-table
          sort-icon-left
          no-sort-reset
          hover
          sort-by="Number"
          responsive="md"
          show-empty
          :items="selItems"
          :fields="fields"
          :sort-desc="true"
          :empty-text="$t('global.table.emptyMessage')"
          :empty-filtered-text="$t('global.table.emptySearchMessage')"
        ></b-table>
      </b-row>
    </page-section>
  </b-container>
</template>
<script>
import PageSection from '@/components/Global/PageSection';
import { processEntryParser } from '@/env/insyde/components/Mixins/SELParserMixin';

export default {
  name: 'BmcAuditLog',
  components: {
    PageSection,
  },

  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
  props: {
    auditobj: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      auditSize: '12',
      selSelectSize: [12, 20, 50, 100, 250, 500],
      selItems: [],
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
          key: 'desc',
          formatter: (value) => {
            return value;
          },
          label: this.$t('pageSystemEventLog.EVENT_TABLE_HEADTITLE6'),
          sortable: false,
          tdClass: 'text-nowrap',
        },
      ],
      timeZone: 'Asia/Taipei',
      url: '',
      total: 0,
      selArr: [],
      $pagger: null,
      allselArr: [],
    };
  },
  computed: {
    entry() {
      return processEntryParser(this.$store.getters['sel/entrydata']);
    },
  },
  watch: {
    auditobj: function (value) {
      //console.log(value);
      if (value == null) return;
      this.init(value);
      this.refreshLog();
    },
  },
  created() {},
  methods: {
    init(dataObj) {
      const audit = this;
      audit.$pagger = document.getElementById('auditSelect');
      audit.url = dataObj.url;
      audit.total = dataObj.maxcount;
    },
    pageTop() {
      const audit = this;
      audit.$pagger.innerText = `1 / ${Math.max(
        Math.ceil(audit.selArr.length / audit.auditSize),
        1
      )}`;
      let end = audit.auditSize - 1;
      let temp = audit.selArr.filter((value, index) => {
        if (index <= end) return value;
      });
      audit.selItems = temp;
    },
    pageBottom() {
      const audit = this;
      let max = Math.max(Math.ceil(audit.selArr.length / audit.auditSize), 1);
      audit.$pagger.innerText = `${max} / ${max}`;
      //=== show rows =====
      let pagenumber = Math.ceil(audit.selArr.length / audit.auditSize);
      let start = (pagenumber - 1) * audit.auditSize;
      let temp = audit.selArr.filter((value, index) => {
        if (index > start - 1) return value;
      });
      audit.selItems = temp;
    },
    pageUp() {
      const audit = this;
      let result = audit.$pagger.innerText.match(/(\d+) \/ (\d+)/);
      //console.log(result[1]); // get currentPage
      let currentPage = result[1];
      if (currentPage == 1) {
        audit.pageTop;
        return;
      }
      --currentPage;
      audit.changePager(currentPage);
    },
    pageDown() {
      const audit = this;
      let result = audit.$pagger.innerText.match(/(\d+) \/ (\d+)/);
      let max = Math.max(Math.ceil(audit.selArr.length / audit.auditSize), 1);
      let currentPage = result[1];
      if (currentPage == max) return;
      ++currentPage;
      audit.changePager(currentPage);
    },
    changePager(currentPage) {
      const audit = this;
      let max = Math.max(Math.ceil(audit.selArr.length / audit.auditSize), 1);
      audit.$pagger.innerText = `${currentPage} / ${max}`;
      //=== show rows =====
      let start = (currentPage - 1) * audit.auditSize;
      let end = start + parseInt(audit.auditSize);
      let temp = audit.selArr.filter((value, index) => {
        if (index > start - 1 && index < end) return value;
      });
      audit.selItems = temp;
    },
    changeSizePage() {
      const audit = this;
      let temp = audit.selArr.filter((value, index) => {
        if (index <= audit.auditSize - 1) return value;
      });
      audit.selItems = temp;
      audit.$pagger.innerText = `1 / ${Math.max(
        Math.ceil(audit.selArr.length / audit.auditSize),
        1
      )}`;
    },
    updateSelfulllbl(totalRows) {
      //console.log('totalRows = ', totalRows);
      const audit = this;
      audit.$pagger.innerText = `1 / ${Math.max(
        Math.ceil(totalRows / audit.auditSize),
        1
      )}`;
    },
    clearLog() {
      const audit = this;
      audit.$bvModal
        .msgBoxConfirm(
          `${audit.$t('pageSystemEventLog.EVENT_CLEAN_PROMPT')} ?`,
          {
            title: `${audit.$t('global.action.confirm')} ?`,
          }
        )
        .then((confirmed) => {
          if (confirmed) {
            const url = audit.$store.getters['sel/auditactions'];
            audit.startLoader();
            audit.$store
              .dispatch('sel/postActions', url)
              .then((success) => {
                audit.successToast(success);
                audit.refreshLog();
              })
              .catch((message) => {
                audit.errorToast(message);
              })
              .finally(() => audit.endLoader());
          }
        });
    },
    refreshLog() {
      const audit = this;
      audit.startLoader();
      audit.$store
        .dispatch('sel/fetchAudit')
        .then(() => {
          audit.total = audit.entry.Maxcount;
        })
        .then(() => {
          let entryobj = {
            url: audit.url,
            pageSize: audit.auditSize,
            lastEntry: audit.total,
          };
          if (audit.total == 0) {
            audit.endLoader();
            return;
          }
          audit.fetchEntry(entryobj);
        });
    },
    fetchEntry(entryObj) {
      const audit = this;
      if (entryObj.lastEntry === 0) return;
      let pageSize = parseInt(audit.auditSize);
      let startFrom = entryObj.lastEntry - pageSize;
      if (startFrom < 0) {
        pageSize += startFrom; // page size 15, only fetch 0 ~ 12
        startFrom = 0;
      }
      audit.$store
        .dispatch('sel/fetchEntry', {
          url: audit.url,
          lastEntry: startFrom,
          pageSize: pageSize,
        })
        .then(() => {
          audit.selArr = audit.selItems = audit.entry.entryArr;
          audit.updateSelfulllbl(audit.selArr.length);
          if (startFrom > 0 && audit.total > 0) {
            audit.processEntry({ lastEntry: startFrom, pageSize: pageSize });
          } else {
            audit.allselArr = audit.selArr;
            audit.endLoader();
          }
        });
    },
    processEntry(entryObj) {
      const audit = this;
      if (entryObj.lastEntry === 0) return;
      let pageSize = entryObj.pageSize;
      let startFrom = entryObj.lastEntry - pageSize;
      if (startFrom < 0) {
        pageSize += startFrom; // page size 15, only fetch 0 ~ 12
        startFrom = 0;
      }
      audit.$store
        .dispatch('sel/fetchEntry', {
          url: audit.url,
          lastEntry: startFrom,
          pageSize: pageSize,
        })
        .then(() => {
          audit.selArr = audit.selArr.concat(audit.entry.entryArr);
          audit.updateSelfulllbl(audit.selArr.length);
          if (startFrom > 0 && audit.total > 0) {
            audit.processEntry({ lastEntry: startFrom, pageSize: pageSize });
          } else {
            //console.log(audit.selArr);
            audit.allselArr = audit.selArr;
            audit.endLoader();
          }
        });
    },
    getdatetimeString(str) {
      let timestamp = Date.parse(str);
      let dateStr = new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false,
        timeZone: this.timeZone, // or UTC
      }).format(timestamp);
      const words = dateStr.split(',');
      dateStr = `${words[0]} ${words[1]} ${words[3]} ${words[2]}`;
      return dateStr;
    },
    Save() {
      const audit = this;
      var content = '';
      // Follow SELText.txt
      // EventID: Time: Description: \n
      audit.allselArr.forEach((entry) => {
        content += `EventID:${('0000' + entry.Number).slice(
          -4
        )}    Time:${audit.getdatetimeString(entry.timeStamp)}    Description:${
          entry.desc
        }\n`;
      });

      audit.download(content, 'AuditLog.txt');
    },
    download(content, filename) {
      var elem = document.createElement('a');
      elem.setAttribute(
        'href',
        `data:text/plain; charset=utf-8,${encodeURIComponent(content)}`
      );
      elem.setAttribute('download', filename);
      elem.style.display = 'none';
      document.body.appendChild(elem);
      elem.click();
      document.body.removeChild(elem);
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
.text_alert_warning {
  color: #bd6202;
}
.grid-self-end {
  justify-self: end;
}
.grid-self-center {
  justify-self: center;
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
