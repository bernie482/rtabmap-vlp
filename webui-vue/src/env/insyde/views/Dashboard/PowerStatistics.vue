<template>
  <overview-card
    :title="$t('pageDashboard.powerStatistics')"
    :to="`/resource-management/PowerStatistics`"
  >
    <div class="dashboard-refresh">
      <icon-restart class="pointer" @click="onIconAction($event)" />
    </div>
    <div class="dashboard-info">
      <b-row class="mt-2">
        <b-col>
          <b-form-group class="mb-4">
            <b-table
              ref="table"
              responsive="md"
              selectable
              show-empty
              no-select-on-click
              hover
              sort-by="index"
              :fields="fields"
              :items="powerstatInfos"
              :empty-text="$t('global.table.emptyMessage')"
              @row-selected="onRowSelected($event, powerstatInfos.length)"
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
  name: 'PowerStatistics',
  components: {
    OverviewCard,
    IconRestart,
  },
  mixins: [DataFormatterMixin],
  data() {
    return {
      fields: [
        {
          key: 'subsystem',
          label: this.$t('pageDashboard.powerstatistics.subsystem'),
        },
        {
          key: 'currentwatt',
          label: this.$t('pageDashboard.powerstatistics.currentwatt'),
        },
      ],
    };
  },
  computed: {
    powerstatInfos() {
      return this.$store.getters['dashboardstore/powerinfo'];
    },
  },
  created() {
    this.$store
      .dispatch('dashboardstore/getPowerStatistics')
      .catch(({ message }) => this.errorToast(message))
      .finally(() => {
        this.$root.$emit('powerstatistics-complete');
      });
  },
  methods: {
    onIconAction() {
      this.$store
        .dispatch('dashboardstore/getPowerStatistics')
        .catch(({ message }) => this.errorToast(message))
        .finally(() => {
          this.$root.$emit('powerstatistics-complete');
        });
    },
  },
};
</script>
