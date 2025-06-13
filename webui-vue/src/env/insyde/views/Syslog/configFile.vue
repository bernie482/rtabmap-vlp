<template>
  <b-container fluid="x1">
    <page-section :section-title="$t('appPageTitle.DIAG_SYSLOG_P30')">
      <b-row b-col="2">
        <b-col md="2">
          <label>{{ $t('pageSyslog.SYSLOG_IMPORT_FILE') }} </label>
        </b-col>
        <b-col>
          <input ref="path" type="file" @change="importfileChange" />
        </b-col>
      </b-row>
      <b-row b-col="3">
        <b-col md="2"></b-col>
        <b-col md="1">
          <b-button
            variant="secondary"
            :disabled="disabled"
            @click="importConfig"
          >
            {{ $t('global.action.import') }}
          </b-button>
        </b-col>
        <b-col>
          <label class="gray-info-color"
            >{{ $t('pageSyslog.SYSLOG_BTN_IMPORT_INFO') }}
          </label>
        </b-col>
      </b-row>
      <b-row b-col="3">
        <b-col md="2">
          <label>{{ $t('pageSyslog.SYSLOG_EXPORT_FILE') }}</label>
        </b-col>
        <b-col md="2">
          <file-downloader
            class="mb-2 rounded-lg btn-primary-spacing"
            :download-func="exportConfig"
            >{{ $t('global.action.export') }}
          </file-downloader>
        </b-col>
        <b-col>
          <label class="gray-info-color"
            >{{ $t('pageSyslog.SYSLOG_BTN_EXPORT_INFO') }}
          </label>
        </b-col>
      </b-row>
    </page-section>
  </b-container>
</template>

<script>
import PageSection from '@/components/Global/PageSection';
import FileDownloader from '@/env/insyde/components/FileDownloader/FileDownloader';
export default {
  name: 'ConfigFile',
  components: {
    PageSection,
    FileDownloader,
  },

  data() {
    return {
      file: '',
      fileobj: null,
      disabled: true,
    };
  },
  computed: {},
  created() {},
  methods: {
    importfileChange(e) {
      const MAX_FILE_SIZE = 1024 * 1024;
      this.fileobj = e.target.files[0];
      if (this.fileobj.size > MAX_FILE_SIZE) {
        this.errorToast(this.$t('pageSyslog.SYSLOG_FILE_ERROR_MSG'));
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
    exportConfig(processFileFunc) {
      const dbgutl = this;
      dbgutl.startLoader();
      dbgutl.$store
        .dispatch('syslog/exportConfFile')
        .then(processFileFunc)
        .catch((message) => {
          dbgutl.errorToast(message);
        })
        .finally(dbgutl.endLoader());
    },
    importConfig() {
      const dbgutl = this;
      dbgutl.startLoader();
      dbgutl.$store
        .dispatch('syslog/importConfig', dbgutl.file)
        .then((success) => {
          dbgutl.$refs.path.value = null;
          dbgutl.disabled = true;
          dbgutl.successToast(success);
        })
        .catch((message) => {
          dbgutl.errorToast(message);
        })
        .finally(dbgutl.endLoader());
    },
  },
};
</script>
<style lang="scss" scoped>
.gray-info-color {
  color: #b8b8b8;
}
</style>
