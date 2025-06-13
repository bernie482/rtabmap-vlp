<template>
  <b-container fluid="xl">
    <page-title />
    <backup-bmc-rom style="width: 650px" />
    <backup-restore-bios style="width: 650px" />
  </b-container>
</template>

<script>
import PageTitle from '@/components/Global/PageTitle';
import BackupBmcRom from './BackupBmcRom';
import BackupRestoreBios from './BackupRestoreBios';

export default {
  name: 'BackupRestore',
  components: { PageTitle, BackupBmcRom, BackupRestoreBios },

  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
  data() {
    return {};
  },
  methods: {},
};
</script>
