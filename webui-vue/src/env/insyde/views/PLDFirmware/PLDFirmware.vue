<template>
  <b-container fluid="xl">
    <page-title />
    <page-section :section-title="$t('pagePldFirmware.sectionTitlePldImages')">
      <b-row>
        <b-col xl="10">
          <firmware-info
            :title="$t('pagePldFirmware.cardTitleImage')"
            :attributes="firmwareContent"
          />
        </b-col>
      </b-row>
    </page-section>

    <!-- Update firmware-->
    <page-section
      :section-title="$t('pagePldFirmware.sectionTitleUpdateFirmware')"
    >
      <b-row>
        <b-col sm="8" md="6" xl="4">
          <firmware-update-form
            :type="firmwareType"
            :submit-func="confirmUpdate"
            :is-disabled="isPageDisabled"
          />
        </b-col>
      </b-row>
    </page-section>

    <!-- Modals -->
    <firmware-update-modal
      :type="firmwareType"
      path="pagePldFirmware.modal"
      @ok="updatePldFirmware"
    />
  </b-container>
</template>

<script>
import i18n from '@/i18n';
import PageTitle from '@/components/Global/PageTitle';
import PageSection from '@/components/Global/PageSection';

import FirmwareInfo from '@/env/insyde/components/Firmware/FirmwareInfo';
import FirmwareUpdateForm from '@/env/insyde/components/Firmware/FirmwareUpdateForm';
import FirmwareUpdateModal from '@/env/insyde/components/Firmware/FirmwareUpdateModal';

export default {
  name: 'PLDFirmware',
  components: {
    PageTitle,
    PageSection,
    FirmwareInfo,
    FirmwareUpdateForm,
    FirmwareUpdateModal,
  },

  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
  data() {
    return {
      firmwareType: 'pld',
      updateType: 'post',
      data: null,
    };
  },
  computed: {
    firmwareContent() {
      let pldFirmwareContent = this.$store.getters[
        'firmware/activePldFirmware'
      ];
      return {
        [i18n.t('pagePldFirmware.cardBodyVersion')]: pldFirmwareContent?.version
          ? pldFirmwareContent?.version
          : '--',
      };
    },
    availableUploadType() {
      let availableType = ['post'];
      if (this.$store.getters['firmware/isTftpUploadAvailable']) {
        availableType.push('tftp');
      }
      return availableType;
    },
    isPageDisabled() {
      return this.loading;
    },
  },
  created() {
    let vm = this;
    vm.startLoader();
    vm.$store
      .dispatch('firmware/getUpdateServiceSettings')
      .then(() => {
        return vm.$store.dispatch('firmware/getPldFirmwareInventory', {
          url: vm.$store.getters['firmware/firmwareInventoryUrl'],
        });
      })
      .catch(({ message }) => vm.errorToast(message))
      .finally(() => vm.endLoader());
  },
  methods: {
    confirmUpdate({ type, data }) {
      let vm = this;
      vm.type = type;
      vm.data = data;
      vm.$bvModal.show(`firmware-${vm.firmwareType}-modal`);
    },
    updatePldFirmware() {
      let vm = this;
      vm.startLoader();
      const timerId = setTimeout(() => {
        this.endLoader();
        this.infoToast(this.$t('pagePldFirmware.toast.verifyUpdateMessage'), {
          title: this.$t('pagePldFirmware.toast.verifyUpdate'),
          refreshAction: true,
        });
      }, 360000);
      this.infoToast(this.$t('pagePldFirmware.toast.updateStartedMessage'), {
        title: this.$t('pagePldFirmware.toast.updateStarted'),
        timestamp: true,
      });
      switch (vm.type) {
        case 'post':
          vm.dispatchPostUpload(timerId);
          break;
        case 'tftp':
          vm.dispatchTftpUpload(timerId);
          break;
      }
    },
    // post
    dispatchPostUpload(timerId) {
      this.$store
        .dispatch('firmware/uploadFirmware', this.data.file)
        .catch(({ message }) => {
          this.endLoader();
          this.errorToast(message);
          clearTimeout(timerId);
        });
    },
    // tftp
    dispatchTftpUpload(timerId) {
      this.$store
        .dispatch('firmware/uploadFirmwareTFTP', this.data.fileAddress)
        .catch(({ message }) => {
          this.endLoader();
          this.errorToast(message);
          clearTimeout(timerId);
        });
    },
  },
};
</script>
