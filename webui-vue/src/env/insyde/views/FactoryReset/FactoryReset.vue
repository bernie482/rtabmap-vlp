<template>
  <b-container fluid="xl">
    <page-title />

    <b-row class="mb-3">
      <b-col>
        <span>
          {{ $t('pageInsydeFactoryReset.LANG_FACTORY_RESET_DESC') }}
        </span>
        <br />
        <span class="tip-error">
          {{ $t('pageInsydeFactoryReset.LANG_FACTORY_RESET_RESTORE_WARNING2') }}
        </span>
      </b-col>
    </b-row>
    <div class="form-background pl-4 pt-4 pb-1">
      <b-row class="mb-3 ml-2">
        <b-col>
          <b-form-checkbox
            v-model="usePreserve"
            name="preserve-enabled"
            :disabled="$route.meta.viewOnly"
          >
            {{ $t('pageInsydeFactoryReset.LANG_FACTORY_RESET_PRESERVE') }}
          </b-form-checkbox>
        </b-col>
      </b-row>
    </div>
    <div v-show="usePreserve" class="form-background pl-4 pt-4 pb-1">
      <b-row class="mb-3 ml-4">
        <b-col>
          <b-button variant="info" @click="checkAll">
            {{ $t('pageInsydeFactoryReset.LANG_FACTORY_RESET_PRESERVE_ALL') }}
          </b-button>
        </b-col>
      </b-row>
      <b-row class="mb-3 ml-4">
        <b-col>
          <b-form-checkbox id="preserve-" v-model="options.SDR">
            {{ $t('pageInsydeFactoryReset.LANG_FACTORY_RESET_PRESERVE_SDR') }}
          </b-form-checkbox></b-col
        >
        <b-col>
          <b-form-checkbox id="preserve-SEL" v-model="options.SEL">
            {{ $t('pageInsydeFactoryReset.LANG_FACTORY_RESET_PRESERVE_SEL') }}
          </b-form-checkbox></b-col
        >
        <!--<b-col>
          <b-form-checkbox id="preserve-IPMI" v-model="options.IPMI">
            {{ $t('pageInsydeFactoryReset.LANG_FACTORY_RESET_PRESERVE_IPMI') }}
          </b-form-checkbox></b-col
        >-->
        <b-col>
          <b-form-checkbox id="preserve-NETWORK" v-model="options.NETWORK">
            {{
              $t('pageInsydeFactoryReset.LANG_FACTORY_RESET_PRESERVE_NETWORK')
            }}
          </b-form-checkbox></b-col
        >
        <b-col></b-col>
      </b-row>
      <b-row class="mb-3 ml-4">
        <!--<b-col>
          <b-form-checkbox id="preserve-NTP" v-model="options.NTP">
            {{ $t('pageInsydeFactoryReset.LANG_FACTORY_RESET_PRESERVE_NTP') }}
          </b-form-checkbox></b-col
        >-->
        <b-col>
          <b-form-checkbox id="preserve-SNMP" v-model="options.SNMP">
            {{ $t('pageInsydeFactoryReset.LANG_FACTORY_RESET_PRESERVE_SNMP') }}
          </b-form-checkbox></b-col
        >
        <b-col>
          <b-form-checkbox id="preserve-SSH" v-model="options.SSH">
            {{ $t('pageInsydeFactoryReset.LANG_FACTORY_RESET_PRESERVE_SSH') }}
          </b-form-checkbox></b-col
        >
        <!--<b-col>
          <b-form-checkbox id="preserve-KVM" v-model="options.KVM">
            {{ $t('pageInsydeFactoryReset.LANG_FACTORY_RESET_PRESERVE_KVM') }}
          </b-form-checkbox></b-col
        >-->
        <b-col>
          <b-form-checkbox id="preserve-User" v-model="options.User">
            {{ $t('pageInsydeFactoryReset.LANG_FACTORY_RESET_PRESERVE_User') }}
          </b-form-checkbox></b-col
        >
        <b-col></b-col>
      </b-row>
      <b-row class="mb-3 ml-4">
        <b-col>
          <b-form-checkbox id="preserve-SYSLOG" v-model="options.SYSLOG">
            {{
              $t('pageInsydeFactoryReset.LANG_FACTORY_RESET_PRESERVE_SYSLOG')
            }}
          </b-form-checkbox></b-col
        >
        <b-col>
          <b-form-checkbox id="preserve-WEB" v-model="options.WEB">
            {{ $t('pageInsydeFactoryReset.LANG_FACTORY_RESET_PRESERVE_WEB') }}
          </b-form-checkbox></b-col
        >
        <b-col>
          <b-form-checkbox id="preserve-OEM" v-model="options.OEM">
            {{ $t('pageInsydeFactoryReset.LANG_FACTORY_RESET_PRESERVE_OEM') }}
          </b-form-checkbox></b-col
        >
        <!--<b-col>
          <b-form-checkbox id="preserve-SYSTEM" v-model="options.SYSTEM">
            {{
              $t('pageInsydeFactoryReset.LANG_FACTORY_RESET_PRESERVE_SYSTEM')
            }}
          </b-form-checkbox></b-col
        >-->
        <b-col></b-col>
      </b-row>
    </div>

    <!-- Reset Form -->
    <b-button
      type="submit"
      variant="primary"
      data-test-id="unitReset-button-submit"
      :disabled="$route.meta.viewOnly"
      @click="onFactoryResetSubmit"
    >
      {{ $t('global.action.reset') }}
    </b-button>
  </b-container>
</template>

<script>
import PageTitle from '@/components/Global/PageTitle';

import { mapFields } from 'vuex-map-fields';

export default {
  name: 'FactoryReset',
  components: { PageTitle },

  data() {
    return {
      // NOTE: some options is disabled. depend on platform features.
      options: {
        SDR: true,
        SEL: true,
        //IPMI: true,
        NETWORK: true,
        //NTP: true,
        SNMP: true,
        SSH: true,
        //KVM: true,
        SYSLOG: true,
        WEB: true,
        OEM: true,
        //SYSTEM: true,
        User: true,
      },
    };
  },
  computed: {
    ...mapFields('insydeFactoryReset', ['usePreserve']),
  },
  created() {
    this.hideLoader();
  },
  methods: {
    onFactoryResetSubmit() {
      this.$bvModal
        .msgBoxConfirm(
          this.$t('pageInsydeFactoryReset.msgbox.resetConfirmMessage'),
          {
            title: this.$tc('appPageTitle.insydeFactoryReset'),
            okTitle: this.$tc('global.action.confirm'),
            cancelTitle: this.$t('global.action.cancel'),
          }
        )
        .then((confirmed) => {
          if (confirmed) {
            this.$store
              .dispatch(
                'insydeFactoryReset/resetSetting',
                this.usePreserve ? this.options : undefined
              )
              .then((title) => {
                this.successToast('', {
                  title,
                });
              })
              .catch(({ message }) => {
                this.errorToast('', {
                  title: message,
                });
              });
          }
        });
    },
    checkAll() {
      let checked = !this.options.SDR;
      for (let index in this.options) {
        this.options[index] = checked;
      }
    },
  },
};
</script>
