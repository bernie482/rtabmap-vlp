<template>
  <page-section :section-title="$t('pageamdFirmware.sectionTitleHostCards')">
    <b-form novalidate class="mb-5">
      <b-form-group :label="$t('pageamdFirmware.selectbiostype')">
        <b-form-radio
          v-model="form.setBiosTypeOption"
          name="set-bios-type-option"
          data-test-id="amdfirmware-radio-setNonCombo"
          value="noncombo"
          @change="setBiosType"
        >
          {{ $t('pageamdFirmware.noncombobiossupport') }}
        </b-form-radio>
        <b-form-radio
          v-model="form.setBiosTypeOption"
          name="set-bios-type-option"
          data-test-id="amdfirmware-radio-setCombo"
          value="combo"
          @change="setBiosType"
        >
          {{ $t('pageamdFirmware.combobiossupport') }}
        </b-form-radio>
      </b-form-group>
    </b-form>
    <b-card-group deck>
      <!-- Running image -->
      <b-card>
        <template #header>
          <p class="font-weight-bold m-0">
            {{ $t('pageamdFirmware.cardTitleRunning') }}
          </p>
        </template>
        <dl class="mb-0">
          <dt>{{ $t('pageamdFirmware.cardBodyVersion') }}</dt>
          <dd class="mb-0">{{ runningVersion }}</dd>
        </dl>
      </b-card>
    </b-card-group>
  </page-section>
</template>

<script>
import PageSection from '@/components/Global/PageSection';

export default {
  components: { PageSection },
  data() {
    return {
      form: {
        setBiosTypeOption: 'noncombo',
      },
    };
  },
  computed: {
    running() {
      return this.$store.getters['firmware/activeHostFirmware'];
    },
    backup() {
      return this.$store.getters['firmware/backupHostFirmware'];
    },
    runningVersion() {
      return this.running?.version || '--';
    },
    backupVersion() {
      return this.backup?.version || '--';
    },
    backupStatus() {
      return this.backup?.status || null;
    },
    showBackupImageStatus() {
      return (
        this.backupStatus === 'Critical' || this.backupStatus === 'Warning'
      );
    },
  },
  methods: {
    setBiosType() {
      if (this.form.setBiosTypeOption === 'noncombo') {
        this.$store.dispatch('firmware/NonComboBiosUpdate');
      } else if (this.form.setBiosTypeOption === 'combo') {
        this.$store.dispatch('firmware/ComboBiosUpdate');
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.page-section {
  margin-top: -$spacer * 1.5;
}
</style>
