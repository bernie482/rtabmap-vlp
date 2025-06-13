<template>
  <b-container fluid="x1">
    <!--Certificate-->
    <page-section :section-title="$t('pageAlertEmail.certification')">
      <b-row b-col="2">
        <b-col md="2"><label>Certification Check Enable</label></b-col>
        <b-col>
          <b-form-checkbox
            v-model="certcheck"
            switch
            @change="chboxChange"
          ></b-form-checkbox>
        </b-col>
      </b-row>
      <b-row b-col="2">
        <b-col md="2"><label>SSL Certificate</label></b-col>
        <b-col md="1"
          ><input type="file" :disabled="disabledbtn" @change="fileChange"
        /></b-col>
      </b-row>
      <b-row>
        <b-col>
          <b-button
            variant="secondary"
            :disabled="disabledbtn"
            @click="UploadCrt"
          >
            {{ $t('global.action.upload') }}
          </b-button>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <b-button variant="primary" @click="certConfigSave">
            {{ $t('global.action.saveSettings') }}
          </b-button>
        </b-col>
      </b-row>
    </page-section>
  </b-container>
</template>

<script>
import PageSection from '@/components/Global/PageSection';
import { CertCheckParser } from '@/env/insyde/components/Mixins/AlertEmailTableParserMixin';

export default {
  name: 'AlertEmail',
  components: {
    PageSection,
  },

  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
  data() {
    return {
      certcheck: false,
      disabledbtn: false,
      formData: new FormData(),
    };
  },
  computed: {
    certstate() {
      return CertCheckParser(this.$store.getters['alertemail/smtpcertstate']);
    },
  },
  created() {
    const alertemail = this;
    alertemail.startLoader();
    Promise.all([alertemail.getSMTPCERT()]).finally(() =>
      alertemail.endLoader()
    );
  },
  methods: {
    chboxChange() {
      const cert = this;
      if (cert.certstate.state) {
        if (!cert.certcheck) {
          this.disabledbtn = true;
        } else {
          this.disabledbtn = false;
        }
      }
    },
    getSMTPCERT() {
      const alertemail = this;
      alertemail.$store.dispatch('alertemail/getSMTPCertState').then(() => {
        alertemail.certcheck = alertemail.certstate.state;
        alertemail.disabledUploadOption(alertemail.certcheck);
      });
    },
    disabledUploadOption(disbaled) {
      this.disabledbtn = !disbaled;
    },
    fileChange(e) {
      this.formData.append('certfile', e.target.files[0]);
    },
    UploadCrt() {
      let uploadcert = this;
      let certfile = uploadcert.formData;
      uploadcert.startLoader();
      uploadcert.$store
        .dispatch('alertemail/uploadSMTPCert', certfile)
        .then((success) => {
          uploadcert.successToast(success);
        })
        .catch((message) => {
          uploadcert.errorToast(message);
        })
        .finally(() => {
          uploadcert.endLoader();
        });
    },
    certConfigSave() {
      const setconfig = this;
      setconfig.startLoader();
      let configObj = {};
      configObj['CRT_CHECK_STATE'] = setconfig.certcheck;
      setconfig.$store
        .dispatch('alertemail/saveCertConfig', configObj)
        .then((success) => {
          setconfig.getSMTPCERT();
          setconfig.successToast(success);
        })
        .catch((message) => {
          setconfig.errorToast(message);
        })
        .finally(() => {
          setconfig.endLoader();
        });
    },
  },
};
</script>
<style></style>
