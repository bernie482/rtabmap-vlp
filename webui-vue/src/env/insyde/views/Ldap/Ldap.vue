<template>
  <b-container v-show="!loading" fluid="xl">
    <page-title />
    <b-row class="mb-1">
      <b-col cols="6" sm="5" md="4" lg="4" xl="3">
        <label>{{ $t('pageLdapInsyde.enable') }}</label>
      </b-col>
      <b-col cols="6" sm="5" md="4" lg="4" xl="3">
        <b-form-checkbox
          v-model="form.enable"
          switch
          @change="$v.form.enable.$touch()"
        />
      </b-col>
    </b-row>
    <b-row class="mb-1">
      <b-col cols="6" sm="5" md="4" lg="4" xl="3">
        <label>{{ $t('pageLdapInsyde.enableSsl') }}</label>
      </b-col>
      <b-col cols="6" sm="5" md="4" lg="4" xl="3">
        <b-form-checkbox
          v-model="form.enableSSL"
          switch
          :disabled="!form.enable"
          @change="
            $v.form.enableSSL.$touch();
            tougleSSL();
          "
        />
      </b-col>
    </b-row>
    <b-row class="mb-1">
      <b-col cols="6" sm="5" md="4" lg="4" xl="3">
        <label class="ml-3">{{
          $t('pageLdapInsyde.enableVerifyServer')
        }}</label>
      </b-col>
      <b-col cols="1" sm="1" md="1" lg="1" xl="1">
        <b-form-checkbox
          v-model="form.enableVerifyServer"
          switch
          :disabled="!form.enable || !form.enableSSL"
          @change="
            $v.form.enableVerifyServer.$touch();
            tougleSSL();
          "
        />
      </b-col>
      <b-col>
        <b-form-invalid-feedback
          :force-show="
            form.enable &&
            form.enableSSL &&
            form.enableVerifyServer &&
            !existCaCertificate
          "
          role="alert"
        >
          {{ $t('pageLdapInsyde.warningNoCaCertificate') }}
        </b-form-invalid-feedback>
        <b-form-invalid-feedback
          :force-show="form.enable && form.enableSSL && form.enableVerifyServer"
          role="note"
          class="note"
        >
          {{ $t('pageLdapInsyde.helpEanbleVerifyServer') }}
        </b-form-invalid-feedback>
      </b-col>
    </b-row>
    <b-row class="mb-1">
      <b-col cols="6" sm="5" md="4" lg="4" xl="3">
        <label class="ml-3">{{
          $t('pageLdapInsyde.enableVerifyClient')
        }}</label>
      </b-col>
      <b-col cols="1" sm="1" md="1" lg="1" xl="1">
        <b-form-checkbox
          v-model="form.enableVerifyClient"
          switch
          :disabled="!form.enable || !form.enableSSL"
          @change="
            $v.form.enableVerifyClient.$touch();
            tougleSSL();
          "
        />
      </b-col>
      <b-col>
        <b-form-invalid-feedback
          :force-show="
            form.enable &&
            form.enableSSL &&
            form.enableVerifyClient &&
            !existClientCertificate
          "
          role="alert"
        >
          {{ $t('pageLdapInsyde.warningNoClientCertificate') }}
        </b-form-invalid-feedback>
      </b-col>
    </b-row>
    <b-row class="mb-1">
      <b-col cols="6" sm="5" md="4" lg="4" xl="3">
        <label>{{ $t('pageLdapInsyde.port') }}</label>
      </b-col>
      <b-col cols="6" sm="5" md="4" lg="4" xl="3">
        <b-form-input
          v-model="form.port"
          type="number"
          min="0"
          max="65535"
          :disabled="!form.enable"
          :state="getValidationState($v.form.port)"
          @change="$v.form.port.$touch()"
        />
      </b-col>
    </b-row>
    <b-row class="mb-1">
      <b-col cols="6" sm="5" md="4" lg="4" xl="3">
        <label>{{ $t('pageLdapInsyde.hostname') }}</label>
      </b-col>
      <b-col cols="6" sm="5" md="4" lg="4" xl="3">
        <b-form-group class="mb-0">
          <b-form-input
            v-model="form.hostname"
            type="text"
            :disabled="!form.enable"
            :state="getValidationState($v.form.hostname)"
            @change="$v.form.hostname.$touch()"
          />
          <b-form-invalid-feedback
            v-show="form.enable && form.enableSSL && form.enableVerifyServer"
            role="alert"
          >
            {{ $t('pageLdapInsyde.helpHostname') }}
          </b-form-invalid-feedback>
        </b-form-group>
      </b-col>
    </b-row>
    <b-row class="mb-1">
      <b-col cols="6" sm="5" md="4" lg="4" xl="3">
        <label>{{ $t('pageLdapInsyde.password') }}</label>
      </b-col>
      <b-col cols="6" sm="5" md="4" lg="4" xl="3">
        <input-password-toggle>
          <b-form-input
            v-model="form.bindPwd"
            type="password"
            :disabled="!form.enable"
            :state="getValidationState($v.form.bindPwd)"
            @change="$v.form.bindPwd.$touch()"
          />
        </input-password-toggle>
      </b-col>
    </b-row>
    <b-row class="mb-1">
      <b-col cols="6" sm="5" md="4" lg="4" xl="3">
        <label>{{ $t('pageLdapInsyde.dn') }}</label>
      </b-col>
      <b-col cols="6" sm="5" md="4" lg="4" xl="3">
        <b-form-input
          v-model="form.bindDN"
          type="text"
          :disabled="!form.enable"
          :state="getValidationState($v.form.bindDN)"
          @change="$v.form.bindDN.$touch()"
        />
      </b-col>
    </b-row>
    <b-row class="mb-1">
      <b-col cols="6" sm="5" md="4" lg="4" xl="3">
        <label>{{ $t('pageLdapInsyde.search') }}</label>
      </b-col>
      <b-col cols="6" sm="5" md="4" lg="4" xl="3">
        <b-form-input
          v-model="form.searchBase"
          type="text"
          :disabled="!form.enable"
          :state="getValidationState($v.form.searchBase)"
          @change="$v.form.searchBase.$touch()"
        />
      </b-col>
    </b-row>
    <b-row class="mb-1">
      <b-col>
        <label>{{ $t('pageLdapInsyde.group.title') }}</label>
      </b-col>
    </b-row>
    <b-row class="mb-1">
      <b-col cols="6" sm="5" md="4" lg="4" xl="3">
        <label>{{ $t('pageLdapInsyde.group.admin') }}</label>
      </b-col>
      <b-col cols="6" sm="5" md="4" lg="4" xl="3">
        <b-form-input
          v-model="form.groupFilter.admin"
          type="text"
          :disabled="!form.enable"
          :state="getValidationState($v.form.groupFilter.admin)"
          @change="$v.form.groupFilter.admin.$touch()"
        />
      </b-col>
    </b-row>
    <b-row class="mb-1">
      <b-col cols="6" sm="5" md="4" lg="4" xl="3">
        <label>{{ $t('pageLdapInsyde.group.operator') }}</label>
      </b-col>
      <b-col cols="6" sm="5" md="4" lg="4" xl="3">
        <b-form-input
          v-model="form.groupFilter.operator"
          type="text"
          :disabled="!form.enable"
          :state="getValidationState($v.form.groupFilter.operator)"
          @change="$v.form.groupFilter.operator.$touch()"
        />
      </b-col>
    </b-row>
    <b-row class="mb-1">
      <b-col cols="6" sm="5" md="4" lg="4" xl="3">
        <label>{{ $t('pageLdapInsyde.group.user') }}</label>
      </b-col>
      <b-col cols="6" sm="5" md="4" lg="4" xl="3">
        <b-form-input
          v-model="form.groupFilter.user"
          type="text"
          :disabled="!form.enable"
          :state="getValidationState($v.form.groupFilter.user)"
          @change="$v.form.groupFilter.user.$touch()"
        />
      </b-col>
    </b-row>
    <b-row class="mb-1">
      <b-col cols="6" sm="5" md="4" lg="4" xl="3">
        <label>{{ $t('pageLdapInsyde.group.callback') }}</label>
      </b-col>
      <b-col cols="6" sm="5" md="4" lg="4" xl="3">
        <b-form-input
          v-model="form.groupFilter.callback"
          type="text"
          :disabled="!form.enable"
          :state="getValidationState($v.form.groupFilter.callback)"
          @change="$v.form.groupFilter.callback.$touch()"
        />
      </b-col>
    </b-row>
    <b-row class="mb-1">
      <b-col>
        <b-button
          class="mr-1"
          variant="primary"
          :disabled="$v.$invalid"
          @click="doSave"
        >
          {{ $t('global.action.save') }}
        </b-button>
        <b-button
          class="mb-1"
          variant="secondary"
          :disabled="$v.$invalid"
          @click="doClear"
        >
          {{ $t('global.action.clear') }}
        </b-button>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import { mapGetters } from 'vuex';
