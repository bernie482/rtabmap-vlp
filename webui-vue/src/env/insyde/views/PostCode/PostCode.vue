<template>
  <b-container fluid="xl">
    <page-title />

    <page-section
      :section-title="
        $t('pageInsydePostCode.LANG_SERVER_DIAGNOSTICS_SUBMENU_POST_CODES')
      "
    >
      <div class="form-background pl-4 pt-4 pb-1">
        <b-row class="mb-3">
          <div class="padding">
            {{ $t('pageInsydePostCode.LANG_SERVER_DIAG_POST_TIMEHEADER') }}
          </div>
          <div>
            <b-form-select
              id="post-code-order-type"
              v-model="order"
              style="width: 300px"
              :options="timeOrderOptions"
              @change="refreshPage"
            >
            </b-form-select>
          </div>
        </b-row>

        <b-row class="mb-3">
          <b-col class="padding">
            <span class="title padding">{{
              $t('pageInsydePostCode.LANG_SERVER_DIAG_POST_PREVIOUS')
            }}</span>
            <span class="padding"
              >({{ $t('pageInsydePostCode.LANG_SERVER_DIAG_POST_STARTED') }}
              {{ previous.startTime }})</span
            >
          </b-col>
          <b-col class="padding">
            <span class="title padding">{{
              $t('pageInsydePostCode.LANG_SERVER_DIAG_POST_CURRENT')
            }}</span>
            <span class="padding"
              >({{ $t('pageInsydePostCode.LANG_SERVER_DIAG_POST_STARTED') }}
              {{ current.startTime }})</span
            >
          </b-col>
        </b-row>
        <b-row class="mb-3">
          <b-col>
            <span class="title timestamp">{{
              $t('pageInsydePostCode.LANG_SERVER_DIAG_POST_THEAD_TIME')
            }}</span>
            <span class="title padding">{{
              $t('pageInsydePostCode.LANG_SERVER_DIAG_POST_THEAD_CODE')
            }}</span>
          </b-col>
          <b-col>
            <span class="title timestamp">{{
              $t('pageInsydePostCode.LANG_SERVER_DIAG_POST_THEAD_TIME')
            }}</span>
            <span class="title padding">{{
              $t('pageInsydePostCode.LANG_SERVER_DIAG_POST_THEAD_CODE')
            }}</span>
          </b-col>
        </b-row>
        <b-row class="mb-3">
          <b-col>
            <div v-for="(item, index) in previousRecords" :key="index">
              <b-row
                :class="recordStyle(item.code)"
                @mouseover="pickup = item.code"
              >
                <b-col>
                  <span class="padding">{{ item.time }}</span>
                  <span class="padding">{{ item.code }}</span>
                  <span class="padding">{{ item.msg }}</span>
                </b-col>
              </b-row>
            </div>
          </b-col>
          <b-col>
            <div v-for="(item, index) in currentRecords" :key="index">
              <b-row
                :class="recordStyle(item.code)"
                @mouseover="pickup = item.code"
              >
                <b-col>
                  <span class="padding">{{ item.time }}</span>
                  <span class="padding">{{ item.code }}</span>
                  <span class="padding">{{ item.msg }}</span>
                </b-col>
              </b-row>
            </div>
          </b-col>
        </b-row>
      </div>
    </page-section>
  </b-container>
</template>

<script>
import PageTitle from '@/components/Global/PageTitle';
import PageSection from '@/components/Global/PageSection';

import { mapFields } from 'vuex-map-fields';
import Date from '@/env/insyde/utilities/InsydeDate';

export default {
  name: 'Kvm',
  components: { PageTitle, PageSection },

  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
  data() {
    return {
      pageStyle: '1BYTE',
      pickup: '',
      startTimePrevious: 0,
      startTimeCurrent: 0,
      order: 0,
      timeOrderOptions: [
        {
          value: 0,
          text: this.$t(
            'pageInsydePostCode.LANG_SERVER_DIAG_POST_TIMEFROMSTART'
          ),
        },
        {
          value: 1,
          text: this.$t(
            'pageInsydePostCode.LANG_SERVER_DIAG_POST_TIMERELATIVE'
          ),
        },
      ],
    };
  },
  computed: {
    ...mapFields('postCode', ['previous', 'current', 'postCodeTable']),
    previousRecords() {
      return this.processRecords(this.previous.post, this.startTimePrevious);
    },
    currentRecords() {
      return this.processRecords(this.current.post, this.startTimeCurrent);
    },
  },
  created() {
    //<!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN: CONFIG_LPC_SNOOP_DMA -->
    this.pageStyle = '4BYTE';
    //<!-- WEB_CONFIG_DEPEND_FEATURE_END: CONFIG_LPC_SNOOP_DMA -->
    //<!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN: !CONFIG_LPC_SNOOP_DMA -->
    this.pageStyle = '1BYTE';
    //<!-- WEB_CONFIG_DEPEND_FEATURE_END: !CONFIG_LPC_SNOOP_DMA -->

    // overall init request
    this.startLoader();
    const getPostCodeTable = this.$store.dispatch('postCode/getPostCodeTable');
    const getPreviousLogs = this.$store.dispatch(
      'postCode/getPreviousLogs',
      this.pageStyle
    );
    const getCurrentLogs = this.$store.dispatch(
      'postCode/getCurrentLogs',
      this.pageStyle
    );
    Promise.all([getPostCodeTable, getPreviousLogs, getCurrentLogs]).finally(
      () => {
        this.endLoader();

        // PATCH: fix bad start time issue
        if (this.previous.post.length > 0) {
          this.startTimePrevious = parseInt(this.previous.post[0]['TIMESTAMP']);
          this.previous.startTime = new Date(
            this.startTimePrevious * 1000
          ).insydeSel();
        }
        if (this.current.post.length > 0) {
          this.startTimeCurrent = parseInt(this.current.post[0]['TIMESTAMP']);
          this.current.startTime = new Date(
            this.startTimeCurrent * 1000
          ).insydeSel();
        }
      }
    );
  },
  methods: {
    recordStyle(code) {
      return this.pickup == code ? 'col_record_highlight' : 'col_record';
    },
    refreshPage() {
      // reset the data to trigger UI update
      let records = JSON.parse(JSON.stringify(this.previous.post)); // deep copy
      this.previous.post = records;
      records = JSON.parse(JSON.stringify(this.current.post)); // deep copy
      this.current.post = records;
    },
    processRecords(records, refStartTime) {
      return records.map((el, i, array) => {
        // timestamp
        let time;
        if (this.order != 0) {
          // time diff with previous record
          let diff =
            i > 0
              ? parseInt(el.TIMESTAMP) - parseInt(array[i - 1].TIMESTAMP)
              : 0;
          time = new Date(diff); // unit: ms
          time = '+' + time.format('MM:ss.l');
        } else {
          time = new Date(parseInt(el.TIMESTAMP) - refStartTime); // unit: ms
          time = time.format('MM:ss.l');
        }
        // convert hex to post code string
        let code = el.POSTCODE.slice(-2).toUpperCase();
        let number = Number(('0x' + el.POSTCODE).slice(-4));
        let msg = this.postCodeTable[number] || '';
        return { time, code, msg };
      });
    },
  },
};
</script>

<style scoped>
.col_record {
  background-color: #f4f4f4;
}
.col_record_highlight {
  background-color: #f4f41c;
}
.timestamp {
  padding-left: 5px;
  padding-right: 50px;
}
.padding {
  padding: 5px;
}
</style>
