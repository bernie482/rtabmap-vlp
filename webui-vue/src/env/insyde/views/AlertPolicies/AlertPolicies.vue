<template>
  <b-container fluid="x1">
    <page-title />
    <page-section
      :section-title="$t('pageAlertPolicies.CONFALERT_POLICIES_SUB')"
    >
      <modal-modify-policy-settings
        :fieldparm="fieldParm"
        :fieldvalue="fieldValue"
        hide-footer
        @ok="saveModifyPolicy"
      />
      <b-row>
        <b-col class="text-right">
          <label>
            {{ `${$t('pageAlertPolicies.CONFALERT_POLICY_TABLE')}:` }}
          </label>
          {{
            `${plyAmount} ${$t('pageAlertPolicies.CONFALERT_POLICIES_SUFFIX')}`
          }}
        </b-col>
      </b-row>
      <div class="table">
        <b-table
          sort-icon-left
          no-sort-reset
          hover
          sort-by="entryNumber"
          responsive="md"
          show-empty
          :items="plyItems"
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
    <page-section
      :section-title="
        $t('pageAlertPolicies.CONFALERT_POLICIES_ALERT_STRING_KEY')
      "
    >
      <alert-string-key />
    </page-section>
  </b-container>
</template>

<script>
import PageTitle from '@/components/Global/PageTitle';

import PageSection from '@/components/Global/PageSection';
import ModalModifyPolicySettings from './ModalModifyPolicySettings';
import AlertStringKey from './AlertStringKey';
import IconEdit from '@carbon/icons-vue/es/edit/20';
import TableRowAction from '@/components/Global/TableRowAction';
import SearchFilterMixin, {
  searchFilter,
} from '@/components/Mixins/SearchFilterMixin';
import {
  policyTabParser,
  ParmParser,
} from '@/env/insyde/components/Mixins/AlertPoliciesTableParserMixin';

export default {
  name: 'AlertPolicies',
  components: {
    PageTitle,
    PageSection,
    ModalModifyPolicySettings,
    AlertStringKey,
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
      fields: [
        {
          key: 'entryNumber',
          label: this.$t('global.table.prefixNumber'),
          sortable: true,
        },
        {
          key: 'groupNumber',
          label: this.$t('pageAlertPolicies.CONFALERT_POLICIES_GROUP_NUMBER'),
          sortable: false,
          tdClass: 'text-nowrap',
        },
        {
          key: 'enableAlert',
          label: this.$t('pageAlertPolicies.CONFALERT_POLICIES_ENABLE'),
          sortable: false,
          tdClass: 'text-nowrap',
        },
        {
          key: 'policyAct',
          label: this.$t('pageAlertPolicies.CONFALERT_POLICIES_ACTION'),
          sortable: false,
          tdClass: 'text-nowrap',
        },
        {
          key: 'LANChn',
          label: this.$t('pageAlerts.CONFALERT_LANCHANNEL'),
          sortable: false,
          tdClass: 'text-nowrap',
        },
        {
          key: 'DESTSelector',
          label: this.$t(
            'pageAlertPolicies.CONFALERT_POLICIES_DESTINATION_SELECTOR'
          ),
          sortable: false,
          tdClass: 'text-nowrap',
        },
        {
          key: 'EvtSpecAlertStr',
          label: this.$t(
            'pageAlertPolicies.CONFALERT_POLICIES_EVENT_SPEC_ALERT_STRING'
          ),
          sortable: false,
          tdClass: 'text-nowrap',
        },
        {
          key: 'AlertStrKey',
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
      fieldParm: {},
      fieldValue: {},
      plyAmount: 0,
    };
  },
  computed: {
    policyFieldParm() {
      return ParmParser(this.$store.getters['alertpolicies/policyfieldParm']);
    },
    policyTableInfo() {
      return policyTabParser(this.$store.getters['alertpolicies/policies']);
    },
    plyItems() {
      // transform user data to table data
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
    this.getPolicyTable();
    this.getPolicyParm();
  },
  methods: {
    getPolicyTable() {
      const policy = this;
      policy.startLoader();
      policy.$store
        .dispatch('alertpolicies/postPolicyTab')
        .then(() => {
          policy.tabItems = policy.policyTableInfo;
          policy.plyAmount = policy.tabItems.length;
        })
        .finally(() => policy.endLoader());
    },
    getPolicyParm() {
      const policy = this;
      policy.startLoader();
      policy.$store
        .dispatch('alertpolicies/postPolicyParameter')
        .then(() => {
          policy.fieldParm = policy.policyFieldParm;
        })
        .finally(() => policy.endLoader());
    },
    saveModifyPolicy(configObj) {
      let policy = this;
      policy.startLoader();
      policy.$store
        .dispatch('alertpolicies/putPolicyConfig', configObj)
        .then((success) => {
          policy.getPolicyTable();
          policy.successToast(success);
        })
        .catch((message) => {
          policy.errorToast(message);
        })
        .finally(() => policy.endLoader());
    },
    onTableRowAction(action, rowdata) {
      //console.log('onTableRowAction', action, rowdata);
      this.fieldValue = rowdata;
      this.$bvModal.show('modal-modify-policy');
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
