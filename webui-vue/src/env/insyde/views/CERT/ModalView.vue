<template>
  <b-modal
    id="modal-view"
    ref="modal"
    :title="$t('appPageTitle.view_ssl_cert')"
    size="xl"
  >
    <pre v-for="(elmPre, idx) in info" :key="idx" class="normal-log">{{
      elmPre
    }}</pre>
    <!--button-->
    <template #modal-footer>
      <b-button variant="primary" @click="back">
        {{ $t('global.action.back') }}
      </b-button>
    </template>
  </b-modal>
</template>

<script>
export default {
  name: 'ViewCert',
  components: {},

  props: {
    getCERTInfo: {
      type: Function,
      default: null,
    },
    certInfo: {
      type: Array,
      default: null,
    },
  },
  data() {
    return {
      info: [],
    };
  },
  computed: {},
  watch: {
    certInfo: function (value) {
      this.info = value;
    },
  },
  created() {
    this.getCERTInfo();
  },
  methods: {
    back(bvModalEvt) {
      bvModalEvt.preventDefault();
      this.closeModal();
    },
    closeModal() {
      this.$nextTick(() => {
        this.$refs.modal.hide();
      });
    },
  },
};
</script>
<style lang="scss" scoped>
.normal-log {
  white-space: pre-wrap;
  /*color: #efefef;*/
  /*background-color: rgb(66, 66, 66);*/
  overflow: auto;
  resize: none;
  width: 1080px;
  /*min-height: 400px;*/
}
</style>
