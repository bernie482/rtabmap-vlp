<template>
  <b-container fluid="xl">
    <page-title />
    <page-section :section-title="$t('pageVideoLog.SI_VL_DUMPS')">
      <div class="form-background pl-4 pt-4 pb-1">
        <!-- v-show has lower cost than v-if when it will show/hide in this page -->
        <div v-if="settings.dumpFiles.length > 0">
          <b-table
            ref="table"
            responsive="md"
            selectable
            show-empty
            no-select-on-click
            hover
            style="text-align: center; width: 400px"
            :fields="fields"
            :items="tableItems"
            :empty-text="$t('global.table.emptyMessage')"
          >
            <!-- table actions column -->
            <template #cell(actions)="{ item }">
              <table-row-action
                v-for="(action, index) in item.actions"
                :key="index"
                :value="action.value"
                :title="action.title"
                :enabled="!$route.meta.viewOnly"
                @click-table-action="onTableRowAction($event, item)"
              >
                <template #icon>
                  <icon-download v-if="action.value === 'download'" />
                  <icon-trashcan v-if="action.value === 'delete'" />
                </template>
              </table-row-action>
            </template>
          </b-table>
        </div>
        <div v-if="settings.dumpFiles.length === 0">
          {{ $t('pageVideoLog.SI_VL_DUMPS_EMPTY') }}
        </div>
      </div>
    </page-section>

    <page-section :section-title="$t('pageVideoLog.SI_VL_TITLE')">
      <div class="form-background pl-4 pt-4 pb-1">
        <b-form novalidate @submit.prevent="handleSubmit">
          <b-row class="mb-3">
            <b-col>
              <b-form-checkbox
                v-model="settings.enabled"
                name="videolog-enabled"
                :disabled="$route.meta.viewOnly"
                @change="$v.settings.enabled.$touch()"
              >
                {{ $t('pageVideoLog.SI_VL_EN') }}
              </b-form-checkbox>
            </b-col>
          </b-row>

          <div v-show="settings.enabled">
            <!--<b-row class="mb-3 ml-2">
              <b-col sm="3">{{
                $t('pageVideoLog.LANG_DIAG_VL_PRE_EVENT_FPS')
              }}</b-col>
              <b-col sm="3">
                <b-form-select
                  id="videolog-"
                  v-model="settings.fps"
                  :options="fpsOptions"
                >
                </b-form-select>
              </b-col>
            </b-row>-->
            <b-row class="mb-3 ml-2">
              <b-col sm="3">{{
                $t('pageVideoLog.LANG_DIAG_VL_PRE_EVENT_QUALITY')
              }}</b-col>
              <b-col sm="3">
                <b-form-select
                  id="videolog-"
                  v-model="settings.quality"
                  :options="qualityOptions"
                  :disabled="$route.meta.viewOnly"
                >
                </b-form-select>
              </b-col>
            </b-row>

            <!----- trigger block ----->
            <b-row class="mb-3 mt-5 ml-2">
              <b-col class="title">
                {{ $t('pageVideoLog.SI_VL_TRIGGER') }}
              </b-col>
            </b-row>
            <b-row class="mb-3 ml-4">
              <b-col>
                <b-form-checkbox
                  id="trigger-watchdog-timer"
                  v-model="settings.trigger.watchdogTimer"
                  :disabled="$route.meta.viewOnly"
                >
                  {{ $t('pageVideoLog.SI_VL_TRIGGER_EVENT5') }}
                </b-form-checkbox></b-col
              >
              <b-col>
                <b-form-checkbox
                  id="trigger-chassis-off"
                  v-model="settings.trigger.chassisOff"
                  :disabled="$route.meta.viewOnly"
                >
                  {{ $t('pageVideoLog.SI_VL_TRIGGER_EVENT7') }}
                </b-form-checkbox></b-col
              >
            </b-row>
            <b-row class="mb-3 ml-4">
              <b-col>
                <b-form-checkbox
                  id="trigger-chassis-reset"
                  v-model="settings.trigger.chassisReset"
                  :disabled="$route.meta.viewOnly"
                >
                  {{ $t('pageVideoLog.SI_VL_TRIGGER_EVENT8') }}
                </b-form-checkbox></b-col
              >
              <b-col>
                <b-form-checkbox
                  id="trigger-caterr-ierr"
                  v-model="settings.trigger.CATERR_IERR"
                  :disabled="$route.meta.viewOnly"
                  >{{ $t('pageVideoLog.SI_VL_TRIGGER_EVENT9') }}
                </b-form-checkbox></b-col
              >
            </b-row>
            <b-row class="mb-3 ml-4">
              <b-col>
                <b-form-checkbox
                  id="trigger-os-sel"
                  v-model="settings.trigger.OS_SEL"
                  :disabled="$route.meta.viewOnly"
                  >{{ $t('pageVideoLog.SI_VL_TRIGGER_EVENT10') }}
                </b-form-checkbox></b-col
              >
              <b-col>
                <b-form-checkbox
                  id="trigger-chassis-on"
                  v-model="settings.trigger.chassisOn"
                  :disabled="$route.meta.viewOnly"
                  >{{ $t('pageVideoLog.LANG_DIAG_VL_TRIGGER_CHASSIS_ON') }}
                </b-form-checkbox></b-col
              >
            </b-row>
            <!--<b-row class="mb-3 ml-4">
              <b-col>{{ $t('pageVideoLog.LANG_DIAG_VL_TRIGGER_CE') }}</b-col>
              <b-col>
                <b-form-checkbox
                  id="trigger-critical"
                  v-model="settings.trigger.critical"
                  value="true"
                >
                </b-form-checkbox
              ></b-col>
              <b-col>{{ $t('pageVideoLog.LANG_DIAG_VL_TRIGGER_NCE') }}</b-col>
              <b-col>
                <b-form-checkbox
                  id="trigger-none-critical"
                  v-model="settings.trigger.noneCritical"
                  value="true"
                >
                </b-form-checkbox
              ></b-col>
            </b-row>
            <b-row class="mb-3 ml-4">
              <b-col>{{ $t('pageVideoLog.LANG_DIAG_VL_TRIGGER_NRE') }}</b-col>
              <b-col>
                <b-form-checkbox
                  id="trigger-none-recoverable-critical"
                  v-model="settings.trigger.noneRecoverableCritical"
                  value="true"
                >
                </b-form-checkbox
              ></b-col>
              <b-col>{{ $t('pageVideoLog.LANG_DIAG_VL_TRIGGER_FAN') }}</b-col>
              <b-col>
                <b-form-checkbox
                  id="trigger-fan-state-changed"
                  v-model="settings.trigger.fanStateChanged"
                  value="true"
                >
                </b-form-checkbox
              ></b-col>
            </b-row>-->
            <!----- trigger block END ----->

            <!----- pre-event block ----->
            <b-row class="mb-3 mt-5 ml-2">
              <b-col class="title">
                {{ $t('pageVideoLog.LANG_DIAG_VL_PRE_EVENT') }}
              </b-col>
            </b-row>
            <b-row class="mb-3 ml-4">
              <b-col sm="3">{{
                $t('pageVideoLog.LANG_DIAG_VL_STORAGE_PRE_MAX_DUMPS')
              }}</b-col>
              <b-col sm="3">
                <b-form-select
                  id="videolog-preEvent-maxDump"
                  v-model="settings.preEvent.maxDump"
                  :options="preEventMaxDumpOptions"
                  :disabled="$route.meta.viewOnly || !settings.remote.enabled"
                >
                </b-form-select>
              </b-col>
              <b-col sm="6" class="tip-hint">{{
                $t('pageVideoLog.LANG_DIAG_VL_STORAGE_PRE_MAX_DUMPS_HINT')
              }}</b-col>
            </b-row>
            <b-row class="mb-3 ml-4">
              <b-col sm="3">{{
                $t('pageVideoLog.LANG_DIAG_VL_PRE_EVENT_DURATION')
              }}</b-col>
              <b-col sm="3">
                <b-form-select
                  id="videolog-preEvent-maxDuration"
                  v-model="settings.preEvent.maxDuration"
                  :options="preEventMaxDurationOptions"
                  :disabled="$route.meta.viewOnly"
                >
                </b-form-select>
              </b-col>
              <b-col sm="6" class="tip-hint">{{
                $t('pageVideoLog.LANG_DIAG_VL_PRE_EVENT_DURATION_HINT')
              }}</b-col>
            </b-row>
            <!----- pre-event block END ----->

            <!----- post-event block ----->
            <b-row class="mb-3 mt-5 ml-2">
              <b-col class="title">
                {{ $t('pageVideoLog.LANG_DIAG_VL_POST_EVENT') }}
              </b-col>
            </b-row>
            <b-row class="mb-3 ml-4">
              <b-col sm="3">{{
                $t('pageVideoLog.LANG_DIAG_VL_POST_MAX_DUMPS')
              }}</b-col>
              <b-col sm="3">
                <b-form-select
                  id="videolog-postEvent.maxDump"
                  v-model="settings.postEvent.maxDump"
                  :options="postEventMaxDumpOptions"
                  :disabled="$route.meta.viewOnly || !settings.remote.enabled"
                >
                </b-form-select>
              </b-col>
              <b-col sm="6" class="tip-hint">{{
                $t('pageVideoLog.LANG_DIAG_VL_POST_MAX_DUMPS_HINT')
              }}</b-col>
            </b-row>
            <b-row class="mb-3 ml-4">
              <b-col sm="3">{{
                $t('pageVideoLog.LANG_DIAG_VL_POST_DURATION')
              }}</b-col>
              <b-col sm="3">
                <b-form-select
                  id="videolog-postEvent.maxDuration"
                  v-model="settings.postEvent.maxDuration"
                  :options="postEventMaxDurationOptions"
                  :disabled="$route.meta.viewOnly"
                >
                </b-form-select>
              </b-col>
              <b-col sm="6" class="tip-hint">{{
                $t('pageVideoLog.LANG_DIAG_VL_POST_DURATION_HINT')
              }}</b-col>
            </b-row>
            <!----- post-event block END ----->

            <!----- remote block ----->
            <b-row class="mb-3 mt-5 ml-2">
              <b-col sm="12">
                <b-form-checkbox
                  id="videolog-storage-enabled"
                  v-model="settings.remote.enabled"
                  name="videolog-storage-enabled"
                  :value="true"
                  :disabled="$route.meta.viewOnly"
                  @change="onRemoteEnabledChanged"
                >
                  <b> {{ $t('pageVideoLog.SI_VL_STORAGE_ENABLED') }} </b>
                </b-form-checkbox>
              </b-col>
            </b-row>
            <div v-show="settings.remote.enabled">
              <b-row class="mb-3 ml-4">
                <b-col sm="3">{{
                  $t('pageVideoLog.LANG_DIAG_VL_STORAGE_SERVER_ADDR')
                }}</b-col>
                <b-col sm="3">
                  <insyde-text-input
                    id="user-storage-host"
                    v-model="settings.remote.host"
                    :v="$v.settings.remote.host"
                    :disabled="$route.meta.viewOnly"
                    my-class="form-control"
                  ></insyde-text-input
                ></b-col>
                <b-col sm="6" class="tip-hint">{{
                  $t('pageVideoLog.LANG_DIAG_VL_STORAGE_SERVER_ADDR_HINT')
                }}</b-col>
              </b-row>
              <b-row class="mb-3 ml-4">
                <b-col sm="3">{{
                  $t('pageVideoLog.SI_VL_STORAGE_SHARE')
                }}</b-col>
                <b-col sm="3">
                  <b-form-select
                    id="user-storage-type"
                    v-model="settings.remote.type"
                    :options="remoteTypeOptions"
                    :disabled="$route.meta.viewOnly"
                  >
                  </b-form-select>
                </b-col>
              </b-row>
              <b-row class="mb-3 ml-4">
                <b-col sm="3">{{
                  $t('pageVideoLog.LANG_DIAG_VL_STORAGE_PATH')
                }}</b-col>
                <b-col sm="3">
                  <insyde-text-input
                    id="user-storage-path"
                    v-model="settings.remote.path"
                    :v="$v.settings.remote.path"
                    :disabled="$route.meta.viewOnly"
                    my-class="form-control"
                  ></insyde-text-input
                ></b-col>
                <b-col sm="6" class="tip-hint">{{
                  $t('pageVideoLog.LANG_DIAG_VL_STORAGE_PATH_HINT')
                }}</b-col>
              </b-row>
              <b-row class="mb-3 ml-4">
                <b-col sm="3">{{
                  $t('pageVideoLog.LANG_DIAG_VL_STORAGE_USER')
                }}</b-col>
                <b-col sm="3">
                  <insyde-text-input
                    id="user-storage-user"
                    v-model="settings.remote.user"
                    :v="$v.settings.remote.user"
                    :disabled="$route.meta.viewOnly"
                    my-class="form-control"
                  ></insyde-text-input
                ></b-col>
                <b-col sm="6" class="tip-hint">{{
                  $t('pageVideoLog.LANG_DIAG_VL_STORAGE_USER_HINT')
                }}</b-col>
              </b-row>
              <!-- PATCH: fix browser autocomplete that cause fill password field -->
              <input type="password" hidden autocomplete="new-password" />
              <b-row class="mb-3 ml-4">
                <b-col sm="3">{{
                  $t('pageVideoLog.LANG_DIAG_VL_STORAGE_PASSWD')
                }}</b-col>
                <b-col sm="3">
                  <insyde-text-input
                    id="user-storage-pass"
                    v-model="settings.remote.password"
                    type="password"
                    :v="$v.settings.remote.password"
                    :disabled="$route.meta.viewOnly"
                    my-class="form-control"
                  ></insyde-text-input
                ></b-col>
                <b-col sm="6" class="tip-hint">{{
                  $t('pageVideoLog.LANG_DIAG_VL_STORAGE_PASSWD_HINT')
                }}</b-col>
              </b-row>
            </div>
            <!----- remote block END ----->
          </div>

          <b-row class="mb-3">
            <b-col>
              <b-button
                variant="primary"
                type="submit"
                class="mb-3"
                :disabled="$route.meta.viewOnly || $v.$invalid"
              >
                {{ $t('global.action.save') }}
              </b-button>
            </b-col>
          </b-row>
        </b-form>
      </div>
    </page-section>
  </b-container>
