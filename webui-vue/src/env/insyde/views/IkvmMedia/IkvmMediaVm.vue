<template>
  <div v-if="false"></div>
</template>

<script>
export default {
  components: {},
  mixins: [],
  data() {
    return {};
  },
  computed: {},
  created() {
    // Emit initial data fetch complete to parent component
    this.$root.$emit('ikvm-media-vm-complete');
  },
  methods: {},
};
</script>
