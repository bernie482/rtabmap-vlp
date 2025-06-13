<template>
  <b-container fluid="xl">
    <page-title />
    <sol style="width: 600px" />
    <sol-ssh style="width: 600px" />
    <smash style="width: 600px" />
  </b-container>
</template>

<script>
import PageTitle from '@/components/Global/PageTitle';
import Sol from './Sol';
import SolSsh from './SolSsh';
import Smash from './Smash';

export default {
  name: 'ConfigSolSmash',
  components: { PageTitle, Sol, SolSsh, Smash },

  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
  data() {
    return {};
  },
  created() {
    // overall init request
    this.startLoader();
    const configSolSmashPromise = this.$store.dispatch(
      'configSolSmash/getSolSshSettings'
    );
    Promise.all([configSolSmashPromise]).finally(() => this.endLoader());
  },
  methods: {},
};
</script>
