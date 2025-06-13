<template>
  <div>
    <b-form
      v-show="!resetPwdShow"
      class="send-email-panel panel login-form"
      novalidate
      @submit.prevent="sendEmail"
    >
      <label id="label_title" class="h1">{{
        $t('pageLogin.LANG_LOGIN_FORGET_PASSWORD_PROMPT')
      }}</label>
      <label>{{ $t('pageLogin.LANG_LOGIN_FORGET_PASSWORD_INFO') }}</label>
      <div v-show="errorAlertText">
        <div class="error-alert">
          <div class="col-left">
            <div>
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
            </div>
            <span class="error-alert-text">{{ errorMsg }}</span>
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
        <b-form-input
          v-model="username"
          type="text"
          placeholder="Username"
          class="text-center"
          disabled
        >
        </b-form-input>
        <div class="btns">
          <b-button variant="light" class="btn btn-back" @click="backToLogin"
            ><span>&lt;</span>{{ $t('pageLogin.LANG_COMMON_BACK') }}</b-button
          >
          <b-button
            id="send-email-btn"
            block
            type="submit"
            variant="primary"
            class="btn btn-next"
            >{{ $t('pageLogin.LANG_LOGIN_SEND_CODE') }}
          </b-button>
        </div>
      </div>
    </b-form>
    <reset-password v-show="resetPwdShow" :user="username" />
  </div>
</template>
<script>
import router from '@/router';
import ResetPassword from './ResetPassword';

export default {
  components: { ResetPassword },
  props: {
    user: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      test: false,
      username: '',
      errorAlertText: false,
      errorMsg: this.$t('pageLogin.LANG_COMMON_UNKNOWN_ERROR'),
      resetPwdShow: false,
    };
  },
  computed: {},
  watch: {
    user: function (value) {
      if (value === '') return;
      this.username = value;
    },
  },
  created() {},
  validations: {},
  methods: {
    closeAlertText() {
      this.errorAlertText = false;
    },
    sendEmail() {
      this.$store
        .dispatch('authentication/login_send_email', this.username)
        .then(() => {
          this.hide();
          this.resetPwdShow = true;
        })
        .catch((error) => {
          console.log(error);
          this.errorAlertText = true;
        })
        .finally(() => {
          if (this.test) {
            this.resetPwdShow = true; // for test
          }
        });
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
