<template>
  <b-container fluid="x1">
    <page-title />
    <page-section>
      <b-row class="mb-1">
        <b-col cols="6" sm="5" md="4" lg="4" xl="2">
          <label>{{ $t('pageTACACS.TACACS_ENABLE') }}</label>
        </b-col>
        <b-col cols="6" sm="5" md="4" lg="4" xl="2">
          <b-form-checkbox v-model="enable" switch></b-form-checkbox>
        </b-col>
      </b-row>
      <b-row class="mb-1">
        <b-col cols="6" sm="5" md="4" lg="4" xl="2">
          <label>{{ $t('pageTACACS.TACACS_PORT') }}</label>
        </b-col>
        <b-col cols="6" sm="5" md="4" lg="4" xl="2">
          <b-form-input
            v-model="port"
            type="number"
            min="0"
            max="65535"
            :placeholder="$t('pageTACACS.INPUT_PLACE_HOLDER_PORT')"
            :disabled="!enable"
            :state="getValidationState($v.port)"
            @change="$v.port.$touch()"
          >
          </b-form-input>
        </b-col>
      </b-row>
      <b-row class="mb-1">
        <b-col cols="6" sm="5" md="4" lg="4" xl="2">
          <label>{{ $t('pageTACACS.TACACS_IP_ADDRESS') }}</label>
        </b-col>
        <b-col cols="6" sm="5" md="4" lg="4" xl="2">
          <b-form-input
            v-model="ipv4addr"
            type="text"
            :placeholder="$t('pageTACACS.INPUT_PLACE_HOLDER_IPV4')"
            :disabled="!enable"
            :state="getValidationState($v.ipv4addr)"
            @change="$v.ipv4addr.$touch()"
          >
          </b-form-input>
        </b-col>
      </b-row>
      <b-row class="mb-1">
        <b-col cols="6" sm="5" md="4" lg="4" xl="2">
          <label>{{ $t('pageTACACS.TACACS_SECRET') }}</label>
        </b-col>
        <b-col cols="6" sm="5" md="4" lg="4" xl="2">
          <input-password-toggle>
            <b-form-input
              v-model="secret"
              type="password"
              :placeholder="$t('pageTACACS.INPUT_PLACE_HOLDER_PASSWORD')"
              :disabled="!enable"
              :state="getValidationState($v.secret)"
              @change="$v.secret.$touch()"
            >
            </b-form-input>
          </input-password-toggle>
        </b-col>
      </b-row>
      <b-row>
        <b-col cols="6" sm="5" md="4" lg="4" xl="2">
          <b-button
            variant="primary"
            type="button"
            class="button"
            :disabled="$v.$invalid || btnDisabled"
            @click="configSave"
          >
            {{ $t('global.action.save') }}
          </b-button>
        </b-col>
      </b-row>
    </page-section>
  </b-container>
</template>

<script>
import PageTitle from '@/components/Global/PageTitle';
import PageSection from '@/components/Global/PageSection';
import InputPasswordToggle from '@/components/Global/InputPasswordToggle';
import { required, maxLength, between } from 'vuelidate/lib/validators';
import Validator from '@/env/insyde/utilities/Validator';
import { mapState } from 'vuex';
export default {
  name: 'TACACS',
  components: {
    PageTitle,
    PageSection,
    InputPasswordToggle,
  },
  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
  data() {
    return {
      enable: false,
      port: '49',
      ipv4addr: '',
      secret: '',
      btnDisabled: false,
    };
  },
  validations: {
    port: {
      required,
      between: between(1, 65535),
    },
    ipv4addr: {
      required,
      rule: function (ipv4addr) {
        return Validator.IPV4(ipv4addr);
      },
      maxLength: maxLength(253),
    },
    secret: {
      required,
      maxLength: maxLength(64),
    },
  },
  computed: {
    ...mapState('tacacs', ['data', 'result']),
  },
  created() {
    const tacacs = this;
    tacacs.startLoader();
    tacacs.getTACACS();
  },
  methods: {
    getValidationState(model) {
      const { $invalid } = model;
      return !$invalid;
    },
    getTACACS() {
      const tacacs = this;
      tacacs.$store
        .dispatch('tacacs/getTACACS')
        .then(() => {
          tacacs.enable = tacacs.data?.enable ?? false;
          tacacs.port = tacacs.data?.port ?? '49';
          tacacs.ipv4addr = tacacs.data?.ipv4 ?? '';
          const pwd = tacacs.data?.pwd ?? '';
          tacacs.secret = pwd.length > 0 ? '***' : '';
        })
        .then(() => {
          tacacs.btnDisabled = false;
        })
        .finally(() => tacacs.endLoader());
    },
    configSave() {
      const tacacs = this;
      let payloadObj = {
        enable: tacacs.enable,
        port: parseInt(tacacs.port),
        ipv4: tacacs.ipv4addr,
      };
      if (tacacs.secret.length == 3 && tacacs.secret == '***') {
        //ignore
      } else {
        payloadObj['pwd'] = btoa(tacacs.secret);
      }
      tacacs.btnDisabled = true;
      tacacs.startLoader();
      tacacs.$store
        .dispatch('tacacs/postTACACS', payloadObj)
        .then(() => {
          tacacs.result != 'error'
            ? tacacs.successToast()
            : tacacs.errorToast();
        })
        .then(() => {
          tacacs.getTACACS();
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.button {
  font-size: 12px;
  font-weight: bold;
  padding: 5px 10px;
  text-align: center;
  background-color: #2e9fd3;
  border-left-style: none;
  border-right-style: none;
  border-bottom: 2px solid #41a2e2;
  border-radius: 3px;
  color: white;
  outline: 0;
  margin: 5px 3px;
  transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out,
    border-color 0.15s ease-in-out;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
</style>
