<template>
  <div>
    <b-form
      v-show="!resetSuccess"
      class="reset-password-panel panel"
      novalidate
      @submit.prevent="resetPwd"
    >
      <label id="label_title" class="h1">{{
        $t('pageLogin.LANG_LOGIN_RESET_PASSWORD_PROMPT')
      }}</label>
      <label>{{ $t('pageLogin.LANG_LOGIN_RESET_PASSWORD_INFO') }}</label>
      <div v-show="errorAlertText" class="error-alert">
        <div class="v-center">
          <span class="error-alert-circle">
            <svg
              viewBox="0 0 12 16"
              version="1.1"
              aria-hidden="true"
              width="12"
              height="16"
            >
              <path
                fill-rule="evenodd"
                d="M7.48 8l3.75 3.75-1.48 1.48L6 9.48l-3.75 3.75-1.48-1.48L4.52 8 .77 4.25l1.48-1.48L6 6.52l3.75-3.75 1.48 1.48L7.48 8z"
                fill="#fff"
              ></path>
            </svg>
          </span>
          <span class="error-alert-text"> {{ errorMsg }}</span>
        </div>
        <span class="error-alert-close" @click="closeRedErrorAlert">
          <svg
            viewBox="0 0 12 16"
            version="1.1"
            aria-hidden="true"
            width="12"
            height="16"
          >
            <path
              fill-rule="evenodd"
              d="M7.48 8l3.75 3.75-1.48 1.48L6 9.48l-3.75 3.75-1.48-1.48L4.52 8 .77 4.25l1.48-1.48L6 6.52l3.75-3.75 1.48 1.48L7.48 8z"
              fill="#c0c4cc"
            ></path>
          </svg>
        </span>
      </div>
      <div class="white-pane">
        <label id="label_title" class="h1">
          {{ $t('pageLogin.LANG_LOGIN_RESET_PASSWORD_SECURITY_CODE') }}
        </label>
        <b-form-input
          id="temporary-code"
          v-model="resetUserInfo.securityCode"
          type="password"
          maxlength="128"
          tabindex="1"
          class="text-center"
        >
        </b-form-input>
        <div class="reset-password-new-password-label">
          <label id="label_title" class="h1">{{
            $t('pageLogin.LANG_FIRST_TIME_LOGIN_NEW_PASSWORD_LABEL')
          }}</label>
          <svg
            id="help"
            class="help"
            width="20"
            height="20"
            viewBox="0 0 24 24"
          >
            <path
              fill="#757575"
              d="M11,18H13V16H11V18M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,6A4,4 0 0,0 8,10     H10A2,2 0 0,1 12,8A2,2 0 0,1 14,10C14,12 11,11.75 11,15H13C13,12.75 16,12.5 16,10A4,4 0 0,0 12,6Z"
            ></path>
          </svg>
          <svg
            id="eye"
            :class="{ eye: true, active: isAct }"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            @click="text_act"
          >
            <path
              fill="#757575"
              d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z"
            ></path>
          </svg>
        </div>
        <b-form-input
          name="fakepassword-avoid-browser-autocomplete"
          type="password"
          class="d-none"
        >
        </b-form-input>
        <div class="anchor">
          <b-form-input
            id="new-password"
            v-model="resetUserInfo.newPassword"
            :type="pwdtype"
            maxlength="128"
            tabindex="2"
            class="text-center"
            @input="$v.resetUserInfo.newPassword.$touch()"
          >
          </b-form-input>
          <div class="explain">
            {{ $t('pageLogin.LANG_FIRST_TIME_LOGIN_POLICY_ERROR') }}
          </div>
          <div id="policy" class="policy">
            <div id="bulletin" class="bulletin">
              <div id="triangle" class="triangle"></div>
              <label id="label_title" class="h1">
                {{
                  $t('pageLogin.LANG_FIRST_TIME_LOGIN_PASSWORD_POLICY_LABEL')
                }}
              </label>
              <ul id="rule-pane" class="rule-pane">
                <li class="rule rule-1">
                  {{ $t('pageLogin.LANG_FIRST_TIME_LOGIN_PASSWORD_POLICY_1') }}
                </li>
              </ul>
            </div>
          </div>
        </div>
        <label id="label_title" class="h1">
          {{ $t('pageLogin.LANG_FIRST_TIME_LOGIN_CONFIRM_PASSWORD_LABEL') }}
        </label>
        <b-form-input
          id="confirm-password"
          v-model="validatePwd"
          aria-describedby="confirm-password-required"
          :state="getValidationState($v.validatePwd) && checkMatch()"
          :type="pwdtype"
          maxlength="128"
          tabindex="3"
          class="text-center"
          @input="$v.validatePwd.$touch()"
        >
        </b-form-input>
        <b-form-invalid-feedback id="confirm-password-required" role="alert">
          <template v-if="!$v.validatePwd.required">
            {{ $t('pageLogin.LANG_FIRST_TIME_LOGIN_CONFIRM_ERROR') }}
          </template>
        </b-form-invalid-feedback>
        <b-button
          id="update-password-btn"
          variant="primary"
          block
          class="btn"
          type="submit"
        >
          {{ $t('pageLogin.LANG_LOGIN_RESET_PASSWORD_CHANGE_PASSWORD_BUTTON') }}
        </b-button>
      </div>
      <div
        id="reset-password-return"
        class="blue-font mt-12"
        @click="backToLogin"
      >
        {{ $t('pageLogin.LANG_LOGIN_RETURN_TO_LOGIN') }}
      </div>
    </b-form>
    <password-reset-success v-show="resetSuccess" />
  </div>
