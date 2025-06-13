<template>
  <page-section :section-title="$t('pageIpAccessControl.' + target + '.title')">
    <b-form novalidate @submit.prevent="handleSubmit">
      <b-row>
        <b-col>
          <b-form-checkbox
            v-model="enabled"
            data-test-id="ipSetting-checkbox-enabled"
            :disabled="$route.meta.viewOnly"
            @change="onChangeEnabled"
          >
            {{ $t('pageIpAccessControl.enabled') }}
          </b-form-checkbox>
        </b-col>
      </b-row>
      <div class="form-background p-3">
        <b-form-group
          class="m-0"
          :label="$t('pageIpAccessControl.' + target + '.title')"
          label-class="sr-only"
          :disabled="$route.meta.viewOnly || !enabled"
        >
          <b-row class="text-right">
            <b-col>
              {{ $t('pageIpAccessControl.numberOfAccessRules') }}
              {{ rules.length }}
            </b-col>
          </b-row>
          <b-row>
            <b-col>
              <b-form-group class="mb-4">
                <table-toolbar
                  ref="toolbar"
                  :selected-items-count="selectedRows.length"
                  :actions="tableToolbarActions"
                  @clear-selected="clearSelectedRows($refs.table)"
                  @batch-action="onBatchAction"
                />
                <b-table
                  ref="table"
                  responsive="md"
                  selectable
                  show-empty
                  no-select-on-click
                  hover
                  sort-by="ruleNo"
                  :fields="fields"
                  :items="tableItems"
                  :empty-text="$t('global.table.emptyMessage')"
                  @row-selected="onRowSelected($event, tableItems.length)"
                >
                  <!-- Checkbox column -->
                  <template #head(checkbox)>
                    <b-form-checkbox
                      v-model="tableHeaderCheckboxModel"
                      data-test-id="ipSetting-checkbox-selectAll"
                      :indeterminate="tableHeaderCheckboxIndeterminate"
                      @change="onChangeHeaderCheckbox($refs.table)"
                    >
                      <span class="sr-only">{{
                        $t('global.table.selectAll')
                      }}</span>
                    </b-form-checkbox>
                  </template>
                  <template #cell(checkbox)="row">
                    <b-form-checkbox
                      v-model="row.rowSelected"
                      data-test-id="ipSetting-checkbox-toggleSelectRow"
                      @change="toggleSelectRow($refs.table, row.index)"
                    >
                      <span class="sr-only">{{
                        $t('global.table.selectItem')
                      }}</span>
                    </b-form-checkbox>
                  </template>

                  <!-- table actions column -->
                  <template #cell(actions)="{ item }">
                    <table-row-action
                      v-for="(action, index) in item.actions"
                      :key="index"
                      :value="action.value"
                      :enabled="action.enabled"
                      :title="action.title"
                      @click-table-action="onTableRowAction($event, item)"
                    >
                      <template #icon>
                        <icon-insert
                          v-if="action.value === 'insert'"
                          :data-test-id="`ipSetting-tableRowAction-insert-${index}`"
                        />
                        <icon-edit
                          v-if="action.value === 'edit'"
                          :data-test-id="`ipSetting-tableRowAction-edit-${index}`"
                        />
                        <icon-trashcan
                          v-if="action.value === 'delete'"
                          :data-test-id="`ipSetting-tableRowAction-delete-${index}`"
                        />
                      </template>
                    </table-row-action>
                  </template>
                </b-table>
              </b-form-group>
              <b-row>
                <b-col>
                  <b-btn
                    class="btn_setting"
                    variant="primary"
                    type="button"
                    data-test-id="ipSetting-button-add"
                    :disabled="$route.meta.viewOnly || rules.length > 9"
                    @click="initModalRule('add', null)"
                  >
                    {{ $t('pageIpAccessControl.button.add') }}
                  </b-btn>
                  <div v-if="rules.length > 9" class="error">
                    {{ $t('pageIpAccessControl.tips.maxRules') }}
                  </div>
                </b-col>
              </b-row>
            </b-col>
          </b-row>
          <!-- Modals -->
          <modal-rule
            :next-rule-no="getRuleNo"
            :target="target"
            :scenario="scenario"
            :rule="activeRule"
            @ok="saveRule"
            @hidden="activeRule = null"
          />
        </b-form-group>
      </div>
    </b-form>
  </page-section>
