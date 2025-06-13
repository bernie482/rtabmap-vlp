<template>
  <b-container fluid="xl">
    <page-title />
    <b-row class="align-items-end">
      <b-col sm="6" md="5" xl="4">
        <search
          :placeholder="$t('pageCurrentUsers.table.searchSessions')"
          data-test-id="sessions-input-searchSessions"
          @change-search="onChangeSearchInput"
          @clear-search="onClearSearchInput"
        />
      </b-col>
      <b-col sm="3" md="3" xl="2">
        <table-cell-count
          :filtered-items-count="filteredRows"
          :total-number-of-cells="allConnections.length"
        ></table-cell-count>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <table-toolbar
          ref="toolbar"
          :selected-items-count="selectedRows.length"
          :actions="batchActions"
          @clear-selected="clearSelectedRows($refs.table)"
          @batch-action="onBatchAction"
        >
        </table-toolbar>
        <b-table
          id="table-session-logs"
          ref="table"
          responsive="md"
          selectable
          no-select-on-click
          hover
          show-empty
          :fields="fields"
          :items="allConnections"
          :filter="searchFilter"
          :empty-text="$t('global.table.emptyMessage')"
          :per-page="perPage"
          :current-page="currentPage"
          @filtered="onFiltered"
          @row-selected="onRowSelected($event, allConnections.length)"
        >
          <!-- Checkbox column -->
          <template #head(checkbox)>
            <b-form-checkbox
              v-model="tableHeaderCheckboxModel"
              data-test-id="sessions-checkbox-selectAll"
              :indeterminate="tableHeaderCheckboxIndeterminate"
              @change="onChangeHeaderCheckbox($refs.table)"
            >
              <span class="sr-only">{{ $t('global.table.selectAll') }}</span>
            </b-form-checkbox>
          </template>
          <template #cell(checkbox)="row">
            <b-form-checkbox
              v-model="row.rowSelected"
              :data-test-id="`sessions-checkbox-selectRow-${row.index}`"
              @change="toggleSelectRow($refs.table, row.index)"
            >
              <span class="sr-only">{{ $t('global.table.selectItem') }}</span>
            </b-form-checkbox>
          </template>

          <!-- Actions column -->
          <template #cell(actions)="row" class="ml-3">
            <table-row-action
              v-for="(action, index) in row.item.actions"
              :key="index"
              :value="action.value"
              :title="action.title"
              :row-data="row.item"
              :btn-icon-only="false"
              :enabled="!$route.meta.viewOnly"
              :data-test-id="`sessions-button-disconnect-${row.index}`"
              @click-table-action="onTableRowAction($event, row.item)"
            ></table-row-action>
          </template>
        </b-table>
      </b-col>
    </b-row>

    <!-- Table pagination -->
    <b-row>
      <b-col sm="6">
        <b-form-group
          class="table-pagination-select"
          :label="$t('global.table.itemsPerPage')"
          label-for="pagination-items-per-page"
        >
          <b-form-select
            id="pagination-items-per-page"
            v-model="perPage"
            :options="itemsPerPageOptions"
          />
        </b-form-group>
      </b-col>
      <b-col sm="6">
        <b-pagination
          v-model="currentPage"
          first-number
          last-number
          :per-page="perPage"
          :total-rows="getTotalRowCount(filteredRows)"
          aria-controls="table-session-logs"
        />
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import PageTitle from '@/components/Global/PageTitle';
import Search from '@/components/Global/Search';
import TableCellCount from '@/components/Global/TableCellCount';
import TableRowAction from '@/components/Global/TableRowAction';
import TableToolbar from '@/components/Global/TableToolbar';

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
  components: {
    PageTitle,
    Search,
    TableCellCount,
    TableRowAction,
    TableToolbar,
  },
  mixins: [BVPaginationMixin, BVTableSelectableMixin, SearchFilterMixin],
  beforeRouteLeave(to, from, next) {
    // Hide loader if the user navigates to another page
    // before request is fulfilled.
    this.hideLoader();
    next();
  },
  data() {
    return {
      fields: [
        {
          key: 'checkbox',
        },
        {
          key: 'username',
          label: this.$t('pageCurrentUsers.table.username'),
        },
        {
          key: 'type',
          label: this.$t('pageCurrentUsers.table.type'),
        },
        {
          key: 'ipAddress',
          label: this.$t('pageCurrentUsers.table.ipAddress'),
        },
        {
          key: 'actions',
          label: '',
        },
      ],
      batchActions: [
        {
          value: 'disconnect',
          label: this.$t('pageCurrentUsers.action.disconnect'),
        },
      ],
      currentPage: currentPage,
      itemsPerPageOptions: itemsPerPageOptions,
      perPage: perPage,
      selectedRows: selectedRows,
      searchTotalFilteredRows: 0,
      tableHeaderCheckboxModel: tableHeaderCheckboxModel,
      tableHeaderCheckboxIndeterminate: tableHeaderCheckboxIndeterminate,
      searchFilter: searchFilter,
    };
  },
  computed: {
    filteredRows() {
      return this.searchFilter
        ? this.searchTotalFilteredRows
        : this.allConnections.length;
    },
    allConnections() {
      return this.$store.getters['currentUsers/allConnections'].map(
        (session) => {
          return {
            ...session,
            actions: [
              {
                value: 'disconnect',
                title: this.$t('pageCurrentUsers.action.disconnect'),
              },
            ],
          };
        }
      );
    },
  },
  created() {
    this.startLoader();
    this.$store
      .dispatch('currentUsers/getSessionsData')
      .finally(() => this.endLoader());
  },
  methods: {
    onFiltered(filteredItems) {
      this.searchTotalFilteredRows = filteredItems.length;
    },
    onChangeSearchInput(event) {
      this.searchFilter = event;
    },
    disconnectSessions(uris) {
      this.$store
        .dispatch('currentUsers/disconnectSessions', uris)
        .then((messages) => {
          messages.forEach(({ type, message }) => {
            if (type === 'success') {
              this.successToast(message);
            } else if (type === 'error') {
              this.errorToast(message);
            }
          });
        });
    },
    onTableRowAction(action, { uri, category }) {
      if (action === 'disconnect') {
        this.$bvModal
          .msgBoxConfirm(this.$tc('pageCurrentUsers.modal.disconnectMessage'), {
            title: this.$tc('pageCurrentUsers.modal.disconnectTitle'),
            okTitle: this.$t('pageCurrentUsers.action.disconnect'),
            cancelTitle: this.$t('global.action.cancel'),
          })
          .then((deleteConfirmed) => {
            if (deleteConfirmed) this.disconnectSessions([{ uri, category }]);
          });
      }
    },
    onBatchAction(action) {
      if (action === 'disconnect') {
        const uris = this.selectedRows.map((row) => {
          return { uri: row.uri, category: row.category };
        });
        this.$bvModal
          .msgBoxConfirm(
            this.$tc(
              'pageCurrentUsers.modal.disconnectMessage',
              this.selectedRows.length
            ),
            {
              title: this.$tc(
                'pageCurrentUsers.modal.disconnectTitle',
                this.selectedRows.length
              ),
              okTitle: this.$t('pageCurrentUsers.action.disconnect'),
              cancelTitle: this.$t('global.action.cancel'),
            }
          )
          .then((deleteConfirmed) => {
            if (deleteConfirmed) {
              this.disconnectSessions(uris);
            }
          });
      }
    },
  },
};
</script>
<style lang="scss">
#table-session-logs {
  td .btn-link {
    width: auto !important;
  }
}
</style>
