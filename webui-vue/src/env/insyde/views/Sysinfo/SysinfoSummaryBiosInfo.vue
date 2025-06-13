<template>
  <div v-if="false"></div>
</template>

<script>
export default {
  created() {
    this.$root.$emit('sysinfo-summary-biosinfo-complete');
  },
};
</script>
