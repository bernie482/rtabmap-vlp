<template>
  <b-container fluid="x1">
    <page-section
      :section-title="$t('pageBackupRestore.backupBMCSettings.title')"
    >
      <div class="form-background pl-4 pt-4 pb-1">
        <b-row>
          <b-col>
            <b-button variant="primary" @click="backupBmcSettings">
              {{ $t('global.action.backup') }}
            </b-button>
          </b-col>
        </b-row>
      </div>
    </page-section>
    <page-section
      :section-title="$t('pageBackupRestore.restoreBMCSettings.title')"
    >
      <div class="form-background pl-4 pt-4 pb-1">
        <b-row b-col="2">
          <b-col md="2"><label>Restore File</label></b-col>
          <b-col md="1"
            ><input type="file" :disabled="disabledbtn" @change="fileChange"
          /></b-col>
        </b-row>
        <b-row>
          <b-col>
            <b-button
              variant="secondary"
              :disabled="disabledbtn"
              @click="UploadRestoreFile"
            >
              {{ $t('global.action.upload') }}
            </b-button>
          </b-col>
        </b-row>
        <hr />
        <b-row>
          <b-col>
            <b-button variant="primary" @click="restoreBmcSettings">
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
import { BackupCheckParser } from '@/env/insyde/components/Mixins/BackupRestoreTableParserMixin';
import { fileDownloader } from '@/env/insyde/utilities/InsydeTools';

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
      backupcheck: false,
      disabledbtn: false,
      formData: new FormData(),
    };
  },
  computed: {
    backupstate() {
      return BackupCheckParser(
        this.$store.getters['backuprestore/backuprestorestate']
      );
    },
  },
  methods: {
    disabledUploadOption(disbaled) {
      this.disabledbtn = !disbaled;
    },
    fileChange(e) {
      this.formData.append('backupfile', e.target.files[0]);
    },
    UploadRestoreFile() {
      let uploadfile = this;
      let backupfile = uploadfile.formData;
      uploadfile.startLoader();
      uploadfile.$store
        .dispatch('backuprestore/uploadRestoreFile', backupfile)
        .then((success) => {
          uploadfile.successToast(success);
        })
        .catch((message) => {
          uploadfile.errorToast(message);
        })
        .finally(() => {
          uploadfile.endLoader();
        });
    },
    restoreBmcSettings() {
      let restoresettings = this;
      restoresettings.startLoader();
      restoresettings.$store
        .dispatch('backuprestore/restoreBmcSettings')
        .then((message) => {
          restoresettings.successToast(message);
        })
        .catch((message) => {
          restoresettings.errorToast(message);
        })
        .finally(() => {
          restoresettings.endLoader();
        });
    },
    backupBmcSettings() {
      let backupsettings = this;
      backupsettings.startLoader();
      backupsettings.$store
        .dispatch('backuprestore/backupBmcSettings')
        .then((message) => {
          if (message == 'OK') {
            fileDownloader({
              url: '/cgi/ipmiconf_backup_restore.cgi',
              filename: 'backup256.bin',
            });
            backupsettings.successToast(message);
          } else {
            backupsettings.errorToast(message);
          }
        })
        .catch((message) => {
          backupsettings.errorToast(message);
        })
        .finally(() => {
          backupsettings.endLoader();
        });
    },
  },
};
</script>
<style></style>
