<template>
  <b-container fluid="x1">
    <page-title />
    <!--CERT-->
    <page-section
      :section-title="$t('pageSSLCertificates.certification_upload')"
    >
      <b-row cols="2">
        <b-col md="1"
          ><label>{{
            $t('pageSSLCertificates.LANG_CONFIG_SSL_FORM')
          }}</label></b-col
        >
        <b-col
          ><label>{{ ca_from_date }}</label></b-col
        >
      </b-row>
      <b-row cols="2">
        <b-col md="1"
          ><label>{{
            $t('pageSSLCertificates.LANG_CONFIG_SSL_UNTIL')
          }}</label></b-col
        >
        <b-col
          ><label>{{ ca_until_date }}</label></b-col
        >
      </b-row>
      <b-row b-col="1">
        <b-col md="1"
          ><label>{{
            $t('pageSSLCertificates.LANG_CONFIG_SSL_NEWSSLCERT')
          }}</label></b-col
        >
        <b-col><input type="file" @change="sslcertfileChange" /></b-col>
      </b-row>
      <b-row b-col="1">
        <b-col md="1"
          ><label>{{
            $t('pageSSLCertificates.LANG_CONFIG_SSL_NEWPRIKEY')
          }}</label></b-col
        >
        <b-col><input type="file" @change="privkeyfileChange" /></b-col>
      </b-row>
      <b-button variant="primary" @click="UploadCrt">
        {{ $t('global.action.upload') }}
      </b-button>
    </page-section>
    <!--View/Generate Certificate-->
    <gen-view :lightyrestart="restartHttpd" />
  </b-container>
</template>
<script>
import PageTitle from '@/components/Global/PageTitle';

import PageSection from '@/components/Global/PageSection';
import GenView from './GenView';
import {
  certExpireDateParser,
  uploadCertParser,
} from '@/env/insyde/components/Mixins/CertTableParserMixin';

export default {
  name: 'SSLCertification',
  components: {
    PageTitle,
    PageSection,
    GenView,
  },

  data() {
    return {
      ca_from_date: '',
      ca_until_date: '',
      ca_exist_valid: 0,
      formData: new FormData(),
    };
  },
  computed: {
    uploadedcert() {
      return uploadCertParser(this.$store.getters['cert/uploadedstatus']);
    },
    certexpiredate() {
      return certExpireDateParser(this.$store.getters['cert/getsslstatus']);
    },
  },
  created() {
    this.getCertExpireDate();
  },
  methods: {
    getCertExpireDate() {
      const cert = this;
      cert.startLoader();
      Promise.all([
        cert.$store.dispatch('cert/getsslstatus').then(() => {
          cert.ca_from_date = cert.certexpiredate.from;
          cert.ca_until_date = cert.certexpiredate.until;
          cert.ca_exist_valid = cert.certexpiredate.exist;
        }),
      ]).finally(() => cert.endLoader());
    },
    UploadCrt() {
      let uploadcert = this;
      let certfile = uploadcert.formData;
      uploadcert.$bvModal
        .msgBoxConfirm(
          uploadcert.$t('pageSSLCertificates.LANG_CONFIG_SSL_CRTEXIST'),
          {
            title: `${uploadcert.$t('global.action.confirm')} ?`,
          }
        )
        .then((confirmed) => {
          if (confirmed) {
            uploadcert.startLoader();
            uploadcert.$store
              .dispatch('cert/uploadSSLCert', certfile)
              .then((success) => {
                if (uploadcert.uploadedcert.result != 'OK') {
                  uploadcert.errorToast(
                    uploadcert.$t(
                      'pageSSLCertificates.LANG_CONFIG_SSL_CRTFAILED'
                    )
                  );
                } else {
                  this.getCertExpireDate();
                  this.restartHttpd();
                  uploadcert.successToast(success);
                }
              })
              .catch((message) => {
                uploadcert.errorToast(message);
              })
              .finally(() => {
                uploadcert.endLoader();
              });
          }
        });
    },
    restartHttpd() {
      let lighty = this;
      lighty.$bvModal
        .msgBoxConfirm(
          lighty.$t('pageSSLCertificates.LANG_CONFIG_SSL_SUCCSAVE'),
          {
            title: `${lighty.$t('global.action.confirm')} ?`,
          }
        )
        .then((confirmed) => {
          if (confirmed) {
            lighty.startLoader();
            lighty.$store
              .dispatch('cert/httpdReset')
              .then(() => {
                //dialogAlert(mLangMap.getStr("LANG_CONFIG_SSL_WEB_RESTART"));
                //window.top.$('#loading').show();
                //top.logout('show alert', 15000);
                lighty.successToast(
                  lighty.$t('pageSSLCertificates.LANG_CONFIG_SSL_WEB_RESTART')
                );
              })
              .catch((message) => {
                lighty.errorToast(message);
              })
              .finally(() => {
                lighty.endLoader();
              });
          }
        });
    },
    privkeyfileChange(e) {
      this.formData.append('keyfile', e.target.files[0]);
    },
    sslcertfileChange(e) {
      this.formData.append('certfile', e.target.files[0]);
    },
  },
};
</script>
<style></style>
