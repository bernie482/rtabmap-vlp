<template>
  <b-container fluid="x1">
    <page-section :section-title="$t('pageBackupRestore.backupBMCRom.title')">
      <div class="form-background pl-4 pt-4 pb-1">
        <b-row>
          <b-col>
            <b-button variant="primary" @click="backupBmcRom">
              {{ $t('global.action.backup') }}
            </b-button>
          </b-col>
        </b-row>
        <b-row align-v="center">
          <b-col cols="auto">
            <span>{{ $t('pageBackupRestore.backupBMCRom.messageLable') }}</span>
          </b-col>
          <b-col cols="auto">
            <span :style="messageStyle">{{ getStatus }}</span>
            <span v-if="FW_ROM.STATUS != 0" :style="messageStyle"
              >{{ FW_ROM.PERCENT }}{{ getPercent }}</span
            >
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
      backupcheck: false,
      disabledbtn: false,
      messageText: '',
      messageStyle: '',
      formData: new FormData(),
    };
  },
  computed: {
    ...mapState('backuprestore', ['FW_ROM']),
    getStatus() {
      if (this.FW_ROM.STATUS == 0) return 'OK';
      else return 'processing ';
    },
    getPercent() {
      if (this.FW_ROM.STATUS != 0) return ' %';
      else return ' ';
    },
    backupstate() {
      return BackupCheckParser(
        this.$store.getters['backuprestore/backuprestorestate']
      );
    },
  },
  created() {
    const backupflashrom = this;
    backupflashrom.startLoader();
    Promise.all([backupflashrom.getFlashRomStatus()]).finally(() =>
      backupflashrom.endLoader()
    );
  },
  destroyed() {
    clearTimeout(this.timer);
  },
  methods: {
    getFlashRomStatus() {
      const backupflashrom = this;
      backupflashrom.startLoader();
      backupflashrom.$store
        .dispatch('backuprestore/getFlashRomStatus')
        .then(() => {
          if (this.FW_ROM.STATUS == 1) {
            this.timer = setTimeout(this.getFlashRomStatus, 1500);
          } else if (this.FW_ROM.STATUS == 2) {
            fileDownloader({
              url: '/web-fwupd/flash-dump.bin',
              filename: 'flash-dump.rom',
            });
            backupflashrom.$store
              .dispatch('backuprestore/delFlashRom')
              .then((message) => {
                backupflashrom.successToast(message);
              })
              .catch((message) => {
                backupflashrom.errorToast(message);
              })
              .finally(() => {
                backupflashrom.endLoader();
              });
          }
        })
        .finally(() => {
          backupflashrom.endLoader();
        });
    },
    backupBmcRom() {
      let backuprom = this;
      backuprom.startLoader();

      backuprom.$store
        .dispatch('backuprestore/backupBmcRom')
        .then((message) => {
          console.info(message);
          if (message == 'success') {
            this.timer = setTimeout(this.getFlashRomStatus, 1500);
          } else {
            backuprom.errorToast(message);
          }
        })
        .catch((message) => {
          backuprom.errorToast(message);
        })
        .finally(() => {
          backuprom.endLoader();
        });
    },
  },
};
</script>
<style></style>
