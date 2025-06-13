<template>
  <page-section :section-title="$t('pageSysinfo.timeout.title')">
    <div>
      <select
        v-model="timeout"
        :disabled="$route.meta.viewOnly"
        @change="$v.timeout.$touch()"
      >
        <option
          v-for="(item, idx) in timeoutSelector"
          :key="idx"
          :value="item.value"
        >
          {{ item.display }}
        </option>
      </select>
    </div>
    <b-button
      type="button"
      variant="primary"
      class="mt-1"
      :disabled="!$v.$anyDirty || $route.meta.viewOnly"
      @click="setTimeout"
    >
      {{ $t('global.action.save') }}
    </b-button>
  </page-section>
</template>

<script>
import PageSection from '@/components/Global/PageSection';

export default {
  components: { PageSection },

  data() {
    return {
      timeout: 0,
      timeoutSelector: [
        { value: 30, display: `30 ${this.$t('pageSysinfo.unit.minutes')}` },
        { value: 60, display: `1 ${this.$t('pageSysinfo.unit.hours')}` },
        { value: 120, display: `2 ${this.$t('pageSysinfo.unit.hours')}` },
        { value: 240, display: `4 ${this.$t('pageSysinfo.unit.hours')}` },
        { value: 480, display: `8 ${this.$t('pageSysinfo.unit.hours')}` },
        { value: 1440, display: `1 ${this.$t('pageSysinfo.unit.days')}` },
        { value: 0, display: `${this.$t('pageSysinfo.timeout.disabled')}` },
      ],
    };
  },
  computed: {
    timeoutStore() {
      return this.$store.getters['sysinfo/timeout'];
    },
  },
  validations: {
    timeout: {},
  },
  created() {
    this.$store
      .dispatch('sysinfo/getSessionTimeout')
      .catch(({ message }) => this.errorToast(message))
      .finally(() => {
        this.timeout = this.timeoutStore;
        // Emit initial data fetch complete to parent component
        this.$root.$emit('sysinfo-timeout-complete');
      });
  },
  methods: {
    setTimeout() {
      this.startLoader();
      this.$store
        .dispatch('sysinfo/setSessionTimeout', this.timeout)
        .then((success) => {
          if (this.timeout != this.timeoutStore) {
            this.errorToast(this.$t('pageSysinfo.toast.errorSetTimeout'));
            this.timeout = this.timeoutStore;
          } else {
            this.successToast(success);
            this.$v.$reset();
          }
        })
        .catch(({ message }) => this.errorToast(message))
        .finally(() => this.endLoader());
    },
  },
};
</script>
