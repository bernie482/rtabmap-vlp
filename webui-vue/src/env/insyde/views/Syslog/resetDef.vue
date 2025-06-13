<template>
  <b-container fluid="x1">
    <page-section :section-title="$t('appPageTitle.DIAG_SYSLOG_P25')">
      <b-row>
        <b-col>
          <label class="gray-info-color">{{
            $t('pageSyslog.SYSLOG_RESET_TO_DEFAULT_INFO')
          }}</label>
        </b-col>
      </b-row>
      <b-button variant="primary" @click="ResetDef">
        {{ $t('global.action.reset') }}
      </b-button>
    </page-section>
  </b-container>
</template>

<script>
import PageSection from '@/components/Global/PageSection';
export default {
  name: 'ResetDef',
  components: {
    PageSection,
  },

  data() {
    return {};
  },
  computed: {},
  created() {},
  methods: {
    ResetDef() {
      const rstDef = this;
      rstDef.$bvModal
        .msgBoxConfirm(
          `${rstDef.$t('pageSyslog.SYSLOG_RST_DEF_COMFIRM_BOX')} ?`,
          {
            title: `${rstDef.$t('global.action.confirm')} ?`,
          }
        )
        .then((confirmed) => {
          if (confirmed) {
            let nullconfig = {};
            rstDef.startLoader();
            rstDef.$store
              .dispatch('syslog/syslog_reset_default', nullconfig)
              .then((success) => {
                rstDef.successToast(success);
              })
              .catch((message) => {
                rstDef.errorToast(message);
              })
              .finally(rstDef.endLoader());
          }
        });
    },
  },
};
</script>
<style lang="scss" scoped>
.gray-info-color {
  color: #b8b8b8;
}
</style>
