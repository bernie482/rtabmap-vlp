<template>
  <overview-card
    :title="$t('pageDashboard.virtualFrontPanel')"
    :to="`/operations/virtual-front-panel`"
  >
    <div class="dashboard-refresh">
      <icon-restart class="pointer" @click="onIconAction($event)" />
    </div>
    <div class="dashboard-info">
      <b-row class="mt-3 text-center">
        <b-col>
          <div>
            {{ $t('pageDashboard.vfp.LANG_SYS_DASHBOARD_STATUS') }}
          </div></b-col
        >
        <b-col
          ><div>
            {{ $t('pageDashboard.vfp.LANG_SYS_DASHBOARD_CHASSIS') }}
          </div></b-col
        >
        <b-col
          ><div>
            {{ $t('pageDashboard.vfp.LANG_SYS_DASHBOARD_POWER') }}
          </div></b-col
        >
      </b-row>
      <b-row class="mt-3 text-center">
        <b-col>
          <div
            v-if="vfpInfo.status === 'amberblink'"
            class="led led-status led-amber led-blink"
          ></div>
          <div
            v-else-if="vfpInfo.status === 'greenblink'"
            class="led led-status led-green led-blink"
          ></div>
          <div v-else class="led led-status"></div>
        </b-col>
        <b-col>
          <div v-if="vfpInfo.chassis === 0" class="led led-chassis"></div>
          <div
            v-else-if="vfpInfo.chassis === 1"
            class="led led-chassis led-blue led-blink"
          ></div>
          <div v-else class="led led-chassis led-blue"></div>
        </b-col>
        <b-col>
          <div v-if="vfpInfo.power === 0" class="led led-power"></div>
          <div
            v-else-if="vfpInfo.power === 1"
            class="led led-power led-green"
          ></div>
        </b-col>
      </b-row>
    </div>
  </overview-card>
</template>

<script>
import OverviewCard from './OverviewCard';
import DataFormatterMixin from '@/components/Mixins/DataFormatterMixin';
import IconRestart from '@carbon/icons-vue/es/restart/24';

export default {
  name: 'VirtualFrontPanel',
  components: {
    OverviewCard,
    IconRestart,
  },
  mixins: [DataFormatterMixin],
  data() {
    return {};
  },
  computed: {
    vfpInfo() {
      // return this.$store.getters['dashboardstore/vfpinfo'];
      return this.$store.getters['ws/vfpinfo'];
    },
  },
  created() {
    // this.$store
    //   .dispatch('dashboardstore/getVfpVmInfo')
    //   .catch(({ message }) => this.errorToast(message))
    //   .finally(() => {
    //     this.$root.$emit('virtual-front-panel-complete');
    //   });
    this.$root.$emit('virtual-front-panel-complete');
  },
  methods: {
    onIconAction() {
      // this.$store
      //   .dispatch('dashboardstore/getVfpVmInfo')
      //   .catch(({ message }) => this.errorToast(message))
      //   .finally(() => {
      //     this.$root.$emit('virtual-front-panel-complete');
      //   });
    },
  },
};
</script>
