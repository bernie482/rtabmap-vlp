<template>
  <overview-card
    :title="$t('pageDashboard.LANG_SYS_DASHBOARD_SCREEN_TITLE')"
    :to="`/operations/kvm`"
  >
    <div class="widget-body">
      <div
        class="preview-placeholder"
        style="height: 250.707px; display: none"
      ></div>
      <img v-show="previewReady" style="width: 100%" :src="preview" />
    </div>
  </overview-card>
</template>

<script>
import OverviewCard from './OverviewCard';
import DataFormatterMixin from '@/components/Mixins/DataFormatterMixin';

export default {
  name: 'ScreenPreview',
  components: {
    OverviewCard,
  },
  mixins: [DataFormatterMixin],
  data() {
    return {
      preview: '/images/blank640x476.jpg',
      previewReady: false,
    };
  },
  watch: {
    '$store.state.ws.kvm.imageReadyNotify': function () {
      this.preview = '/images/preview.jpg?ts=' + new Date().getTime();
      this.previewReady = true;
    },
  },
  created() {
    this.$store.dispatch('ws/generatePreviewImage', true);
    this.$root.$emit('screen-preview-complete');
  },
  destroyed() {
    this.$store.dispatch('ws/generatePreviewImage', false);
  },
  methods: {},
};
</script>
<style scoped>
.preview-placeholder {
  background-color: #000;
  width: 100%;
}
</style>
