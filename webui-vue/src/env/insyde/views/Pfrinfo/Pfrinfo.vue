<template>
  <page-section :section-title="$t('pagePfrinfo.title')">
    <table>
      <tbody>
        <tr>
          <td>
            {{
              $t('pagePfrinfo.LANG_CONFIG_PFRINFOR_CPLD_ROT_RELEASE_VERSION')
            }}
          </td>
          <td>{{ pfrinfo.PFR_0_P }}</td>
        </tr>
        <tr>
          <td>{{ $t('pagePfrinfo.LANG_CONFIG_PFRINFOR_CPLD_ROT_SVN') }}</td>
          <td>{{ pfrinfo.PFR_1_P }}</td>
        </tr>
        <tr>
          <td>{{ $t('pagePfrinfo.LANG_CONFIG_PFRINFOR_PLATFORM_STATE') }}</td>
          <td>{{ pfrinfo.PFR_2_P }}</td>
        </tr>
        <tr>
          <td>{{ $t('pagePfrinfo.LANG_CONFIG_PFRINFOR_RECOVERY_COUNT') }}</td>
          <td>{{ pfrinfo.PFR_3_P }}</td>
        </tr>
        <tr>
          <td>
            {{ $t('pagePfrinfo.LANG_CONFIG_PFRINFOR_LAST_RECOVERY_REASON') }}
          </td>
          <td>{{ pfrinfo.PFR_4_P }}</td>
        </tr>
        <tr>
          <td>
            {{ $t('pagePfrinfo.LANG_CONFIG_PFRINFOR_PANIC_EVENT_COUNT') }}
          </td>
          <td>{{ pfrinfo.PFR_5_P }}</td>
        </tr>
        <tr>
          <td>
            {{ $t('pagePfrinfo.LANG_CONFIG_PFRINFOR_LAST_PANIC_REASON') }}
          </td>
          <td>{{ pfrinfo.PFR_6_P }}</td>
        </tr>
        <tr>
          <td>{{ $t('pagePfrinfo.LANG_CONFIG_PFRINFOR_MAJOR_ERROR_CODE') }}</td>
          <td>{{ pfrinfo.PFR_7_P }}</td>
        </tr>
        <tr>
          <td>{{ $t('pagePfrinfo.LANG_CONFIG_PFRINFOR_MINOR_ERROR_CODE') }}</td>
          <td>{{ pfrinfo.PFR_8_P }}</td>
        </tr>
        <tr>
          <td>
            {{ $t('pagePfrinfo.LANG_CONFIG_PFRINFOR_UFM_PROVISIONING_STATUS') }}
          </td>
          <td>{{ pfrinfo.PFR_9_P }}</td>
        </tr>
        <tr>
          <td>{{ $t('pagePfrinfo.LANG_CONFIG_PFRINFOR_BMC_CHECKPOINT') }}</td>
          <td>{{ pfrinfo.PFR_A_P }}</td>
        </tr>
        <tr>
          <td>
            {{ $t('pagePfrinfo.LANG_CONFIG_PFRINFOR_PCH_UPDATE_INTENT') }}
          </td>
          <td>{{ pfrinfo.PFR_B_P }}</td>
        </tr>
        <tr>
          <td>
            {{ $t('pagePfrinfo.LANG_CONFIG_PFRINFOR_BMC_UPDATE_INTENT') }}
          </td>
          <td>{{ pfrinfo.PFR_C_P }}</td>
        </tr>
        <tr>
          <td>
            {{ $t('pagePfrinfo.LANG_CONFIG_PFRINFOR_PCH_PFR_ACTIVE_VERSION') }}
          </td>
          <td>{{ pfrinfo.PFR_D_P }}</td>
        </tr>
        <tr>
          <td>
            {{ $t('pagePfrinfo.LANG_CONFIG_PFRINFOR_BMC_PFR_ACTIVE_VERSION') }}
          </td>
          <td>{{ pfrinfo.PFR_E_P }}</td>
        </tr>
        <tr>
          <td>
            {{
              $t('pagePfrinfo.LANG_CONFIG_PFRINFOR_PCH_PFR_RECOVERY_VERSION')
            }}
          </td>
          <td>{{ pfrinfo.PFR_F_P }}</td>
        </tr>
        <tr>
          <td>
            {{
              $t('pagePfrinfo.LANG_CONFIG_PFRINFOR_BMC_PFR_RECOVERY_VERSION')
            }}
          </td>
          <td>{{ pfrinfo.PFR_10_P }}</td>
        </tr>
      </tbody>
    </table>
  </page-section>
</template>

<script>
import PageSection from '@/components/Global/PageSection';

export default {
  components: { PageSection },

  data() {
    return {};
  },
  computed: {
    pfrinfo() {
      return this.$store.getters['pfrinfo/pfrinfo'];
    },
  },
  created() {
    this.startLoader();
    this.$store
      .dispatch('pfrinfo/getStatus')
      .then((success) => {
        this.successToast(success);
      })
      .catch(({ message }) => this.errorToast(message))
      .finally(() => this.endLoader());
  },
};
</script>
