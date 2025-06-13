<template>
  <div class="form-background p-3">
    <b-form @submit.prevent="submitForm">
      <slot name="attributes">
        <b-form-group
          v-if="availableType.length > 1"
          :label="$t('firmware.form.updateFirmware.fileSource')"
          :disabled="isPageDisabled"
        >
          <b-form-radio v-model="typeSelected" :value="'post'">
            {{ $t('firmware.form.updateFirmware.workstation') }}
          </b-form-radio>
          <b-form-radio v-model="typeSelected" :value="'tftp'">
            {{ $t('firmware.form.updateFirmware.tftpServer') }}
          </b-form-radio>
        </b-form-group>
        <!-- post Upload -->
        <template v-if="typeSelected === 'post'">
          <b-form-group
            :label="$t('firmware.form.updateFirmware.imageFile')"
            label-for="`firmware-${type}-file`"
          >
            <form-file
              id="`firmware-${type}-file`"
              :state="getValidationState($v.postFile)"
              :disabled="isDisabled"
              aria-describedby="firmware-file-help-block"
              @input="onFileUpload($event)"
            >
              <template #invalid>
                <b-form-invalid-feedback role="alert">
                  {{ $t('global.form.required') }}
                </b-form-invalid-feedback>
              </template>
            </form-file>
          </b-form-group>
        </template>

        <!-- TFTP Server Upload -->
        <template v-if="typeSelected === 'tftp'">
          <b-form-group
            :label="$t('firmware.form.updateFirmware.fileAddress')"
            label-for="`firmware-${type}-file-address`"
          >
            <b-form-input
              id="`firmware-${type}-file-address`"
              v-model="tftpFileAddress"
              type="text"
              :state="getValidationState($v.tftpFileAddress)"
              :disabled="isPageDisabled"
              @input="$v.tftpFileAddress.$touch()"
            />
            <b-form-invalid-feedback role="alert">
              {{ $t('global.form.fieldRequired') }}
            </b-form-invalid-feedback>
          </b-form-group>
        </template>
      </slot>
      <slot name="actions">
        <b-btn
          data-test-id="firmware-button-startUpdate"
          type="submit"
          variant="primary"
          :disabled="isDisabled"
        >
          {{ $t('global.form.updateFirmware.startUpdate') }}
        </b-btn>
        <alert
          v-if="serverOffRequired"
          variant="warning"
          :small="true"
          class="mt-4"
        >
          <p class="col-form-label">
            {{ $t('firmware.alert.mustBePoweredOffToUpdateFirmware') }}
          </p>
        </alert>
      </slot>
    </b-form>
  </div>
</template>

<script>
import { requiredIf } from 'vuelidate/lib/validators';
import Alert from '@/components/Global/Alert';
import FormFile from '@/components/Global/FormFile';

export default {
  name: 'FirmwareUpdateForm',
  components: { Alert, FormFile },
  props: {
    type: {
      required: true,
      type: String,
      default: '',
    },
    isDisabled: {
      required: true,
      type: Boolean,
      default: false,
    },
    serverOffRequired: {
      required: false,
      type: Boolean,
      default: false,
    },
    availableType: {
      required: false,
      type: Array,
      default: () => {
        return ['post'];
      },
    },
    submitFunc: {
      required: true,
      type: Function,
      default: () => {},
    },
  },
  data() {
    return {
      typeSelected: 'post',
      // post
      postFile: null,
      // tftp
      tftpFileAddress: null,
    };
  },
  watch: {
    typeSelected: function () {
      this.$v.$reset();
      // post
      this.postFile = null;

      // tftp
      this.tftpFileAddress = null;
    },
  },
  validations() {
    return {
      postFile: {
        required: requiredIf(function () {
          return this.typeSelected === 'post';
        }),
      },
      tftpFileAddress: {
        required: requiredIf(function () {
          return this.typeSelected === 'tftp';
        }),
      },
    };
  },
  methods: {
    onFileUpload(file) {
      this.postFile = file;
      this.$v.postFile.$touch();
    },
    submitForm() {
      this.$v.$touch();
      if (this.$v.$invalid) return;
      let formData = {
        type: this.typeSelected,
      };
      switch (formData.type) {
        case 'post':
          formData.data = {
            file: this.postFile,
          };
          break;
        case 'tftp':
          formData.data = {
            fileAddress: this.tftpFileAddress,
          };
          break;
      }
      this.submitFunc(formData);
    },
  },
};
</script>

<style></style>
