<template>
  <b-container fluid="xl">
    <page-title />
    <b-row align-v="center">
      <b-col cols="auto">
        <input type="button" :value="$t('pageSol.lanuch')" @click="doLaunch" />
      </b-col>
      <b-col cols="auto">
        {{ $t('pageSol.help') }}
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import PageTitle from '@/components/Global/PageTitle';

import { fileDownloader } from '@/env/insyde/utilities/InsydeTools';

export default {
  name: 'ConfigSolSmash',
  components: { PageTitle },

  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
  data() {
    return {};
  },
  created() {},
  methods: {
    doLaunch() {
      fileDownloader({
        url:
          '/cgi/url_redirect.cgi?url_name=sol_sess_04&url_type=jwss&lang_setting=English',
        filename: 'launch.jnlp',
        mineType: 'application/x-java-jnlp-file; charset=UTF-8',
        method: 'get',
      });
    },
  },
};
</script>
