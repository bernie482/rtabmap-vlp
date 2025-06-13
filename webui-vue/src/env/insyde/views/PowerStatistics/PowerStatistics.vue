<template>
  <b-container fluid="xl">
    <page-title />
    <page-section
      :section-title="$t('pagePowerStatistics.currentPowerConsumption')"
    >
      <power-current />
    </page-section>
    <!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN:CONFIG_POWER_MONITORING -->
    <page-section
      :section-title="$t('pagePowerStatistics.powerConsumptionHistory')"
    >
      <power-history />
    </page-section>
    <!-- WEB_CONFIG_DEPEND_FEATURE_END:CONFIG_POWER_MONITORING -->
  </b-container>
</template>

<script>
import PageTitle from '@/components/Global/PageTitle';
import PageSection from '@/components/Global/PageSection';
import PowerCurrent from './PowerCurrent';
// <!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN:CONFIG_POWER_MONITORING -->
import PowerHistory from './PowerHistory';
// <!-- WEB_CONFIG_DEPEND_FEATURE_END:CONFIG_POWER_MONITORING -->

export default {
  name: 'PowerStatistics',
  components: {
    PageTitle,
    PageSection,
    PowerCurrent,
    // <!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN:CONFIG_POWER_MONITORING -->
    PowerHistory,
    // <!-- WEB_CONFIG_DEPEND_FEATURE_END:CONFIG_POWER_MONITORING -->
  },
};
</script>
