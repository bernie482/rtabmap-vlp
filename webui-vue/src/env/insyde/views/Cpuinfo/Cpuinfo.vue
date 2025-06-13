<template>
  <b-container fluid="xl">
    <page-title />
    <insyde-unavailable v-if="unavailable" v-show="!loading" />
    <table v-else>
      <tbody>
        <div v-for="(items, idx) in cpu_obj" :key="idx">
          <tr v-for="(data, id) in items" :key="'obj' + id">
            <td>{{ id }}:</td>
            <td>{{ data }}</td>
          </tr>
          <tr>
            <p>&nbsp;</p>
          </tr>
        </div>
      </tbody>
    </table>
  </b-container>
</template>

<script>
import PageTitle from '@/components/Global/PageTitle';

import RedfishBiosSchemaParserMixin from '@/env/insyde/components/Mixins/RedfishBiosSchemaParserMixin';
import {
  cpuValuesParser,
  numberofcpuParser,
} from '@/env/insyde/components/Mixins/CpuTableParserMixin';

export default {
  name: 'CPU',
  components: { PageTitle },
  mixins: [RedfishBiosSchemaParserMixin],
  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
  data() {
    return {
      cpu_obj: [],
    };
  },
  computed: {
    unavailable() {
      return this.cpu_obj.length === 0;
    },
    numberofcpu() {
      return numberofcpuParser(this.$store.getters['cpu/cpuID']);
    },
    values() {
      return cpuValuesParser(this.$store.getters['cpu/cpuValues']);
    },
  },
  created() {
    const cpu = this;
    cpu.startLoader();

    cpu.$store
      .dispatch('cpu/getNumOfcpu')
      .then(() => {
        return cpu.numberofcpu.NumOfCPU;
      })
      .then((d) => {
        return Promise.all(
          d.map((url) => {
            return cpu.$store
              .dispatch('cpu/getCpu', url)
              .then(() => {
                cpu.cpu_obj.push(cpu.values.CPU_DATA);
              })
              .catch(({ message }) => cpu.errorToast(message));
          })
        );
      })
      .finally(() => {
        cpu.endLoader();
      });
  },
  methods: {},
};
</script>

<style></style>
