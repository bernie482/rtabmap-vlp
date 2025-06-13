<template>
  <div class="login-form text-center">
    <b-form
      v-show="!initForgotPanel && !showTwoFactorPanel"
      novalidate
      @submit.prevent="login"
    >
      <alert class="login-error mb-4" :show="authError" variant="danger">
        <p id="login-error-alert">
          {{ $t('pageLogin.alert.message') }}
        </p>
      </alert>
      <!--USER Name-->
      <!--<b-form-group label-align-xl="center" label-for="username">-->
      <label id="label_login" class="h1">{{
        $t('pageLogin.label_please_login')
      }}</label>
      <b-form-input
        id="username"
        v-model="userInfo.username"
        aria-describedby="login-error-alert username-required"
        :state="getValidationState($v.userInfo.username)"
        type="text"
        autofocus="autofocus"
        data-test-id="login-input-username"
        placeholder="Username"
        class="text-center"
        :disabled="disableSubmitButton"
        @input="$v.userInfo.username.$touch()"
      >
      </b-form-input>
      <b-form-invalid-feedback id="username-required" role="alert">
        <template v-if="!$v.userInfo.username.required">
          {{ $t('global.form.fieldRequired') }}
        </template>
      </b-form-invalid-feedback>
      <!--</b-form-group>-->
      <!--PASSWORD-->
      <div class="login-form_section mb-3">
        <label for="password"></label>
        <input-password-toggle>
          <b-form-input
            id="password"
            ref="refpwd"
            v-model="userInfo.password"
            aria-describedby="login-error-alert password-required"
            :state="getValidationState($v.userInfo.password)"
            type="password"
            data-test-id="login-input-password"
            class="form-control-with-button text-center"
            placeholder="Password"
            :disabled="disableSubmitButton"
            @input="$v.userInfo.password.$touch()"
          >
          </b-form-input>
        </input-password-toggle>
        <b-form-invalid-feedback id="password-required" role="alert">
          <template v-if="!$v.userInfo.password.required">
            {{ $t('global.form.fieldRequired') }}
          </template>
        </b-form-invalid-feedback>
        <div id="functional">
          <b-form-checkbox
            id="remember-username-checkbox"
            v-model="rememberUsername"
            :disabled="disableSubmitButton"
            >{{ $t('pageLogin.LANG_LOGIN_REMEMBER_USERNAME') }}</b-form-checkbox
          >
          <div
            id="forgot-password-text"
            class="blue-font"
            @click="showForgotPwd"
          >
            {{ $t('pageLogin.LANG_LOGIN_FORGOT_PASSWORD') }}
          </div>
        </div>
        <b-button
          block
          class="mt-3"
          type="submit"
          variant="primary"
          data-test-id="login-button-submit"
          :disabled="disableSubmitButton"
          >{{ $t('pageLogin.logIn') }}
        </b-button>
        <!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN:CONFIG_KRB5 -->
        <!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN:CONFIG_WEB_PAGE_CFG_CONFIG_KERBEROS -->
        <b-button
          v-show="btnSSO"
          block
          class="mt-3 btn notify-text"
          variant="primary"
          data-test-id="login-sso-button"
          :disabled="disableSubmitButton"
          @click="SSOLogin"
          >{{ $t('pageKRBAuthentication.KRB_SSO_LOGIN') }}
        </b-button>
        <!-- WEB_CONFIG_DEPEND_FEATURE_END:CONFIG_WEB_PAGE_CFG_CONFIG_KERBEROS -->
        <!-- WEB_CONFIG_DEPEND_FEATURE_END:CONFIG_KRB5 -->
      </div>
      <div>
        <svg width="24" height="24" viewbox="0 0 24 24">
          <path
            fill="#b5b5b5"
            d="M16.36,14C16.44,13.34 16.5,12.68 16.5,12C16.5,11.32 16.44,10.66 16.36,10H19.74C19.9,10.64 20,11.31 20,12C20,12.69 19.9,13.36 19.74,14M14.59,19.56C15.19,18.45 15.65,17.25 15.97,16H18.92C17.96,17.65 16.43,18.93 14.59,19.56M14.34,14H9.66C9.56,13.34 9.5,12.68 9.5,12C9.5,11.32 9.56,10.65 9.66,10H14.34C14.43,10.65 14.5,11.32 14.5,12C14.5,12.68 14.43,13.34 14.34,14M12,19.96C11.17,18.76 10.5,17.43 10.09,16H13.91C13.5,17.43 12.83,18.76 12,19.96M8,8H5.08C6.03,6.34 7.57,5.06 9.4,4.44C8.8,5.55 8.35,6.75 8,8M5.08,16H8C8.35,17.25 8.8,18.45 9.4,19.56C7.57,18.93 6.03,17.65 5.08,16M4.26,14C4.1,13.36 4,12.69 4,12C4,11.31 4.1,10.64 4.26,10H7.64C7.56,10.66 7.5,11.32 7.5,12C7.5,12.68 7.56,13.34 7.64,14M12,4.03C12.83,5.23 13.5,6.57 13.91,8H10.09C10.5,6.57 11.17,5.23 12,4.03M18.92,8H15.97C15.65,6.75 15.19,5.55 14.59,4.44C16.43,5.07 17.96,6.34 18.92,8M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"
          ></path>
        </svg>
        <b-form-select
          id="language"
          v-model="$i18n.locale"
          class="w-50"
          :options="languages"
          data-test-id="login-select-language"
          :disabled="disableSubmitButton"
        ></b-form-select>
        <!--<svg width="24" height="24" viewbox="0 0 24 24">
        <path fill="#b5b5b5" d="M12,6L7,11H17L12,6M7,13L12,18L17,13H7Z"></path>
      </svg>-->
      </div>
    </b-form>
    <!--Modal-->
    <forgot-password
      v-show="initForgotPanel || test"
      :user="userInfo.username"
    />
    <reset-password v-show="test" />
    <password-reset-success v-show="test" />
    <krb-two-fa v-show="showTwoFactorPanel || test" :otpmail="mail" />
  </div>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import VuelidateMixin from '@/components/Mixins/VuelidateMixin.js';
