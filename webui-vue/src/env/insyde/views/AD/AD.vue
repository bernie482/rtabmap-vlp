<template>
  <b-container fluid="x1">
    <page-title />
    <page-section>
      <div>
        <label>{{ $t('pageActiveDirectory.CONF_AD_DESC') }}</label>
        <b-button variant="link" @click="showModal">{{
          $t('pageActiveDirectory.LANG_AD_HERE')
        }}</b-button>
      </div>
      <div class="container-flex right">
        <label
          >{{ $t('pageActiveDirectory.LANG_AD_GROUP_COUNT') }} :
          {{ quantity }}</label
        >
      </div>
      <div class="table">
        <b-table
          sort-icon-left
          no-sort-reset
          hover
          sort-by="id"
          responsive="md"
          show-empty
          :items="adItems"
          :fields="fields"
          :filter="searchFilter"
          :empty-text="$t('global.table.emptyMessage')"
          :empty-filtered-text="$t('global.table.emptySearchMessage')"
          @filtered="onFiltered"
        >
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
                <icon-edit
                  v-if="action.value === 'modify'"
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
      <modal-modify-ad-settings
        :group-value="mRoleValue"
        hide-footer
        @ok="ModifyRole"
      />
      <modal-ad-advanced-settings
        :advsettings="configstate"
        hide-footer
        @ok="saveADCONF"
      />
    </page-section>
  </b-container>
</template>

<script>
import PageTitle from '@/components/Global/PageTitle';

import PageSection from '@/components/Global/PageSection';
import DataFormatterMixin from '@/components/Mixins/DataFormatterMixin';
import ModalAdAdvancedSettings from './ModalAdAdvancedSettings';
import ModalModifyAdSettings from './ModalModifyAdSettings';
import IconTrashcan from '@carbon/icons-vue/es/trash-can/20';
import IconEdit from '@carbon/icons-vue/es/edit/20';
import TableRowAction from '@/components/Global/TableRowAction';
import SearchFilterMixin, {
  searchFilter,
} from '@/components/Mixins/SearchFilterMixin';
import {
  advstateParser,
  adParser,
} from '@/env/insyde/components/Mixins/ADTableParserMixin';

export default {
  name: 'ActiveDirectory',
  components: {
    PageTitle,
    PageSection,
    ModalAdAdvancedSettings,
    ModalModifyAdSettings,
    IconTrashcan,
    IconEdit,
    TableRowAction,
  },
  mixins: [DataFormatterMixin, SearchFilterMixin],
  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
  data() {
    return {
      quantity: 0,
      fields: [
        {
          key: 'id',
          label: this.$t('pageActiveDirectory.CONF_AD_ID'),
          sortable: true,
        },
        {
          key: 'name',
          formatter: (value) => {
            return value.length != 0 ? value : '~';
          },
          label: this.$t('pageActiveDirectory.CONF_AD_NAME'),
          sortable: false,
          tdClass: 'text-nowrap',
        },
        {
          key: 'domain',
          formatter: (value) => {
            return value.length != 0 ? value : '~';
          },
          label: this.$t('pageActiveDirectory.CONF_AD_DOMAIN'),
          sortable: false,
          tdClass: 'text-nowrap',
        },
        {
          key: 'privilege',
          formatter: (value) => {
            return `${this.$t(
              'pageActiveDirectory.LANG_USER_PRIVILEG_' + value.toString(16)
            )}`;
          },
          label: this.$t('pageActiveDirectory.CONF_AD_PRI'),
          sortable: false,
          tdClass: 'text-nowrap',
        },
        {
          key: 'actions',
          label: '',
          tdClass: 'text-right text-nowrap',
        },
      ],
      searchFilter: searchFilter,
      searchTotalFilteredRows: 0,
      tabItems: [],
      mRoleValue: {},
      adInfo: [],
      configstate: {},
    };
  },
  computed: {
    advconfigstate() {
      return advstateParser(this.$store.getters['ad/minfo']);
    },
    adfied() {
      return adParser(this.$store.getters['ad/minfo']);
    },
    adItems() {
      // transform user data to table data
      return this.tabItems.map((role) => {
        return {
          actions: [
            {
              value: 'modify',
              enabled: true,
              title: this.$t('pageActiveDirectory.CONF_AD_ACTION_MODIFY'),
            },
            {
              value: 'delete',
              enabled: role.name.length != 0 ? true : false,
              title: this.$t('pageActiveDirectory.CONF_AD_ACTION_DEL'),
            },
          ],
          ...role,
        };
      });
    },
  },
  created() {
    const ad = this;
    ad.startLoader();
    Promise.all([
      ad.$store.dispatch('ad/getadinfo').then(() => {
        ad.tabItems = ad.adInfo = ad.adfied.group;
        ad.calRoleTotal();
      }),
      ad.$store.dispatch('ad/get_ad_config').then(() => {
        ad.configstate = ad.advconfigstate.config;
      }),
    ]).finally(() => ad.endLoader());
  },
  methods: {
    calRoleTotal() {
      const ad = this;
      let tmp = ad.adInfo.filter((d) => {
        return d.name.length != 0;
      });
      ad.quantity = tmp.length;
    },
    ModifyRole(roleObj) {
      let configAD = this;
      configAD.startLoader();
      configAD.$store
        .dispatch('ad/saveModifiedADConfig', roleObj)
        .then((success) => {
          configAD.$store.dispatch('ad/getadinfo').then(() => {
            configAD.tabItems = configAD.adInfo = configAD.adfied.group;
            configAD.calRoleTotal();
          });
          configAD.successToast(success);
        })
        .catch((message) => {
          configAD.errorToast(message);
        })
        .finally(() => configAD.endLoader());
    },
    delRole(roleGroupID) {
      this.$bvModal
        .msgBoxConfirm(this.$t('pageActiveDirectory.LANG_AD_DEL_CONFIRM'), {
          title: this.$tc('global.action.confirm'),
          okTitle: this.$tc('global.action.confirm'),
          cancelTitle: this.$t('global.action.cancel'),
        })
        .then((deleteConfirmed) => {
          if (deleteConfirmed) {
            // delete role group
            this.startLoader();
            let roleid = {};
            roleid['id'] = roleGroupID;
            this.$store
              .dispatch('ad/del_ad_role', roleid)
              .then((success) => {
                this.$store.dispatch('ad/getadinfo').then(() => {
                  this.tabItems = this.adInfo = this.adfied.group;
                  this.calRoleTotal();
                });
                this.successToast(success);
              })
              .catch((message) => {
                this.errorToast(message);
              })
              .finally(() => this.endLoader());
          }
        });
    },
    onTableRowAction(action, rowdata) {
      //console.log('onTableRowAction', action, rowdata);
      if (action != 'delete') {
        this.mRoleValue = rowdata;
        this.$bvModal.show('modal-modify-ad');
      } else {
        this.delRole(rowdata?.id);
      }
    },
    saveADCONF(ConfigObj) {
      //console.log('ConfigObj= ', ConfigObj);
      let ad = this;
      ad.startLoader();
      ad.$store
        .dispatch('ad/set_ad_conf', ConfigObj)
        .then((success) => {
          ad.successToast(success);
        })
        .catch((message) => {
          ad.errorToast(message);
        })
        .finally(() => ad.endLoader());
    },
    showModal() {
      this.$bvModal.show('modal-ad-adv');
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
}
.container-flex.right {
  justify-content: flex-end;
}
</style>
