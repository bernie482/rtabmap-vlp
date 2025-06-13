<template>
  <b-container fluid="x1">
    <page-title />
    <page-section :section-title="$t('pageAlerts.peftable')">
      <modal-modify-p-e-f-settings
        :pefstate="mpefstatus"
        :pefvalue="mpefvalue"
        hide-footer
        @ok="saveModifyPef"
      />
      <modal-global-p-e-f-settings
        :glopefstatus="glopefstatus"
        hide-footer
        @ok="saveGlobalPefState"
      />
      <div>
        <label>{{ $t('pageAlerts.CONFPEF_DESC') }}</label>
        <b-button variant="link" @click="showModal">here</b-button>
      </div>
      <div class="table">
        <b-table
          sort-icon-left
          no-sort-reset
          hover
          sort-by="Number"
          responsive="md"
          show-empty
          :items="pefItems"
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
      </div>
    </page-section>
    <snmp-server :redfishsnmp="redfishsnmp" @update="updateSNMPServer" />
    <snmp-trap :snmptrap="snmpTrap" />
    <alert-dest :alertdest="destConfigObj" />
  </b-container>
</template>

<script>
import PageTitle from '@/components/Global/PageTitle';

import PageSection from '@/components/Global/PageSection';
import DataFormatterMixin from '@/components/Mixins/DataFormatterMixin';
import ModalGlobalPEFSettings from './ModalGlobalPEFSettings';
import ModalModifyPEFSettings from './ModalModifyPEFSettings';
import IconEdit from '@carbon/icons-vue/es/edit/20';
import IconInsert from '@carbon/icons-vue/es/row--insert/20';
import IconTrashcan from '@carbon/icons-vue/es/trash-can/20';
import TableRowAction from '@/components/Global/TableRowAction';
import SnmpServer from './SnmpServer';
import SnmpTrap from './SnmpTrap';
import AlertDest from './AlertDest';
import SearchFilterMixin, {
  searchFilter,
} from '@/components/Mixins/SearchFilterMixin';
import {
  snmpsvcParser,
  pefParser,
  alertdestParser,
  snmptrapParser,
  globalpefParser,
  modifypefParser,
} from '@/env/insyde/components/Mixins/AlertsTableParserMixin';

export default {
  name: 'Alerts',
  components: {
    PageTitle,
    PageSection,
    ModalGlobalPEFSettings,
    ModalModifyPEFSettings,
    IconEdit,
    IconInsert,
    IconTrashcan,
    TableRowAction,
    SnmpServer,
    SnmpTrap,
    AlertDest,
  },
  mixins: [DataFormatterMixin, SearchFilterMixin],
  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
  data() {
    return {
      destConfigObj: {},
      snmpTrap: {},
      redfishsnmp: {},
      fields: [
        {
          key: 'Number',
          label: 'No',
          sortable: true,
        },
        {
          key: 'PefEnable',
          label: 'PEF Enable',
          sortable: false,
          tdClass: 'text-nowrap',
        },
        {
          key: 'SensorType',
          label: 'Sensor Type',
          sortable: false,
          tdClass: 'text-nowrap',
        },
        {
          key: 'SensorName',
          label: 'Sensor Name',
          sortable: false,
          tdClass: 'text-nowrap',
        },
        {
          key: 'AssertionCond',
          label: 'Assertion Condition',
          sortable: false,
          tdClass: 'text-nowrap',
        },
        {
          key: 'PefAction',
          label: 'PEF Actions',
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
      gpefenable: false,
      gpefeventfilter: false,
      gpefaction: 0,
      glopefstatus: {},
      mpefstatus: {},
      mpefvalue: {},
    };
  },
  computed: {
    getSNMPServer() {
      return snmpsvcParser(this.$store.getters['alerts/snmpsvc']);
    },
    pefinfo() {
      return pefParser(this.$store.getters['alerts/pef']);
    },
    alertdeststate() {
      return alertdestParser(this.$store.getters['alerts/alertconf']);
    },
    snmptrapinfo() {
      return snmptrapParser(this.$store.getters['alerts/trapconf']);
    },
    getGlobalPefStatus() {
      return globalpefParser(this.$store.getters['alerts/globalpefstatus']);
    },
    getModifyPefStatus() {
      return modifypefParser(this.$store.getters['alerts/mpefstatus']);
    },
    pefItems() {
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
    const alerts = this;
    alerts.startLoader();
    alerts.$store.dispatch('alerts/getGlobalPefStatus').then(() => {
      alerts.gpefenable = alerts.getGlobalPefStatus.enable;
      alerts.gpefeventfilter = alerts.getGlobalPefStatus.filteraction;
      alerts.gpefaction = alerts.getGlobalPefStatus.action;
      alerts.glopefstatus = alerts.getGlobalPefStatus.glopefobj;
      alerts.$store.dispatch('alerts/getPef').then(() => {
        alerts.tabItems = alerts.pefinfo.pefdata;
        alerts.$store.dispatch('alerts/getModifyPef').then(() => {
          alerts.mpefstatus = alerts.getModifyPefStatus;
          // SNMP service
          alerts.$store.dispatch('alerts/getSNMPsvc').then(() => {
            alerts.redfishsnmp = alerts.getSNMPServer ?? null;
            alerts.$store.dispatch('alerts/getTrapConfigInfo').then(() => {
              alerts.snmpTrap = alerts.snmptrapinfo;
              // Alert destination#~
              alerts.$store
                .dispatch('alerts/getAlertDestInfo')
                .then(() => {
                  alerts.destConfigObj = alerts?.alertdeststate ?? null;
                })
                .finally(() => {
                  alerts.endLoader();
                });
            });
          });
          /*.catch((message) => {
              // Redfish GET error.
              alerts.errorToast(message);
            });*/
        });
      });
    });
  },
  methods: {
    updateSNMPServer(snmpObj) {
      if (snmpObj == null) return;
      const alerts = this;
      alerts.redfishsnmp = snmpObj;
    },
    saveModifyPef(mpefobj) {
      //console.log('saveModifyPef !!!', mpefobj);
      let modifiedPEF = this;
      modifiedPEF.startLoader();
      modifiedPEF.$store
        .dispatch('alerts/saveModifiedpefConfig', mpefobj)
        .then((success) => {
          // updated PEF
          modifiedPEF.$store.dispatch('alerts/getPef').then(() => {
            modifiedPEF.tabItems = modifiedPEF.pefinfo.pefdata;
          });
          modifiedPEF.successToast(success);
        })
        .catch((message) => {
          modifiedPEF.errorToast(message);
        })
        .finally(() => modifiedPEF.endLoader());
    },
    onTableRowAction(action, rowdata) {
      //console.log('onTableRowAction', action, rowdata);
      this.mpefvalue = rowdata;
      this.$bvModal.show('modal-modify-pef');
    },
    saveGlobalPefState(GlobalPefObj) {
      //console.log('saveGlobalPefState!!');
      let alerts = this;
      alerts.startLoader();
      alerts.$store
        .dispatch('alerts/saveGlobalpefConfig', GlobalPefObj)
        .then((success) => {
          alerts.successToast(success);
        })
        .catch((message) => {
          alerts.errorToast(message);
        })
        .finally(() => alerts.endLoader());
    },
    showModal() {
      this.$bvModal.show('modal-global-pef');
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
