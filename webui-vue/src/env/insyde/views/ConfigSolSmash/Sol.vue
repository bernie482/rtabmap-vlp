<template>
  <page-section :section-title="$t('pageConfigSolSmash.sol.title')">
    <div class="form-background pl-4 pt-4 pb-1">
      <b-form novalidate @submit.prevent="handleSubmit">
        <b-row class="mb-3">
          <b-form-text>
            {{ $t('pageConfigSolSmash.sol.description') }}
          </b-form-text>
        </b-row>
        <b-row class="mb-3">
          <b-col>
            {{ $t('pageConfigSolSmash.sol.interface') }}
          </b-col>
          <b-col>
            <b-form-select
              id="sol-interface"
              v-model="form.interface"
              :disabled="$route.meta.viewOnly || interfaceOptions.length === 0"
              :options="interfaceOptions"
              @change="onChangeInterface"
            >
            </b-form-select>
          </b-col>
        </b-row>

        <hr />
        <b-row class="mb-3 ml-2">
          <b-col>
            {{ $t('pageConfigSolSmash.sol.enabled') }}
          </b-col>
          <b-col>
            <b-form-checkbox
              id="sol-enable"
              v-model="form.enable"
              :disabled="$route.meta.viewOnly"
            >
              {{ $t('global.status.enabled') }}
            </b-form-checkbox>
          </b-col>
        </b-row>
        <b-row class="mb-3 ml-2">
          <b-col>
            {{ $t('pageConfigSolSmash.sol.baudrate') }}
          </b-col>
          <b-col>
            <b-form-select
              id="sol-baudrate"
              v-model="form.baudrate"
              :options="baudrateOptions"
              :disabled="$route.meta.viewOnly"
            >
            </b-form-select>
          </b-col>
        </b-row>
        <b-row class="mb-3 ml-2">
          <b-col>
            {{ $t('pageConfigSolSmash.sol.flowControl') }}
          </b-col>
          <b-col>
            <b-form-select
              id="sol-flow-control"
              v-model="form.flowControl"
              :options="flowControlOptions"
              :disabled="$route.meta.viewOnly"
            >
            </b-form-select>
          </b-col>
        </b-row>
        <b-row class="mb-3 ml-2">
          <b-col>
            {{ $t('pageConfigSolSmash.sol.privilege') }}
          </b-col>
          <b-col>
            <b-form-select
              id="boot-privilege-Level"
              v-model="form.privilege"
              :disabled="$route.meta.viewOnly || privilegeOptions.length === 0"
              :options="privilegeOptions"
            >
            </b-form-select>
          </b-col>
        </b-row>
        <b-row class="mb-3 ml-2">
          <b-col>
            <b-button
              variant="primary"
              type="submit"
              class="mb-3"
              :disabled="$route.meta.viewOnly"
            >
              {{ $t('global.action.save') }}
            </b-button>
          </b-col>
        </b-row>
      </b-form>
    </div>
  </page-section>
</template>

<script>
//import { mapState, mapMutations } from 'vuex';
import { mapFields } from 'vuex-map-fields';

import PageSection from '@/components/Global/PageSection';

export default {
  name: 'Sol',
  components: { PageSection },

  data() {
    return {
      form: {
        interface: 1,
        enable: false,
        baudrate: 10, // PATCH: index bias by 6
        flowControl: 0,
        privilege: 4,
      },
      baudrateOption: [9600, 19200, 38400, 57600, 115200],
      flowControlOption: ['None', 'RTS/CTS', 'XON/XOFF'],
      privilegeOption: [
        'None',
        'Callback',
        'User',
        'Operator',
        'Administrator',
      ],
    };
  },
  computed: {
    ...mapFields('configSolSmash', ['solInfo']),
    // options
    interfaceOptions() {
      let options = this.solInfo.map((item) => {
        return {
          value: item.interface,
          text: `Channel ${item.interface}`,
        };
      });
      return options;
    },
    baudrateOptions() {
      let options = this.baudrateOption.map((item, index) => {
        return {
          value: index + 6, // PATCH: index bias by 6
          text: item + ' bps',
        };
      });
      return options;
    },
    flowControlOptions() {
      let options = this.flowControlOption.map((item, index) => {
        return {
          value: index,
          text: item,
        };
      });
      return options;
    },
    privilegeOptions() {
      let options = this.privilegeOption.map((item, index) => {
        return {
          value: index,
          text: item,
        };
      });
      // PATCH: remove useless items
      options = options.slice(2);
      return options;
    },
  },
  created() {
    let vm = this;
    this.$store
      .dispatch('configSolSmash/getSolSettings')
      .then(() => {
        vm.updateInterface(vm.form.interface);
      })
      .finally(() =>
        this.$root.$emit('boot-configuration-boot-option-complete')
      );
  },
  methods: {
    handleSubmit() {
      this.startLoader();
      this.$store
        .dispatch('configSolSmash/saveSolSettings', this.form)
        .then((message) => this.successToast(message))
        .catch(({ message }) => this.errorToast(message))
        .finally(() => {
          this.endLoader();
        });
    },
    updateInterface(value) {
      let info = this.solInfo.find((item) => item.interface == value);
      // update
      this.form.interface = info.interface;
      this.form.enable = info.enable;
      this.form.baudrate = info.baudrate;
      this.form.flowControl = info.flowControl;
      this.form.privilege = info.privilege;
    },
    onChangeInterface(value) {
      this.updateInterface(value);
    },
  },
};
</script>
