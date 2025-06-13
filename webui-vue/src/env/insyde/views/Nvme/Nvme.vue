<template>
  <b-container fluid="x1">
    <page-title />
    <insyde-unavailable v-if="unavailable" v-show="!loading" />
    <b-row v-if="!unavailable" class="align-items-end">
      <b-col sm="6" md="5" xl="4">
        <search
          @change-search="onChangeSearchInput"
          @clear-search="onClearSearchInput"
        />
      </b-col>
      <b-col sm="6" md="3" xl="2">
        <table-cell-count
          :filtered-items-count="filteredRows"
          :total-number-of-cells="nvme.length"
        ></table-cell-count>
      </b-col>
    </b-row>
    <b-table
      v-if="!unavailable"
      sort-icon-left
      no-sort-reset
      hover
      responsive="md"
      show-empty
      :items="nvme"
      :fields="fields"
      :filter="searchFilter"
      :empty-text="$t('global.table.emptyMessage')"
      :empty-filtered-text="$t('global.table.emptySearchMessage')"
      @filtered="onFiltered"
    >
      <!-- Expand chevron icon -->
      <template #cell(expandRow)="row">
        <b-button
          variant="link"
          data-test-id="hardwareStatus-button-expandDimms"
          :title="expandRowLabel"
          class="btn-icon-only"
          @click="toggleRowDetails(row)"
        >
          <icon-chevron />
          <span class="sr-only">{{ expandRowLabel }}</span>
        </b-button>
      </template>
      <template #row-details="{ item }">
        <!-- <p>{{ item.detail }}</p> -->
        <b-container fluid>
          <b-row>
            <b-col>{{ $t('pageNvme.table.detail.name') }}</b-col>
            <b-col>{{ dataFormatter(item.name) }}</b-col>
            <b-col>{{ $t('pageNvme.table.detail.firmwareVersion') }}</b-col>
            <b-col>{{ dataFormatter(item.detail.FirmwareVersion) }}</b-col>
            <b-col>{{ $t('pageNvme.table.detail.pcieVendorId') }}</b-col>
            <b-col>{{ dataFormatter(item.detail.PCIeVendorID) }}</b-col>
            <b-col>{{ $t('pageNvme.table.detail.Powered') }}</b-col>
            <b-col>{{ dataFormatter(item.detail.Powered) }}</b-col>
          </b-row>
        </b-container>
        <b-container fluid>
          <b-row>
            <b-col>{{ $t('pageNvme.table.detail.state') }}</b-col>
            <b-col>{{ dataFormatter(item.state) }}</b-col>
            <b-col>{{ $t('pageNvme.table.detail.manufacturer') }}</b-col>
            <b-col>{{ dataFormatter(item.detail.Manufacturer) }}</b-col>
            <b-col>{{ $t('pageNvme.table.detail.pcieDeviceId') }}</b-col>
            <b-col>{{ dataFormatter(item.detail.PCIeDeviceID) }}</b-col>
            <b-col>{{ $t('pageNvme.table.detail.FUNCTIONAL') }}</b-col>
            <b-col>{{ dataFormatter(item.detail.Functional) }}</b-col>
          </b-row>
        </b-container>
        <b-container fluid>
          <b-row>
            <b-col>{{ $t('pageNvme.table.detail.health') }}</b-col>
            <b-col>{{ dataFormatter(item.health) }}</b-col>
            <b-col>{{ $t('pageNvme.table.detail.model') }}</b-col>
            <b-col>{{ dataFormatter(item.detail.Model) }}</b-col>
            <b-col>{{
              $t('pageNvme.table.detail.PCIeSubsystemVendorID')
            }}</b-col>
            <b-col>{{
              dataFormatter(item.detail.PCIeSubsystemVendorID)
            }}</b-col>
            <b-col>{{ $t('pageNvme.table.detail.RESET_REQUIRED') }}</b-col>
            <b-col>{{ dataFormatter(item.detail.ResetRequired) }}</b-col>
          </b-row>
        </b-container>
        <b-container fluid>
          <b-row>
            <b-col>{{ $t('pageNvme.table.detail.size') }}</b-col>
            <b-col>{{ dataFormatter(item.size) }}</b-col>
            <b-col>{{ $t('pageNvme.table.detail.serialnumber') }}</b-col>
            <b-col>{{ dataFormatter(item.detail.SerialNumber) }}</b-col>
            <b-col>{{
              $t('pageNvme.table.detail.PCIeSubsystemDeviceID')
            }}</b-col>
            <b-col>{{
              dataFormatter(item.detail.PCIeSubsystemDeviceID)
            }}</b-col>
            <b-col>{{ $t('pageNvme.table.detail.TEMPERATURE') }}</b-col>
            <b-col>{{
              dataFormatter(item.detail.Temperature) + '&#8451;'
            }}</b-col>
          </b-row>
        </b-container>
        <b-container fluid>
          <b-row>
            <b-col>{{ $t('pageNvme.table.detail.protocol') }}</b-col>
            <b-col>{{ dataFormatter(item.protocol) }}</b-col>
            <b-col>{{ $t('pageNvme.table.detail.partNumber') }}</b-col>
            <b-col>{{ dataFormatter(item.detail.PartNumber) }}</b-col>
            <b-col>{{ $t('pageNvme.table.detail.BUS_NUMBER') }}</b-col>
            <b-col>{{ dataFormatter(item.detail.PCIeBusNumber) }}</b-col>
            <b-col>{{
              $t('pageNvme.table.detail.AVAILABLE_SPARE_THRESHOLD')
            }}</b-col>
            <b-col>{{
              dataFormatter(item.detail.AvailableSpareThreshold)
            }}</b-col>
          </b-row>
        </b-container>
        <b-container fluid>
          <b-row>
            <b-col>{{ $t('pageNvme.table.detail.mediatype') }}</b-col>
            <b-col>{{ dataFormatter(item.mediatype) }}</b-col>
            <b-col>{{ $t('pageNvme.table.detail.assetTag') }}</b-col>
            <b-col>{{ dataFormatter(item.detail.AssetTag) }}</b-col>
            <b-col>{{
              $t('pageNvme.table.detail.PCIE_NEGOTIATED_LINK_SPEED')
            }}</b-col>
            <b-col>{{
              dataFormatter(item.detail.PCIeNegotiatedLinkSpeed)
            }}</b-col>
            <b-col>{{
              $t('pageNvme.table.detail.TEMPERATURE_THRESHOLD')
            }}</b-col>
            <b-col>{{ dataFormatter(item.detail.TemperatureThreshold) }}</b-col>
          </b-row>
        </b-container>
        <b-container fluid>
          <b-row>
            <b-col>{{ $t('pageNvme.table.detail.statusIndicator') }}</b-col>
            <b-col>{{ dataFormatter(item.detail.StatusIndicator) }}</b-col>
            <b-col>{{ $t('pageNvme.table.detail.deviceType') }}</b-col>
            <b-col>{{ dataFormatter(item.detail.DeviceType) }}</b-col>
            <b-col>{{ $t('pageNvme.table.detail.PCIE_LINK_ACTIVE') }}</b-col>
            <b-col>{{ dataFormatter(item.detail.PCIeLinkActive) }}</b-col>
            <b-col>{{
              $t('pageNvme.table.detail.RELIABILITY_DEGRADED')
            }}</b-col>
            <b-col>{{ dataFormatter(item.detail.ReliabilityDegraded) }}</b-col>
          </b-row>
        </b-container>
        <b-container fluid>
          <b-row>
            <b-col>{{ $t('pageNvme.table.detail.ovrrallHealthState') }}</b-col>
            <b-col>{{ dataFormatter(item.detail.OverallHealthState) }}</b-col>
            <b-col>{{ $t('pageNvme.table.detail.PERCENTAGE_USED') }}</b-col>
            <b-col>{{
              dataFormatter(item.detail.PredictedMediaLifeLeftPercent)
            }}</b-col>
            <b-col>{{ $t('pageNvme.table.detail.PCIE_0_LINK_SPEED') }}</b-col>
            <b-col>{{ dataFormatter(item.detail.PCIe0LinkSpeed) }}</b-col>
            <b-col>{{ $t('pageNvme.table.detail.MEDIA_READ_ONLY') }}</b-col>
            <b-col>{{ dataFormatter(item.detail.MediaReadOnly) }}</b-col>
          </b-row>
        </b-container>
        <b-container fluid>
          <b-row>
            <b-col>{{ $t('pageNvme.table.detail.PHYSICAL_ADDRESS') }}</b-col>
            <b-col>{{ dataFormatter(item.detail.PhysicalAddress) }}</b-col>
            <b-col>{{ $t('pageNvme.table.detail.PCIE_0_LINK_WIDTH') }}</b-col>
            <b-col>{{ dataFormatter(item.detail.PCIe0LinkWidth) }}</b-col>
            <b-col>{{
              $t('pageNvme.table.detail.VOLATILE_MEMORY_BACKUP_FAILED')
            }}</b-col>
            <b-col>{{
              dataFormatter(item.detail.VolatileMemoryBackupFailed)
            }}</b-col>
            <b-col>{{
              $t('pageNvme.table.detail.I2C_PHYSICAL_CHANNEL')
            }}</b-col>
            <b-col>{{ dataFormatter(item.detail.I2CPhysicalChannel) }}</b-col>
          </b-row>
        </b-container>
      </template>
    </b-table>
  </b-container>
