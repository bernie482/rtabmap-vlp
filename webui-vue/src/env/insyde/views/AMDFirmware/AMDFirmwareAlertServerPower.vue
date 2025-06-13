<template>
  <b-row>
    <b-col xl="10">
      <!-- Operation in progress alert -->
      <alert v-if="isOperationInProgress" variant="info" class="mb-5">
        <p>
          {{ $t('pageamdFirmware.alert.operationInProgress') }}
        </p>
      </alert>
      <!-- Power off server warning alert -->
      <alert v-else-if="!isServerOff" variant="warning" class="mb-5">
        <p class="mb-0">
          {{ $t('pageamdFirmware.alert.serverMustBePoweredOffTo') }}
        </p>
        <ul class="m-0">
          <li>
            {{ $t('pageamdFirmware.alert.switchRunningAndBackupImages') }}
          </li>
          <li>
            {{ $t('pageamdFirmware.alert.updateFirmware') }}
          </li>
        </ul>
        <template #action>
          <b-link to="/operations/server-power-operations">
            {{ $t('pageamdFirmware.alert.viewServerPowerOperations') }}
          </b-link>
        </template>
      </alert>
    </b-col>
  </b-row>
</template>

<script>
import Alert from '@/components/Global/Alert';

export default {
  components: { Alert },
  props: {
    isServerOff: {
      required: true,
      type: Boolean,
    },
  },
  computed: {
    isOperationInProgress() {
      return this.$store.getters['controls/isOperationInProgress'];
    },
  },
};
</script>
