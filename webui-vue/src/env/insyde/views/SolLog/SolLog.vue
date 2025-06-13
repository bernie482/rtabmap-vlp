<template>
  <b-container fluid="xl">
    <page-title />
    <b-row align-v="center">
      <b-col v-if="!opf5ReleasePatches" cols="3">
        <!-- <b-form-checkbox :checked="enable" :disabled="disabled" switch inline>
          <span>{{
            enable
              ? $t('pageSolLog.enableSolLog')
              : $t('pageSolLog.enableSolLog')
          }}</span>
        </b-form-checkbox> -->
        <b-form-checkbox
          id="solLogEnable"
          v-model="status"
          name="solLogEnable"
          value="true"
          unchecked-value="false"
          @change="check($event)"
        >
          <span> {{ $t('pageSolLog.enableSolLog') }} </span>
        </b-form-checkbox>
        <!-- <div>
          State: <strong>{{ status }}</strong>
        </div> -->
      </b-col>
      <b-col class="text-right">
        <b-button
          :disabled="disabled"
          class="mb-2 rounded-lg btn-primary-spacing"
          @click="refreshLog"
        >
          <!-- <icon-update-now /> -->
          {{ $t('pageSolLog.refresh') }}
        </b-button>
        <file-downloader
          class="mb-2 rounded-lg btn-primary-spacing"
          :disabled="disabled"
          :download-func="downloadLog"
          >{{ $t('pageSolLog.save') }}</file-downloader
        >
        <b-button
          :disabled="disabled"
          class="mb-2 rounded-lg btn-primary-spacing"
          @click="clearLog"
        >
          <icon-clean />
          {{ $t('pageSolLog.clear') }}
        </b-button>
      </b-col>
    </b-row>
    <div id="log-board" ref="panel"></div>
  </b-container>
</template>

<script>
import PageTitle from '@/components/Global/PageTitle';

import FileDownloader from '@/env/insyde/components/FileDownloader/FileDownloader';
import Clean from '@carbon/icons-vue/es/clean/24';
//import Update from '@carbon/icons-vue/es/update-now/24';
import { FitAddon } from 'xterm-addon-fit';
import { Terminal } from 'xterm';
import { mapGetters } from 'vuex';
import i18n from '@/i18n';

export default {
  name: 'SolLog',
  components: {
    PageTitle,
    FileDownloader,
    IconClean: Clean,
    //IconUpdate: Update,
  },

  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
  data() {
    return {
      term: null,
      disabled: true,
      status: false,
    };
  },
  computed: {
    ...mapGetters('solLog', ['enable', 'contents']),
    opf5ReleasePatches: () => process.env.VUE_APP_OPF5_RELEASE_PATCHES,
  },
  created() {
    const vm = this;
    vm.startLoader();
    vm.disabled = true;
    vm.$store
      .dispatch('solLog/getStatus')
      .then(() => {
        vm.status = vm.enable;
        if (vm.enable) vm.pushContent();
      })
      .finally(() => {
        vm.endLoader();
        vm.disabled = false;
      });
  },
  mounted() {
    this.openTerminal();
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeConsoleWindow);
  },
  methods: {
    check() {
      console.log(this.status);
      let payload = JSON.parse('{}');
      if (this.status == 'true') payload.solLogEnable = true;
      else payload.solLogEnable = false;
      console.log(payload);
      const vm = this;
      vm.startLoader();
      vm.disabled = true;

      vm.$store
        .dispatch('solLog/setLogEnDisable', payload)
        .then((response) => {
          console.log(response.data);
          if (response.data.result == 'success') {
            vm.successToast(i18n.t('pageSolLog.alert.setSuccess'));
          } else {
            vm.errorToast(i18n.t('pageSolLog.alert.setFail'));
          }
        })
        .catch(({ message }) => vm.errorToast(message))
        .finally(() => {
          vm.endLoader();
          vm.disabled = false;
        });
    },
    openTerminal() {
      const vm = this;
      // Refer https://github.com/xtermjs/xterm.js/ for xterm implementation and addons.

      vm.term = new Terminal({
        fontSize: 15,
        fontFamily:
          'SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace',
      });

      const fitAddon = new FitAddon();
      vm.term.loadAddon(fitAddon);

      const SOL_LOG_THEME = {
        background: '#19273c',
        cursor: 'rgba(83, 146, 255, .5)',
        scrollbar: 'rgba(83, 146, 255, .5)',
      };
      vm.term.setOption('theme', SOL_LOG_THEME);
      vm.term.open(this.$refs.panel);
      fitAddon.fit();

      this.resizeConsoleWindow = _.throttle(() => {
        fitAddon.fit();
      }, 1000);
      window.addEventListener('resize', this.resizeConsoleWindow);
    },
    pushContent() {
      const vm = this;
      vm.contents.forEach((c) => {
        vm.term.writeln(c);
      });
    },
    downloadLog(processFileFunc) {
      const vm = this;
      vm.startLoader();
      vm.disabled = true;

      vm.$store
        .dispatch('solLog/downloadLog')
        .then(processFileFunc)
        .catch(({ message }) => vm.errorToast(message))
        .finally(() => {
          vm.endLoader();
          vm.disabled = false;
        });
    },
    clearLog() {
      const vm = this;
      vm.startLoader();
      vm.disabled = true;

      vm.$store
        .dispatch('solLog/clearLog')
        .then(() => {
          vm.term.clear();
          return vm.$store.dispatch('solLog/getStatus');
        })
        .then(() => {
          if (vm.enable) vm.pushContent();
        })
        .catch((error) => vm.errorToast(error))
        .finally(() => {
          vm.endLoader();
          vm.disabled = false;
        });
    },
    refreshLog() {
      const vm = this;
      vm.startLoader();
      vm.disabled = true;
      vm.$store
        .dispatch('solLog/getContent')
        .then(() => {
          vm.term.clear();
          vm.pushContent();
        })
        .catch(({ message }) => vm.errorToast(message))
        .finally(() => {
          vm.endLoader();
          vm.disabled = false;
        });
    },
  },
};
</script>

<style>
#log-board {
  overflow: auto;
}

.btn-primary-spacing {
  margin-right: 10px;
  margin-bottom: 10px !important;
}
</style>
