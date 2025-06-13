<template>
  <b-container fluid="x1">
    <page-title />
    <b-form novalidate @submit.prevent="handleSubmit">
      <b-row>
        <b-col cols="3">
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
                responsive="md"
                selectable
                show-empty
                no-select-on-click
                hover
                sort-by="index"
                :fields="fields"
                :items="deviceInfos"
                :empty-text="$t('global.table.emptyMessage')"
              >
              </b-table>
            </b-form-group>
            <b-row>
              <b-col> </b-col>
            </b-row>
          </b-col>
        </b-row>
      </div>
    </b-form>
  </b-container>
</template>

<script>
import { mapState } from 'vuex';
import PageTitle from '@/components/Global/PageTitle';

import BVPaginationMixin, {
  currentPage,
  perPage,
  itemsPerPageOptions,
} from '@/components/Mixins/BVPaginationMixin';
import BVTableSelectableMixin, {
  selectedRows,
  tableHeaderCheckboxModel,
} from '@/components/Mixins/BVTableSelectableMixin';

export default {
  name: 'PowerTelemetry',
  components: {
    PageTitle,
  },
  mixins: [BVPaginationMixin, BVTableSelectableMixin],
  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
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
  created() {
    /*
    this.startLoader();
    this.$store
      .dispatch('powerTelemetryStore/getAllDeviceOptions')
      .finally(() => this.endLoader());
    */
    this.startLoader();
    let payload = JSON.parse('{}');
    payload.index = 0;
    Promise.all([
      this.$store.dispatch('powerTelemetryStore/getAllDeviceOptions'),
      this.$store.dispatch('powerTelemetryStore/getDeviceInfoByIndex', payload),
    ]).finally(() => this.endLoader());
  },
  methods: {
    onChangeSelect(selectedOption) {
      //console.log(selectedOption);
      let payload = JSON.parse('{}');
      payload.index = Number(selectedOption);
      //console.log(payload);
      this.startLoader();
      this.$store
        .dispatch('powerTelemetryStore/getDeviceInfoByIndex', payload)
        .then(/*(success) => this.successToast(success)*/)
        .catch(({ message }) => this.errorToast(message))
        .finally(() => this.endLoader());
    },
  },
};
</script>
