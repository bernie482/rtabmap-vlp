<template>
  <b-modal id="modal-user" ref="modal" size="middle" @hidden="closeModal">
    <template #modal-title>
      <template v-if="newUser">
        {{ $t('pageUsers.addUser') }}
      </template>
      <template v-else>
        {{ $t('pageUsers.editUser') }}
      </template>
    </template>
    <b-form id="form-user" novalidate @submit.prevent="handleSubmit">
      <b-container>
        <!-- PATCH: fix browser autocomplete that cause fill password field -->
        <input type="password" hidden autocomplete="new-password" />

        <b-row v-if="newUser" class="mb-3">
          <b-col class="title"> {{ $t('pageUsers.modal.userId') }} </b-col>
          <b-col>
            <b-form-select
              id="user-id"
              v-model="form.id"
              :options="availableUserIds"
              data-test-id="users-select-id"
            >
            </b-form-select>
          </b-col>
        </b-row>
        <b-row v-if="!newUser" class="mb-3">
          <b-col class="title"> {{ $t('pageUsers.lanChannel') }} </b-col>
          <b-col> {{ channel }} </b-col>
        </b-row>

        <b-row class="mb-3">
          <b-col class="title"> {{ $t('pageUsers.modal.username') }} </b-col>
          <b-col>
            <insyde-text-input
              id="user-username"
              v-model="form.username"
              :v="$v.form.username"
              my-class="form-control"
            ></insyde-text-input
          ></b-col>
        </b-row>

        <b-row class="mb-3">
          <b-col class="title">
            {{ $t('pageUsers.modal.password') }}
          </b-col>
          <b-col>
            <insyde-text-input
              id="user-password"
              v-model="form.password"
              type="password"
              :v="$v.form.password"
              autocomplete="off"
              my-class="form-control"
            ></insyde-text-input
          ></b-col>
        </b-row>

        <b-row class="mb-3">
          <b-col class="title">
            {{ $t('pageUsers.modal.confirmPassword') }}
          </b-col>
          <b-col>
            <insyde-text-input
              id="user-password-confirmation"
              v-model="form.passwordConfirmation"
              type="password"
              data-test-id="users-input-passwordConfirmation"
              :v="$v.form.passwordConfirmation"
              :msg="$t('pageUsers.modal.tips.passwordsDoNotMatch')"
              my-class="form-control"
            ></insyde-text-input
          ></b-col>
        </b-row>

        <b-row class="mb-3">
          <b-col class="title"> {{ $t('pageUsers.modal.email') }} </b-col>
          <b-col>
            <insyde-text-input
              id="user-email"
              v-model="form.email"
              data-test-id="users-email"
              :v="$v.form.email"
              my-class="form-control"
            ></insyde-text-input
          ></b-col>
        </b-row>

        <b-row class="mb-3">
          <b-col class="title">
            {{ $t('pageUsers.modal.privilege') }}
          </b-col>
          <b-col>
            <b-form-select
              id="user-privilege"
              v-model="form.privilege"
              :options="privilegeOptions"
              data-test-id="users-select-privilege"
              @input="$v.form.privilege.$touch()"
            >
            </b-form-select>
          </b-col>
        </b-row>

        <b-row class="mb-3">
          <b-col class="title"> {{ $t('pageUsers.modal.enabled') }} </b-col>
          <b-col>
            <b-form-select
              id="user-enabled"
              v-model="form.enabled"
              :options="enabledOptions"
              @input="$v.form.enabled.$touch()"
            >
            </b-form-select>
          </b-col>
        </b-row>

        <b-row v-if="supportSolAccess" class="mb-3">
          <b-col class="title"> {{ $t('pageUsers.modal.solAccess') }} </b-col>
          <b-col>
            <b-form-select
              id="user-sol-access"
              v-model="form.solPayloadAccess"
              :options="enabledOptions"
              @input="$v.form.solPayloadAccess.$touch()"
            >
            </b-form-select>
          </b-col>
        </b-row>

        <b-row class="mb-3">
          <b-col class="title">
            {{ $t('pageUsers.modal.ipmiMessaging') }}
          </b-col>
          <b-col>
            <b-form-select
              id="user-ipmi-messaging"
              v-model="form.ipmiMessaging"
              :options="enabledOptions"
              @input="$v.form.ipmiMessaging.$touch()"
            >
            </b-form-select>
          </b-col>
        </b-row>

        <b-row v-if="supportPasswordExpiration" class="mb-3">
          <b-col class="title">
            {{ $t('pageUsers.modal.passwordExpirationDay') }}
          </b-col>
          <b-col>
            <insyde-text-input
              id="user-password-expiration"
              v-model="form.PasswordExpirationDay"
              :v="$v.form.PasswordExpirationDay"
              my-class="form-control"
            ></insyde-text-input
          ></b-col>
        </b-row>

        <b-row class="mb-3">
          <b-col class="title">
            <b-form-checkbox
              v-model="form.snmp.access"
              name="user-snmp-access"
              data-test-id="users-radioButton-snmp-access-enabled"
              :value="true"
              :disabled="form.privilege !== 'Administrator'"
              @change="$v.form.snmp.access.$touch()"
            >
              <b> {{ $t('pageUsers.modal.snmp.access') }} </b>
            </b-form-checkbox>
          </b-col>
        </b-row>

        <b-row v-if="form.privilege === 'Administrator'" class="mb-3 ml-2">
          <b-col class="title">
            {{ $t('pageUsers.modal.snmp.accessLevel') }}
          </b-col>
          <b-col>
            <b-form-select
              id="user-snmp-access-level"
              v-model="form.snmp.accessLevel"
              :options="SNMPAccessLevelOptions"
              :disabled="form.snmp.access === false"
              @input="$v.form.snmp.accessLevel.$touch()"
            >
            </b-form-select>
          </b-col>
        </b-row>

        <b-row v-if="form.privilege === 'Administrator'" class="mb-3 ml-2">
          <b-col class="title">
            {{ $t('pageUsers.modal.snmp.AuthenticationProtocol') }}
          </b-col>
          <b-col>
            <b-form-select
              id="user-snmp-AuthenticationProtocol"
              v-model="form.snmp.AuthenticationProtocol"
              :options="AuthenticationProtocolOptions"
              :disabled="form.snmp.access === false"
              @input="$v.form.snmp.AuthenticationProtocol.$touch()"
            >
            </b-form-select>
          </b-col>
        </b-row>

        <b-row v-if="form.privilege === 'Administrator'" class="mb-3 ml-2">
          <b-col class="title">
            {{ $t('pageUsers.modal.snmp.AuthenticationKey') }}
          </b-col>
          <b-col>
            <insyde-text-input
              id="user-snmp-AuthenticationKey"
              v-model="form.snmp.AuthenticationKey"
              type="password"
              data-test-id="users-snmp-AuthenticationKey"
              :v="$v.form.snmp.AuthenticationKey"
              :disabled="form.snmp.access === false"
              my-class="form-control"
            ></insyde-text-input
          ></b-col>
        </b-row>

        <b-row v-if="form.privilege === 'Administrator'" class="mb-3 ml-2">
          <b-col class="title">
            {{ $t('pageUsers.modal.snmp.EncryptionProtocol') }}
          </b-col>
          <b-col>
            <b-form-select
              id="user-snmp-EncryptionProtocol"
              v-model="form.snmp.EncryptionProtocol"
              :options="EncryptionProtocolOptions"
              :disabled="form.snmp.access === false"
              @input="$v.form.snmp.EncryptionProtocol.$touch()"
            >
            </b-form-select>
          </b-col>
        </b-row>

        <b-row v-if="form.privilege === 'Administrator'" class="mb-3 ml-2">
          <b-col class="title">
            {{ $t('pageUsers.modal.snmp.EncryptionKey') }}
          </b-col>
          <b-col>
            <insyde-text-input
              id="user-snmp-EncryptionKey"
              v-model="form.snmp.EncryptionKey"
              type="password"
              data-test-id="users-snmp-EncryptionKey"
              :disabled="form.snmp.access === false"
              :v="$v.form.snmp.EncryptionKey"
              my-class="form-control"
            ></insyde-text-input
          ></b-col>
        </b-row>
      </b-container>
    </b-form>
    <template #modal-footer="{ cancel }">
      <b-button
        variant="secondary"
        data-test-id="users-button-cancel"
        @click="cancel()"
      >
        {{ $t('global.action.cancel') }}
      </b-button>
      <b-button
        form="form-user"
        data-test-id="users-button-submit"
        type="submit"
        variant="primary"
        @click="onOk"
      >
        <template v-if="newUser">
          {{ $t('pageUsers.addUser') }}
        </template>
        <template v-else>
          {{ $t('global.action.save') }}
        </template>
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import InsydeTextInput from '@/env/insyde/components/InsydeTextInput';
import {
  required,
  maxLength,
  minLength,
  sameAs,
  or,
  requiredIf,
} from 'vuelidate/lib/validators';
import Validator from '@/env/insyde/utilities/Validator';
import {
  objectDeepSet,
  roleId2PrivilegeLevel,
  getInsydeTimestamp,
} from '@/env/insyde/utilities/InsydeTools';

