<template>
  <b-modal
    id="modal-modify-ad"
    ref="modal"
    :title="$t('pageActiveDirectory.LANG_ADDAD_CAPTION')"
    size="xl"
    group-value
  >
    <b-row>
      <b-col md="2"
        ><label>{{ $t('pageActiveDirectory.CONF_AD_NG_NAME0') }}</label></b-col
      >
      <b-col><input v-model="gname" type="text" /></b-col>
    </b-row>
    <b-row>
      <b-col md="2"
        ><label>{{
          $t('pageActiveDirectory.CONF_AD_NG_DOMAIN0')
        }}</label></b-col
      >
      <b-col><input v-model="gdomain" type="text" /></b-col>
    </b-row>
    <b-row cols="2">
      <b-col md="2">
        <label>{{ $t('pageActiveDirectory.CONF_AD_NG_PRIV0') }}</label></b-col
      >
      <b-col>
        <select v-model="netpriv">
          <option v-for="(obj, id) in rolePriv" :key="id" :value="obj.type">
            {{ obj.name }}
          </option>
        </select>
      </b-col>
    </b-row>
    <!--button-->
    <template #modal-footer="{ cancel }">
      <b-button variant="secondary" @click="cancel()">
        {{ $t('global.action.cancel') }}
      </b-button>
      <b-button variant="primary" @click="onOk">
        {{ $t('global.action.save') }}
      </b-button>
    </template>
  </b-modal>
</template>
<script>
export default {
  components: {},
  props: {
    groupValue: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      gname: '',
      gdomain: '',
      netpriv: '4',
      rolePriv: [
        {
          name: this.$t('pageActiveDirectory.LANG_USER_PRIVILEG_4'),
          type: 4,
        },
        {
          name: this.$t('pageActiveDirectory.LANG_USER_PRIVILEG_3'),
          type: 3,
        },
        {
          name: this.$t('pageActiveDirectory.LANG_USER_PRIVILEG_2'),
          type: 2,
        },
        {
          name: this.$t('pageActiveDirectory.LANG_USER_PRIVILEG_1'),
          type: 1,
        },
        {
          name: this.$t('pageActiveDirectory.LANG_USER_PRIVILEG_F'),
          type: 15,
        },
      ],
      roleID: 0,
    };
  },
  computed: {},
  watch: {
    groupValue: function (value) {
      //console.log('group-value', value);
      this.roleID = value?.id;
      this.gname = value?.name;
      this.gdomain = value?.domain;
      this.netpriv = value?.privilege != 0 ? value?.privilege.toString() : '2';
    },
  },
  created() {},
  validations: {},
  methods: {
    handleSubmit() {
      let config = {};
      config['id'] = this.roleID;
      config['domain'] = this.gdomain;
      config['name'] = this.gname;
      config['privilege'] = parseInt(this.netpriv, 10);
      this.$emit('ok', config);
      this.closeModal();
    },
    closeModal() {
      this.$nextTick(() => {
        this.$refs.modal.hide();
      });
    },
    onOk(bvModalEvt) {
      bvModalEvt.preventDefault();
      this.handleSubmit();
    },
  },
};
</script>
<style>
.fontsize {
  font-size: 12px;
}
</style>
