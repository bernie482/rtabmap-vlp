<template>
  <page-section :section-title="$t('pageSystemDiagnostics.acd.title')">
    <div>
      <b-row align-v="center">
        <b-col cols="auto">
          <label>
            {{ $t('pageSystemDiagnostics.acd.enable') }}
          </label>
        </b-col>
        <b-col cols="auto">
          <input
            v-model="form.enable"
            type="checkbox"
            :disabled="loading"
            @change="toggleEnable"
          />
        </b-col>
      </b-row>
      <b-row align-v="center">
        <b-col cols="auto">
          <label>
            {{ $t('pageSystemDiagnostics.acd.file') }}
          </label>
        </b-col>
        <b-col cols="auto">
          <select
            v-model="form.fileindex"
            class="select-blue"
            :disabled="filelist.length === 0 || loading"
            @change="onSelect"
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
    </div>
    <div>
      <div v-show="Boolean(analyzedContent)">
        <label>
          {{ $t('pageSystemDiagnostics.acd.analyzedData') }}
        </label>
        <textarea v-model="analyzedContent" class="logshow" readonly="" />
      </div>
      <div v-show="Boolean(fileContent)">
        <label>
          {{ $t('pageSystemDiagnostics.acd.rawData') }}
        </label>
        <textarea v-model="fileContent" class="logshow" readonly="" />
      </div>
      <div
        v-show="!Boolean(analyzedContent) && !Boolean(fileContent)"
        class="error-wrapper"
      >
        <insyde-unavailable
          :msg="$t('pageSystemDiagnostics.acd.unavailable')"
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
      timer: undefined,
      filelist: [],
      fileContent: '',
      analyzedContent: '',
      form: {
        enable: false,
        fileindex: -1,
      },
    };
  },
  computed: {
    acdLogStatus() {
      return this.$store.getters['diagnostics/acdLogStatus'];
    },
  },
  watch: {
    '$store.state.ws.acd.readyNotify': function () {
      this.startLoader();

      this.$store
        .dispatch('diagnostics/getAcdLogStatus')
        .then(() => this.showAcdLog())
        .catch(({ message }) => this.errorToast(message))
        .finally(() => {
          this.endLoader();
        });
    },
  },
  created() {
    this.$store
      .dispatch('diagnostics/getAcdLogStatus')
      .then(() => this.showAcdLog())
      .catch(({ message }) => this.errorToast(message))
      .finally(() => {
        // Emit initial data fetch complete to parent component
        this.loading = false;
        this.$root.$emit('system-diagnostics-acd-complete');
      });
  },
  destroyed() {
    clearTimeout(this.timer);
  },
  methods: {
    showAcdLog() {
      this.form.enable = this.acdLogStatus?.ACDLOGENABLE ?? false;
      if ((this.acdLogStatus?.ACDLOG?.length ?? 0) > 0) {
        this.filelist = [];
        this.fileContent = '';
        this.analyzedContent = '';
        let acdlog = this.acdLogStatus.ACDLOG;
        if (acdlog[0]?.FILENAME && acdlog[0]?.LOGINFO) {
          // Default select the first one.
          this.form.fileindex = 0;
          for (let i = 0; i < acdlog.length; i++) {
            let fname = acdlog[i].FILENAME.split('/');
            this.filelist.push(fname[fname.length - 1]);
            let content = '';
            for (let k = 0; k < acdlog[0].LOGINFO.length; k++) {
              content = content + acdlog[0].LOGINFO[k].CONTENT;
            }
            this.fileContent = content;
          }
          if (this.acdLogStatus?.ACDLOG_ANALYZED) {
            let acdlog_analyzed = this.acdLogStatus.ACDLOG_ANALYZED;
            let content_analyzed = '';
            if ((acdlog_analyzed[0]?.LOGINFO?.length ?? 0) > 0) {
              for (let k = 0; k < acdlog_analyzed[0].LOGINFO.length; k++) {
                content_analyzed =
                  content_analyzed + acdlog_analyzed[0].LOGINFO[k].CONTENT;
              }
              this.analyzedContent = content_analyzed;
            }
          }
        }
      }
    },
    checkAcdLogService() {
      this.$store
        .dispatch('diagnostics/checkAcdLogService')
        .then(() => {
          if (this.form.enable !== this.acdLogStatus.ACDLOGENABLE) {
            this.timer = setTimeout(this.checkAcdLogService, 4000);
          } else {
            this.successToast();
            this.endLoader();
          }
        })
        .catch(({ message }) => this.errorToast(message));
    },
    toggleEnable() {
      this.startLoader();

      this.$store
        .dispatch('diagnostics/setAcdLogEnable', this.form.enable)
        .then(() => {
          this.checkAcdLogService();
        })
        .catch(({ message }) => this.errorToast(message));
    },
    onSelect() {
      let index = this.form.fileindex;

      // Raw LOG
      let acdLogInfo = this?.acdLogStatus?.ACDLOG[index]?.LOGINFO ?? [];
      let content = '';
      for (let i = 0; i < acdLogInfo.length; i++) {
        content = content + acdLogInfo[i].CONTENT;
      }
      this.fileContent = content;

      // Analyzed LOG
      let analyzedLogInfo =
        this?.acdLogStatus?.ACDLOG_ANALYZED[index]?.LOGINFO ?? [];
      let content_analyzed = '';
      for (let i = 0; i < analyzedLogInfo.length; i++) {
        content_analyzed = content_analyzed + analyzedLogInfo[i].CONTENT;
      }
      this.analyzedContent = content_analyzed;
    },
    doDownload(processFileFunc) {
      let filename = this.filelist[this.form.fileindex];
      if (!filename) {
        return;
      }
      this.startLoader();

      this.$store
        .dispatch('diagnostics/downloadAcdLog', filename)
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
