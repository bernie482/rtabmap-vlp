<template>
  <b-button @click="download">
    <icon-document-download />
    <slot></slot>
  </b-button>
</template>

<script>
import DocumentDownload from '@carbon/icons-vue/es/document--download/24';
import FileProcessMixin from '@/env/insyde/components/Mixins/FileProcessMixin';

export default {
  name: 'FileDownloader',
  components: { IconDocumentDownload: DocumentDownload },
  mixins: [FileProcessMixin],
  props: {
    downloadFunc: {
      type: Function,
      default() {
        return () => {
          return null;
        };
      },
    },
  },
  methods: {
    download() {
      const vm = this;
      vm.downloadFunc(vm.processFileFunc);
    },
  },
};
</script>

<style></style>
