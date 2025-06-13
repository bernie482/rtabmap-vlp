<template>
  <overview-card
    :title="$t('appPageTitle.memoryFP')"
    :to="`/hardware-status/memory-fp`"
  >
    <div class="dashboard-refresh">
      <icon-restart class="pointer" @click="onIconAction($event)" />
    </div>
    <div class="dashboard-info">
      <health-gauge
        :values="dimmScores"
        :text="'Health'"
        style="width: 100%"
      ></health-gauge>
    </div>
  </overview-card>
</template>

<script>
import OverviewCard from './OverviewCard';
import HealthGauge from '@/env/insyde/components/Chart/HealthGauge';
import { mapFields } from 'vuex-map-fields';
import IconRestart from '@carbon/icons-vue/es/restart/24';

export default {
  name: 'MemoryFP',
  components: {
    OverviewCard,
    HealthGauge,
    IconRestart,
  },
  computed: {
    ...mapFields('memoryFP', ['dimms']),
    dimmScores() {
      return this.dimms.map((el) => {
        return el.Oem?.InsydeMemory?.HealthScore || '-';
      });
    },
  },
  created() {
    const getDataPromise = this.$store.dispatch('memoryFP/getMemoryAll');
    Promise.all([getDataPromise]).finally();
  },
};
</script>
