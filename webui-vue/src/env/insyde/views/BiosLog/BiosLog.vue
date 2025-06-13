<template>
  <b-container fluid="xl">
    <page-title />
    <b-row align-v="center">
      <!-- <b-col cols="2">
        <b-form-checkbox
          :checked="enable"
          :disabled="disabled"
          switch
          inline
          @change="changeEnable"
        >
          <span>{{
            enable ? $t('pageBiosLog.enable') : $t('pageBiosLog.disable')
          }}</span>
        </b-form-checkbox>
      </b-col> -->
      <b-col cols="5">
        <b-pagination
          v-if="number > 0"
          v-model="currPage"
          :total-rows="number"
          :per-page="perPage"
          :disabled="disabled"
          align="fill"
        ></b-pagination>
      </b-col>
      <b-col cols="3">
        <!-- <h1>Search</h1> -->
      </b-col>
      <b-col cols="2">
        <file-downloader
          class="mb-2 rounded-lg"
          :disabled="disabled"
          :download-func="exportFile"
          >{{ $t('pageBiosLog.export') }}</file-downloader
        >
      </b-col>
      <b-col cols="2">
        <file-downloader
          class="mb-2 rounded-lg"
          :disabled="disabled"
          :download-func="exportAllFile"
          >{{ $t('pageBiosLog.exportAll') }}</file-downloader
        >
      </b-col>
      <!-- <b-col cols="2">
        <b-button :disabled="disabled" class="mb-2 rounded-lg" @click="clear">
          <icon-clean />
          {{ $t('pageBiosLog.clear') }}
        </b-button>
      </b-col> -->
    </b-row>
    <b-row>
      <b-col cols="12">
        <div id="log-board" ref="panel"></div>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import PageTitle from '@/components/Global/PageTitle';

import FileDownloader from '@/env/insyde/components/FileDownloader/FileDownloader';
// import Clean from '@carbon/icons-vue/es/clean/24';
import { FitAddon } from 'xterm-addon-fit';
import { Terminal } from 'xterm';
import { mapGetters } from 'vuex';
import i18n from '@/i18n';

export default {
  name: 'BiosLog',
  components: { PageTitle, FileDownloader },

  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
  data() {
    return {
      term: null,
      currPage: 1,
      lastPage: 1,
      perPage: 1,
      disabled: true,
    };
  },
  computed: {
    ...mapGetters('biosLog', ['number', 'contents']),
  },
  watch: {
    currPage: function (newValue, oldValue) {
      const vm = this;
      vm.currPage = newValue;
      vm.lastPage = oldValue;
      vm.disabled = true;

      if (!vm.contents[newValue - 1]) {
        vm.startLoader();
        vm.$store
          .dispatch('biosLog/getContents', newValue - 1)
          .then(() => {
            vm.pushContent();
          })
          .catch(({ message }) => {
            console.error(message);
            vm.errorToast(
              i18n.t('pageBiosLog.toast.errorGetContentStart') +
                vm.currPage +
                i18n.t('pageBiosLog.toast.errorGetContentEnd')
            );
            vm.currPage = vm.lastPage;
          })
          .finally(() => {
            vm.endLoader();
            vm.disabled = false;
          });
      } else {
        vm.pushContent();
        vm.endLoader();
        vm.disabled = false;
      }
    },
  },
  created() {
    const vm = this;
    vm.startLoader();
    vm.disabled = true;
    vm.$store
      .dispatch('biosLog/getStatus')
      .then(() => {
        if (vm.number > 0) vm.pushContent();
      })
      .catch(({ message }) => vm.errorToast(message))
      .finally(() => {
        if (this.number == 0) {
          // vm.errorToast(i18n.t('pageBiosLog.toast.alertNoBiosFile'));
          vm.disabled = true;
        } else {
          vm.disabled = false;
        }
        vm.endLoader();
      });
  },
  mounted() {
    const vm = this;
    vm.openTerminal();
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeConsoleWindow);
  },
  methods: {
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

      const BIOS_LOG_THEME = {
        background: '#19273c',
        cursor: 'rgba(83, 146, 255, .5)',
        scrollbar: 'rgba(83, 146, 255, .5)',
      };
      vm.term.setOption('theme', BIOS_LOG_THEME);
      vm.term.open(vm.$refs.panel);
      fitAddon.fit();

      this.resizeConsoleWindow = _.throttle(() => {
        fitAddon.fit();
      }, 1000);
      window.addEventListener('resize', this.resizeConsoleWindow);
    },
    pushContent() {
      const vm = this;
      vm.clearContent();
      if (vm.contents[vm.currPage - 1]) {
        vm.contents[vm.currPage - 1].forEach((c) => {
          vm.term.writeln(c);
        });
      }
    },
    clearContent() {
      const vm = this;
      vm.term.clear();
    },
    // changeEnable() {
    //   const vm = this;
    //   vm.enable = !vm.enable;
    //   console.log(vm.enable);
    // },
    exportFile(processFileFunc) {
      const vm = this;
      vm.disabled = true;
      vm.$store
        .dispatch('biosLog/exportLog', vm.currPage)
        .then(processFileFunc)
        .catch(({ message }) => vm.errorToast(message))
        .finally(() => {
          vm.disabled = false;
        });
    },
    exportAllFile(processFileFunc) {
      const vm = this;
      vm.disabled = true;
      vm.$store
        .dispatch('biosLog/exportLog')
        .then(processFileFunc)
        .catch(({ message }) => vm.errorToast(message))
        .finally(() => {
          vm.disabled = false;
        });
    },
    // clear() {
    //   const vm = this;
    //   vm.disabled = true;
    //   vm.$store
    //     .dispatch('biosLog/clearLog')
    //     .then(() => {
    //     })
    //     .catch(({ message }) => vm.errorToast(message))
    //     .finally(() => {
    //       vm.disabled = false;
    //     });
    // },
  },
};
</script>

<style>
.enable-label {
  display: inline;
}
</style>
