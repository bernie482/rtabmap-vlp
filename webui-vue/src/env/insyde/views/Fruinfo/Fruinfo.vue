<template>
  <b-container fluid="xl">
    <page-title />
    <insyde-unavailable v-if="unavailable" v-show="!loading" />
    <table v-else>
      <tbody>
        <tr>
          <td><h3>Device</h3></td>
          <td>
            <select v-model="selected">
              <option v-if="!Object.keys(device).length" disabled value="">
                FRU device
              </option>
              <option v-for="(item, idx) in device" v-else :key="idx">
                {{ item }}
              </option>
            </select>
          </td>
        </tr>
        <tr v-show="selected && chassis[selected] != null">
          <td colspan="2"><h3>Chassis Information</h3></td>
        </tr>
        <tr v-for="(val, idx, key) in chassis[selected]" :key="key">
          <td>{{ idx }}:</td>
          <td>
            {{ val }}
          </td>
        </tr>
        <tr v-for="(val, idx, key) in chassis_ex[selected]" :key="key">
          <td>Extra {{ idx + 1 }}:</td>
          <td>
            {{ val }}
          </td>
        </tr>
        <tr v-show="selected && product[selected] != null">
          <td colspan="2"><h3>Product Information</h3></td>
        </tr>
        <tr
          v-for="(val, idx, index) in product[selected]"
          :key="'prod' + index"
        >
          <td>{{ idx }}:</td>
          <td>
            {{ val }}
          </td>
        </tr>
        <tr v-for="(val, idx, key) in product_ex[selected]" :key="key">
          <td>Extra {{ idx + 1 }}:</td>
          <td>
            {{ val }}
          </td>
        </tr>
        <tr v-show="selected && board[selected] != null">
          <td colspan="2"><h3>Board Information</h3></td>
        </tr>
        <tr v-for="(val, idx, key) in board[selected]" :key="'bod' + key">
          <td>{{ idx }}:</td>
          <td>
            {{ val }}
          </td>
        </tr>
        <tr v-for="(val, idx, key) in board_ex[selected]" :key="key">
          <td>Extra {{ idx + 1 }}:</td>
          <td>
            {{ val }}
          </td>
        </tr>
      </tbody>
    </table>
  </b-container>
</template>

<script>
import PageTitle from '@/components/Global/PageTitle';
import RedfishBiosSchemaParserMixin from '@/env/insyde/components/Mixins/RedfishBiosSchemaParserMixin';
import { fruValuesParser } from '@/env/insyde/components/Mixins/FruTableParserMixin';

export default {
  name: 'FRU',
  components: { PageTitle },
  mixins: [RedfishBiosSchemaParserMixin],
  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
  data() {
    return {
      selected: '',
      fru_obj: {},
      device: {},
      chassis: {},
      product: {},
      board: {},
      chassis_ex: {},
      product_ex: {},
      board_ex: {},
    };
  },
  computed: {
    unavailable() {
      return Object.keys(this.device).length === 0;
    },
    values() {
      return fruValuesParser(this.$store.getters['fru/fruValues']);
    },
  },
  created() {
    const fru = this;
    fru.startLoader();

    fru.$store
      .dispatch('fru/getFru')
      .then(() => {
        fru.fru_obj = fru.values.FRU_DATA;
        fru.device = fru.values.DEVICE;
        fru.chassis = fru.values.CHASSIS;
        fru.product = fru.values.PRODUCT;
        fru.board = fru.values.BOARD;
        fru.chassis_ex = fru.values.CHS_EX;
        fru.product_ex = fru.values.PROD_EX;
        fru.board_ex = fru.values.BO_EX;
        let devkeys = Object.keys(fru.device);
        if (devkeys.length) {
          fru.selected = fru.device[devkeys[0]]; // Default select the first device.
        }
      })
      .catch(({ message }) => fru.errorToast(message))
      .finally(() => {
        fru.endLoader();
      });
  },
  methods: {},
};
</script>
