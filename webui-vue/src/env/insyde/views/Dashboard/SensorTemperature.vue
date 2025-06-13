<template>
  <overview-card
    :title="$t('pageDashboard.temperature')"
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
              show-empty
              no-select-on-click
              hover
              sort-by="healthy"
              :fields="fields"
              :tbody-tr-class="addTdClass"
              :sort-desc="true"
              :sort-compare="sortCompare"
              :items="temperatureInfos"
              :empty-text="$t('global.table.emptyMessage')"
              @row-selected="onRowSelected($event, temperatureInfos.length)"
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
  name: 'SensorTemperature',
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
    temperatureInfos() {
      return this.$store.getters['dashboardstore/sensorTemperatureInfo'];
    },
  },
  created() {
    this.$store
      .dispatch('dashboardstore/getSensorTemperature')
      .catch(({ message }) => this.errorToast(message))
      .finally(() => {
        this.$root.$emit('sensor-temperature-complete');
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
        .dispatch('dashboardstore/getSensorTemperature')
        .catch(({ message }) => this.errorToast(message))
        .finally(() => {
          this.$root.$emit('sensor-temperature-complete');
        });
    },
  },
};
</script>

<style lang="scss" scoped>
/** sensor
---------------------------------------------------------*/
.green {
  background-color: rgb(36, 189, 98);
  color: #fff;
}
.yellow {
  background-color: rgb(255, 241, 0);
  color: #000;
}
.red {
  background-color: rgb(220, 41, 41);
  color: #fff;
}
</style>
