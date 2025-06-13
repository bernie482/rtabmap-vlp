<template>
  <b-container fluid="xl">
    <page-title />
    <b-row>
      <b-col class="text-left">
        {{ $t('pageUsers.lanChannel') }}
        <b-form-select
          id="users-channel"
          v-model="channelSelected"
          style="width: 100px"
          :options="channelOptions"
          :disabled="loading"
        >
        </b-form-select>
      </b-col>
      <b-col class="text-right">
        <b-button
          :disabled="disabled || reachUserLimit"
          variant="primary"
          data-test-id="users-button-addUser"
          @click="initModalUser(null)"
        >
          <icon-add />
          {{ $t('pageUsers.addUser') }}
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
          sort-by="id"
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
              v-for="(action, index) in item.actions"
              :key="index"
              :value="action.value"
              :enabled="!$route.meta.viewOnly && action.enabled"
              :title="action.title"
              @click-table-action="onTableRowAction($event, item)"
            >
              <template #icon>
                <icon-edit
                  v-if="action.value === 'edit'"
                  :data-test-id="`users-tableRowAction-edit-${index}`"
                />
                <icon-trashcan
                  v-if="action.value === 'delete'"
                  :data-test-id="`users-tableRowAction-delete-${index}`"
                />
              </template>
            </table-row-action>
          </template>
        </b-table>
      </b-col>
    </b-row>
    <!-- Modals -->
    <modal-user
      :user="activeUser"
      :user-ids="currentUserIds"
      :channel="channelSelected"
      :password-requirements="passwordRequirements"
      :support-sol-access="supportSOLAccess"
      :support-password-expiration="supportPasswordExpiration"
      @ok="saveUser"
      @hidden="activeUser = null"
    />
  </b-container>
</template>

<script>
import IconTrashcan from '@carbon/icons-vue/es/trash-can/20';
import IconEdit from '@carbon/icons-vue/es/edit/20';
import IconAdd from '@carbon/icons-vue/es/add--alt/20';

import ModalUser from './ModalUser';
import PageTitle from '@/components/Global/PageTitle';
import TableRowAction from '@/components/Global/TableRowAction';
import LoadingBarMixin, { loading } from '@/components/Mixins/LoadingBarMixin';

import { mapFields } from 'vuex-map-fields';
const maxUserCnt = 15;

