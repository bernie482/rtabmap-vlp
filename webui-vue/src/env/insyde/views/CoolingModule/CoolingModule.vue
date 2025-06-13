<template>
  <b-container fluid="xl">
    <page-title />
    <page-section>
      <b-form novalidate @submit.prevent="submitForm">
        <b-form-group
          label="Configure cooling module"
          :disabled="loading"
          label-sr-only
        >
          <b-form-radio
            v-model="form.configurationSelected"
            value="manual"
            data-test-id="CoolingModule-radio-configureManual"
            @change="handleOptionChange"
          >
            {{ $t('pageCoolingModule.form.manual.title') }}
          </b-form-radio>
          <b-row class="mt-3 ml-3 fixed-height-row">
            <b-col sm="3" lg="3" xl="3">
              <b-form-group
                :label="$t('pageCoolingModule.form.manual.PumpPwm1')"
                label-for="input-PumpPwm1"
              >
                <b-input-group>
                  <b-form-input
                    id="input-PumpPwm1"
                    v-model="form.manual.PumpPwm1"
                    :disabled="automaticOptionSelected"
                    :state="getValidationState($v.form.manual.PumpPwm1)"
                    data-test-id="CoolingModule-input-PumpPwm1"
                    @blur="$v.form.manual.PumpPwm1.$touch()"
                    @input="$v.form.manual.PumpPwm1.$touch()"
                  />
                  <b-form-invalid-feedback role="alert">
                    <div v-if="!$v.form.manual.PumpPwm1.between">
                      {{
                        $t('global.form.valueMustBeBetween', {
                          min: 0,
                          max: 100,
                        })
                      }}
                    </div>
                  </b-form-invalid-feedback>
                </b-input-group>
              </b-form-group>
            </b-col>
            <b-col sm="3" lg="3" xl="3">
              <b-form-group
                :label="$t('pageCoolingModule.form.manual.PumpPwm2')"
                label-for="input-PumpPwm2"
              >
                <b-input-group>
                  <b-form-input
                    id="input-PumpPwm2"
                    v-model="form.manual.PumpPwm2"
                    :disabled="automaticOptionSelected"
                    :state="getValidationState($v.form.manual.PumpPwm2)"
                    data-test-id="CoolingModule-input-PumpPwm2"
                    @blur="$v.form.manual.PumpPwm2.$touch()"
                    @input="$v.form.manual.PumpPwm2.$touch()"
                  />
                  <b-form-invalid-feedback role="alert">
                    <div v-if="!$v.form.manual.PumpPwm2.between">
                      {{
                        $t('global.form.valueMustBeBetween', {
                          min: 0,
                          max: 100,
                        })
                      }}
                    </div>
                  </b-form-invalid-feedback>
                </b-input-group>
              </b-form-group>
            </b-col>
            <b-col sm="3" lg="3" xl="3">
              <b-form-group
                :label="$t('pageCoolingModule.form.manual.PumpPwm3')"
                label-for="input-PumpPwm3"
              >
                <b-input-group>
                  <b-form-input
                    id="input-PumpPwm3"
                    v-model="form.manual.PumpPwm3"
                    :disabled="automaticOptionSelected"
                    :state="getValidationState($v.form.manual.PumpPwm3)"
                    data-test-id="CoolingModule-input-PumpPwm3"
                    @blur="$v.form.manual.PumpPwm3.$touch()"
                    @input="$v.form.manual.PumpPwm3.$touch()"
                  />
                  <b-form-invalid-feedback role="alert">
                    <div v-if="!$v.form.manual.PumpPwm3.between">
                      {{
                        $t('global.form.valueMustBeBetween', {
                          min: 0,
                          max: 100,
                        })
                      }}
                    </div>
                  </b-form-invalid-feedback>
                </b-input-group>
              </b-form-group>
            </b-col>
          </b-row>
          <b-row class="mt-3 ml-3 mb-3 fixed-height-row">
            <b-col sm="3" lg="3" xl="3">
              <b-form-group
                :label="$t('pageCoolingModule.form.manual.mVol')"
                label-for="input-mVol"
              >
                <b-input-group>
                  <b-form-input
                    id="input-mVol"
                    v-model="form.manual.mVol"
                    :disabled="automaticOptionSelected"
                    :state="getValidationState($v.form.manual.mVol)"
                    data-test-id="CoolingModule-input-mVol"
                    @blur="$v.form.manual.mVol.$touch()"
                    @input="$v.form.manual.mVol.$touch()"
                  />
                  <b-form-invalid-feedback role="alert">
                    <div v-if="!$v.form.manual.mVol.between">
                      {{
                        $t('global.form.valueMustBeBetween', {
                          min: 0,
                          max: 3300,
                        })
                      }}
                    </div>
                  </b-form-invalid-feedback>
                </b-input-group>
              </b-form-group>
            </b-col>
          </b-row>
          <b-form-radio
            v-model="form.configurationSelected"
            value="automatic"
            data-test-id="CoolingModule-radio-configureAutomatic"
            @change="handleOptionChange"
          >
            {{ $t('pageCoolingModule.form.automatic.title') }}
          </b-form-radio>
          <b-row class="mt-3 ml-3 fixed-height-row">
            <b-col sm="3" lg="3" xl="3">
              <b-form-group
                :label="$t('pageCoolingModule.form.automatic.Mode')"
              >
                <b-form-select
                  id="automatic-mode-select"
                  v-model="form.automatic.Mode"
                  data-test-id="CoolingModule-Automatic-Mode-Select"
                  :options="automaticModeSelectOptions"
                  :disabled="manualOptionSelected"
                >
                </b-form-select>
              </b-form-group>
            </b-col>
          </b-row>
          <b-row class="mt-3 ml-3 fixed-height-row">
            <b-col sm="3" lg="3" xl="3">
              <b-form-group
                :label="
                  $t('pageCoolingModule.form.automatic.InletPressureTarget')
                "
                label-for="input-InletPressureTarget"
              >
                <b-input-group>
                  <b-form-input
                    id="input-InletPressureTarget"
                    v-model="form.automatic.InletPressureTarget"
                    :disabled="manualOptionSelected"
                    :state="
                      getValidationState($v.form.automatic.InletPressureTarget)
                    "
                    data-test-id="CoolingModule-input-InletPressureTarget"
                    @blur="$v.form.automatic.InletPressureTarget.$touch()"
                    @input="$v.form.automatic.InletPressureTarget.$touch()"
                  />
                  <b-form-invalid-feedback role="alert">
                    <div v-if="!$v.form.automatic.InletPressureTarget.between">
                      {{
                        $t('global.form.valueMustBeBetween', {
                          min: 0,
                          max: 400,
                        })
                      }}
                    </div>
                  </b-form-invalid-feedback>
                </b-input-group>
              </b-form-group>
            </b-col>
            <b-col sm="3" lg="3" xl="3">
              <b-form-group
                :label="
                  $t('pageCoolingModule.form.automatic.OutletPressureTarget')
                "
                label-for="input-OutletPressureTarget"
              >
                <b-input-group>
                  <b-form-input
                    id="input-OutletPressureTarget"
                    v-model="form.automatic.OutletPressureTarget"
                    :disabled="manualOptionSelected"
                    :state="
                      getValidationState($v.form.automatic.OutletPressureTarget)
                    "
                    data-test-id="CoolingModule-input-OutletPressureTarget"
                    @blur="$v.form.automatic.OutletPressureTarget.$touch()"
                    @input="$v.form.automatic.OutletPressureTarget.$touch()"
                  />
                  <b-form-invalid-feedback role="alert">
                    <div v-if="!$v.form.automatic.OutletPressureTarget.between">
                      {{
                        $t('global.form.valueMustBeBetween', {
                          min: 0,
                          max: 400,
                        })
                      }}
                    </div>
                  </b-form-invalid-feedback>
                </b-input-group>
              </b-form-group>
            </b-col>
            <b-col sm="3" lg="3" xl="3">
              <b-form-group
                :label="
                  $t('pageCoolingModule.form.automatic.DropPressureTarget')
                "
                label-for="input-DropPressureTarget"
              >
                <b-input-group>
                  <b-form-input
                    id="input-DropPressureTarget"
                    v-model="form.automatic.DropPressureTarget"
                    :disabled="manualOptionSelected"
                    :state="
                      getValidationState($v.form.automatic.DropPressureTarget)
                    "
                    data-test-id="CoolingModule-input-DropPressureTarget"
                    @blur="$v.form.automatic.DropPressureTarget.$touch()"
                    @input="$v.form.automatic.DropPressureTarget.$touch()"
                  />
                  <b-form-invalid-feedback role="alert">
                    <div v-if="!$v.form.automatic.DropPressureTarget.between">
                      {{
                        $t('global.form.valueMustBeBetween', {
                          min: 0,
                          max: 400,
                        })
                      }}
                    </div>
                  </b-form-invalid-feedback>
                </b-input-group>
              </b-form-group>
            </b-col>
          </b-row>
          <b-row class="mt-3 ml-3 fixed-height-row">
            <b-col sm="3" lg="3" xl="3">
              <b-form-group
                :label="
                  $t('pageCoolingModule.form.automatic.InletTemperatureTarget')
                "
                label-for="input-InletTemperatureTarget"
              >
                <b-input-group>
                  <b-form-input
                    id="input-InletTemperatureTarget"
                    v-model="form.automatic.InletTemperatureTarget"
                    :disabled="manualOptionSelected"
                    :state="
                      getValidationState(
                        $v.form.automatic.InletTemperatureTarget
                      )
                    "
                    data-test-id="CoolingModule-input-InletTemperatureTarget"
                    @blur="$v.form.automatic.InletTemperatureTarget.$touch()"
                    @input="$v.form.automatic.InletTemperatureTarget.$touch()"
                  />
                  <b-form-invalid-feedback role="alert">
                    <div
                      v-if="!$v.form.automatic.InletTemperatureTarget.between"
                    >
                      {{
                        $t('global.form.valueMustBeBetween', {
                          min: 0,
                          max: 65,
                        })
                      }}
                    </div>
                  </b-form-invalid-feedback>
                </b-input-group>
              </b-form-group>
            </b-col>
            <b-col sm="3" lg="3" xl="3">
              <b-form-group
                :label="
                  $t('pageCoolingModule.form.automatic.OutletTemperatureTarget')
                "
                label-for="input-OutletTemperatureTarget"
              >
                <b-input-group>
                  <b-form-input
                    id="input-OutletTemperatureTarget"
                    v-model="form.automatic.OutletTemperatureTarget"
                    :disabled="manualOptionSelected"
                    :state="
                      getValidationState(
                        $v.form.automatic.OutletTemperatureTarget
                      )
                    "
                    data-test-id="CoolingModule-input-OutletTemperatureTarget"
                    @blur="$v.form.automatic.OutletTemperatureTarget.$touch()"
                    @input="$v.form.automatic.OutletTemperatureTarget.$touch()"
                  />
                  <b-form-invalid-feedback role="alert">
                    <div
                      v-if="!$v.form.automatic.OutletTemperatureTarget.between"
                    >
                      {{
                        $t('global.form.valueMustBeBetween', {
                          min: 0,
                          max: 65,
                        })
                      }}
                    </div>
                  </b-form-invalid-feedback>
                </b-input-group>
              </b-form-group>
            </b-col>
          </b-row>
          <b-row class="mt-3 ml-3 mb-3 fixed-height-row">
            <b-col sm="3" lg="3" xl="3">
              <b-form-group
                :label="$t('pageCoolingModule.form.automatic.FlowTarget')"
                label-for="input-FlowTarget"
              >
                <b-input-group>
                  <b-form-input
                    id="input-FlowTarget"
                    v-model="form.automatic.FlowTarget"
                    :disabled="manualOptionSelected"
                    :state="getValidationState($v.form.automatic.FlowTarget)"
                    data-test-id="CoolingModule-input-FlowTarget"
                    @blur="$v.form.automatic.FlowTarget.$touch()"
                    @input="$v.form.automatic.FlowTarget.$touch()"
                  />
                  <b-form-invalid-feedback role="alert">
                    <div v-if="!$v.form.automatic.FlowTarget.between">
                      {{
                        $t('global.form.valueMustBeBetween', {
                          min: 0,
                          max: 100,
                        })
                      }}
                    </div>
                  </b-form-invalid-feedback>
                </b-input-group>
              </b-form-group>
            </b-col>
          </b-row>
          <b-button
            variant="primary"
            type="submit"
            data-test-id="CoolingModule-button-saveSettings"
          >
            {{ $t('global.action.saveSettings') }}
          </b-button>
        </b-form-group>
      </b-form>
    </page-section>
  </b-container>
