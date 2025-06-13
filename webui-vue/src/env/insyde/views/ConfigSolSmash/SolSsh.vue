<template>
  <page-section :section-title="$t('pageConfigSolSmash.solSsh.title')">
    <div class="form-background pl-4 pt-4 pb-1">
      <b-form novalidate @submit.prevent="handleSubmit">
        <b-row class="mb-3">
          <b-form-text>
            {{ $t('pageConfigSolSmash.solSsh.description') }}
          </b-form-text>
        </b-row>
        <b-row class="mb-3">
          <b-col>
            {{ $t('pageConfigSolSmash.solSsh.enabled') }}
          </b-col>
          <b-col>
            <b-form-checkbox
              id="sol-ssh-enable"
              v-model="solSsh.enabled"
              :disabled="$route.meta.viewOnly"
            >
              {{ $t('global.status.enabled') }}
            </b-form-checkbox>
          </b-col>
        </b-row>
        <b-row class="mb-3">
          <b-col>
            {{ $t('pageConfigSolSmash.solSsh.port') }}
          </b-col>
          <b-col>
            <input
              id="sol-ssh-port"
              v-model="solSsh.port"
              :disabled="$route.meta.viewOnly"
            />
          </b-col>
        </b-row>
        <b-row class="mb-3">
          <b-col>
            {{ $t('pageConfigSolSmash.solSsh.timeout') }}
          </b-col>
          <b-col>
            <input
              id="sol-ssh-timeout"
              v-model="solSsh.timeout"
              :disabled="$route.meta.viewOnly"
            />
          </b-col>
        </b-row>
        <b-row class="mb-3">
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
    };
  },
  computed: {
    ...mapFields('configSolSmash', ['solSsh']),
  },
  methods: {
    handleSubmit() {
      this.startLoader();
      //console.info('handleSubmit', this.solSsh);
      this.$store
        .dispatch('configSolSmash/saveSolSshSettings')
        .then((message) => this.successToast(message))
        .catch(({ message }) => this.errorToast(message))
        .finally(() => {
          this.endLoader();
        });
    },
  },
};
</script>
