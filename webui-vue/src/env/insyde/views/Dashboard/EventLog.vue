<template>
  <overview-card :title="$t('pageDashboard.eventLog')" :to="`/logs/event-logs`">
    <div class="dashboard-refresh">
      <icon-restart class="pointer" @click="onIconAction($event)" />
    </div>
    <div class="dashboard-info">
      <b-row class="mt-2">
        <b-col>
          <b-form-group class="mb-4">
            <b-table
              ref="table"
              sticky-header
              responsive="md"
              selectable
              show-empty
              no-select-on-click
              hover
              :fields="fields"
              :items="eventlogInfos"
              :empty-text="$t('global.table.emptyMessage')"
              @row-selected="onRowSelected($event, eventlogInfos.length)"
            >
            </b-table>
          </b-form-group>
        </b-col>
      </b-row>
    </div>
  </overview-card>
</template>

<script>
import OverviewCard from './OverviewCard';
import DataFormatterMixin from '@/components/Mixins/DataFormatterMixin';
import IconRestart from '@carbon/icons-vue/es/restart/24';

export default {
  name: 'EventLog',
  components: {
    OverviewCard,
    IconRestart,
  },
  mixins: [DataFormatterMixin],
  data() {
    return {
      fields: [
        {
          key: 'eventid',
          label: this.$t('pageDashboard.eventlog.LANG_EVENT_TABLE_HEADTITLE0'),
        },
        {
          key: 'timestamp',
          label: this.$t('pageDashboard.eventlog.LANG_EVENT_TABLE_HEADTITLE1'),
        },
        {
          key: 'sensorname',
          label: this.$t('pageDashboard.eventlog.LANG_EVENT_TABLE_HEADTITLE2'),
        },
        {
          key: 'controller',
          label: this.$t('pageDashboard.eventlog.LANG_EVENT_TABLE_HEADTITLE3'),
        },
        {
          key: 'severity',
          label: this.$t('pageDashboard.eventlog.LANG_EVENT_TABLE_HEADTITLE4'),
        },
        {
          key: 'sensortype',
          label: this.$t('pageDashboard.eventlog.LANG_EVENT_TABLE_HEADTITLE5'),
        },
        {
          key: 'desc',
          label: this.$t('pageDashboard.eventlog.LANG_EVENT_TABLE_HEADTITLE6'),
        },
      ],
    };
  },
  computed: {
    eventlogInfos() {
      return this.$store.getters['dashboardstore/eventlogInfo'];
    },
  },
  created() {
    this.$store
      .dispatch('dashboardstore/getEventLog')
      .catch(({ message }) => this.errorToast(message))
      .finally(() => {
        // Emit initial data fetch complete to parent component
        this.$root.$emit('event-log-complete');
      });
  },
  methods: {
    onIconAction() {
      this.$store
        .dispatch('dashboardstore/getEventLog')
        .catch(({ message }) => {
          this.errorToast(message);
        })
        .finally(() => {
          this.$root.$emit('event-log-complete');
        });
    },
  },
};
</script>
