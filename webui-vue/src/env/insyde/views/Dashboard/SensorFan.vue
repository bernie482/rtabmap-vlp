<template>
  <overview-card
    :title="$t('pageDashboard.fan')"
    :to="`/hardware-status/sensoreadings`"
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
              sticky-header
              sort-icon-left
              no-sort-reset
              responsive="md"
              selectable
              show-empty
              no-select-on-click
              hover
              sort-by="index"
              :fields="fields"
              :tbody-tr-class="addTdClass"
              :sort-desc="true"
              :sort-compare="sortCompare"
              :items="fanInfos"
              :empty-text="$t('global.table.emptyMessage')"
              @row-selected="onRowSelected($event, fanInfos.length)"
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
  name: 'SensorFan',
  components: {
    OverviewCard,
    IconRestart,
  },
  mixins: [DataFormatterMixin],
  data() {
    return {
      fields: [
        {
          key: 'healthy',
          label: this.$t('pageDashboard.healthy'),
        },
        {
          key: 'name',
          label: this.$t('pageDashboard.name'),
        },
      ],
    };
  },
  computed: {
    fanInfos() {
      return this.$store.getters['dashboardstore/sensorFanInfo'];
    },
  },
  created() {
    this.$store
      .dispatch('dashboardstore/getSensorFan')
      .catch(({ message }) => this.errorToast(message))
      .finally(() => {
        this.$root.$emit('sensor-fan-complete');
      });
  },
  methods: {
    sortCompare(a, b, key) {
      if (key === 'health') {
        return this.sortStatus(a, b, key);
      }
    },
    addTdClass(value) {
      return value?.class ?? 'unknow';
    },
    onIconAction() {
      this.$store
        .dispatch('dashboardstore/getSensorFan')
        .catch(({ message }) => this.errorToast(message))
        .finally(() => {
          this.$root.$emit('sensor-fan-complete');
        });
    },
  },
};
</script>