</template>

<script>
import PageTitle from '@/components/Global/PageTitle';

import IconChevron from '@carbon/icons-vue/es/chevron--down/20';

//import StatusIcon from '@/components/Global/StatusIcon';
import TableCellCount from '@/components/Global/TableCellCount';

import DataFormatterMixin from '@/components/Mixins/DataFormatterMixin';
import Search from '@/components/Global/Search';
import SearchFilterMixin, {
  searchFilter,
} from '@/components/Mixins/SearchFilterMixin';
import TableRowExpandMixin, {
  expandRowLabel,
} from '@/env/insyde/components/Mixins/NvmeTableRowExpandMixin';

export default {
  name: 'Nvme',
  components: {
    PageTitle,
    IconChevron,
    Search,
    TableCellCount,
  },
  mixins: [TableRowExpandMixin, DataFormatterMixin, SearchFilterMixin],
  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
  data() {
    return {
      fields: [
        {
          key: 'expandRow',
          label: '',
          tdClass: 'table-row-expand',
          sortable: false,
        },
        {
          key: 'id',
          label: this.$t('pageNvme.table.id'),
          formatter: this.dataFormatter,
          sortable: true,
        },
        {
          key: 'name',
          label: this.$t('pageNvme.table.name'),
          formatter: this.dataFormatter,
          sortable: true,
          tdClass: 'text-nowrap',
        },
        {
          key: 'state',
          label: this.$t('pageNvme.table.state'),
          formatter: this.dataFormatter,
          sortable: true,
          tdClass: 'text-nowrap',
        },
        {
          key: 'health',
          label: this.$t('pageNvme.table.health'),
          formatter: this.dataFormatter,
          sortable: true,
          tdClass: 'text-nowrap',
        },
        {
          key: 'size',
          label: this.$t('pageNvme.table.size'),
          formatter: this.dataFormatter,
          sortable: true,
          tdClass: 'text-nowrap',
        },
        {
          key: 'protocol',
          label: this.$t('pageNvme.table.protocol'),
          formatter: this.dataFormatter,
          sortable: true,
          tdClass: 'text-nowrap',
        },
        {
          key: 'mediatype',
          label: this.$t('pageNvme.table.mediatype'),
          formatter: this.dataFormatter,
          sortable: true,
          tdClass: 'text-nowrap',
        },
      ],
      searchFilter: searchFilter,
      searchTotalFilteredRows: 0,
      expandRowLabel: expandRowLabel,
    };
  },
  computed: {
    unavailable() {
      return this.nvme.length === 0;
    },
    filteredRows() {
      return this.searchFilter
        ? this.searchTotalFilteredRows
        : this.nvme.length;
    },
    nvme() {
      return this.$store.getters['nvmestore/nvme'];
    },
  },
  created() {
    this.startLoader();

    this.$store
      .dispatch('nvmestore/getNvme')
      .catch(({ message }) => this.errorToast(message))
      .finally(() => {
        this.endLoader();
      });
  },
  methods: {
    onFiltered(filteredItems) {
      this.searchTotalFilteredRows = filteredItems.length;
    },
  },
};
</script>