import {
  not,
  sameAs,
  requiredIf,
  maxLength,
  between,
  helpers,
} from 'vuelidate/lib/validators';
import Validator from '@/env/insyde/utilities/Validator';
import Converter from '@/env/insyde/utilities/Converter';

import InputPasswordToggle from '@/components/Global/InputPasswordToggle';
import PageTitle from '@/components/Global/PageTitle';

export default {
  name: 'Ldap',
  components: {
    PageTitle,
    InputPasswordToggle,
  },

  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
  data() {
    return {
      form: {
        enable: false,
        enableSSL: false,
        enableVerifyServer: false,
        enableVerifyClient: false,
        port: 389,
        hostname: '',
        bindPwd: '',
        bindDN: '',
        searchBase: '',
        groupFilter: {
          admin: '',
          operator: '',
          user: '',
          callback: '',
        },
      },
    };
  },
  computed: {
    ...mapGetters('ldapinsyde', [
      'enable',
      'enableSSL',
      'enableVerifyServer',
      'enableVerifyClient',
      'existCaCertificate',
      'existClientCertificate',
      'port',
      'hostname',
      'bindDN',
      'searchBase',
      'groupFilter',
    ]),
  },
  validations: {
    form: {
      enable: {},
      enableSSL: {},
      enableVerifyServer: {},
      enableVerifyClient: {},
      port: {
        required: requiredIf('enable'),
        between: between(0, 65535),
      },
      hostname: {
        requireds: requiredIf('enable'),
        rule: function (hostname) {
          if (!helpers.req(hostname)) {
            return true;
          }
          if (
            this.form.enable &&
            this.form.enableSSL &&
            this.form.enableVerifyServer
          ) {
            return Validator.DomainName(hostname);
          } else {
            return (
              Validator.IPV4(hostname) ||
              Validator.IPV6(hostname) ||
              Validator.DomainName(hostname)
            );
          }
        },
        maxLength: maxLength(253),
      },
      bindPwd: {
        maxLength: maxLength(64),
      },
      bindDN: {
        required: requiredIf('enable'),
        maxLength: maxLength(127),
        dn: Validator.DistinguishedName,
      },
      searchBase: {
        required: requiredIf('enable'),
        maxLength: maxLength(127),
        dn: Validator.DistinguishedName,
      },
      groupFilter: {
        admin: {
          roleGroup: function (group) {
            return !helpers.req(group) || Validator.LDAP_ROLE_Group(group);
          },
          maxLength: maxLength(128),
          notSameAsOperator: not(sameAs('operator')),
          notSameAsUser: not(sameAs('user')),
          notSameAsCallback: not(sameAs('callback')),
        },
        operator: {
          roleGroup: function (group) {
            return !helpers.req(group) || Validator.LDAP_ROLE_Group(group);
          },
          maxLength: maxLength(128),
          notSameAsAdmin: not(sameAs('admin')),
          notSameAsUser: not(sameAs('user')),
          notSameAsCallback: not(sameAs('callback')),
        },
        user: {
          roleGroup: function (group) {
            return !helpers.req(group) || Validator.LDAP_ROLE_Group(group);
          },
          maxLength: maxLength(128),
          notSameAsAdmin: not(sameAs('admin')),
          notSameAsOperator: not(sameAs('operator')),
          notSameAsCallback: not(sameAs('callback')),
        },
        callback: {
          roleGroup: function (group) {
            return !helpers.req(group) || Validator.LDAP_ROLE_Group(group);
          },
          maxLength: maxLength(128),
          notSameAsAdmin: not(sameAs('admin')),
          notSameAsOperator: not(sameAs('operator')),
          notSameAsUser: not(sameAs('user')),
        },
      },
    },
  },
  created() {
    this.load();
  },
  methods: {
    getValidationState(model) {
      const { $invalid } = model;
      return !$invalid;
    },
    fetchConfig() {
      this.form.bindPwd = '';
      this.form.enable = this.enable;
      this.form.enableSSL = this.enableSSL;
      this.form.enableVerifyServer = this.enableVerifyServer;
      this.form.enableVerifyClient = this.enableVerifyClient;
      this.form.port = this.port;
      this.form.hostname = this.hostname;
      this.form.bindDN = this.bindDN;
      this.form.searchBase = this.searchBase;
      this.form.groupFilter = this.groupFilter;
    },
    load() {
      this.startLoader();
      this.$store
        .dispatch('ldapinsyde/getConfig')
        .then(() => {
          this.fetchConfig();
        })
        .finally(() => this.endLoader());
    },
    doSave() {
      this.$v.$touch();
      if (this.$v.$invalid) return;
      this.startLoader();
      let config = {
        ...this.form,
        bindPwd: Converter.Base64.encode(this.form.bindPwd),
      };

      this.$store
        .dispatch('ldapinsyde/setConfig', config)
        .then((success) => {
          this.fetchConfig();
          this.successToast(success);
        })
        .catch(({ message }) => this.errorToast(message))
        .finally(() => {
          this.endLoader();
        });
    },
    doClear() {
      this.$bvModal
        .msgBoxConfirm(this.$t('pageLdapInsyde.modal.confirmMessage'), {
          title: this.$t('pageLdapInsyde.modal.confirmTitle'),
          okTitle: this.$t('global.action.confirm'),
          cancelTitle: this.$t('global.action.cancel'),
        })
        .then((confirmed) => {
          if (confirmed) this.clear();
        });
    },
    clear() {
      this.startLoader();
      this.$store
        .dispatch('ldapinsyde/clearConfig')
        .then((success) => {
          this.fetchConfig();
          this.successToast(success);
        })
        .catch(({ message }) => this.errorToast(message))
        .finally(() => {
          this.endLoader();
        });
    },
    setStyle(elm_form, elm_src, invalid) {
      return invalid ? { 'border-color': '#ff0000' } : {};
    },
    tougleSSL() {
      let port = this.form.enableSSL ? 636 : 389;
      this.form.port = port;
    },
  },
};
</script>

<style lang="scss" scoped>
.note {
  color: rgb(255, 150, 0);
}
</style>
