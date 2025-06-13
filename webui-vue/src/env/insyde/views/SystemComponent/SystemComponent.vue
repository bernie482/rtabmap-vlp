<template>
  <b-container fluid="x1">
    <page-title />
    <insyde-unavailable v-if="unavailable" v-show="!loading" />
    <tree-view v-else :nodes="tree" />
  </b-container>
</template>

<script>
import PageTitle from '@/components/Global/PageTitle';

import RedfishPCIeFunctionParserMixin from '@/env/insyde/components/Mixins/RedfishPCIeFunctionParserMixin';
import TreeView from '@/env/insyde/components/TreeView/TreeView';

import { mapGetters } from 'vuex';

export default {
  name: 'SystemComponent',
  components: { PageTitle, TreeView },
  mixins: [RedfishPCIeFunctionParserMixin],
  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
  data() {
    return {
      tree: [],
    };
  },
  computed: {
    ...mapGetters('pcie', ['pcieComponents']),
    unavailable() {
      return this.tree.length === 0;
    },
  },
  created() {
    const vm = this;
    vm.startLoader();
    vm.loading = true;
    vm.$store
      .dispatch('pcie/getPcie')
      .then(() => {
        vm.tree = vm.buildTree(vm.sortedAvailPCIeComponents);
      })
      .catch(({ message }) => vm.errorToast(message))
      .finally(() => {
        vm.endLoader();
        vm.loading = false;
      });
  },
};
</script>
