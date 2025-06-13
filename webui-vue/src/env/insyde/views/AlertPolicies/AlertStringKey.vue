<template>
  <b-container fluid="x1">
    <page-section>
      <modal-modify-strings-settings
        :number="stringkeyNo"
        :strings="strings"
        hide-footer
        @ok="saveStringsTable"
      />
      <b-row>
        <b-col class="text-right">
          <label>
            {{
              `${$t(
                'pageAlertPolicies.CONFALERT_POLICIES_ALERT_STRING_KEY_TABLE'
              )}:`
            }}
          </label>
          {{
            `${keyAmount} ${$t('pageAlertPolicies.CONFALERT_POLICIES_SUFFIX')}`
          }}
        </b-col>
      </b-row>
      <div class="table">
        <b-table
          sort-icon-left
          no-sort-reset
          hover
          sort-by="number"
          responsive="md"
          show-empty
          :items="stringsItems"
          :fields="fields"
          :filter="searchFilter"
          :empty-text="$t('global.table.emptyMessage')"
          :empty-filtered-text="$t('global.table.emptySearchMessage')"
          @filtered="onFiltered"
        >
          <template #cell(modify)="{ item }">
            <table-row-action
              v-for="(action, index) in item.modify"
              :key="index"
              :value="action.value"
              :enabled="action.enabled"
              :title="action.title"
              @click-table-action="onTableRowAction($event, item)"
            >
              <template #icon>
                <icon-edit
                  v-if="action.value === 'edit'"
                  :data-test-id="`ipSetting-tableRowAction-edit-${index}`"
                />
              </template>
            </table-row-action>
          </template>
        </b-table>
      </div>
    </page-section>
  </b-container>
</template>

<script>
import PageSection from '@/components/Global/PageSection';
import ModalModifyStringsSettings from './ModalModifyStringsSettings';
import IconEdit from '@carbon/icons-vue/es/edit/20';
import TableRowAction from '@/components/Global/TableRowAction';
import SearchFilterMixin, {
  searchFilter,
} from '@/components/Mixins/SearchFilterMixin';
import { stringsParser } from '@/env/insyde/components/Mixins/AlertPoliciesTableParserMixin';

export default {
  name: 'AlertStringKey',
  components: {
    PageSection,
    ModalModifyStringsSettings,
    IconEdit,
    TableRowAction,
  },
  mixins: [SearchFilterMixin],
  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
  data() {
    return {
      destConfigObj: {},
      fields: [
        {
          key: 'number',
          label: this.$t('global.table.prefixNumber'),
          sortable: true,
        },
        {
          key: 'strings',
          label: this.$t(
            'pageAlertPolicies.CONFALERT_POLICIES_ALERT_STRING_KEY'
          ),
          sortable: false,
          tdClass: 'text-nowrap',
        },
        {
          key: 'modify',
          label: '',
          tdClass: 'text-right text-nowrap',
        },
      ],
      searchFilter: searchFilter,
      searchTotalFilteredRows: 0,
      tabItems: [],
      stringkeyNo: 1,
      strings: '',
      keyAmount: 0,
    };
  },
  computed: {
    alertStringKey() {
      return stringsParser(this.$store.getters['alertpolicies/strings']);
    },
    stringsItems() {
      return this.tabItems.map((rule) => {
        return {
          modify: [
            {
              value: 'edit',
              enabled: true,
              title: this.$t('pageIpAccessControl.button.modify'),
            },
          ],
          ...rule,
        };
      });
    },
  },
  created() {
    const policies = this;
    policies.startLoader();
    policies.$store.dispatch('alertpolicies/postStringKey').then(() => {
      policies.tabItems = policies.alertStringKey;
      policies.keyAmount = policies.tabItems.length;
    });
  },
  methods: {
    saveStringsTable(stringObj) {
      let policies = this;
      policies.startLoader();
      policies.$store
        .dispatch('alertpolicies/putStringKey', stringObj)
        .then((success) => {
          policies.$store.dispatch('alertpolicies/postStringKey').then(() => {
            policies.tabItems = policies.alertStringKey;
            policies.endLoader();
          });
          policies.successToast(success);
        })
        .catch((message) => {
          policies.errorToast(message);
        });
    },
    onTableRowAction(action, rowdata) {
      //console.log('onTableRowAction', action, rowdata);
      this.stringkeyNo = rowdata.number;
      this.strings = rowdata.strings;
      this.$bvModal.show('modal-modify-strings');
    },
    onFiltered(filteredItems) {
      this.searchTotalFilteredRows = filteredItems.length;
    },
  },
};
</script>

<style lang="scss" scoped>
.table {
  height: 38vh;
  overflow-y: scroll;
}
</style>