</template>

<script>
import IconDownload from '@carbon/icons-vue/es/document--download/20';
import IconTrashcan from '@carbon/icons-vue/es/trash-can/20';
import TableRowAction from '@/components/Global/TableRowAction';

import PageTitle from '@/components/Global/PageTitle';
import PageSection from '@/components/Global/PageSection';
import InsydeTextInput from '@/env/insyde/components/InsydeTextInput';

import { mapFields } from 'vuex-map-fields';

import { required, requiredIf, or } from 'vuelidate/lib/validators';
//import Validator from '@/env/insyde/utilities/Validator';

import Validator from '@/env/insyde/utilities/Validator';
import { fileDownloader } from '@/env/insyde/utilities/InsydeTools';

export default {
  name: 'VideoLog',
  components: {
    IconTrashcan,
    IconDownload,
    TableRowAction,
    PageTitle,
    PageSection,
    InsydeTextInput,
  },

  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
  data() {
    return {
      fields: [
        {
          key: 'name',
          label: this.$t('pageVideoLog.table.filename'),
        },
        {
          key: 'size',
          label: this.$t('pageVideoLog.table.size'),
        },
        {
          key: 'actions',
          label: '',
          tdClass: 'text-right text-nowrap',
        },
      ],
      remoteTypeOptionsRef: [
        this.$t('pageVideoLog.LANG_DIAG_VL_STORAGE_NFS'),
        this.$t('pageVideoLog.LANG_DIAG_VL_STORAGE_CIFS'),
      ],
      qualityOptionsRef: [
        this.$t('pageVideoLog.LANG_DIAG_VL_PRE_EVENT_QUALITY0'),
        this.$t('pageVideoLog.LANG_DIAG_VL_PRE_EVENT_QUALITY1'),
        this.$t('pageVideoLog.LANG_DIAG_VL_PRE_EVENT_QUALITY2'),
      ],
      preEventDurationOptionsRef: [
        this.$t('pageVideoLog.LANG_DIAG_VL_PRE_EVENT_QUALITY0'),
        this.$t('pageVideoLog.LANG_DIAG_VL_PRE_EVENT_QUALITY1'),
        this.$t('pageVideoLog.LANG_DIAG_VL_PRE_EVENT_QUALITY2'),
      ],
    };
  },
  computed: {
    ...mapFields('videoLog', ['settings']),
    // options
    fpsOptions() {
      return Array.from({ length: 4 }, (_, i) => i + 1);
    },
    qualityOptions() {
      return this.qualityOptionsRef.map((item, index) => {
        return {
          value: index,
          text: item,
        };
      });
    },
    remoteTypeOptions() {
      return this.remoteTypeOptionsRef.map((item) => {
        return {
          value: item.toLowerCase(),
          text: item,
        };
      });
    },
    preEventMaxDurationOptions() {
      return Array.from({ length: 51 }, (_, i) => i + 10);
    },
    preEventMaxDumpOptions() {
      return Array.from({ length: 3 }, (_, i) => i + 1);
    },
    postEventMaxDumpOptions() {
      return Array.from({ length: 4 }, (_, i) => i + 1);
    },
    postEventMaxDurationOptions() {
      let maxValue = this.settings.remote.enabled ? 300 : 20; // TODO: range is depended on menuconfig
      return Array.from({ length: maxValue }, (_, i) => i + 1);
    },
    tableItems() {
      // transform user data to table data
      return this.settings.dumpFiles.map((el) => {
        return {
          name: this.getBaseName(el.name),
          size: el.size,
          actions: [
            {
              value: 'download',
              title: this.$t('pageVideoLog.table.download'),
            },
            {
              value: 'delete',
              title: this.$tc('pageVideoLog.table.delete'),
            },
          ],
        };
      });
    },
  },
  validations() {
    return {
      settings: {
        enabled: {
          required,
        },
        fps: {
          required,
        },
        remote: {
          host: {
            required: requiredIf(function () {
              return this.settings.remote.enabled;
            }),
            check: or(Validator.EmptyString, Validator.IPV4),
          },
          path: {
            required: requiredIf(function () {
              return this.settings.remote.enabled;
            }),
            check: or(Validator.EmptyString, Validator.SystemPath),
          },
          user: {
            required: requiredIf(function () {
              return this.settings.remote.type == 'CIFS';
            }),
            check: or(Validator.EmptyString, Validator.UserName),
          },
          password: {
            required: requiredIf(function () {
              return this.settings.remote.type == 'CIFS';
            }),
            check: or(Validator.EmptyString, Validator.Password),
          },
        },
      },
    };
  },
  created() {
    // overall init request
    this.startLoader();
    //const getDateTimePromise = this.$store.dispatch('videoLog/getDateTime');
    const getVideoLogSettingsPromise = this.$store.dispatch(
      'videoLog/getVideoLogSettings'
    );
    Promise.all([getVideoLogSettingsPromise]).finally(() => this.endLoader());
  },
  methods: {
    handleSubmit() {
      this.startLoader();
      this.$store
        .dispatch('videoLog/saveVideoLogSettings')
        .then((message) => this.successToast(message))
        .catch(({ message }) => this.errorToast(message))
        .finally(() => {
          this.endLoader();
        });
    },
    onRemoteEnabledChanged(value) {
      if (value == true) return;

      if (this.settings.preEvent.maxDump > 1)
        this.settings.preEvent.maxDump = 1;
      if (this.settings.postEvent.maxDump > 2)
        this.settings.postEvent.maxDump = 2;
      if (this.settings.postEvent.maxDuration > 20)
        this.settings.postEvent.maxDuration = 20;
    },
    onTableRowAction(action, row) {
      switch (action) {
        case 'download':
          this.goDownloadFile(row.name);
          break;
        case 'delete':
          this.goDelFile(row.name);
          break;
        default:
          break;
      }
    },
    getBaseName(path) {
      return path.split(/[\\/]/).pop();
    },
    goDownloadFile(filename) {
      this.startLoader();
      fileDownloader({
        url: '/cgi/crash_video_capture.cgi?FILE=' + filename,
        filename,
      });
      this.endLoader();
    },
    goDelFile(filename) {
      this.startLoader();
      this.$store
        .dispatch('videoLog/delVideoLogFile', filename)
        .then((message) => this.successToast(message))
        .catch(({ message }) => this.errorToast(message))
        .finally(() => {
          this.endLoader();
        });
    },
  },
};
</script>
