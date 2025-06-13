<template>
  <b-container fluid="x1">
    <page-title />
    <page-section>
      <div class="container-flex right">
        <label>
          {{
            `${$t(
              'pagePowerCapping.LANG_MISC_NM_CONFIG_EXTRATBLINFO'
            )}: ${quantity} ${$t(
              'pagePowerCapping.LANG_MISC_NM_CONFIG_POLICYUNIT'
            )}`
          }}
        </label>
      </div>
      <div class="table">
        <b-table
          ref="selectableTable"
          sort-icon-left
          no-sort-reset
          hover
          :sort-by.sync="sortBy"
          :sort-desc="sortDesc"
          responsive="md"
          show-empty
          :items="policyItems"
          :fields="fields"
          :select-mode="selectMode"
          selectable
          @row-selected="onRowSelected"
        >
        </b-table>
      </div>
      <add-edit-policies
        :confsettings="selected"
        @update="updateTableItems"
        @ok="getAllPolicies"
        @clearsel="clearSelected"
      />
    </page-section>
  </b-container>
</template>

<script>
import PageTitle from '@/components/Global/PageTitle';

import PageSection from '@/components/Global/PageSection';
import DataFormatterMixin from '@/components/Mixins/DataFormatterMixin';
import AddEditPolicies from './AddEditPolicies';
import {
  // <!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN:!CONFIG_NM_OFFLOAD -->
  nmpolicyParser,
  // <!-- WEB_CONFIG_DEPEND_FEATURE_END:!CONFIG_NM_OFFLOAD -->
  // <!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN:CONFIG_NM_OFFLOAD -->
  policyCollectionParser,
  policyEntryParser,
  // <!-- WEB_CONFIG_DEPEND_FEATURE_END:CONFIG_NM_OFFLOAD -->
} from '@/env/insyde/components/Mixins/PowerCappingParserMixin';

export default {
  name: 'PowerCapping',
  components: {
    PageTitle,
    PageSection,
    AddEditPolicies,
  },
  mixins: [DataFormatterMixin],
  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
  props: {
    tableArr: {
      type: Array,
      default: null,
    },
  },
  data() {
    return {
      sortBy: 'id',
      sortDesc: false,
      quantity: 0,
      fields: [
        {
          key: 'id',
          label: this.$t('pagePowerCapping.LANG_MISC_NM_COLUMN_TITLE0'),
          sortable: true,
        },
        {
          key: 'domain',
          formatter: (value) => {
            switch (value) {
              case 0:
                return this.$t(
                  'pagePowerCapping.POWER_STATISTICS_ENTIRE_PLATFORM'
                );
              case 1:
                return this.$t('pagePowerCapping.POWER_STATISTICS_CPU');
              case 2:
                return this.$t('pagePowerCapping.POWER_STATISTICS_MEMORY');
              default:
                return this.$t(
                  'pagePowerCapping.POWER_STATISTICS_ENTIRE_PLATFORM'
                );
            }
          },
          label: this.$t('pagePowerCapping.LANG_MISC_NM_COLUMN_TITLE6'),
          sortable: false,
          tdClass: 'text-nowrap',
        },
        /*
        {
          key: 'timers',
          label: this.$t('pagePowerCapping.LANG_MISC_NM_COLUMN_TITLE1'),
          sortable: false,
          tdClass: 'text-nowrap',
        },*/
        {
          key: 'enable',
          label: this.$t('pagePowerCapping.LANG_MISC_NM_COLUMN_TITLE2'),
          sortable: false,
          tdClass: 'text-nowrap',
        },
        {
          key: 'shutdown',
          label: this.$t('pagePowerCapping.LANG_MISC_NM_COLUMN_TITLE3'),
          sortable: false,
          tdClass: 'text-nowrap',
        },
        {
          key: 'logevent',
          label: this.$t('pagePowerCapping.LANG_MISC_NM_COLUMN_TITLE4'),
          sortable: false,
          tdClass: 'text-nowrap',
        },
        {
          key: 'powerlimit',
          label: this.$t('pagePowerCapping.LANG_MISC_NM_COLUMN_TITLE5'),
          sortable: false,
          tdClass: 'text-nowrap',
        },
      ],
      temptabItems: [],
      tabItems: [],
      selected: [],
      selectMode: 'single',
    };
  },
  computed: {
    // <!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN:CONFIG_NM_OFFLOAD -->
    entry() {
      return policyEntryParser(this.$store.getters['powercapping/policyentry']);
    },
    policyCollection() {
      return policyCollectionParser(
        this.$store.getters['powercapping/policycollection']
      );
    },
    // <!-- WEB_CONFIG_DEPEND_FEATURE_END:CONFIG_NM_OFFLOAD -->
    // <!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN:!CONFIG_NM_OFFLOAD -->
    nmpolicy() {
      return nmpolicyParser(this.$store.getters['powercapping/policy']);
    },
    // <!-- WEB_CONFIG_DEPEND_FEATURE_END:!CONFIG_NM_OFFLOAD -->
    policyItems() {
      return this.tabItems;
    },
  },
  created() {
    const nm = this;
    // <!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN:!CONFIG_NM_OFFLOAD -->
    nm.startLoader();
    nm.$store
      .dispatch('powercapping/nmpolicy')
      .then(() => {
        nm.tabItems = nm.nmpolicy.policyArr;
        nm.calentriesTotal();
      })
      .finally(() => nm.endLoader());
    // <!-- WEB_CONFIG_DEPEND_FEATURE_END:!CONFIG_NM_OFFLOAD -->
    // <!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN:CONFIG_NM_OFFLOAD -->
    nm.getAllPolicies();
    // <!-- WEB_CONFIG_DEPEND_FEATURE_END:CONFIG_NM_OFFLOAD -->
  },
  methods: {
    clearSelected() {
      let powerPolicy = this;
      powerPolicy.$refs.selectableTable.clearSelected();
    },
    // <!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN:CONFIG_NM_OFFLOAD -->
    getAllPolicies() {
      const nm = this;
      nm.startLoader();
      nm.$store
        .dispatch('powercapping/getPolicyCollection')
        .then(() => {
          return nm.policyCollection.membersArr;
        })
        .then((response) => {
          let reqArr = [];
          response.forEach((d) => {
            let uri = d['@odata.id'];
            reqArr.push(
              nm.$store
                .dispatch('powercapping/getPolicyEntry', uri)
                .then(() => {
                  //console.log(nm.$store.getters['powercapping/policyentry']);
                  nm.temptabItems.push(nm.entry.plyObj);
                })
            );
          });
          return reqArr;
        })
        .then((response) => {
          nm.temptabItems = [];
          Promise.all(response).finally(() => {
            nm.tabItems = nm.temptabItems;
            nm.calentriesTotal();
            nm.endLoader();
          });
        });
    },
    // <!-- WEB_CONFIG_DEPEND_FEATURE_END:CONFIG_NM_OFFLOAD -->
    updateTableItems(tableItems) {
      let nm = this;
      nm.tabItems = tableItems;
      nm.calentriesTotal();
    },
    onRowSelected(items) {
      //console.log(items);
      let entry = this;
      entry.selected = items;
    },
    calentriesTotal() {
      const nm = this;
      nm.quantity = nm.tabItems.length;
    },
  },
};
</script>
<style lang="scss" scoped>
.table {
  height: 38vh;
  overflow-y: scroll;
}

.container-flex.right {
  justify-content: flex-end;
}
</style>
