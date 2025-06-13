<template>
  <overview-card
    :title="$t('pageDashboard.voltage')"
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
              :items="voltageInfos"
              :empty-text="$t('global.table.emptyMessage')"
              @row-selected="onRowSelected($event, voltageInfos.length)"
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
  name: 'SensorVoltage',
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
    voltageInfos() {
      return this.$store.getters['dashboardstore/sensorVoltageInfo'];
    },
  },
  created() {
    this.$store
      .dispatch('dashboardstore/getSensorVoltage')
      .catch(({ message }) => this.errorToast(message))
      .finally(() => {
        this.$root.$emit('sensor-voltage-complete');
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
        .dispatch('dashboardstore/getSensorVoltage')
        .catch(({ message }) => this.errorToast(message))
        .finally(() => {
          this.$root.$emit('sensor-voltage-complete');
        });
    },
  },
};
</script>