import { mapFields } from 'vuex-map-fields';

export default {
  components: { InsydeTextInput },

  props: {
    channel: {
      type: Number,
      default: 0,
    },
    user: {
      type: Object,
      default: null,
    },
    userIds: {
      type: Array,
      default: null,
    },
    passwordRequirements: {
      type: Object,
      required: true,
    },
    supportSolAccess: {
      type: Boolean,
      default: true,
    },
    supportPasswordExpiration: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      originalUsername: '',
      form: {
        id: this.getAvailableId,
        username: '',
        password: '',
        passwordConfirmation: '',
        privilege: 'Administrator',
        email: '',
        enabled: true,
        solPayloadAccess: false,
        ipmiMessaging: true,
        PasswordExpirationDay: '0',
        snmp: {
          access: false,
          accessLevel: 0,
          // no use
          AuthenticationProtocol: 0,
          EncryptionProtocol: 0,
          AuthenticationKey: '',
          EncryptionKey: '',
        },
      },
      CreationTime: '2020-01-01T001:00:01+00:00', // for the calculation of PasswordExpiration
      // options
      enabledOptionsRef: ['Disabled', 'Enabled'],
      SNMPAccessLevelOptions: ['ReadOnly', 'ReadWrite'],
      AuthenticationProtocolOptions: [
        'HMAC_MD5',
        'HMAC_SHA96',
        'HMAC128_SHA224',
        'HMAC192_SHA256',
        'HMAC256_SHA384',
        'HMAC384_SHA512',
      ],
      EncryptionProtocolOptions: [
        //<!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN:CONFIG_SNMP_PRIVACY_PROTOCOL_DES -->
        { value: 'CBC_DES', text: 'CBC_DES', index: 0 },
        //<!-- WEB_CONFIG_DEPEND_FEATURE_END:CONFIG_SNMP_PRIVACY_PROTOCOL_DES -->
        { value: 'CFB128_AES128', text: 'CFB128_AES128', index: 1 },
      ],
    };
  },
  validations() {
    return {
      form: {
        enabled: {
          required,
        },
        username: {
          required,
          check: Validator.UserName,
        },
        privilege: {
          required,
        },
        password: {
          // TODO: the check rule is dependent on CONFIG_PASSWORD_POLICY_LEVEL for insyde
          required: requiredIf(function () {
            return this.requirePassword();
          }),
          check: or(Validator.EmptyString, Validator.Password),
          minLength: minLength(this.passwordRequirements.minLength),
          maxLength: maxLength(this.passwordRequirements.maxLength),
        },
        passwordConfirmation: {
          sameAsPassword: sameAs('password'),
        },
        email: {
          check: or(Validator.EmptyString, Validator.Email),
        },
        solPayloadAccess: {
          required: requiredIf(function () {
            return this.supportSolAccess;
          }),
        },
        ipmiMessaging: {
          required,
        },
        PasswordExpirationDay: {
          check: or(Validator.EmptyString, Validator.NumberRule),
          maxLength: maxLength(3), // NOTE: spf limit max 365
        }, // TODO: modify as timestamp ISO 6202 like '1987-01-09T23:38:13+00:00'
        snmp: {
          access: {
            required,
          },
          accessLevel: {},
          AuthenticationProtocol: {},
          AuthenticationKey: {
            required: requiredIf(function () {
              return (
                (this.form.snmp.access && this.newUser) ||
                this.requireAuthentication
              );
            }),
            password: Validator.Password,
            minLength: minLength(8),
            maxLength: maxLength(12),
          },
          EncryptionProtocol: {},
          EncryptionKey: {
            required: requiredIf(function () {
              return (
                (this.form.snmp.access && this.newUser) ||
                this.requireEncryption
              );
            }),
            password: Validator.Password,
            minLength: minLength(8),
            maxLength: maxLength(12),
          },
        },
      },
    };
  },
  computed: {
    ...mapFields('users', ['accountRoles']),
    newUser() {
      return this.user ? false : true;
    },
    availableUserIds() {
      let vm = this;
      let idList = Array.from({ length: 15 }, (_, i) => i + 1);
      return idList.filter(function (el) {
        return vm.userIds.indexOf(el) < 0;
      });
    },
    privilegeOptions() {
      return this.accountRoles;
    },
    enabledOptions() {
      return this.enabledOptionsRef.map((item, index) => {
        return {
          value: index ? true : false,
          text: item,
        };
      });
    },
    requireAuthentication() {
      return (
        this.form.snmp.access && this.user.SNMP?.AuthenticationProtocol === null
      );
    },
    requireEncryption() {
      return (
        this.form.snmp.access && this.user.SNMP?.EncryptionProtocol === null
      );
    },
    requireSnmpAccessLevel() {
      return (
        this.form.snmp.access &&
        this.user.Oem.InsydeAccount.SNMPAccessLevel === null
      );
    },
  },
  watch: {
    user: function () {
      this.resetForm();
    },
    availableUserIds: {
      // Update form id.
      handler: function () {
        this.form.id = this.availableUserIds[0];
      },
      deep: true,
    },
  },
  methods: {
    handleSubmit() {
      let userData = {};

      if (this.newUser) {
        // NOTE: for add flow, use user.cgi data format
        this.$v.$touch();
        if (this.$v.$invalid) return;
        userData.uid = this.form.id;
        userData.name = this.form.username;
        userData.pwd = btoa(this.form.password); // PATCH: base64 encoded
        userData.userAccess = roleId2PrivilegeLevel(this.form.privilege); // PATCH: convert to int privilege
        if (this.form.PasswordExpirationDay == 0) {
          userData.pwdExpireEnable = false;
        } else {
          userData.pwdExpireEnable = true;
          userData.pwdExpireDay = parseInt(this.form.PasswordExpirationDay);
        }
        userData.email = this.form.email;
        userData.enable = this.form.enabled;
        userData.solPayloadAccess = this.form.solPayloadAccess;
        userData.snmpAccessEnable = this.form.snmp.access;
        if (this.form.snmp.access) {
          userData.snmp = {};
          userData.snmp.accessLevel = this.SNMPAccessLevelOptions.findIndex(
            (el) => el === this.form.snmp.accessLevel
          );
          userData.snmp.authProtocol = this.AuthenticationProtocolOptions.findIndex(
            (el) => el === this.form.snmp.AuthenticationProtocol
          );
          userData.snmp.authKey = this.form.snmp.AuthenticationKey || '';
          userData.snmp.authKey = btoa(userData.snmp.authKey); // PATCH: base64 encoded
          userData.snmp.privacyProtocol = this.EncryptionProtocolOptions.find(
            (el) => el.value === this.form.snmp.EncryptionProtocol
          ).index;
          userData.snmp.privacyKey = this.form.snmp.EncryptionKey || '';
          userData.snmp.privacyKey = btoa(userData.snmp.privacyKey); // PATCH: base64 encoded
        }
      } else {
        // NOTE: for update flow, use redfish data format
        if (this.$v.$invalid) return;
        userData.id = this.form.id;
        userData.originalUsername = this.originalUsername;
        if (this.$v.form.enabled.$dirty) {
          userData.Enabled = this.form.enabled;
        }
        if (this.$v.form.username.$dirty) {
          userData.UserName = this.form.username;
        }
        if (this.$v.form.privilege.$dirty) {
          // NOTE: for multi-channel feature, should update with channel info
          objectDeepSet(userData, 'Oem.InsydeAccount.Privilege', [
            {
              ChannelId: this.channel.toString(),
              PrivilegeLevel: this.form.privilege.toString(),
            },
          ]);
        }
        if (this.$v.form.password.$dirty) {
          userData.Password = this.form.password;
        }
        if (this.$v.form.email.$dirty) {
          objectDeepSet(userData, 'Oem.InsydeAccount.Email', this.form.email);
        }
        if (this.$v.form.ipmiMessaging.$dirty) {
          objectDeepSet(
            userData,
            'Oem.InsydeAccount.IPMIMessaging',
            this.form.ipmiMessaging
          );
        }
        if (this.$v.form.solPayloadAccess.$dirty) {
          objectDeepSet(
            userData,
            'Oem.InsydeAccount.SOLAccess',
            this.form.solPayloadAccess
          );
        }
        if (this.$v.form.snmp.access.$dirty) {
          objectDeepSet(
            userData,
            'Oem.InsydeAccount.SNMPAccess',
            this.form.snmp.access
          );
        }
        if (
          this.$v.form.snmp.accessLevel.$dirty ||
          this.requireSnmpAccessLevel
        ) {
          objectDeepSet(
            userData,
            'Oem.InsydeAccount.SNMPAccessLevel',
            this.form.snmp.accessLevel
          );
        }
        if (
          this.$v.form.snmp.AuthenticationProtocol.$dirty ||
          this.requireAuthentication
        ) {
          objectDeepSet(
            userData,
            'SNMP.AuthenticationProtocol',
            this.form.snmp.AuthenticationProtocol
          );
        }
        if (
          this.$v.form.snmp.EncryptionProtocol.$dirty ||
          this.requireEncryption
        ) {
          objectDeepSet(
            userData,
            'SNMP.EncryptionProtocol',
            this.form.snmp.EncryptionProtocol
          );
        }
        if (
          this.$v.form.snmp.AuthenticationKey.$dirty ||
          this.requireAuthentication
        ) {
          objectDeepSet(
            userData,
            'SNMP.AuthenticationKey',
            this.form.snmp.AuthenticationKey
          );
        }
        if (this.$v.form.snmp.EncryptionKey.$dirty || this.requireEncryption) {
          objectDeepSet(
            userData,
            'SNMP.EncryptionKey',
            this.form.snmp.EncryptionKey
          );
        }
        // TODO: change as timestamp
        if (this.$v.form.PasswordExpirationDay.$dirty) {
          let d = null;
          if (this.form.PasswordExpirationDay != '0') {
            d = new Date(this.CreationTime);
            d.setDate(d.getDate() + parseInt(this.form.PasswordExpirationDay));
          }
          objectDeepSet(
            userData,
            'PasswordExpiration',
            //d == null ? d : d.toISOString()
            d == null ? d : getInsydeTimestamp(d)
          );
        }

        if (Object.entries(userData).length === 2) {
          // console.warn('empty', userData);
          this.closeModal();
          return;
        }
      }

      this.$emit('ok', { isNewUser: this.newUser, userData });
      this.closeModal();
    },
    closeModal() {
      this.resetForm();
      this.$nextTick(() => {
        this.$refs.modal.hide();
      });
    },
    resetForm() {
      // HACK: to reset form data
      Object.assign(this.$data, this.$options.data.call(this));

      // PATCH: reset id
      if (this.user) {
        // NOTE: for edit flow to init
        this.originalUsername = this.user.username;
        this.form.id = this.user.Id;
        this.form.username = this.user.username;
        this.form.enabled = this.user.Enabled;
        this.form.privilege = this.user.privilege;
        //this.form.RoleId = this.user.RoleId;
        // PATCH: compatible with OPF
        if (this.user.Oem.InsydeAccount) {
          this.form.email = this.user.Oem.InsydeAccount.Email || '';
          this.form.solPayloadAccess = this.user.Oem.InsydeAccount.SOLAccess;
          this.form.ipmiMessaging = this.user.Oem.InsydeAccount.IPMIMessaging;
          this.form.snmp.access = this.user.Oem.InsydeAccount.SNMPAccess;
          this.form.snmp.accessLevel =
            this.user.Oem.InsydeAccount.SNMPAccessLevel || 'ReadOnly';
          this.form.snmp.AuthenticationProtocol =
            this.user.SNMP?.AuthenticationProtocol || 'HMAC_MD5';
          this.form.snmp.EncryptionProtocol =
            this.user.SNMP?.EncryptionProtocol || 'CFB128_AES128';
          this.form.snmp.AuthenticationKey = this.user.SNMP?.AuthenticationKey;
          this.form.snmp.EncryptionKey = this.user.SNMP?.EncryptionKey;

          // PATCH: handle expiration
          this.CreationTime = this.user.Oem.InsydeAccount.CreationTime;
          let days = 0;
          if (this.user.PasswordExpiration != null) {
            let d1 = new Date(this.user.PasswordExpiration);
            let d2 = new Date(this.CreationTime);
            let day_diff = new Date(d1 - d2);
            days = day_diff.getUTCDate() - 1;
          }
          this.form.PasswordExpirationDay = days.toString();
        }
      } else {
        // NOTE: for add flow to init
        if (this.availableUserIds.length) {
          if (!this.availableUserIds.includes(this.form.id)) {
            this.form.id = this.availableUserIds[0];
            // PATCH: let fields have default value
            this.form.snmp.accessLevel = this.SNMPAccessLevelOptions[0];
            this.form.snmp.AuthenticationProtocol = this.AuthenticationProtocolOptions[0];
            this.form.snmp.EncryptionProtocol = this.EncryptionProtocolOptions[0].value;
          }
        }
      }
      this.$v.$reset();
    },
    requirePassword() {
      if (this.newUser) return true;
      if (this.$v.form.password.$dirty) return true;
      if (this.$v.form.passwordConfirmation.$dirty) return true;
      return false;
    },
    onOk(bvModalEvt) {
      // prevent modal close
      bvModalEvt.preventDefault();
      this.handleSubmit();
    },
  },
};
</script>
