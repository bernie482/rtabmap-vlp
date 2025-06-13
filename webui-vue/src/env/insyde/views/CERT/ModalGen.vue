<template>
  <b-modal
    id="modal-gen"
    ref="modal"
    :title="$t('appPageTitle.gen_ssl_cert')"
    size="lg"
  >
    <b-row cols="2">
      <b-col md="3"
        ><label>{{
          $t('pageSSLCertificates.LANG_GENERATE_SSL_CERT_COUNTRY')
        }}</label></b-col
      >
      <b-col><input v-model="country" type="text" /></b-col>
    </b-row>
    <b-row cols="2">
      <b-col md="3"
        ><label>{{
          $t('pageSSLCertificates.LANG_GENERATE_SSL_CERT_STATE')
        }}</label></b-col
      >
      <b-col><input v-model="state" type="text" /></b-col>
    </b-row>
    <b-row cols="2">
      <b-col md="3"
        ><label>{{
          $t('pageSSLCertificates.LANG_GENERATE_SSL_CERT_LOCALITY')
        }}</label></b-col
      >
      <b-col><input v-model="locality" type="text" /></b-col>
    </b-row>
    <b-row cols="2">
      <b-col md="3"
        ><label>{{
          $t('pageSSLCertificates.LANG_GENERATE_SSL_CERT_ORG')
        }}</label></b-col
      >
      <b-col><input v-model="org" type="text" /></b-col>
    </b-row>
    <b-row cols="2">
      <b-col md="3"
        ><label>{{
          $t('pageSSLCertificates.LANG_GENERATE_SSL_CERT_ORGUNIT')
        }}</label></b-col
      >
      <b-col><input v-model="ou" type="text" /></b-col>
    </b-row>
    <b-row cols="2">
      <b-col md="3"
        ><label>{{
          $t('pageSSLCertificates.LANG_GENERATE_SSL_CERT_COMMON')
        }}</label></b-col
      >
      <b-col><input v-model="cname" type="text" /></b-col>
    </b-row>
    <b-row cols="2">
      <b-col md="3"
        ><label>{{
          $t('pageSSLCertificates.LANG_GENERATE_SSL_CERT_EMAIL')
        }}</label></b-col
      >
      <b-col><input v-model="email" type="text" /></b-col>
    </b-row>
    <!--button-->
    <template #modal-footer="{ cancel }">
      <b-button variant="secondary" @click="cancel()">
        {{ $t('global.action.cancel') }}
      </b-button>
      <b-button variant="primary" @click="onOk">
        {{ $t('global.action.generated') }}
      </b-button>
    </template>
  </b-modal>
</template>

<script>
export default {
  name: 'GenCert',
  components: {},

  data() {
    return {
      country: '',
      state: '',
      locality: '',
      org: '',
      ou: '',
      cname: '',
      email: '',
    };
  },
  computed: {},
  created() {},
  methods: {
    handleSubmit() {
      let gen = this;
      let certData = {
        SSL_C: gen.country,
        SSL_ST: gen.state,
        SSL_L: gen.locality,
        SSL_O: gen.org,
        SSL_OU: gen.ou,
        SSL_CN: gen.cname,
        SSL_EA: gen.email,
      };
      gen.$emit('ok', certData);
      gen.closeModal();
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
<style></style>
