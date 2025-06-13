<template>
  <b-container fluid="x1">
    <page-section
      :section-title="$t('pageSSLCertificates.certification_view_gen')"
    >
      <b-row b-col="2">
        <b-col md="2">
          <label>{{ $t('appPageTitle.view_ssl_cert') }}</label></b-col
        >
      </b-row>
      <b-button variant="primary" @click="showViewModal">
        {{ $t('global.action.view') }}
      </b-button>
      <b-row b-col="2">
        <b-col md="2">
          <label>{{ $t('appPageTitle.gen_ssl_cert') }}</label></b-col
        >
      </b-row>
      <b-button variant="primary" @click="showGenField">
        {{ $t('global.action.generated') }}
      </b-button>
    </page-section>
    <!--Modal-->
    <modal-view
      :cert-info="certInfo"
      :get-c-e-r-t-info="getCERTInfo"
      hide-footer
      @ok="CertContent"
    />
    <modal-gen hide-footer @ok="genCert" />
  </b-container>
</template>

<script>
import PageSection from '@/components/Global/PageSection';
import ModalView from './ModalView';
import ModalGen from './ModalGen';
import {
  genCertParser,
  getCertInfoParser,
} from '@/env/insyde/components/Mixins/CertTableParserMixin';

export default {
  name: 'ViewGenerateCertificate',
  components: {
    PageSection,
    ModalView,
    ModalGen,
  },

  props: {
    lightyrestart: {
      type: Function,
      default: null,
    },
  },
  data() {
    return {
      info: null,
      formData: new FormData(),
      certInfo: [],
    };
  },
  computed: {
    certstate() {
      return genCertParser(this.$store.getters['cert/gensslstatus']);
    },
    certinfo() {
      return getCertInfoParser(this.$store.getters['cert/certcontant']);
    },
  },
  created() {},
  methods: {
    getCERTInfo() {
      const view = this;
      view.startLoader();
      Promise.all([
        view.$store.dispatch('cert/getCertContant').then(() => {
          let msg = view.certinfo.errmsg;
          if (msg.length != 0) {
            // fail
            view.errorToast(msg);
          } else {
            view.info = view.certinfo.data;
            view.info.forEach((chunk) => {
              view.certInfo.push(chunk);
            });
          }
        }),
      ]).finally(() => view.endLoader());
    },
    genCert(configDataObj) {
      let cert = this;
      cert.$bvModal
        .msgBoxConfirm(
          cert.$t('pageSSLCertificates.LANG_GENERATE_SSL_CERT_DIAG_CONFIRM'),
          {
            title: `${cert.$t('global.action.confirm')} ?`,
          }
        )
        .then((confirmed) => {
          if (confirmed) {
            cert.startLoader();
            cert.$store
              .dispatch('cert/gensslcert', configDataObj)
              .then(() => {
                if (cert.certstate.result != 'success') {
                  cert.errorToast(cert.msg);
                } else {
                  cert.successToast(cert.certstate.msg);
                  cert.getCERTInfo();
                  cert.lightyrestart();
                }
              })
              .catch((message) => {
                cert.errorToast(message);
              })
              .finally(() => {
                cert.endLoader();
              });
          }
        });
    },
    CertContent() {},
    showGenField() {
      this.$bvModal.show('modal-gen');
    },
    showViewModal() {
      this.$bvModal.show('modal-view');
    },
  },
};
</script>
<style></style>
