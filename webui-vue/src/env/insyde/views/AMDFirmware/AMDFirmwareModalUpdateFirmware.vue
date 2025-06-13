<template>
  <b-modal
    id="modal-update-firmware"
    :title="$t('pageamdFirmware.sectionTitleUpdateFirmware')"
    :ok-title="$t('pageamdFirmware.form.updateFirmware.startUpdate')"
    :cancel-title="$t('global.action.cancel')"
    @ok="$emit('ok')"
  >
    <template v-if="isSingleFileUploadEnabled">
      <p>
        {{ $t('pageamdFirmware.modal.updateFirmwareInfo') }}
      </p>
      <p>
        {{
          $t('pageamdFirmware.modal.updateFirmwareInfo2', {
            running: runningBmcVersion,
          })
        }}
      </p>
      <p class="m-0">
        {{ $t('pageamdFirmware.modal.updateFirmwareInfo3') }}
      </p>
    </template>
    <template v-else>
      {{ $t('pageamdFirmware.modal.updateFirmwareInfoDefault') }}
    </template>
  </b-modal>
</template>

<script>
export default {
  computed: {
    runningBmc() {
      return this.$store.getters['firmware/activeBmcFirmware'];
    },
    runningBmcVersion() {
      return this.runningBmc?.version || '--';
    },
    isSingleFileUploadEnabled() {
      return this.$store.getters['firmware/isSingleFileUploadEnabled'];
    },
  },
};
</script>
