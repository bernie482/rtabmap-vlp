<template>
  <b-container fluid="x1">
    <page-section
      :section-title="$t('pageBackupRestore.backupBiosSettings.title')"
    >
      <div class="form-background pl-4 pt-4 pb-1">
        <b-row>
          <b-col>
            <b-button
              variant="primary"
              :disabled="disabledbiosbtn"
              @click="backupBiosSettings"
            >
              {{ $t('global.action.backup') }}
            </b-button>
          </b-col>
        </b-row>
      </div>
    </page-section>
    <page-section
      :section-title="$t('pageBackupRestore.restoreBiosSettings.title')"
    >
      <div class="form-background pl-4 pt-4 pb-1">
        <b-row b-col="2">
          <b-col md="2"><label>Restore File</label></b-col>
          <b-col md="1"
            ><input ref="path" type="file" @change="fileChange"
          /></b-col>
        </b-row>
        <b-row>
          <b-col>
            <b-button
              variant="secondary"
              :disabled="disabled"
              @click="restoreBiosSettings"
            >
              {{ $t('global.action.restore') }}
            </b-button>
          </b-col>
        </b-row>
      </div>
    </page-section>
  </b-container>
</template>

<script>
import PageSection from '@/components/Global/PageSection';
import { fileDownloader } from '@/env/insyde/utilities/InsydeTools';
import { mapState } from 'vuex';

export default {
  name: 'BackupRestore',
  components: {
    PageSection,
  },

  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
  data() {
    return {
      disabled: true,
      disabledbiosbtn: true,
      file: '',
      fileobj: null,
    };
  },
  computed: {
    ...mapState('backuprestore', ['backupBiosResult']),
  },
  created() {
    const backuprestorebios = this;
    backuprestorebios.startLoader();
    Promise.all(
      [backuprestorebios.getBackupBiosStatus()],
      [backuprestorebios.getRedfishStatus()]
    ).finally(() => backuprestorebios.endLoader());
  },
  methods: {
    disabledBiosUploadOption(disbaled) {
      this.disabledbiosbtn = !disbaled;
    },
    fileChange(e) {
      const MAX_FILE_SIZE = 0x100000;
      this.fileobj = e.target.files[0];
      if (this.fileobj.size > MAX_FILE_SIZE) {
        this.errorToast(this.$t('pageBackupRestore.toast.errorRestoreFile'));
        return;
      }
      let reader = new FileReader();
      reader.onload = () => {
        this.file = reader.result;
      };
      reader.readAsText(this.fileobj);
      this.$refs.path.value != null
        ? (this.disabled = false)
        : (this.disabled = true);
    },
    getRedfishStatus() {
      const backuprestorebios = this;
      backuprestorebios.startLoader();
      backuprestorebios.$store
        .dispatch('backuprestore/getRedfishStatus')
        .then((message) => {
          backuprestorebios.successToast(message);
        })
        .catch((message) => {
          backuprestorebios.errorToast(message);
        })
        .finally(() => {
          backuprestorebios.endLoader();
        });
    },
    getBackupBiosStatus() {
      const backuprestorebios = this;
      backuprestorebios.startLoader();
      backuprestorebios.$store
        .dispatch('backuprestore/getBackupBiosStatus')
        .then((message) => {
          if (message == 0) {
            backuprestorebios.errorToast();
            this.disabledBiosUploadOption(false);
          } else {
            this.disabledBiosUploadOption(true);
            backuprestorebios.successToast();
          }
        })
        .catch((message) => {
          this.disabledBiosUploadOption(false);
          backuprestorebios.errorToast(message);
        })
        .finally(() => {
          backuprestorebios.endLoader();
        });
    },
    restoreBiosSettings() {
      let restorebiossettings = this;
      restorebiossettings.startLoader();
      restorebiossettings.$store
        .dispatch('backuprestore/restoreBiosSettings', this.file)
        .then((message) => {
          console.log(message);
          restorebiossettings.$refs.path.value = null;
          restorebiossettings.disabled = true;
          restorebiossettings.successToast(message);
        })
        .catch((message) => {
          restorebiossettings.errorToast(message);
        })
        .finally(() => {
          restorebiossettings.endLoader();
        });
    },
    backupBiosSettings() {
      let backupbiossettings = this;
      backupbiossettings.startLoader();
      backupbiossettings.$store
        .dispatch('backuprestore/backupBiosSettings')
        .then((message) => {
          console.log(this.backupBiosResult);
          if (this.backupBiosResult == 'success') {
            fileDownloader({
              url: '/cgi/backup_bios_config.cgi',
              filename: 'file.download',
              mineType: 'txt',
            });
            backupbiossettings.successToast(message);
          } else {
            backupbiossettings.errorToast(message);
          }
        })
        .catch((message) => {
          backupbiossettings.errorToast(message);
        })
        .finally(() => {
          backupbiossettings.endLoader();
        });
    },
  },
};
</script>
<style></style>