import i18n from '@/i18n';
import Alert from '@/components/Global/Alert';
import InputPasswordToggle from '@/components/Global/InputPasswordToggle';
import ForgotPassword from './ForgotPassword';
import KrbTwoFa from './KrbTwoFa';
import ResetPassword from './ResetPassword';
import PasswordResetSuccess from './PasswordResetSuccess';

export default {
  name: 'Login',
  components: {
    Alert,
    InputPasswordToggle,
    ForgotPassword,
    ResetPassword,
    PasswordResetSuccess,
    KrbTwoFa,
  },
  mixins: [VuelidateMixin],
  data() {
    return {
      test: false,
      mail: '',
      btnSSO: false,
      userInfo: {
        username: null,
        password: null,
      },
      disableSubmitButton: false,
      languages: [
        {
          value: 'en-US',
          text: 'English',
        },
        // Disable langauages es & ru in temporary(during the Supervyse vue pages development).
        //{
        //  value: 'es',
        //  text: 'Español',
        //},
        //{
        //  value: 'ru-RU',
        //  text: 'Русский',
        //},
      ],
      rememberUsername: localStorage.getItem('rememberUsername') ?? false,
      initForgotPanel: false,
      showTwoFactorPanel: false,
    };
  },
  computed: {
    authError() {
      return this.$store.getters['authentication/authError'];
    },
  },
  watch: {
    'userInfo.username': function () {
      if (this.rememberUsername)
        localStorage.setItem('loginUsername', this.userInfo.username);
    },
    rememberUsername: function (newValue) {
      if (newValue) {
        localStorage.setItem('rememberUsername', newValue);
        localStorage.setItem('loginUsername', this.userInfo.username);
      } else {
        localStorage.removeItem('rememberUsername');
        localStorage.removeItem('loginUsername');
      }
    },
  },
  validations: {
    userInfo: {
      username: {
        required,
      },
      password: {
        required,
      },
    },
  },
  mounted() {},
  created() {
    if (this.rememberUsername) {
      this.userInfo.username = localStorage.getItem('loginUsername');
      //this.$refs.refpwd.pointer();
    }
    // <!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN:CONFIG_KRB5 -->
    // <!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN:CONFIG_WEB_PAGE_CFG_CONFIG_KERBEROS -->
    Promise.all([
      this.$store
        .dispatch('authentication/krbcheck')
        .then(() => {
          // ignore here.
        })
        .catch(() => {
          let ssoStart = this.getCookie('SSO');
          if (ssoStart != 0) {
            this.btnSSO = true;
          } else {
            this.btnSSO = false;
          }
        }),
    ]).finally();
    // <!-- WEB_CONFIG_DEPEND_FEATURE_END:CONFIG_WEB_PAGE_CFG_CONFIG_KERBEROS -->
    // <!-- WEB_CONFIG_DEPEND_FEATURE_END:CONFIG_KRB5 -->
  },
  methods: {
    SSOLogin() {
      this.disableSubmitButton = true;
      let elm_forgot_pwd_txt = document.getElementById('forgot-password-text');
      elm_forgot_pwd_txt.classList.add('disabled');
      this.$store
        .dispatch('authentication/sso_login')
        .then(() => {
          // krb login success
          //console.log('sso_login success');
          this.mail = this.getCookie('OTP_MAIL');
          this.showTwoFactorPanel = true;
        })
        .catch((error) => console.log(error))
        .finally(() => (this.disableSubmitButton = false));
    },
    getCookie(cname) {
      var name = cname + '=';
      var ca = document.cookie.split(';');
      for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
          c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
          return c.substring(name.length, c.length);
        }
      }
      return '';
    },
    showForgotPwd() {
      if (!this.disableSubmitButton) {
        this.$v.userInfo.username.$touch();
        if (this.$v.userInfo.username.$invalid) return;
        this.initForgotPanel = true;
      }
    },
    login: function () {
      this.$v.$touch();
      if (this.$v.$invalid) return;
      this.disableSubmitButton = true;
      const username = this.userInfo.username;
      const password = this.userInfo.password;
      this.$store
        .dispatch('authentication/login', { username, password })
        .then(() => {
          localStorage.setItem('storedLanguage', i18n.locale);
          localStorage.setItem('storedUsername', username);
          this.$store.commit('global/setUsername', username);
          this.$store.commit('global/setLanguagePreference', i18n.locale);
          return this.$store.dispatch(
            'authentication/checkPasswordChangeRequired',
            username
          );
        })
        .then((passwordChangeRequired) => {
          if (passwordChangeRequired) {
            this.$router.push('/change-password');
          } else {
            this.$router.push('/');
          }
        })
        .catch((error) => console.log(error))
        .finally(() => (this.disableSubmitButton = false));
    },
  },
};
</script>
<style lang="scss" scoped>
input[type='password'].error {
  border-color: #f44336;
  outline: 0;
  -webkit-box-shadow: 0 0 0 2px rgba(245, 34, 45, 0.2);
  box-shadow: 0 0 0 2px rgba(245, 34, 45, 0.2);
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
#label_login {
  font-size: 20px;
  text-align: center !important;
}
#functional {
  flex-flow: row nowrap;
}
#forgot-password-text.disabled {
  color: #bdbdbd;
  cursor: not-allowed;
  user-select: none;
}
.error-tip {
  display: none;
}
.error-con {
  vertical-align: super;
  color: #0070ae;
  font-weight: 500;
}
</style>
