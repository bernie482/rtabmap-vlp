<template>
  <b-container fluid="xl">
    <page-title />
    <page-section :section-title="$t('pageMemoryFP.SH_MFP_LIST')">
      <div class="form-background pl-4 pt-4 pb-1">
        <b-row>
          <b-col class="text-right padding">
            {{ $t('pageMemoryFP.LANG_SYS_ASSET_DIMM_CNT') }}: {{ dimms.length }}
          </b-col>
        </b-row>
        <b-row v-show="dimms.length > 0">
          <b-col>
            <b-table
              ref="table"
              responsive="md"
              show-empty
              no-select-on-click
              hover
              striped
              style="text-align: center"
              :fields="fields"
              :items="tableItems"
              :empty-text="$t('global.table.emptyMessage')"
            >
              <template #cell(state)="{ item }">
                <div :class="ledStyle(item.state)"></div>
              </template>
            </b-table>
          </b-col>
        </b-row>
        <b-row v-show="dimms.length === 0">
          <b-col>
            {{ $t('pageMemoryFP.SH_MFP_NOT_FOUND') }}
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

export default {
  name: 'MemoryFP',
  components: {
    PageTitle,
    PageSection,
  },

  data() {
    return {
      fields: [
        {
          key: 'state',
          label: this.$t('pageMemoryFP.table.SH_MFP_STATE'),
          sortable: true,
        },
        {
          key: 'score',
          label: this.$t('pageMemoryFP.table.SH_MFP_SCORE'),
          sortable: true,
        },
        {
          key: 'slotNumber',
          label: this.$t('pageMemoryFP.table.SH_MFP_NUMBER'),
          sortable: true,
        },
        {
          key: 'size',
          label: this.$t('pageMemoryFP.table.SH_MFP_NUMBER_SIZE'),
          sortable: true,
        },
        {
          key: 'manufacturer',
          label: this.$t('pageMemoryFP.table.SH_MFP_MANU'),
          sortable: true,
        },
        {
          key: 'sn',
          label: this.$t('pageMemoryFP.table.SH_MFP_SERIAL'),
          sortable: true,
        },
        {
          key: 'pn',
          label: this.$t('pageMemoryFP.table.SH_MFP_PART'),
          sortable: true,
        },
      ],
    };
  },
  computed: {
    ...mapFields('memoryFP', ['dimms']),
    tableItems() {
      // transform user data to table data
      return this.dimms.map((el) => {
        let size = '-';
        if (el.CapacityMiB) size = el.CapacityMiB + ' MB';
        return {
          state: el.Status.State || '-',
          score: el.Oem?.InsydeMemory?.HealthScore || '-',
          slotNumber: el.Location?.PartLocation?.ServiceLabel || '-',
          size,
          manufacturer: el.Manufacturer || '-',
          sn: el.SerialNumber || '-',
          pn: el.PartNumber || '-',
        };
      });
    },
  },
  created() {
    this.startLoader();
    const getDataPromise = this.$store.dispatch('memoryFP/getMemoryAll');
    Promise.all([getDataPromise]).finally(() => this.endLoader());
  },
  methods: {
    ledStyle(s) {
      if (s == 'Enabled') return 'led led-green';
      return 'led';
    },
  },
};
</script>

<style scoped>
.padding {
  padding: 20px;
}
</style>
