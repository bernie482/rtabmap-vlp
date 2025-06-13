<template>
  <div>
    <template v-for="(node, index) in nodes">
      <tree-node :key="index" :node="node"></tree-node>
    </template>
  </div>
</template>

<script>
import TreeNode from './TreeNode.vue';

export default {
  name: 'TreeView',
  components: { TreeNode },
  props: {
    nodes: {
      type: Array,
      default() {
        return [];
      },
    },
  },
};
</script>
