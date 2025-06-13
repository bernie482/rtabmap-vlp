<template>
  <b-container fluid="x1">
    <page-title />
    <page-section>
      <b-row class="mb-1">
        <b-col cols="6" sm="5" md="4" lg="4" xl="2">
          <label>{{ $t('pageKRBAuthentication.KRB_ENABLE') }}</label>
        </b-col>
        <b-col cols="6" sm="5" md="4" lg="4" xl="2">
          <b-form-checkbox v-model="enable" switch></b-form-checkbox>
        </b-col>
      </b-row>
      <b-row class="mb-1">
        <b-col cols="6" sm="5" md="4" lg="4" xl="2">
          <label>
            {{ $t('pageKRBAuthentication.KRB_REALM') }}
          </label>
        </b-col>
        <b-col cols="6" sm="5" md="4" lg="4" xl="2">
          <b-form-input
            v-model="realm"
            class="textfield"
            type="text"
            :disabled="!enable"
          >
          </b-form-input>
        </b-col>
      </b-row>
      <b-row class="mb-1">
        <b-col cols="6" sm="5" md="4" lg="4" xl="2">
          <label>
            {{ $t('pageKRBAuthentication.KRB_ADDR') }}
          </label>
        </b-col>
        <b-col cols="6" sm="5" md="4" lg="4" xl="2">
          <b-form-input
            v-model="addr"
            class="textfield"
            type="text"
            :disabled="!enable"
          ></b-form-input>
        </b-col>
      </b-row>
      <b-row class="mb-1">
        <b-col cols="6" sm="5" md="4" lg="4" xl="2">
          <label>
            {{ $t('pageKRBAuthentication.KRB_PORT') }}
          </label>
        </b-col>
        <b-col cols="6" sm="5" md="4" lg="4" xl="2">
          <b-form-input
            v-model="port"
            class="textfield"
            type="text"
            :disabled="!enable"
          ></b-form-input>
        </b-col>
      </b-row>
      <b-row class="mb-1">
        <b-col cols="6" sm="5" md="4" lg="4" xl="2">
          <label>
            {{ $t('pageKRBAuthentication.KRB_KEYTABLE_FILE') }}
          </label>
        </b-col>
        <b-col cols="6" sm="5" md="4" lg="4" xl="2">
          <input
            ref="btnfile"
            type="file"
            :disabled="!enable"
            @change="fileChange"
          />
        </b-col>
      </b-row>
      <b-button variant="primary" @click="ConfigSave">
        {{ $t('global.action.saveSettings') }}
      </b-button>
      <b-button variant="secondary" :disabled="disabledbtn" @click="uploadCert">
        {{ $t('global.action.upload') }}
      </b-button>
    </page-section>
  </b-container>
</template>
<script>
import PageTitle from '@/components/Global/PageTitle';

import PageSection from '@/components/Global/PageSection';
import { KRBParser } from '@/env/insyde/components/Mixins/KRBAuthParserMixin';

export default {
  name: 'KrbAuth',
  components: {
    PageTitle,
    PageSection,
  },

  data() {
    return {
      disabledbtn: false,
      enable: false,
      realm: '',
      addr: '',
      port: '',
      formData: new FormData(),
    };
  },
  computed: {
    krbinf() {
      return KRBParser(this.$store.getters['krbauth/krbinfo']);
    },
  },
  created() {
    const krbauth = this;
    krbauth.startLoader();

    Promise.all([
      krbauth.$store.dispatch('krbauth/postKRB5Info').then(() => {
        krbauth.enable = parseInt(krbauth.krbinf.enabled) ? true : false;
        krbauth.realm = krbauth.krbinf.realm;
        krbauth.addr = krbauth.krbinf.addr;
        krbauth.port = krbauth.krbinf.port;
      }),
    ]).finally(() => krbauth.endLoader());
  },
  methods: {
    fileChange(e) {
      this.clearFormData();
      if (this.$refs.btnfile.value != null)
        this.formData.append('KRB_KEYTAB', e.target.files[0]);
    },
    clearFormData() {
      this.formData.delete('KRB_ENABLE');
      this.formData.delete('KRB_REALM');
      this.formData.delete('KRB_ADDR');
      this.formData.delete('KRB_PORT');
      this.formData.delete('KRB_KEYTAB');
    },
    uploadCert() {
      let krbauth = this;
      let configdata = krbauth.formData;
      krbauth.startLoader();
      krbauth.$store
        .dispatch('krbauth/uploadCert', configdata)
        .then((success) => {
          let result =
            krbauth.$store.getters['krbauth/result']?.RESULT ?? 'FAIL';
          if (result != 'OK') {
            krbauth.disabledbtn = false;
            krbauth.errorToast(result);
          } else {
            krbauth.disabledbtn = true;
            krbauth.successToast(success);
          }
        })
        .catch((message) => {
          krbauth.disabledbtn = false;
          krbauth.errorToast(message);
        })
        .finally(() => {
          krbauth.$refs.btnfile.value = null;
          krbauth.endLoader();
        });
    },
    ConfigSave() {
      let krbauth = this;
      krbauth.clearFormData();
      krbauth.formData.append('KRB_ENABLE', this.enable ? 1 : 0);
      krbauth.formData.append('KRB_REALM', this.realm);
      krbauth.formData.append('KRB_ADDR', this.addr);
      krbauth.formData.append('KRB_PORT', this.port);
      let configdata = krbauth.formData;
      krbauth.startLoader();
      krbauth.$store
        .dispatch('krbauth/configAuth', configdata)
        .then((success) => {
          let result =
            krbauth.$store.getters['krbauth/result']?.RESULT ?? 'FAIL';
          if (result != 'OK') {
            krbauth.errorToast(result);
          } else {
            krbauth.successToast(success);
          }
        })
        .catch((message) => {
          krbauth.errorToast(message);
        })
        .finally(() => {
          krbauth.endLoader();
        });
    },
  },
};
</script>
<style lang="scss" scoped>
.textfield {
  font-size: 12px;
  line-height: 28px;
  position: relative;
  border: 2px solid #0077ae;
  border-radius: 3px;
  outline: none;
  padding: 0px 4px;
}
</style>
