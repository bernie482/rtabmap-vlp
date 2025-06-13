<template>
  <div>
    <template v-for="child in list.child">
      <div :key="child.name">
        <template v-if="child.nodeType === 'menu'">
          <collapse-list-menu
            v-model="listValues"
            :menu="child"
            @update="updateValue"
          />
        </template>
        <template v-else-if="child.nodeType === 'attr'">
          <collapse-list-attribute
            :attribute="child"
            :attribute-value="getValueFromList(child.name, child)"
            @update="updateValue"
          />
        </template>
      </div>
    </template>
  </div>
</template>

<script>
import CollapseListAttribute from './CollapseListAttribute';
import CollapseListMenu from './CollapseListMenu';

export default {
  name: 'CollaseList',
  components: { CollapseListMenu, CollapseListAttribute },
  model: {
    prop: 'collapseListValues',
    event: 'input',
  },
  props: {
    list: {
      type: Object,
      default() {
        return { child: [] };
      },
    },
    collapseListValues: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  data() {
    return {
      listValues: this.collapseListValues,
    };
  },
  methods: {
    getValueFromList(name, node) {
      return this.listValues?.[name] ?? node.value.curr ?? node.value.default;
    },
    updateValue(value) {
      this.$emit('update', value);
    },
  },
};
</script>
