<template>
  <b-container fluid="xl">
    <page-title />
    <b-row>
      <boot-option />
    </b-row>
    <b-row>
      <boot-order />
    </b-row>
  </b-container>
</template>

<script>
import PageTitle from '@/components/Global/PageTitle';
import BootOption from './BootOption';
import BootOrder from './BootOrder';

export default {
  name: 'BootConfiguration',
  components: { PageTitle, BootOption, BootOrder },

  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
  data() {
    return {};
  },
  created() {
    let vm = this;
    this.startLoader();
    const bootSettingsPromise = this.$store.dispatch(
      'bootConfig/getBootSettings'
    );
    const bootOptionPromise = new Promise((resolve) => {
      this.$root.$on('boot-configuration-boot-option-complete', () =>
        resolve()
      );
    });
    const bootOrderPromise = new Promise((resolve) => {
      this.$root.$on('boot-configuration-boot-order-complete', () => resolve());
    });
    Promise.all([bootSettingsPromise, bootOptionPromise, bootOrderPromise])
      .catch(function (err) {
        console.error(err);
        vm.errorToast(err.toString());
      })
      .finally(() => {
        this.endLoader();
      });
  },
  methods: {},
};
</script>
