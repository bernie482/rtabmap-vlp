<template>
  <page-section :section-title="$t('pageBootConfiguration.bootOption.title')">
    <div class="form-background p-3" style="width: 600px">
      <b-form novalidate @submit.prevent="handleSubmit">
        <b-form-group
          :label="$t('pageBootConfiguration.bootOption.bootSettingsEnabled')"
          label-for="boot-mode"
          class="mb-3"
        >
          <b-form-select
            id="boot-enabled"
            v-model="overrideEnabled"
            :options="overrideEnabledOptions"
            :disabled="$route.meta.viewOnly"
          >
          </b-form-select>
        </b-form-group>
        <b-form-group
          :label="$t('pageBootConfiguration.bootOption.bootSettingsMode')"
          label-for="boot-mode"
          class="mb-3"
        >
          <b-form-select
            id="boot-mode"
            v-model="overrideMode"
            :disabled="!uiOoverrideEnabled"
            :options="overrideModeOptions"
            @change="onChangeOptionMode"
          >
          </b-form-select>
        </b-form-group>
        <b-form-group
          :label="$t('pageBootConfiguration.bootOption.bootSettingsOverride')"
          label-for="boot-option"
          class="mb-3"
        >
          <b-form-select
            id="boot-option"
            v-model="bootSource"
            :disabled="!uiOoverrideEnabled"
            :options="bootSourceOptionsWithMode"
            @change="onChangeSourceSelect"
          >
          </b-form-select>
        </b-form-group>
        <!--<b-form-checkbox
          v-model="form.oneTimeBoot"
          class="mb-4"
          :disabled="
            bootSource === 'None' || bootSource === 'UefiBootNext'
          "
          @change="$v.form.oneTimeBoot.$touch()"
        >
          {{ $t('pageBootConfiguration.bootOption.enableOneTimeBoot') }}
        </b-form-checkbox>-->
        <b-form-group
          v-if="bootSource === 'UefiBootNext'"
          :label="$t('pageBootConfiguration.bootOption.bootNext')"
          label-for="uefi-boot-next"
          class="mb-3"
        >
          <b-form-select
            id="uefi-boot-next"
            v-model="bootNext"
            :disabled="
              $route.meta.viewOnly ||
              bootSource !== 'UefiBootNext' ||
              overrideEnabled === 'Disabled'
            "
            :options="bootNextOptions"
          >
          </b-form-select>
        </b-form-group>
        <b-form-group
          v-if="bootSource === 'UefiTarget'"
          :label="$t('pageBootConfiguration.bootOption.uefiTarget')"
          label-for="uefi-target"
          class="mb-3"
        >
          <b-form-input
            id="uefi-target"
            v-model="uefiTarget"
            :disabled="!uiOoverrideEnabled || bootSource !== 'UefiTarget'"
          >
          </b-form-input>
        </b-form-group>
        <!--<b-form-group
          :label="
            $t('pageServerPowerOperations.bootSettings.tpmRequiredPolicy')
          "
        >
          <b-form-text id="tpm-required-policy-help-block">
            {{
              $t(
                'pageServerPowerOperations.bootSettings.tpmRequiredPolicyHelper'
              )
            }}
          </b-form-text>
          <b-form-checkbox
            id="tpm-required-policy"
            v-model="form.tpmPolicyOn"
            aria-describedby="tpm-required-policy-help-block"
            @change="$v.form.tpmPolicyOn.$touch()"
          >
            {{ $t('global.status.enabled') }}
          </b-form-checkbox>
        </b-form-group>-->
        <b-button
          variant="primary"
          type="submit"
          class="mb-3"
          :disabled="$route.meta.viewOnly"
        >
          {{ $t('global.action.save') }}
        </b-button>
      </b-form>
    </div>
  </page-section>
</template>

<script>
import { mapState } from 'vuex';
import i18n from '@/i18n';

import PageSection from '@/components/Global/PageSection';

