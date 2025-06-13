<template>
  <page-section :section-title="$t('pageSystemDiagnostics.debug.title')">
    <b-row align-v="center">
      <b-col cols="auto">
        <p>{{ $t('pageSystemDiagnostics.debug.interpretion') }}</p>
      </b-col>
    </b-row>
    <b-row align-v="center">
      <b-col cols="auto">
        <insyde-text-input
          v-model="password"
          type="password"
          maxlength="16"
          class="width200"
          :v="$v.password"
        />
      </b-col>
      <b-col cols="auto">
        <span v-if="$v.password.$invalid" class="info explain error">
          {{ $t('pageSystemDiagnostics.debug.passwordError') }}
        </span>
        <span v-else>{{ $t('pageSystemDiagnostics.debug.passwordDesc') }}</span>
      </b-col>
    </b-row>
    <b-row align-v="center">
      <b-col cols="auto">
        <input
          type="button"
          class="button"
          value="Generate Logs"
          :disabled="password === '' || $v.password.$invalid"
          @click="doGenerate"
        />
      </b-col>
      <b-col cols="auto">
        <span class="info">
          {{ $t('pageSystemDiagnostics.debug.generateDesc') }}
        </span>
      </b-col>
    </b-row>
    <b-row align-v="center">
      <b-col cols="auto">
        <file-downloader
          class="mb-2 rounded-lg"
          :disabled="!downloadable"
          :download-func="doDownload"
        >
          {{ $t('global.action.download') }}
        </file-downloader>
      </b-col>
      <b-col cols="auto">
        <span class="info">
          {{ $t('pageSystemDiagnostics.debug.downloadDesc') }}
        </span>
      </b-col>
    </b-row>
    <b-row align-v="center">
      <b-col cols="auto">
        <span>{{ $t('pageSystemDiagnostics.debug.generatedLabel') }}</span>
      </b-col>
      <b-col cols="auto">
        <span :style="messageStyle">{{ messageText }}</span>
      </b-col>
    </b-row>
  </page-section>
</template>

<script>
import PageSection from '@/components/Global/PageSection';
import InsydeTextInput from '@/env/insyde/components/InsydeTextInput';
import FileDownloader from '@/env/insyde/components/FileDownloader/FileDownloader';
import { minLength } from 'vuelidate/lib/validators';

export default {
  components: { PageSection, InsydeTextInput, FileDownloader },

  data() {
    return {
      loading: true,
      timer: undefined,
      password: '',
      downloadable: false,
      messageText: '',
      messageStyle: '',
      complete: false,
    };
  },
  computed: {
    debugLogStatus() {
      return this.$store.getters['diagnostics/debugLogStatus'];
    },
  },
  validations: {
    password: {
      minLength: minLength(8),
    },
  },
  created() {
    this.getStatus();
  },
  destroyed() {
    clearTimeout(this.timer);
  },
  methods: {
    setLoading(enable) {
      if (enable) {
        if (!this.loading) {
          this.startLoader();
        }
      } else {
        if (!this.complete) {
          // Emit initial data fetch complete to parent component
          this.$root.$emit('system-diagnostics-main-complete');
          this.complete = true;
        } else {
          this.endLoader();
        }
      }
      this.loading = enable;
    },
    getStatus() {
      this.$store
        .dispatch('diagnostics/getDebugLogStatus')
        .then(() => {
          let state = this.debugLogStatus.state;
          const IDLE = 0,
            ENTER = 1,
            BEGIN = 2,
            END = 3,
            READ = 4;
          if (state == IDLE) {
            this.updateGenertedTime(
              this.debugLogStatus.time,
              this.debugLogStatus.offset
            );
            this.messageStyle = {
              'font-size': '16px',
              color: '#0077ae',
              'font-style': 'italic',
            };
            this.setLoading(false);
          } else if (
            state == ENTER ||
            state == BEGIN ||
            state == END ||
            state == READ
          ) {
            this.downloadable = false;
            this.messageText = this.$t('pageSystemDiagnostics.debug.running');
            this.messageStyle = {
              'font-size': '16px',
              color: '#0077ae',
              'font-style': 'italic',
            };
            this.timer = setTimeout(this.getStatus, 1200);
          } else {
            this.downloadable = false;
            this.messageText = this.$t(
              'pageSystemDiagnostics.debug.unknownError'
            );
            this.messageStyle = { color: '#f44336' };
            this.setLoading(false);
          }
        })
        .catch(({ message }) => {
          this.errorToast(message);
          this.setLoading(false);
        });
    },
    doGenerate() {
      this.setLoading(true);
      this.$store
        .dispatch('diagnostics/generateDebugLog', this.password)
        .then(() => {
          this.successToast(
            this.$t('pageSystemDiagnostics.debug.toast.generateStart')
          );
          this.getStatus();
        })
        .catch(({ message }) => {
          this.setLoading(false);
          this.errorToast(message);
        });
    },
    doDownload(processFileFunc) {
      this.setLoading(true);
      this.$store
        .dispatch('diagnostics/downloadDebugLog')
        .then(processFileFunc)
        .catch(({ message }) => this.errorToast(message))
        .finally(() => this.setLoading(false));
    },
    updateGenertedTime(time, offset) {
      if (time < 0) {
        this.downloadable = false;
        this.messageText = this.$t('pageSystemDiagnostics.debug.noLogFile');
      } else {
        let filetime = this.convertToTimezoneString(time, offset);
        if (filetime == null) {
          this.downloadable = false;
          this.messageText = this.$t('pageSystemDiagnostics.debug.noLogFile');
        } else {
          this.downloadable = true;
          this.messageText = filetime;
        }
      }
      return;
    },
    convertToTimezoneString(tloc, offset) {
      let dif = offset >= 0 ? '+' : '-',
        pad = (num) => {
          return ('0' + num).slice(-2);
        },
        date = new Date((tloc + offset * 60) * 1000);

      if (isNaN(date)) {
        return null;
      }

      return (
        date.getUTCFullYear() +
        '-' +
        pad(date.getUTCMonth() + 1) +
        '-' +
        pad(date.getUTCDate()) +
        ' ' +
        pad(date.getUTCHours()) +
        ':' +
        pad(date.getUTCMinutes()) +
        ' UTC' +
        dif +
        pad(offset / 60) +
        ':' +
        pad(offset % 60)
      );
    },
  },
};
</script>

<style scoped>
.width200 {
  width: 200px;
}
.explain.error {
  color: #f44336;
}
</style>
