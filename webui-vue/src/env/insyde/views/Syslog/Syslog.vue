<template>
  <b-container fluid="x1">
    <page-title />
    <base-setting />
    <log-to-remote-srv />
    <reset-def />
    <config-file />
  </b-container>
</template>
<script>
import PageTitle from '@/components/Global/PageTitle';

import BaseSetting from './baseSetting';
import LogToRemoteSrv from './LogToRemoteSrv';
import ResetDef from './resetDef';
import ConfigFile from './configFile';
export default {
  name: 'SyslogSettings',
  components: {
    PageTitle,
    LogToRemoteSrv,
    BaseSetting,
    ResetDef,
    ConfigFile,
  },

  data() {
    return {};
  },
  computed: {},
  created() {},
  methods: {},
};
</script>
