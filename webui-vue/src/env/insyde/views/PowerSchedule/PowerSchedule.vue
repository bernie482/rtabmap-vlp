<template>
  <b-container fluid="xl">
    <page-title />
    <b-row>
      <b-col class="text-right">
        <b-button
          variant="primary"
          data-test-id="power-schedule-button-delete"
          :disabled="disabled || currentIds.length === 0"
          @click="onDeletedAll"
        >
          <icon-trashcan />
          {{ $t('global.action.deleteAll') }}
        </b-button>
        <b-button
          variant="primary"
          data-test-id="power-schedule-button-add"
          :disabled="disabled"
          @click="initModal(null)"
        >
          <icon-add />
          {{ $t('global.action.add') }}
        </b-button>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <b-table
          ref="table"
          responsive="md"
          selectable
          show-empty
          no-select-on-click
          hover
          style="text-align: center"
          :fields="fields"
          :items="tableItems"
          :empty-text="$t('global.table.emptyMessage')"
          @row-selected="onRowSelected($event, tableItems.length)"
        >
          <!-- table actions column -->
          <template #cell(actions)="{ item }">
            <table-row-action
              v-for="(action, index) in item.Actions"
              :key="index"
              :value="action.value"
              :enabled="iconEnabled(action)"
              :title="action.title"
              @click-table-action="onTableRowAction($event, item)"
            >
              <template #icon>
                <icon-edit
                  v-if="action.value === 'edit'"
                  :data-test-id="`power-schedule-tableRowAction-edit-${index}`"
                  :disabled="disabled"
                />
                <icon-trashcan
                  v-if="action.value === 'delete'"
                  :data-test-id="`power-schedule-tableRowAction-delete-${index}`"
                  :disabled="disabled"
                />
              </template>
            </table-row-action>
          </template>
        </b-table>
      </b-col>
    </b-row>
    <!-- Modals -->
    <modal-schedule
      :item="activeItem"
      :user-ids="currentIds"
      @update:item="(newValue) => (activeItem = newValue)"
      @ok="saveSchedule"
      @hidden="activeItem = null"
    />
  </b-container>
</template>

<script>
import IconTrashcan from '@carbon/icons-vue/es/trash-can/20';
import IconEdit from '@carbon/icons-vue/es/edit/20';
import IconAdd from '@carbon/icons-vue/es/add--alt/20';

import ModalSchedule from './ModalSchedule';
import PageTitle from '@/components/Global/PageTitle';
import TableRowAction from '@/components/Global/TableRowAction';

import { mapFields } from 'vuex-map-fields';
import { mapState } from 'vuex';
import Date from '@/env/insyde/utilities/InsydeDate';