export default {
  name: 'BootOption',
  components: { PageSection },

  data() {
    return {
      form: {
        //oneTimeBoot: this.$store.getters['bootConfig/overrideEnabled'], // (X)
        bootNext: this.$store.getters['bootConfig/bootNext'],
        uefiTarget: this.$store.getters['bootConfig/uefiTarget'],
        tpmPolicyOn: this.$store.getters['bootConfig/tpmEnabled'], // (X)
      },
    };
  },
  computed: {
    ...mapState('bootConfig', [
      // options
      'overrideEnabledOptions',
      'overrideModeOptions',
      'bootSourceOptions',
      'tpmEnabled',
    ]),
    uiOoverrideEnabled() {
      return !this.$route.meta.viewOnly && this.overrideEnabled !== 'Disabled';
    },
    overrideEnabled: {
      get() {
        return this.$store.getters['bootConfig/overrideEnabled'];
      },
      set(value) {
        this.$store.commit('bootConfig/setOverrideEnabled', value);
      },
    },
    overrideMode: {
      get() {
        return this.$store.getters['bootConfig/overrideMode'];
      },
      set(value) {
        this.$store.commit('bootConfig/setOverrideMode', value);
      },
    },
    bootSource: {
      get() {
        return this.$store.getters['bootConfig/bootSource'];
      },
      set(value) {
        this.$store.commit('bootConfig/setBootSource', value);
      },
    },
    bootNext: {
      get() {
        return this.$store.getters['bootConfig/bootNext'];
      },
      set(value) {
        this.$store.commit('bootConfig/setBootNext', value);
      },
    },
    uefiTarget: {
      get() {
        return this.$store.getters['bootConfig/uefiTarget'];
      },
      set(value) {
        this.$store.commit('bootConfig/setUefiTarget', value);
      },
    },
    bootSourceOptionsWithMode() {
      return this.overrideMode === 'UEFI'
        ? this.bootSourceOptions
        : this.bootSourceOptions.filter(
            (option) => !RegExp(/^uefi/i).test(option)
          );
    },
    // Use for UefiBootNext
    bootNextOptions() {
      let bootNextOptions = this.$store.getters['bootConfig/bootNextOptions'];
      bootNextOptions = bootNextOptions.map((option) => {
        return {
          value: option,
          text: option,
        };
      });
      if (bootNextOptions.length == 0) {
        bootNextOptions.push({
          value: null,
          text: i18n.t('pageBootConfiguration.bootOption.modal.noBootNext'),
        });
      } /* else {
        bootNextOptions.push({
          value: null,
          text: i18n.t('pageBootConfiguration.bootOption.modal.selectBootNext'),
        });
      }*/
      return bootNextOptions;
    },
  },
  /*watch: {
    bootSource: function (value) {
      this.bootSource = value;
    },
    overrideEnabled: function (value) {
      this.form.oneTimeBoot = value;
    },
    overrideMode: function (value) {
      this.overrideMode = value;
    },
    bootNext: function (value) {
      this.form.bootNext = value;
    },
    uefiTarget: function (value) {
      this.form.uefiTarget = value;
    },
    tpmEnabled: function (value) {
      this.form.tpmPolicyOn = value;
    },
  },*/
  validations: {
    // Empty validations to leverage vuelidate form states
    // to check for changed values
    overrideEnabled: {},
    overrideMode: {},
    bootSource: {},
    bootNext: {},
    uefiTarget: {},
    tpmPolicyOn: {},
  },
  created() {
    // this.$store
    //   .dispatch('bootConfig/getTpmPolicy')
    //   .finally(() =>
    //     this.$root.$emit('boot-configuration-boot-option-complete')
    //   );
    this.$root.$emit('boot-configuration-boot-option-complete');
  },
  methods: {
    handleSubmit() {
      this.startLoader();
      this.$v.$touch();
      if (this.$v.$invalid) {
        console.error('handleSubmit failed:', this.$v.form);
        return;
      }

      this.$store
        .dispatch('bootConfig/saveBootOption')
        .then((success) => this.successToast(success))
        .catch(({ message }) => this.errorToast(message))
        .finally(() => this.endLoader());
    },
    onChangeOptionMode(selectedMode) {
      if (selectedMode === 'Legacy') {
        if (!this.bootSourceOptionsWithMode.includes(this.bootSource)) {
          this.bootSource = 'None';
        }
      }
    },
    onChangeSourceSelect(selectedSource) {
      // Disable one time boot if selected boot option is 'None'
      //if (selectedSource === 'None') this.form.oneTimeBoot = false;
      // or Enable one time boot if selected boot option is 'UefiBootNext' (According to the Redfish spec)
      if (selectedSource === 'UefiBootNext') this.overrideEnabled = 'Once';
    },
  },
};
</script>
