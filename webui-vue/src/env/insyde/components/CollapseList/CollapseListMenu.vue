<template>
  <div>
    <b-card v-show="!menu.hidden" no-body>
      <b-card-header>
        <b-button
          v-b-toggle
          block
          :href="'#' + menu.name"
          variant="primary"
          @click.prevent
        >
          {{ menu.display }}
        </b-button>
      </b-card-header>
      <b-collapse :id="menu.name">
        <template v-for="(child, index) in menu.child">
          <!-- NOTE: add index to avoid duplicate key issue -->
          <div :key="index + child.name" class="card-sub">
            <template v-if="child.nodeType === 'menu'">
              <collapse-list-menu
                v-model="menuValues"
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
      </b-collapse>
    </b-card>
  </div>
</template>

<script>
import CollapseListAttribute from './CollapseListAttribute';

export default {
  name: 'CollapseListMenu',
  components: { CollapseListAttribute },
  model: {
    prop: 'collapseMenuValues',
    event: 'input',
  },
  props: {
    menu: {
      type: Object,
      default() {
        return {};
      },
    },
    collapseMenuValues: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  data() {
    return {
      menuValues: this.collapseMenuValues,
    };
  },
  methods: {
    getValueFromList(name, node) {
      return this.menuValues[name] ?? node.value.curr ?? node.value.default;
    },
    updateValue(value) {
      this.$emit('update', value);
    },
  },
};
</script>