export default {
  name: 'Schedules',
  components: {
    IconAdd,
    IconEdit,
    IconTrashcan,
    ModalSchedule,
    PageTitle,
    TableRowAction,
  },

  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
  data() {
    return {
      activeItem: {}, // NOTE: must be different from null for trigger watch event
      fields: [
        {
          key: 'Id',
          label: this.$t('pagePowerSchedule.LANG_POWER_SCHEDULE_INDEX_LABEL'),
        },
        {
          key: 'Enabled',
          label: this.$t('pagePowerSchedule.LANG_POWER_SCHEDULE_ENABLE_LABEL'),
        },
        {
          key: 'StartDate',
          label: this.$t('pagePowerSchedule.LANG_POWER_SCHEDULE_START_LABEL'),
        },
        {
          key: 'EndDate',
          label: this.$t('pagePowerSchedule.LANG_POWER_SCHEDULE_END_LABEL'),
        },
        {
          key: 'TriggerDate',
          label: this.$t(
            'pagePowerSchedule.LANG_POWER_SCHEDULE_TRIGGER_DATE_LABEL'
          ),
        },
        {
          key: 'TriggerTime',
          label: this.$t(
            'pagePowerSchedule.LANG_POWER_SCHEDULE_TRIGGER_TIME_LABEL'
          ),
        },
        {
          key: 'Action',
          label: this.$t('pagePowerSchedule.LANG_POWER_SCHEDULE_ACTION_LABEL'),
        },
        {
          key: 'Actions',
          label: '',
          tdClass: 'text-right text-nowrap',
        },
      ],
    };
  },
  computed: {
    ...mapState('powerSchedule', ['allSchedules']),
    ...mapFields('powerSchedule', [
      'allSchedules',
      'powerActionOptions',
      'powerDateTypeOptions',
      'powerDateWeeklyDayOptions',
    ]),
    disabled() {
      return this.$route.meta.viewOnly || this.loading;
    },
    currentIds() {
      return this.allSchedules.map((el) => {
        return el ? parseInt(el.index) : 0;
      });
    },
    tableItems() {
      // transform user data to table data
      let list = this.allSchedules.filter((el) => {
        return !!el;
      });
      return list.map((el) => {
        if (!el) return {};
        let type = 2; // 0: undefined, 1: specific date, 2: daily, 3: weekly, 4: monthly
        let duration = false; // false: default, true: start-end date is diff
        let startDate = '-';
        let endDate = '-';
        let triggerDate = '';

        triggerDate = this.$t(
          'pagePowerSchedule.LANG_POWER_SCHEDULE_DAILY_LABEL'
        );
        if (
          el.endYear == 0 &&
          el.endMonth == 0 &&
          el.endDay == 0 &&
          el.startYear == 0 &&
          el.startMonth == 0 &&
          el.startDay == 0
        ) {
          type = 2;
        } else {
          startDate = new Date(
            el.startYear,
            el.startMonth - 1, // month is 0-base
            el.startDay
          ).format('yyyy-mm-dd');
          endDate = new Date(el.endYear, el.endMonth - 1, el.endDay).format(
            'yyyy-mm-dd'
          );
        }
        if (el.startYear == 0) {
          duration = false;
        } else if (startDate == endDate) {
          type = 1;
          triggerDate = startDate;
        } else {
          duration = true;
        }
        // for weekly
        if (el.dayOfWeek > 0 && el.dayOfWeek < 8) {
          type = 3;
          triggerDate =
            this.$t('pagePowerSchedule.LANG_POWER_SCHEDULE_WEEKLY_LABEL') +
            ', ' +
            this.powerDateWeeklyDayOptions.find((el2) => {
              return el2.value == el.dayOfWeek;
            }).text;
        }
        // for monthly
        if (el.dayOfMonth > 0 && el.dayOfMonth < 32) {
          type = 4;
          triggerDate =
            this.$t('pagePowerSchedule.LANG_POWER_SCHEDULE_MONTHLY_LABEL') +
            ', ' +
            el.dayOfMonth.toString();
        }

        return {
          ...el,
          type,
          duration,
          // Big Camel means table title variable
          Id: el.index,
          Enabled: el.enable ? 'Enabled' : 'Disabled',
          StartDate: startDate,
          EndDate: endDate,
          TriggerDate: triggerDate,
          TriggerTime: this.makeTimeFormat(el.hour, el.minute),
          Action: this.getActionName(el.action),
          Actions: [
            {
              value: 'edit',
              enabled: true,
              title: this.$t('global.action.edit'),
            },
            {
              value: 'delete',
              enabled: true,
              title: this.$tc('global.action.delete'),
            },
          ],
        };
      });
    },
  },
  created() {
    this.startLoader();
    this.$store.dispatch('powerSchedule/getSchedules').finally(() => {
      this.endLoader();
    });
  },
  methods: {
    initModal(item) {
      this.activeItem = item;
      this.$bvModal.show('modal-schedule');
    },
    onDeleted(item) {
      this.$bvModal
        .msgBoxConfirm(
          this.$t('pagePowerSchedule.toast.deleteConfirmMessage', {
            item: item.itemname,
          }),
          {
            title: this.$tc('pagePowerSchedule.toast.deleteSchedule'),
            okTitle: this.$tc('global.action.ok'),
            cancelTitle: this.$t('global.action.cancel'),
          }
        )
        .then((deleteConfirmed) => {
          if (deleteConfirmed) {
            this.deleteSchedule(item);
          }
        });
    },
    onDeletedAll() {
      this.$bvModal
        .msgBoxConfirm(
          this.$t('pagePowerSchedule.toast.deleteAllConfirmMessage'),
          {
            title: this.$tc('pagePowerSchedule.toast.deleteAllSchedule'),
            okTitle: this.$tc('global.action.ok'),
            cancelTitle: this.$t('global.action.cancel'),
          }
        )
        .then((deleteConfirmed) => {
          if (deleteConfirmed) {
            this.deleteSchedules(this.currentIds);
          }
        });
    },
    saveSchedule({ payload }) {
      this.startLoader();
      this.$store
        .dispatch('powerSchedule/updateSchedule', payload)
        .then((success) => this.successToast(success))
        .catch(({ message }) => this.errorToast(message))
        .finally(() => this.endLoader());
      // reset status
      this.activeItem = {};
    },
    deleteSchedule({ Id }) {
      this.startLoader();
      this.$store
        .dispatch('powerSchedule/deleteSchedule', Id)
        .then((success) => this.successToast(success))
        .catch(({ message }) => this.errorToast(message))
        .finally(() => this.endLoader());
      // reset status
      this.activeItem = {};
    },
    deleteSchedules(Ids) {
      this.startLoader();
      this.$store
        .dispatch('powerSchedule/deleteSchedules', Ids)
        .then((success) => this.successToast(success))
        .catch(({ message }) => this.errorToast(message))
        .finally(() => this.endLoader());
      // reset status
      this.activeItem = {};
    },
    onTableRowAction(action, row) {
      switch (action) {
        case 'edit':
          this.initModal(row);
          break;
        case 'delete':
          this.onDeleted(row);
          break;
        default:
          break;
      }
    },
    getActionName(action) {
      let act = parseInt(action);
      if (act == 0xa0) {
        return this.$tc('global.power.LANG_S_POWER_CONTROL_IMMOFF');
      } else if (act == 0xa1) {
        return this.$tc('global.power.LANG_S_POWER_CONTROL_ON');
      } else if (act == 0xa2) {
        return this.$tc('global.power.LANG_S_POWER_CONTROL_CYCLE');
      } else if (act == 0xa3) {
        return this.$tc('global.power.LANG_S_POWER_CONTROL_RESET');
      } else if (act == 0xa4) {
        return this.$tc('global.power.LANG_S_POWER_CONTROL_GRACEFUL_SHUTDOWN');
      } else {
        return '-';
      }
    },
    makeTimeFormat(hr, m) {
      return ('0' + hr).slice(-2) + ':' + ('0' + m).slice(-2);
    },
    iconEnabled(action) {
      return (
        action.enabled &&
        (!this.$route.meta.viewOnly || action.value !== 'delete')
      );
    },
  },
};
</script>

<style lang="scss" scoped>
.btn.collapsed {
  svg {
    transform: rotate(180deg);
  }
}
</style>
