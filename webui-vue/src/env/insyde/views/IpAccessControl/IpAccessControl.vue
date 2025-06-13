<template>
  <b-container fluid="xl">
    <page-title />
    <ipv4-setting :target="'ipv4'" />
    <ipv4-setting :target="'ipv6'" />
  </b-container>
</template>

<script>
import PageTitle from '@/components/Global/PageTitle';
import Ipv4Setting from './Ipv4Setting';

export default {
  name: 'IpAccessControl',
  components: {
    PageTitle,
    Ipv4Setting,
  },
};
</script>
