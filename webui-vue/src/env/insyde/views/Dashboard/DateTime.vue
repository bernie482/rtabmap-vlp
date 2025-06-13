<template>
  <overview-card
    :title="$t('pageDashboard.date&time')"
    :to="`/settings/date-time`"
  >
    <div class="dashboard-refresh">
      <icon-restart class="pointer" @click="onIconAction($event)" />
    </div>
    <div class="dashboard-info">
      <b-row class="mt-2">
        <div id="clock">
          <div id="date">
            <span id="year">{{ datetime.year }}</span>
            <span class="slash">/</span>
            <span id="month">{{ datetime.month }}</span>
            <span class="slash">/</span>
            <span id="day">{{ datetime.day }}</span>
          </div>
          <div id="time">
            <span id="hour" class="time-num">{{ datetime.hour }}</span>
            <span class="time-num">:</span>
            <span id="minute" class="time-num">{{ datetime.minute }}</span>
            <span id="week">{{ datetime.week }}</span>
            <div id="tz">{{ datetime.tz }}</div>
          </div>
        </div>
      </b-row>
    </div>
  </overview-card>
</template>

<script>
import OverviewCard from './OverviewCard';
import DataFormatterMixin from '@/components/Mixins/DataFormatterMixin';
import IconRestart from '@carbon/icons-vue/es/restart/24';

export default {
  name: 'DateTime',
  components: {
    OverviewCard,
    IconRestart,
  },
  mixins: [DataFormatterMixin],
  computed: {
    datetime() {
      return this.$store.getters['dashboardstore/datetimeinfo'];
    },
  },
  created() {
    this.$store
      .dispatch('dashboardstore/getDateTime')
      .catch(({ message }) => this.errorToast(message))
      .finally(() => {
        this.$root.$emit('date-time-complete');
      });
  },
  methods: {
    exportFileNameByDate() {
      // Create export file name based on date
      let date = new Date();
      date =
        date.toISOString().slice(0, 10) +
        '_' +
        date.toString().split(':').join('-').split(' ')[4];
      let fileName = 'all_event_logs_';
      return fileName + date;
    },
  },
};
</script>
<style lang="scss" scoped>
/** datetime
---------------------------------------------------------*/
#clock {
  text-align: center;
}

#date {
  display: inline-block;
  margin-right: 16px;
  font-size: 18px;
  line-height: 18px;
  letter-spacing: 1.6px;
  vertical-align: middle;
  color: #757575;
}

#time {
  position: relative;
  display: inline-block;
  line-height: 36px;
  letter-spacing: 3.2px;
}

.time-num {
  font-size: 28px;
  vertical-align: middle;
  color: #4f4f4f;
}

#week {
  margin-left: 16px;
  vertical-align: super;
  color: #8f8f8f;
}

#tz {
  position: absolute;
  color: #aeaeae;
  right: 0;
  bottom: -24px;
}
</style>