</template>
<script>
import { required } from 'vuelidate/lib/validators';
import router from '@/router';
import VuelidateMixin from '@/components/Mixins/VuelidateMixin.js';
import PasswordResetSuccess from './PasswordResetSuccess';

export default {
  components: { PasswordResetSuccess },
  mixins: [VuelidateMixin],
  props: {
    user: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      test: false,
      resetUserInfo: {
        username: null,
        newPassword: '',
        securityCode: null,
      },
      errorMsg: this.$t('pageLogin.LANG_COMMON_UNKNOWN_ERROR'),
      isAct: false,
      errorAlertText: false,
      pwdtype: 'password',
      resetSuccess: false,
      validatePwd: '',
    };
  },
  computed: {},
  watch: {
    user: function (value) {
      if (value === '') return;
      this.resetUserInfo.username = value;
    },
  },
  created() {},
  validations: {
    validatePwd: {
      required,
    },
    resetUserInfo: {
      username: {
        required,
      },
      newPassword: {
        required,
      },
      securityCode: {
        required,
      },
    },
  },
  methods: {
    checkMatch() {
      return this.resetUserInfo.newPassword === this.validatePwd;
    },
    resetPwd() {
      this.$v.$touch();
      if (this.$v.$invalid) return;
      this.$store
        .dispatch('authentication/login_reset_password', this.resetUserInfo)
        .then((success) => {
          console.log(success);
          this.hide();
          this.resetSuccess = true;
        })
        .catch((error) => {
          console.log(error);
          this.errorAlertText = true;
        })
        .finally(() => {
          if (this.test) {
            this.resetSuccess = true; //for test
          }
        });
    },
    text_act() {
      this.isAct = !this.isAct;
      if (this.isAct) {
        this.pwdtype = 'text';
      } else {
        this.pwdtype = 'password';
      }
    },
    backToLogin() {
      router.go('/login');
    },
    closeRedErrorAlert() {
      this.errorAlertText = false;
    },
  },
};
</script>
<style lang="scss" scoped>
.error {
  display: block;
}
.anchor {
  position: relative;
}
.eye {
  top: auto;
  right: 45px;
  cursor: pointer;
}
.eye.active path {
  fill: #0077ae;
}
.blue-font {
  color: #0077ae;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}
.blue-font:hover {
  color: #005380;
}
.help {
  border-radius: 50%;
  cursor: pointer;
  margin-right: 5px;
}
.help.active path {
  fill: #0077ae;
}
.policy {
  display: none;
  align-items: center;
  text-align: left;
  overflow-y: auto;
  position: absolute;
  width: 410px;
  right: -410px;
  top: -32px;
}
.policy.active {
  display: flex;
}
.optional-rule.highlight,
.rule.highlight {
  color: #ffc107;
}
.rule-pane {
  margin: 12px;
}
div.explain {
  display: none;
  font-size: 14px;
  color: #f44336;
  margin-bottom: 24px;
}
.white-pane {
  padding: 22px 0 24px;
  border-radius: 3px;
  //background-color: rgba(255, 255, 255, 0.28);
}
#label_title {
  font-size: 20px;
  text-align: center !important;
}
/** reset password panel
---------------------------------------------------------*/
#reset-password-error-alert {
  display: none;
}
.reset-password-panel {
  position: relative;
}
input[type='text'].username-tip {
  background-color: rgb(224, 224, 224);
  color: rgb(97, 97, 97);
  cursor: default;
}
.reset-password-new-password-label {
  display: flex;
  align-items: center;
  justify-content: center;
}
/** error alert
---------------------------------------------------------*/
.error-alert {
  display: none;
  background-color: #fef0f0;
  color: #f56c6c;
  padding: 8px 16px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  transition: opacity 0.2s;
  margin-bottom: 12px;
  justify-content: space-between;
}
.error-alert > .col-left {
  display: flex;
  align-items: center;
}
.error-alert-circle {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  background-color: #f56c6c;
  margin-right: 12px;
  width: 24px;
  height: 24px;
}
.error-alert-close {
  cursor: pointer;
  margin-left: 16px;
}
</style>
