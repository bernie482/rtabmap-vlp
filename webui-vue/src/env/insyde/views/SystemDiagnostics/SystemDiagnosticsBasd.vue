<template>
  <page-section :section-title="$t('pageSystemDiagnostics.basd.title')">
    <b-row align-v="center">
      <b-col cols="auto">
        <label>
          {{ $t('pageSystemDiagnostics.basd.type') }}
        </label>
      </b-col>
      <b-col cols="auto">
        <select
          v-model="form.selectedTypeIndex"
          class="select-blue"
          :disabled="basdLogs.length === 0 || loading"
          @change="onChangeLogType"
        >
          <option v-if="basdLogs.length === 0" value="-1">NA</option>
          <option v-for="(val, idx) in basdLogs" :key="idx" :value="idx">
            {{ val.TYPE }}
          </option>
        </select>
      </b-col>
      <b-col cols="auto">
        <input
          v-show="basdLogSelectedLog && basdLogSelectedLog.ONDEMAND"
          type="button"
          class="button"
          :value="$t('pageSystemDiagnostics.basd.trigger')"
          :disabled="loading || basdTriggerRunning"
          @click="onTrigger"
        />
      </b-col>
    </b-row>
    <b-row align-v="center">
      <b-col cols="auto">
        <label>
          {{ $t('pageSystemDiagnostics.basd.file') }}
        </label>
      </b-col>
      <b-col cols="auto">
        <select
          v-model="form.selectedFileIndex"
          class="select-blue"
          :disabled="filelist.length === 0 || loading"
          @change="onChangeLogFile"
        >
          <option v-if="filelist.length === 0" value="-1">NA</option>
          <option v-for="(val, idx) in filelist" :key="idx" :value="idx">
            {{ val }}
          </option>
        </select>
      </b-col>
      <b-col cols="auto">
        <file-downloader
          class="mb-2 rounded-lg"
          :disabled="filelist.length === 0 || loading"
          :download-func="doDownload"
        >
          {{ $t('global.action.download') }}
        </file-downloader>
      </b-col>
    </b-row>
    <b-row align-v="center">
      <b-col cols="auto">
        <label>
          {{ $t('pageSystemDiagnostics.basd.desc') }}
        </label>
      </b-col>
      <b-col cols="auto">
        <label>
          {{ (basdLogSelectedLog && basdLogSelectedLog.DESC) || '' }}
        </label>
      </b-col>
    </b-row>
    <div>
      <div v-if="Boolean(fileContent)">
        <textarea v-model="fileContent" class="logshow" readonly="" />
      </div>
      <div v-else class="error-wrapper">
        <insyde-unavailable
          :msg="$t('pageSystemDiagnostics.basd.unavailable')"
        />
      </div>
    </div>
  </page-section>
</template>

<script>
import PageSection from '@/components/Global/PageSection';
import FileDownloader from '@/env/insyde/components/FileDownloader/FileDownloader';

export default {
  components: { PageSection, FileDownloader },

  data() {
    return {
      loading: true,
      filelist: [],
      fileContent: '',
      form: {
        selectedTypeIndex: -1,
        selectedFileIndex: -1,
      },
    };
  },
  computed: {
    basdLogStatus() {
      return this.$store.getters['diagnostics/basdLogStatus'];
    },
    basdLogs() {
      return this.basdLogStatus?.BASDLOG ?? [];
    },
    basdLogSelectedLog() {
      return this.basdLogs[this.form.selectedTypeIndex];
    },
    basdLogSelectsedFile() {
      return this.basdLogSelectedLog.LOGZIP[this.form.selectedFileIndex];
    },
    basdTriggerRunning() {
      return this.$store.getters['diagnostics/basdTriggerRunning'];
    },
  },
  watch: {
    '$store.state.ws.basd.readyNotify': function () {
      this.$store.commit('diagnostics/basdTriggerRunning', false);
    },
  },
  created() {
    this.$store
      .dispatch('diagnostics/getBasdLogStatus')
      .then(() => {
        this.updateFiles(true);
      })
      .catch(({ message }) => this.errorToast(message))
      .finally(() => {
        // Emit initial data fetch complete to parent component
        this.loading = false;
        this.$root.$emit('system-diagnostics-basd-complete');
      });
  },
  methods: {
    updateFiles(init) {
      this.filelist = [];
      if (this.basdLogs.length <= 0) {
        this.form.selectedTypeIndex = -1;
      } else {
        if (init) this.form.selectedTypeIndex = 0;
        let basdLogFiles = this.basdLogSelectedLog.LOGZIP;
        if (basdLogFiles.length <= 0) {
          this.form.selectedFileIndex = -1;
        } else {
          // Create file list
          for (let i = 0; i < basdLogFiles.length; i++) {
            let fname = basdLogFiles[i].FILENAME.split('/');
            this.filelist.push(fname[fname.length - 1]);
          }
          this.updateContent(true);
        }
      }
    },
    updateContent(init) {
      this.fileContent = '';
      if (init) this.form.selectedFileIndex = 0;
      let loginfos = this.basdLogSelectsedFile.LOGINFO;
      let content = '';
      for (let i = 0; i < loginfos.length; i++) {
        content += loginfos[i].CONTENT;
      }
      this.fileContent = content;
    },
    onTrigger() {
      this.startLoader();

      this.$store
        .dispatch(
          'diagnostics/triggerBasdLog',
          this.basdLogs[this.form.selectedTypeIndex].TYPE
        )
        .then(() => {
          this.successToast(
            this.$t('pageSystemDiagnostics.basd.toast.onTrigger')
          );
          this.$store.commit('diagnostics/basdTriggerRunning', true);
        })
        .catch(({ message }) => this.errorToast(message))
        .finally(() => {
          this.endLoader();
        });
    },
    onChangeLogType() {
      this.updateFiles(false);
    },
    onChangeLogFile() {
      this.updateContent(false);
    },
    doDownload(processFileFunc) {
      let filename = this.filelist[this.form.selectedFileIndex];
      if (!filename) {
        return;
      }
      this.startLoader();

      this.$store
        .dispatch('diagnostics/downloadBasdLog', filename)
        .then(processFileFunc)
        .catch(({ message }) => this.errorToast(message))
        .finally(() => {
          this.endLoader();
        });
    },
  },
};
</script>

<style scoped>
.logshow {
  width: 100%;
  overflow: hidden;
  height: 180px;
  max-height: 300px;
  overflow-y: auto;
  resize: none;
}
</style>
