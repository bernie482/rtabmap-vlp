<template>
  <b-card>
    <template #header>
      <slot name="header">
        <p class="font-weight-bold m-0">
          {{ title }}
        </p>
      </slot>
    </template>
    <dl class="mb-0">
      <slot name="attributes">
        <template v-for="(value, key, index) in attributes">
          <dt :key="index">{{ key }}</dt>
          <dd :key="index" class="mb-0">{{ value }}</dd>
        </template>
      </slot>
    </dl>
    <slot name="action" />
  </b-card>
</template>

<script>
export default {
  name: 'FirmwareInfo',
  props: {
    title: {
      required: true,
      type: String,
      default: '',
    },
    attributes: {
      required: true,
      type: Object,
      default: () => {
        return {};
      },
    },
  },
};
</script>

<style></style>
