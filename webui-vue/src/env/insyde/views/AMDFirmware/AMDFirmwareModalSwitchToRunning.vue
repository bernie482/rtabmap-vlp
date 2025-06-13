<template>
  <b-modal
    id="modal-switch-to-running"
    :ok-title="$t('pageamdFirmware.modal.switchImages')"
    :cancel-title="$t('global.action.cancel')"
    :title="$t('pageamdFirmware.modal.switchRunningImage')"
    @ok="$emit('ok')"
  >
    <p>
      {{ $t('pageamdFirmware.modal.switchRunningImageInfo') }}
    </p>
    <p class="m-0">
      {{
        $t('pageamdFirmware.modal.switchRunningImageInfo2', {
          backup,
        })
      }}
    </p>
  </b-modal>
</template>

<script>
export default {
  props: {
    backup: {
      type: String,
      required: true,
    },
  },
};
</script>
