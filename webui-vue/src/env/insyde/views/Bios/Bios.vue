<template>
  <b-container fluid="xl">
    <page-title :value="$route.params.menu" />
    <b-form v-if="tree">
      <collapse-list
        v-model="currValues"
        :list="tree"
        @update="cacheModified"
      />
      <b-button type="button" variant="primary" @click="onSubmit"
        >Save</b-button
      >
      <b-button type="button" variant="danger" @click="onReset">Reset</b-button>
    </b-form>
  </b-container>
</template>

<script>
import PageTitle from '@/components/Global/PageTitle';
import CollapseList from '@/env/insyde/components/CollapseList/CollapseList';

import RedfishBiosSchemaParserMixin from '@/env/insyde/components/Mixins/RedfishBiosSchemaParserMixin';
import { mapGetters } from 'vuex';

export default {
  name: 'Bios',
  components: { PageTitle, CollapseList },
  mixins: [RedfishBiosSchemaParserMixin],
  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
  data() {
    return {
      tree: null,
      lastValues: {},
      currValues: {},
      changeValues: {},
    };
  },
  computed: {
    isPageDisabled() {
      return this.loading;
    },
    ...mapGetters('bios', {
      registryMenus: 'registryMenus',
      registryAttributes: 'registryAttributes',
      registryDependencies: 'registryDependencies',
      values: 'attributes',
    }),
  },
  created() {
    const vm = this;
    vm.startLoader();
    vm.$store
      .dispatch('bios/getBios')
      .then(() => {
        vm.lastValues = vm.values;
        vm.currValues = _.cloneDeep(vm.lastValues);
        vm.tree = vm.buildTree(vm.$route.params.menu, vm.currValues);
      })
      .catch(({ message }) => vm.errorToast(message))
      .finally(() => vm.endLoader());
  },
  methods: {
    cacheModified(attr) {
      const vm = this;
      if (attr?.value) {
        vm.$set(vm.changeValues, attr.name, attr.value);
        vm.$set(vm.currValues, attr.name, attr.value);
      } else {
        if (attr?.delete) {
          vm.$delete(vm.changeValues, attr.name);
        }
      }
      vm.syncTree(attr.name, vm.currValues);
    },
    onSubmit() {
      const vm = this;
      vm.startLoader();
      vm.$store
        .dispatch('bios/saveBiosSettings', vm.changeValues)
        .then((success) => {
          vm.successToast(success);
        })
        .then(() => {
          vm.lastValues = vm.values;
          Object.keys(vm.lastValues).forEach((key) => {
            vm.$set(vm.currValues, key, vm.lastValues[key]);
          });
          vm.changeValues = {};
        })
        .catch(({ message }) => vm.errorToast(message))
        .finally(() => {
          vm.endLoader();
        });
    },
    onReset() {
      const vm = this;
      Object.keys(vm.changeValues).forEach((key) => {
        vm.$set(vm.currValues, key, vm.lastValues[key]);
      });
      vm.changeValues = {};
    },
  },
};
</script>
