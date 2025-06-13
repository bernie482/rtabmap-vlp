<template>
  <b-modal
    id="modal-ad-adv"
    ref="modal"
    :title="$t('pageActiveDirectory.LANG_AD_ADV_TITLE')"
    size="lg"
    advsettings
  >
    <b-row>
      <b-col md="5"
        ><label>{{
          $t('pageActiveDirectory.LANG_AD_ADV_ENABLE')
        }}</label></b-col
      >
      <b-col
        ><b-form-checkbox v-model="enabled" switch></b-form-checkbox
      ></b-col>
    </b-row>
    <b-row>
      <b-col md="5"
        ><label>{{ $t('pageActiveDirectory.LANG_AD_ADV_SSL') }}</label></b-col
      >
      <b-col
        ><b-form-checkbox
          v-model="enabledOverSSL"
          :disabled="!enabled"
          switch
          @change="setportNum"
        ></b-form-checkbox
      ></b-col>
    </b-row>
    <b-row>
      <b-col md="5"
        ><label>{{ $t('pageActiveDirectory.LANG_AD_ADV_PORT') }}</label></b-col
      >
      <b-col><input v-model="port" type="text" :disabled="!enabled" /></b-col>
    </b-row>
    <b-row>
      <b-col md="5"
        ><label>{{
          $t('pageActiveDirectory.LANG_AD_ADV_USERDOMAIN')
        }}</label></b-col
      >
      <b-col
        ><input v-model="domainName" type="text" :disabled="!enabled"
      /></b-col>
    </b-row>
    <b-row>
      <b-col md="5"
        ><label>{{
          $t('pageActiveDirectory.LANG_AD_ADV_TIMEOUT')
        }}</label></b-col
      >
      <b-col
        ><input v-model="timeout" type="text" :disabled="!enabled"
      /></b-col>
    </b-row>
    <b-row>
      <b-col
        ><label>{{ $t('pageActiveDirectory.LANG_AD_ADV_SRV') }}</label></b-col
      >
    </b-row>
    <b-row>
      <b-col md="5"
        ><label>{{
          $t('pageActiveDirectory.LANG_AD_ADV_IPV4_SRV1')
        }}</label></b-col
      >
      <b-col
        ><input v-model="ipv4server1" type="text" :disabled="!enabled"
      /></b-col>
    </b-row>
    <b-row>
      <b-col md="5"
        ><label>{{
          $t('pageActiveDirectory.LANG_AD_ADV_IPV4_SRV2')
        }}</label></b-col
      >
      <b-col
        ><input v-model="ipv4server2" type="text" :disabled="!enabled"
      /></b-col>
    </b-row>
    <b-row>
      <b-col md="5"
        ><label>{{
          $t('pageActiveDirectory.LANG_AD_ADV_IPV4_SRV3')
        }}</label></b-col
      >
      <b-col
        ><input v-model="ipv4server3" type="text" :disabled="!enabled"
      /></b-col>
    </b-row>
    <b-row>
      <b-col md="5"
        ><label>{{
          $t('pageActiveDirectory.LANG_AD_ADV_IPV6_SRV1')
        }}</label></b-col
      >
      <b-col
        ><input v-model="ipv6server1" type="text" :disabled="!enabled"
      /></b-col>
    </b-row>
    <b-row>
      <b-col md="5"
        ><label>{{
          $t('pageActiveDirectory.LANG_AD_ADV_IPV6_SRV2')
        }}</label></b-col
      >
      <b-col
        ><input v-model="ipv6server2" type="text" :disabled="!enabled"
      /></b-col>
    </b-row>
    <b-row>
      <b-col md="5"
        ><label>{{
          $t('pageActiveDirectory.LANG_AD_ADV_IPV6_SRV3')
        }}</label></b-col
      >
      <b-col
        ><input v-model="ipv6server3" type="text" :disabled="!enabled"
      /></b-col>
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
    advsettings: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      enabled: false,
      enabledOverSSL: false,
      port: '',
      domainName: '',
      timeout: '',
      ipv4server1: '',
      ipv4server2: '',
      ipv4server3: '',
      ipv6server1: '',
      ipv6server2: '',
      ipv6server3: '',
    };
  },
  computed: {},
  watch: {
    advsettings: function (value) {
      if (value === null) return;
      this.enabled = value?.enable;
      this.enabledOverSSL = value?.enableSSL;
      this.timeout = value?.timeout;
      this.port = value?.port.toString();
      this.domainName = value?.domainName;
      let v4addr = value?.ipv4Server ?? [];
      let v6addr = value?.ipv6Server ?? [];
      v4addr.forEach((d, index) => {
        switch (index) {
          case 0:
            this.ipv4server1 = d?.address != '0.0.0.0' ? d.address : '';
            break;
          case 1:
            this.ipv4server2 = d?.address != '0.0.0.0' ? d.address : '';
            break;
          case 2:
            this.ipv4server3 = d?.address != '0.0.0.0' ? d.address : '';
            break;
          default:
        }
      });
      v6addr.forEach((d, index) => {
        //eval(`this.ipv6server${index + 1}=d.address`);
        switch (index) {
          case 0:
            this.ipv6server1 = d?.address != '::' ? d.address : '';
            break;
          case 1:
            this.ipv6server2 = d?.address != '::' ? d.address : '';
            break;
          case 2:
            this.ipv6server3 = d?.address != '::' ? d.address : '';
            break;
          default:
        }
      });
    },
  },
  validations: {},
  methods: {
    setportNum() {
      if (!this.enabledOverSSL) {
        this.port = 389;
      } else {
        this.port = 636;
      }
    },
    handleSubmit() {
      let advset = this;
      let adsrvconfig = {};
      adsrvconfig['domainName'] = advset.domainName;
      adsrvconfig['enable'] = advset.enabled;
      adsrvconfig['enableSSL'] = advset.enabledOverSSL;
      adsrvconfig['port'] = parseInt(advset.port, 10);
      adsrvconfig['timeout'] = parseInt(advset.timeout, 10);
      adsrvconfig['ipv4Server'] = [
        {
          address:
            advset.ipv4server1.length != 0 ? advset.ipv4server1 : '0.0.0.0',
        },
        {
          address:
            advset.ipv4server2.length != 0 ? advset.ipv4server2 : '0.0.0.0',
        },
        {
          address:
            advset.ipv4server3.length != 0 ? advset.ipv4server3 : '0.0.0.0',
        },
      ];
      adsrvconfig['ipv6Server'] = [
        { address: advset.ipv6server1.length != 0 ? advset.ipv6server1 : '::' },
        { address: advset.ipv6server2.length != 0 ? advset.ipv6server2 : '::' },
        { address: advset.ipv6server3.length != 0 ? advset.ipv6server3 : '::' },
      ];
      advset.$emit('ok', adsrvconfig);
      advset.closeModal();
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
<style lang="scss" scoped>
.fontsize {
  font-size: 12px;
}
</style>
