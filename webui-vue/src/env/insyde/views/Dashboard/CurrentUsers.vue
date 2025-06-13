<template>
  <overview-card
    :title="$t('pageDashboard.LANG_SYSTEM_CURRENTUSERS_INFO_TITLE')"
    :to="`/security-and-access/current-users`"
  >
    <div class="dashboard-refresh">
      <icon-restart class="pointer" @click="onIconAction($event)" />
    </div>
    <div class="dashboard-info">
      <b-row class="mt-2">
        <b-col>
          <b-form-group class="mb-4">
            <b-table
              ref="table"
              sticky-header
              responsive="md"
              selectable
              show-empty
              no-select-on-click
              hover
              :fields="fields"
              :items="userInfos"
              :empty-text="$t('global.table.emptyMessage')"
            >
            </b-table>
          </b-form-group>
        </b-col>
      </b-row>
    </div>
  </overview-card>
</template>

<script>
import OverviewCard from './OverviewCard';
import IconRestart from '@carbon/icons-vue/es/restart/24';

export default {
  name: 'CurrentUsers',
  components: {
    OverviewCard,
    IconRestart,
  },
  data() {
    return {
      fields: [
        {
          key: 'username',
          label: this.$t(
            'pageDashboard.currentUsers.LANG_SYS_CURRENT_USER_COLUMN_TITLE0'
          ),
        },
        {
          key: 'type',
          label: this.$t(
            'pageDashboard.currentUsers.LANG_SYS_CURRENT_USER_COLUMN_TITLE1'
          ),
        },
        {
          key: 'ipAddress',
          label: this.$t(
            'pageDashboard.currentUsers.LANG_SYS_CURRENT_USER_COLUMN_TITLE4'
          ),
        },
      ],
    };
  },
  computed: {
    userInfos() {
      return this.$store.getters['currentUsers/allConnections'];
    },
  },
  created() {
    this.$store
      .dispatch('currentUsers/getSessionsData')
      .catch(({ message }) => this.errorToast(message))
      .finally(() => {
        this.$root.$emit('current-users-complete');
      });
  },
  methods: {
    onIconAction() {
      this.$store
        .dispatch('currentUsers/getSessionsData')
        .catch(({ message }) => this.errorToast(message))
        .finally(() => {
          this.$root.$emit('current-users-complete');
        });
    },
  },
};
</script>
