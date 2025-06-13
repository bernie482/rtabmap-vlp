<template>
  <overview-card
    :title="$t('pageDashboard.LANG_TOPMENU_VIRTUAL_MEDIA')"
    :to="`/operations/virtual-media`"
  >
    <div class="dashboard-refresh">
      <icon-restart class="pointer" @click="onIconAction($event)" />
    </div>
    <div class="dashboard-info">
      <template v-for="(info, idx) in vmInfo">
        <b-row :key="idx" class="mt-2">
          <b-col sm="6">
            <dt>{{ info.label }}</dt>
          </b-col>
          <b-col sm="6">
            <dd>
              {{ info.status }}
            </dd>
          </b-col>
        </b-row>
      </template>
    </div>
  </overview-card>
</template>

<script>
import OverviewCard from './OverviewCard';
import DataFormatterMixin from '@/components/Mixins/DataFormatterMixin';
import IconRestart from '@carbon/icons-vue/es/restart/24';

export default {
  name: 'VirtualMedia',
  components: {
    OverviewCard,
    IconRestart,
  },
  mixins: [DataFormatterMixin],
  data() {
    return {};
  },
  computed: {
    vmInfo() {
      // return this.$store.getters['dashboardstore/vminfo'];
      return this.$store.getters['ws/vminfo'];
    },
  },
  created() {
    // this.$store
    //   .dispatch('dashboardstore/getVMInfo')
    //   .catch(({ message }) => this.errorToast(message))
    //   .finally(() => {
    //     this.$root.$emit('virtual-media-complete');
    //   });
    this.$root.$emit('virtual-media-complete');
  },
  methods: {
    onIconAction() {
      // this.$store
      //   .dispatch('currentUsers/getVMInfo')
      //   .catch(({ message }) => this.errorToast(message))
      //   .finally(() => {
      //     this.$root.$emit('virtual-media-complete');
      //   });
    },
  },
};
</script>