export default {
  name: 'Users',
  components: {
    IconAdd,
    IconEdit,
    IconTrashcan,
    ModalUser,
    PageTitle,
    TableRowAction,
  },
  mixins: [LoadingBarMixin],
  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
  data() {
    return {
      activeUser: {}, // NOTE: must be different from null for trigger watch event
      loading,
    };
  },
  computed: {
    ...mapFields('users', [
      'channelSelected',
      'channelOptions',
      'allUsers',
      'minPasswordLength',
      'maxPasswordLength',
    ]),
    disabled() {
      return this.loading || this.$route.meta.viewOnly;
    },
    reachUserLimit() {
      return this.allUsers.length >= maxUserCnt;
    },
    currentUserIds() {
      return this.allUsers.map((user) => {
        return user?.Oem?.Insyde?.UID || parseInt(user.Id);
      });
    },
    fields() {
      return [
        {
          key: 'id',
          label: this.$t('pageUsers.table.userId'),
          sortable: true,
        },
        {
          key: 'username',
          label: this.$t('pageUsers.table.username'),
          sortable: true,
        },
        {
          key: 'status',
          label: this.$t('pageUsers.table.status'),
        },
        {
          key: 'privilege',
          label: this.$t('pageUsers.table.privilege'),
        },
        ...(this.supportSOLAccess
          ? [
              {
                key: 'solPayloadAccess',
                label: this.$t('pageUsers.table.solPayloadAccess'),
              },
            ]
          : []),
        {
          key: 'snmpv3Access',
          label: this.$t('pageUsers.table.snmpv3Access'),
        },
        {
          key: 'ipmiMessaging',
          label: this.$t('pageUsers.table.ipmiMessaging'),
        },
        {
          key: 'email',
          label: this.$t('pageUsers.table.email'),
        },
        {
          key: 'actions',
          label: '',
          tdClass: 'text-right text-nowrap',
        },
      ];
    },
    supportSOLAccess() {
      return this.allUsers?.[0]?.Oem?.InsydeAccount?.SOLAccess !== undefined;
    },
    supportPasswordExpiration() {
      return this.allUsers?.[0]?.PasswordExpiration !== undefined;
    },
    tableItems() {
      // transform user data to table data
      return this.allUsers.map((user) => {
        // PATCH: compatible with OPF
        let id = user?.Oem?.Insyde?.UID ?? user.Id;
        let privilege = this.getUserChannelPrivilege(user) ?? user.RoleId;

        return {
          id,
          username: user.UserName,
          privilege,
          status: user.Enabled ? 'Enabled' : 'Disabled',
          //solPayloadAccess: user.Oem?.InsydeAccount?.SOLAccess,
          solPayloadAccess: user.Oem?.InsydeAccount?.SOLAccess
            ? 'Enabled'
            : 'Disabled',
          snmpv3Access: user.Oem?.InsydeAccount?.SNMPAccess
            ? 'Enabled'
            : 'Disabled',
          ipmiMessaging: user.Oem?.InsydeAccount?.IPMIMessaging
            ? 'Enabled'
            : 'Disabled',
          email: user.Oem?.InsydeAccount?.Email,
          // (optional) snmp extern
          snmp: {
            accessLevel: false,
            authProtocol: false,
            authKey: false,
            privacyProtocol: false,
            privacyKey: false,
          },
          actions: [
            {
              value: 'edit',
              enabled: !this.loading,
              title: this.$t('pageUsers.editUser'),
            },
            {
              value: 'delete',
              enabled:
                !this.loading && (user.UserName === 'root' ? false : true),
              title: this.$tc('pageUsers.deleteUser'),
            },
          ],
          ...user,
        };
      });
    },
    passwordRequirements() {
      return {
        minLength: this.minPasswordLength,
        maxLength: this.maxPasswordLength,
      };
    },
  },
  mounted() {
    this.startLoader();
    this.$store.dispatch('users/getChannels');
    this.$store.dispatch('users/getUsers').finally(() => this.endLoader());
    this.$store.dispatch('users/getAccountSettings');
    this.$store.dispatch('users/getAccountRoles');
  },
  methods: {
    initModalUser(user) {
      this.activeUser = user;
      this.$bvModal.show('modal-user');
    },
    initModalDelete(user) {
      this.$bvModal
        .msgBoxConfirm(
          this.$t('pageUsers.modal.deleteConfirmMessage', {
            user: user.username,
          }),
          {
            title: this.$tc('pageUsers.deleteUser'),
            okTitle: this.$tc('pageUsers.deleteUser'),
            cancelTitle: this.$t('global.action.cancel'),
          }
        )
        .then((deleteConfirmed) => {
          if (deleteConfirmed) {
            this.deleteUser(user);
          }
        });
    },
    saveUser({ isNewUser, userData }) {
      this.startLoader();
      if (isNewUser) {
        this.$store
          .dispatch('users/createUser', userData)
          .then((success) => this.successToast(success))
          .catch(({ message }) => this.errorToast(message))
          .finally(() => this.endLoader());
      } else {
        this.$store
          .dispatch('users/updateUser', userData)
          .then((success) => this.successToast(success))
          .catch(({ message }) => this.errorToast(message))
          .finally(() => this.endLoader());
      }
    },
    deleteUser({ Id }) {
      this.startLoader();
      this.$store
        .dispatch('users/deleteUser', Id)
        .then((success) => this.successToast(success))
        .catch(({ message }) => this.errorToast(message))
        .finally(() => this.endLoader());
    },
    onTableRowAction(action, row) {
      switch (action) {
        case 'edit':
          this.initModalUser(row);
          break;
        case 'delete':
          this.initModalDelete(row);
          break;
        default:
          break;
      }
    },
    getUserChannelPrivilege(user) {
      let priv = undefined;
      try {
        priv =
          user.Oem.InsydeAccount.Privilege[this.channelSelected].PrivilegeLevel;
      } catch (e) {
        console.error(user);
      }
      return priv;
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