</template>

<script>
import PageTitle from '@/components/Global/PageTitle';
import PageSection from '@/components/Global/PageSection';
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import LoadingBarMixin, { loading } from '@/components/Mixins/LoadingBarMixin';
import VuelidateMixin from '@/components/Mixins/VuelidateMixin';
import { requiredIf, between } from 'vuelidate/lib/validators';
import api from '@/store/api';
import { CoolingModulePayload } from './CoolingModuleConstants';

export default {
  name: 'CoolingModule',
  components: { PageTitle, PageSection },
  mixins: [BVToastMixin, LoadingBarMixin, VuelidateMixin],
  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
  data() {
    return {
      locale: this.$store.getters['global/languagePreference'],
      form: {
        configurationSelected: '',
        manual: {
          PumpPwm1: '',
          PumpPwm2: '',
          PumpPwm3: '',
          mVol: '',
        },
        automatic: {
          Mode: '',
          InletPressureTarget: '',
          OutletPressureTarget: '',
          DropPressureTarget: '',
          InletTemperatureTarget: '',
          OutletTemperatureTarget: '',
          FlowTarget: '',
        },
      },
      loading,
    };
  },
  validations() {
    return {
      form: {
        manual: {
          PumpPwm1: {
            required: requiredIf(function () {
              return this.manualOptionSelected;
            }),
            between: between(0, 100),
          },
          PumpPwm2: {
            required: requiredIf(function () {
              return this.manualOptionSelected;
            }),
            between: between(0, 100),
          },
          PumpPwm3: {
            required: requiredIf(function () {
              return this.manualOptionSelected;
            }),
            between: between(0, 100),
          },
          mVol: {
            required: requiredIf(function () {
              return this.manualOptionSelected;
            }),
            between: between(0, 3300),
          },
        },
        automatic: {
          Mode: {
            required: requiredIf(function () {
              return this.automaticOptionSelected;
            }),
            between: between(0, 2),
          },
          InletPressureTarget: {
            required: requiredIf(function () {
              return this.automaticOptionSelected;
            }),
            between: between(0, 400),
          },
          OutletPressureTarget: {
            required: requiredIf(function () {
              return this.automaticOptionSelected;
            }),
            between: between(0, 400),
          },
          DropPressureTarget: {
            required: requiredIf(function () {
              return this.automaticOptionSelected;
            }),
            between: between(0, 400),
          },
          InletTemperatureTarget: {
            required: requiredIf(function () {
              return this.automaticOptionSelected;
            }),
            between: between(0, 65),
          },
          OutletTemperatureTarget: {
            required: requiredIf(function () {
              return this.automaticOptionSelected;
            }),
            between: between(0, 65),
          },
          FlowTarget: {
            required: requiredIf(function () {
              return this.automaticOptionSelected;
            }),
            between: between(0, 100),
          },
        },
      },
    };
  },
  computed: {
    automaticOptionSelected() {
      return this.form.configurationSelected === 'automatic';
    },
    manualOptionSelected() {
      return this.form.configurationSelected === 'manual';
    },
    automaticModeSelectOptions() {
      return [
        { text: 'Constant temperature', value: 0 },
        { text: 'Constant pressure', value: 1 },
        { text: 'Constant flow', value: 2 },
      ];
    },
  },
  created() {
    this.startLoader();
    this.fetchCoolingModuleData().then(() => {
      this.handleOptionChange();
    });
    this.endLoader();
  },
  methods: {
    async fetchCoolingModuleData() {
      this.loading = true;
      const {
        AUTOMATIC,
        modules,
        moduleDevices,
        ...automatic_payload
      } = CoolingModulePayload;
      try {
        const response = await api.get(
          '/redfish/v1/Systems/system/Oem/Auras/CoolingModules'
        );
        const data = response.data;

        const manualForm = {};
        data[modules].forEach((module) => {
          manualForm[module.Device] = module.Value;
        });

        if (data[AUTOMATIC] === 1) {
          this.form.configurationSelected = 'automatic';
        } else {
          this.form.configurationSelected = 'manual';
        }

        Object.keys(moduleDevices).forEach((key) => {
          this.form.manual[key] = manualForm[moduleDevices[key]];
        });
        Object.keys(automatic_payload).forEach((key) => {
          this.form.automatic[key] = data[automatic_payload[key]];
        });
      } catch (error) {
        console.error('Failed to fetch cooling module data:', error);
        this.errorToast(
          this.$t('pageCoolingModule.toast.fetchCoolingModuleError')
        );
      } finally {
        this.loading = false;
      }
    },
    async patchCoolingModuleData() {
      this.loading = true;
      const {
        AUTOMATIC,
        modules,
        moduleDevices,
        InletTemperatureTarget,
        OutletTemperatureTarget,
        ...automatic_payload
      } = CoolingModulePayload;

      try {
        const payload = {
          [AUTOMATIC]: this.automaticOptionSelected ? 1 : 0,
        };

        if (this.automaticOptionSelected) {
          Object.keys(automatic_payload).forEach((key) => {
            payload[automatic_payload[key]] = parseInt(
              this.form.automatic[key]
            );
          });
          // The temperature value is float
          payload[InletTemperatureTarget] = parseFloat(
            this.form.automatic.InletTemperatureTarget
          );
          payload[OutletTemperatureTarget] = parseFloat(
            this.form.automatic.OutletTemperatureTarget
          );
        } else {
          payload[modules] = Object.keys(moduleDevices).map((key) => ({
            Device: moduleDevices[key],
            Value: parseInt(this.form.manual[key]),
          }));
        }

        await api.patch(
          '/redfish/v1/Systems/system/Oem/Auras/CoolingModules',
          payload
        );

        this.successToast(
          this.$t('pageCoolingModule.toast.patchCoolingModuleSuccess')
        );
      } catch (error) {
        console.error('Failed to update cooling module data:', error);
        this.errorToast(
          this.$t('pageCoolingModule.toast.patchCoolingModuleError')
        );
      } finally {
        this.loading = false;
      }
    },
    handleOptionChange() {
      if (this.automaticOptionSelected) {
        this.$v.form.manual.$reset();
        this.$v.form.automatic.$touch();
      } else if (this.manualOptionSelected) {
        this.$v.form.automatic.$reset();
        this.$v.form.manual.$touch();
      }
    },
    submitForm() {
      if (this.automaticOptionSelected) {
        this.$v.form.automatic.$touch();
        if (this.$v.form.automatic.$invalid) {
          console.warning('automatic form is invalid');
          return;
        }
      } else {
        this.$v.form.manual.$touch();
        if (this.$v.form.manual.$invalid) {
          console.warning('manual form is invalid');
          return;
        }
      }
      this.startLoader();
      this.patchCoolingModuleData();
      this.endLoader();
    },
  },
};
</script>

<style>
.fixed-height-row {
  height: 85px;
}
</style>
