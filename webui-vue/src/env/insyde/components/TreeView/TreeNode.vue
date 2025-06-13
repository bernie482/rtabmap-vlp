<template>
  <div class="tree-branch">
    <div
      class="tree-node"
      :class="{
        'has-child-nodes': hasChildren,
        'tree-node-expanded': expanded,
      }"
    >
      <transition name="rotateArrow">
        <svg
          v-if="hasChildren"
          width="18"
          height="18"
          class="tree-node-icon"
          @click.prevent="toggle"
        >
          <path d="M4 3 L14 8 L4 13 Z" class="svg-icon" />
        </svg>
      </transition>
      <template v-if="Array.isArray(node._display)">
        <!-- Array-->
        <div class="tree-node-array" @click.prevent="toggle">
          <template v-for="(str, index) in node._display">
            <span :key="index" class="tree-node-label">{{ str }}</span>
          </template>
        </div>
      </template>
      <template v-else>
        <!-- String-->
        <span class="tree-node-title" @click.prevent="toggle">{{
          node._display
        }}</span>
      </template>
    </div>
    <div v-if="expanded && hasChildren" class="tree-node-children">
      <template v-for="(child, index) in node.childs">
        <tree-node :key="index" :node="child"> </tree-node>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TreeNode',
  props: {
    node: {
      type: Object,
      default() {
        return { _display: '', childs: [] };
      },
    },
  },
  data() {
    return {
      expanded: false,
    };
  },
  computed: {
    hasChildren() {
      return this.node.childs.length > 0;
    },
  },
  methods: {
    toggle() {
      this.expanded = !this.expanded;
    },
  },
};
</script>

<style scoped>
.tree-node-title {
  display: inline;
  cursor: pointer;
  user-select: none;
  padding: 2px 4px;
}

.tree-node-array {
  padding: 2px 16px;
  cursor: default;
}

.tree-node:hover {
  border-radius: 3px;
  background-color: #ebecee;
}

.tree-node-label {
  display: block;
  padding-left: 2px;
  cursor: default;
}

.tree-node-icon {
  color: #464646;
  transition: transform 0.3s;
}

.tree-node-children {
  margin-left: 22px;
}

.tree-node.has-child-nodes {
  margin-left: 0;
}

.tree-node.has-child-nodes .tree-node-icon {
  cursor: pointer;
}

.tree-node-expanded .tree-node-icon {
  transform-origin: center;
  transform: rotate(90deg);
  transition: transform 0.3s;
}

.tree-node > svg {
  display: inline-block;
  user-select: none;
}

.tree-node svg > .svg-icon {
  opacity: 1;
  stroke: currentColor;
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-miterlimit: 4;
  stroke-dasharray: none;
  stroke-opacity: 1;
}

.tree-node.tree-node-expanded > svg > .svg-icon {
  fill: none;
}
</style>
