export const loading = true;

const LoadingBarMixin = {
  data() {
    return {
      loading, // NOTE: the default value use true that is used to keep status continue (avoid empty component shown first).
    };
  },
  methods: {
    startLoader() {
      this.$root.$emit('loader-start');
      this.loading = true;
    },
    endLoader() {
      this.$root.$emit('loader-end');
      this.loading = false;
    },
    hideLoader() {
      this.$root.$emit('loader-hide');
    },
  },
};

export default LoadingBarMixin;
