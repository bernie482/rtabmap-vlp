<template>
  <div>
    <label id="label_title" class="h1">
      {{ $t('pageKRBAuthentication.KRB_LOGIN_2FA_PROMPT') }}
    </label>
    <b-form
      class="send-email-panel panel login-form"
      novalidate
      @submit.prevent="sendPasscode"
    >
      <label>{{
        `${$t('pageKRBAuthentication.KRB_LOGIN_2FA_MSG')} ${email}`
      }}</label>
      <div v-show="errorAlertText">
        <div class="error-alert">
          <div class="col-left">
            <div>
              <svg width="24" height="24" viewbox="0 0 24 24">
                <path
                  fill="#0070ae"
                  d="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"
                ></path>
              </svg>
            </div>
            <span class="notify-text">{{ errorMsg }}</span>
          </div>
          <span class="error-alert-close" @click="closeAlertText">
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
      </div>
      <div class="white-pane">
        <input-password-toggle>
          <b-form-input
            v-model="passcode"
            type="password"
            placeholder="Please input passcode."
            data-test-id="login-input-code"
            class="text-center"
            :disabled="btnDisabled"
            @input="$v.passcode.$touch()"
          >
          </b-form-input>
        </input-password-toggle>
        <div class="btns">
          <b-button
            variant="light"
            class="btn btn-back"
            :disabled="btnDisabled"
            @click="backToLogin"
          >
            <span>&lt;</span>{{ $t('pageLogin.LANG_COMMON_BACK') }}
          </b-button>
          <b-button
            id="send-email-btn"
            block
            type="submit"
            variant="primary"
            class="btn btn-next"
            :disabled="btnDisabled"
            >{{ $t('pageLogin.LANG_LOGIN_SEND_CODE') }}
          </b-button>
        </div>
      </div>
    </b-form>
  </div>
</template>
<script>
import router from '@/router';
import i18n from '@/i18n';
import InputPasswordToggle from '@/components/Global/InputPasswordToggle';
export default {
  components: { InputPasswordToggle },
  props: {
    otpmail: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      btnDisabled: false,
      email: '',
      test: false,
      passcode: '',
      errorAlertText: false,
      errorMsg: '',
      resetPwdShow: false,
    };
  },
  computed: {},
  watch: {
    otpmail: function (value) {
      if (value === '') return;
      this.email = value;
    },
  },
  created() {},
  validations: {},
  methods: {
    parseErrorMsg(errorCode) {
      if (errorCode == null) return;
      switch (errorCode) {
        case 128:
          return this.$t('pageKRBAuthentication.2FA_ERROR_CODE0');
        case 204:
          return this.$t('pageKRBAuthentication.2FA_ERROR_CODE1');
        case 212:
          return this.$t('pageKRBAuthentication.2FA_ERROR_CODE2');
        default:
          return this.$t('pageKRBAuthentication.2FA_ERROR_CODE3');
      }
    },
    closeAlertText() {
      this.errorAlertText = false;
    },
    sendPasscode() {
      let twofactor = this;
      twofactor.btnDisabled = true;
      twofactor.$store
        .dispatch('authentication/login_otp_passcode', twofactor.passcode)
        .then(() => {
          let state = twofactor.$store.getters['authentication/otpResult'];
          if (state != null && state?.result != 'success') {
            twofactor.btnDisabled = false;
            twofactor.errorMsg = twofactor.parseErrorMsg(state?.msg);
            twofactor.errorAlertText = true;
          } else {
            // success login
            twofactor.errorAlertText = false;
            twofactor.$store.commit('global/setUsername', state?.User ?? '');
            localStorage.setItem('storedUsername', state?.User ?? '');
            twofactor.$store.commit(
              'global/setLanguagePreference',
              i18n.locale
            );
            twofactor.$router.push('/');
          }
        })
        .catch(() => {
          twofactor.btnDisabled = false;
          let state = twofactor.$store.getters['authentication/otpResult'];
          if (state != null) {
            twofactor.errorMsg = twofactor.parseErrorMsg(state?.msg);
          }
          twofactor.errorAlertText = true;
        })
        .finally(() => {});
    },
    backToLogin() {
      router.go('/login');
    },
  },
};
</script>
<style lang="scss" scoped>
/** error alert **/
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

.send-email-panel h1 {
  font-size: 24px;
}
#send-email-input {
  text-align: left;
}
.send-email-panel div.explain {
  padding-left: 5px;
  text-align: left;
  font-weight: 600;
}
#email-error-alert {
  display: none;
}
.go-to-reset-panel-text {
  margin-left: 5px;
}
.return-login-wrapper div {
  margin-top: 10px;
  margin-right: 5px;
  text-decoration: underline;
}
#label_title {
  font-size: 20px;
  text-align: center !important;
}
.fontsize {
  font-size: 12px;
}
.btns {
  display: flex;
  align-items: center;
}
.white-pane {
  padding: 22px 0 24px;
  border-radius: 3px;
  //background-color: rgba(255, 255, 255, 0.28);
}
.btn-back,
.btn-back:disabled {
  flex-grow: 0;
  width: auto;
  height: auto;
  line-height: 0;
  background-color: rgba(255, 255, 255, 0);
  margin-right: 24px;
  margin-left: 24px;
  color: #0070ae;
  font-size: 16px;
}
.btn-back:disabled {
  color: #9e9e9e;
}
.btn-back span:first-child {
  margin-right: 8px;
}
.btn-back:not(:disabled):hover {
  color: #005380;
  background-color: rgba(255, 255, 255, 0);
}
.btn-back:not(:disabled):active {
  color: #005380;
  background-color: rgba(255, 255, 255, 0);
}
</style>
