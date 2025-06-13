<template>
  <overview-card
    :title="$t('pageDashboard.powerTelemetry')"
    :to="`/resource-management/PowerTelemetry`"
  >
    <div class="dashboard-refresh">
      <icon-restart class="pointer" @click="onIconAction($event)" />
    </div>
    <div class="dashboard-info">
      <b-row class="mt-3">
        <b-col sm="6">
          <b-form-group
            :label="$t('pagePowerTelemetry.selectDeviceType')"
            label-for="device-option"
            class="mb-3"
          >
            <b-form-select
              id="device-option"
              v-model="selected"
              :disabled="deviceOption.length === 0"
              :options="deviceOption"
              @change="onChangeSelect"
            ></b-form-select>
          </b-form-group>
        </b-col>
      </b-row>
      <div>
        <b-row>
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
                sort-by="index"
                :fields="fields"
                :items="deviceInfos"
                :empty-text="$t('global.table.emptyMessage')"
                @row-selected="onRowSelected($event, deviceInfos.length)"
              >
              </b-table>
            </b-form-group>
            <b-row>
              <b-col> </b-col>
            </b-row>
          </b-col>
        </b-row>
      </div>
    </div>
  </overview-card>
</template>

<script>
import { mapState } from 'vuex';
import OverviewCard from './OverviewCard';
import DataFormatterMixin from '@/components/Mixins/DataFormatterMixin';
import IconRestart from '@carbon/icons-vue/es/restart/24';
import {
  currentPage,
  perPage,
  itemsPerPageOptions,
} from '@/components/Mixins/BVPaginationMixin';
import {
  selectedRows,
  tableHeaderCheckboxModel,
} from '@/components/Mixins/BVTableSelectableMixin';
export default {
  name: 'PowerTelemetry',
  components: {
    OverviewCard,
    IconRestart,
  },
  mixins: [DataFormatterMixin],
  data() {
    return {
      fields: [
        {
          key: 'index',
          label: this.$t('pagePowerTelemetry.table.registerIndex'),
        },
        {
          key: 'address',
          label: this.$t('pagePowerTelemetry.table.registerAddress'),
        },
        {
          key: 'energy',
          label: this.$t('pagePowerTelemetry.table.energyCounter'),
        },
        {
          key: 'timeStamp',
          label: this.$t('pagePowerTelemetry.table.timeStamp'),
        },
      ],
      currentPage: currentPage,
      itemsPerPageOptions: itemsPerPageOptions,
      perPage: perPage,
      selectedRows: selectedRows,
      tableHeaderCheckboxModel: tableHeaderCheckboxModel,
      selected: 0, //default select index
    };
  },
  computed: {
    ...mapState('powerTelemetryStore', ['deviceOption']),
    deviceInfos() {
      return this.$store.getters['powerTelemetryStore/deviceInfo'];
    },
  },
  validations: {
    form: {
      index: {},
      address: {},
      energy: {},
      timeStamp: {},
    },
  },
  created() {
    let payload = JSON.parse('{}');
    payload.index = 0;
    Promise.all([
      this.$store.dispatch('powerTelemetryStore/getAllDeviceOptions'),
      this.$store.dispatch('powerTelemetryStore/getDeviceInfoByIndex', payload),
    ]).finally(() => {
      this.$root.$emit('power-telemetry-complete');
    });
  },
  methods: {
    onChangeSelect(selectedOption) {
      let payload = JSON.parse('{}');
      payload.index = Number(selectedOption);
      this.startLoader();
      this.$store
        .dispatch('powerTelemetryStore/getDeviceInfoByIndex', payload)
        .then(/*(success) => this.successToast(success)*/)
        .catch(({ message }) => this.errorToast(message))
        .finally(() => this.endLoader());
    },
    onIconAction() {
      let payload = JSON.parse('{}');
      payload.index = 0;
      Promise.all([
        this.$store.dispatch('powerTelemetryStore/getAllDeviceOptions'),
        this.$store.dispatch(
          'powerTelemetryStore/getDeviceInfoByIndex',
          payload
        ),
      ]).finally(() => {
        this.$root.$emit('power-telemetry-complete');
      });
    },
  },
};
</script>
