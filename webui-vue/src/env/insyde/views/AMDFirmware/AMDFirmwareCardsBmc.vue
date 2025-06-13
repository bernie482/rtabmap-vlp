<template>
  <div>
    <page-section :section-title="sectionTitle">
      <b-card-group deck>
        <!-- Running image -->
        <b-card>
          <template #header>
            <p class="font-weight-bold m-0">
              {{ $t('pageamdFirmware.cardTitleRunning') }}
            </p>
          </template>
          <dl class="mb-0">
            <dt>{{ $t('pageamdFirmware.cardBodyVersion') }}</dt>
            <dd class="mb-0">{{ runningVersion }}</dd>
          </dl>
        </b-card>

        <!-- Backup image -->
        <b-card>
          <template #header>
            <p class="font-weight-bold m-0">
              {{ $t('pageamdFirmware.cardTitleBackup') }}
            </p>
          </template>
          <dl>
            <dt>{{ $t('pageamdFirmware.cardBodyVersion') }}</dt>
            <dd>
              <status-icon v-if="showBackupImageStatus" status="danger" />
              <span v-if="showBackupImageStatus" class="sr-only">
                {{ backupStatus }}
              </span>
              {{ backupVersion }}
            </dd>
          </dl>
        </b-card>
      </b-card-group>
    </page-section>
    <modal-switch-to-running :backup="backupVersion" @ok="switchToRunning" />
  </div>
</template>

<script>
import PageSection from '@/components/Global/PageSection';

import ModalSwitchToRunning from './AMDFirmwareModalSwitchToRunning';

export default {
  components: { ModalSwitchToRunning, PageSection },

  props: {
    isPageDisabled: {
      required: true,
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      switchToBackupImageDisabled:
        process.env.VUE_APP_SWITCH_TO_BACKUP_IMAGE_DISABLED === 'true',
    };
  },
  computed: {
    isSingleFileUploadEnabled() {
      return this.$store.getters['firmware/isSingleFileUploadEnabled'];
    },
    sectionTitle() {
      if (this.isSingleFileUploadEnabled) {
        return this.$t('pageamdFirmware.sectionTitleBmcCardsCombined');
      }
      return this.$t('pageamdFirmware.sectionTitleBmcCards');
    },
    running() {
      return this.$store.getters['firmware/activeBmcFirmware'];
    },
    backup() {
      return this.$store.getters['firmware/backupBmcFirmware'];
    },
    runningVersion() {
      return this.running?.version || '--';
    },
    backupVersion() {
      return this.backup?.version || '--';
    },
    backupStatus() {
      return this.backup?.status || null;
    },
    showBackupImageStatus() {
      return (
        this.backupStatus === 'Critical' || this.backupStatus === 'Warning'
      );
    },
  },
  methods: {
    switchToRunning() {
      this.startLoader();
      const timerId = setTimeout(() => {
        this.endLoader();
        this.infoToast(this.$t('pageamdFirmware.toast.verifySwitchMessage'), {
          title: this.$t('pageamdFirmware.toast.verifySwitch'),
          refreshAction: true,
        });
      }, 60000);

      this.$store
        .dispatch('firmware/switchBmcFirmwareAndReboot')
        .then(() =>
          this.infoToast(
            this.$t('pageamdFirmware.toast.rebootStartedMessage'),
            {
              title: this.$t('pageamdFirmware.toast.rebootStarted'),
            }
          )
        )
        .catch(({ message }) => {
          this.errorToast(message);
          clearTimeout(timerId);
          this.endLoader();
        });
    },
  },
};
</script>