</template>

<script>
import PageSection from '@/components/Global/PageSection';
import ModalRule from './ModalRule';
import TableRowAction from '@/components/Global/TableRowAction';
import TableToolbar from '@/components/Global/TableToolbar';
import IconEdit from '@carbon/icons-vue/es/edit/20';
import IconInsert from '@carbon/icons-vue/es/row--insert/20';
import IconTrashcan from '@carbon/icons-vue/es/trash-can/20';

import BVPaginationMixin, {
  currentPage,
  perPage,
  itemsPerPageOptions,
} from '@/components/Mixins/BVPaginationMixin';
import BVTableSelectableMixin, {
  selectedRows,
  tableHeaderCheckboxModel,
  tableHeaderCheckboxIndeterminate,
} from '@/components/Mixins/BVTableSelectableMixin';
import SearchFilterMixin, {
  searchFilter,
} from '@/components/Mixins/SearchFilterMixin';

export default {
  name: 'IpAccessControl',
  components: {
    PageSection,
    TableToolbar,
    TableRowAction,
    ModalRule,
    IconInsert,
    IconEdit,
    IconTrashcan,
  },
  mixins: [BVPaginationMixin, BVTableSelectableMixin, SearchFilterMixin],
  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
  props: {
    target: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      activeRule: null,
      scenario: '', // how to use modify page: add, insert, modify
      //nextRuleNo: 1, // new index for add new rule
      form: {
        enabled: false,
      },
      fields: [
        {
          key: 'checkbox',
        },
        {
          key: 'ruleNo',
          label: this.$t('pageIpAccessControl.form.ruleNo'),
        },
        {
          key: 'ruleType',
          label: this.$t('pageIpAccessControl.form.ruleType'),
        },
        {
          key: 'content',
          label: this.$t('pageIpAccessControl.form.content'),
        },
        {
          key: 'policy',
          label: this.$t('pageIpAccessControl.form.policy'),
        },
        {
          key: 'actions',
          label: '',
          tdClass: 'text-right text-nowrap',
        },
      ],
      tableToolbarActions: [
        {
          value: 'delete',
          label: this.$t('global.action.delete'),
        },
      ],
      currentPage: currentPage,
      itemsPerPageOptions: itemsPerPageOptions,
      perPage: perPage,
      selectedRows: selectedRows,
      tableHeaderCheckboxModel: tableHeaderCheckboxModel,
      tableHeaderCheckboxIndeterminate: tableHeaderCheckboxIndeterminate,
      searchFilter: searchFilter,
    };
  },
  computed: {
    filteredRows() {
      return this.searchFilter
        ? this.searchTotalFilteredRows
        : this.rules.length;
    },
    tableItems() {
      // transform user data to table data
      return this.rules.map((rule) => {
        return {
          actions: [
            {
              value: 'insert',
              enabled: true,
              title: this.$t('pageIpAccessControl.button.insert'),
            },
            {
              value: 'edit',
              enabled: true,
              title: this.$t('pageIpAccessControl.button.modify'),
            },
            {
              value: 'delete',
              enabled: true,
              title: this.$tc('pageIpAccessControl.button.delete'),
            },
          ],
          ...rule,
        };
      });
    },
    rules() {
      let rules = this.$store.getters[this.target + 'AccessControl/rules'];
      return rules.map((session) => {
        return {
          ...session,
        };
      });
    },
    getRuleNo() {
      return this.rules.length + 1;
    },
    enabled: {
      get() {
        return this.$store.getters[this.target + 'AccessControl/enabled'];
      },
      set(value) {
        this.$store.commit(this.target + 'AccessControl/setEnabled', value);
      },
    },
  },
  created() {
    this.asyncGetRules();
  },
  methods: {
    initModalRule(scenario, rule) {
      //console.log('initModalRule', scenario, rule);
      this.scenario = scenario;
      this.activeRule = rule;
      this.$bvModal.show('modal-rule-' + this.target); // id in sub-component
      //this.$bvModal.show('modal-rule-ipv4');
    },
    initModalDelete(rule) {
      //console.log('initModalDelete', rule);
      this.$bvModal
        .msgBoxConfirm(
          this.$t('pageIpAccessControl.diaglog.deleteConfirmMessage', {
            ruleNo: rule.ruleNo,
          }),
          {
            title: this.$tc('pageIpAccessControl.diaglog.deleteRule'),
            okTitle: this.$tc('pageIpAccessControl.diaglog.deleteRule'),
            cancelTitle: this.$t('global.action.cancel'),
          }
        )
        .then((deleteConfirmed) => {
          if (deleteConfirmed) {
            this.deleteRule(rule);
            this.asyncGetRules();
          }
        });
    },
    saveRule({ scenario, ruleData }) {
      this.startLoader();
      if (scenario == 'add' || scenario == 'insert') {
        this.$store
          .dispatch(this.target + 'AccessControl/createRule', ruleData)
          .then((success) => this.successToast(success))
          .catch(({ message }) => this.errorToast(message))
          .finally(() => this.endLoader());
      } else {
        this.$store
          .dispatch(this.target + 'AccessControl/updateRule', ruleData)
          .then((success) => this.successToast(success))
          .catch(({ message }) => this.errorToast(message))
          .finally(() => this.endLoader());
      }
    },
    asyncGetRules() {
      this.startLoader();
      this.$store
        .dispatch(this.target + 'AccessControl/getRules')
        .finally(() => this.endLoader());
    },
    deleteRule({ ruleNo }) {
      this.startLoader();
      this.$store
        .dispatch(this.target + 'AccessControl/deleteRule', ruleNo)
        .then((success) => this.successToast(success))
        .catch(({ message }) => this.errorToast(message))
        .finally(() => this.endLoader());
    },
    handleSubmit() {
      /*
      this.$v.$touch();
      if (this.$v.$invalid) return;
      */
    },
    onFiltered(filteredItems) {
      this.searchTotalFilteredRows = filteredItems.length;
    },
    onChangeSearchInput(event) {
      this.searchFilter = event;
    },
    onBatchAction(action) {
      switch (action) {
        case 'delete':
          this.$bvModal
            .msgBoxConfirm(
              this.$tc(
                'pageIpAccessControl.diaglog.batchDeleteConfirmMessage',
                this.selectedRows.length
              ),
              {
                title: this.$tc(
                  'pageIpAccessControl.diaglog.deleteRule',
                  this.selectedRows.length
                ),
                okTitle: this.$tc(
                  'pageIpAccessControl.diaglog.deleteRule',
                  this.selectedRows.length
                ),
                cancelTitle: this.$t('global.action.cancel'),
              }
            )
            .then((deleteConfirmed) => {
              if (deleteConfirmed) {
                this.startLoader();
                this.$store
                  .dispatch(
                    this.target + 'AccessControl/deleteRules',
                    this.selectedRows
                  )
                  .then((messages) => {
                    messages.forEach(({ type, message }) => {
                      if (type === 'success') this.successToast(message);
                      if (type === 'error') this.errorToast(message);
                    });
                  })
                  .finally(() => this.endLoader());
              }
            });
          break;
      }
    },
    onTableRowAction(action, row) {
      switch (action) {
        case 'insert':
          this.initModalRule('insert', row);
          break;
        case 'edit':
          this.initModalRule('edit', row);
          break;
        case 'delete':
          this.initModalDelete(row);
          break;
        default:
          break;
      }
    },
    onChangeEnabled(enabled) {
      //console.log('onChangeEnabled', enabled);
      // confirm diaglog
      this.$bvModal
        .msgBoxConfirm(
          this.$t('pageIpAccessControl.diaglog.confirmChangeConfig'),
          {
            title: this.$t('pageIpAccessControl.diaglog.configTitle'),
            okTitle: this.$t('global.action.confirm'),
            cancelTitle: this.$t('global.action.cancel'),
          }
        )
        .then((confirmed) => {
          if (confirmed) {
            //console.log('onChangeEnabled', this.enabled, enabled);
            this.enabled = enabled;
            this.startLoader();
            this.$store
              .dispatch(
                this.target + 'AccessControl/updateConfigEnable',
                enabled
              )
              .then((success) => this.successToast(success))
              .catch(({ message }) => this.errorToast(message))
              .finally(() => this.endLoader());
          } else {
            this.enabled = !enabled;
          }
        });
    },
  },
};
</script>

<style scoped>
/*
.btn {
  border: 1px solid;
}
*/

.btn_setting {
  border: 1px solid;
}
</style>
