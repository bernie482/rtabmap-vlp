<template>
  <div>
    <b-container v-if="!attribute.hidden">
      <b-row>
        <b-col>
          <label>{{ attribute.display }}</label>
        </b-col>
        <b-col>
          <!-- Multiple Strings -->
          <template v-if="type === 'Multi-Strings'">
            <template v-for="(value, index) in currValue">
              <div :key="index">{{ value }}</div>
            </template>
          </template>
          <template v-else>
            <template v-if="!attribute.readonly">
              <!-- String -->
              <template v-if="type === 'String'">
                <b-form-input
                  :id="attribute.name"
                  v-model="currValue"
                  :min="attribute.restrict.minLength"
                  :max="attribute.restrict.maxLength"
                ></b-form-input>
              </template>
              <!-- Integer -->
              <template v-else-if="type === 'Integer'">
                <b-form-input
                  :id="attribute.name"
                  v-model="currValue"
                  type="number"
                  :min="attribute.restrict.minInt"
                  :max="attribute.restrict.maxInt"
                ></b-form-input>
              </template>
              <!-- Boolean -->
              <template v-else-if="type === 'Boolean'">
                <b-form-checkbox v-model="currValue" switch></b-form-checkbox>
              </template>
              <!-- Password -->
              <template v-else-if="type === 'Password'">
                <b-form-input
                  :id="attribute.name"
                  v-model="currValue"
                  type="password"
                ></b-form-input>
              </template>
              <!-- Enumeration -->
              <template v-else-if="type === 'Enumeration'">
                <b-form-select
                  v-model="currValue"
                  :options="attribute.value.options"
                ></b-form-select>
              </template>
            </template>
            <template v-else>
              <div>{{ currValue }}</div>
            </template>
          </template>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
export default {
  name: 'CollapseListAttribute',
  props: {
    attribute: {
      type: Object,
      default() {
        return {};
      },
    },
    attributeValue: {
      type: [String, Number, Boolean, Array],
      default() {
        return undefined;
      },
    },
  },
  computed: {
    type() {
      return this.attribute.type;
    },
    defaultValue() {
      return this.attribute.value.init ?? this.attribute.value.default;
    },
    currValue: {
      get() {
        return this.attributeValue ?? this.defaultValue;
      },
      set(value) {
        const vm = this;
        if (vm.defaultValue !== value) {
          vm.$emit('update', { name: vm.attribute.name, value: value });
        } else {
          vm.$emit('update', {
            name: vm.attribute.name,
            delete: true,
          });
        }
      },
    },
  },
};
</script>
