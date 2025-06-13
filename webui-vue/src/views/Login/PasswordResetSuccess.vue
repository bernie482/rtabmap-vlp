<template>
  <b-form id="reset-password-success" novalidate @submit.prevent="backToLogin">
    <div class="panel">
      <label id="label_title" class="h1">{{
        $t('pageLogin.LANG_LOGIN_RESET_SUCCESS')
      }}</label>
      <label class="mb-10px">{{
        $t('pageLogin.LANG_LOGIN_RESET_SUCCESS_INFO')
      }}</label>
      <b-button class="btn" block variant="primary" type="submit">
        {{ $t('pageLogin.LANG_LOGIN_RETURN_TO_LOGIN') }}
      </b-button>
    </div>
  </b-form>
</template>
<script>
import router from '@/router';

export default {
  components: {},
  data() {
    return { option: null };
  },
  computed: {},
  watch: {},
  created() {},
  validations: {},
  methods: {
    backToLogin() {
      router.go('/login');
    },
  },
};
</script>
<style lang="scss" scoped>
.mb-10px {
  margin-bottom: 10px;
}
#label_title {
  font-size: 20px;
  text-align: center !important;
}
</style>
