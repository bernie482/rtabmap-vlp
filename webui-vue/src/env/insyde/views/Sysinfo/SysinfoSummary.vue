<template>
  <page-section :section-title="$t('pageSysinfo.summary.title')">
    <b-row align-v="center">
      <b-col cols="4">
        {{ $t('pageSysinfo.summary.labelHostPowerStatus') }}
      </b-col>
      <b-col class="title" :style="{ color: powerStatusColor }">
        {{ powerStatus }}
      </b-col>
      <div class="w-100"></div>
      <b-col cols="4">
        {{ $t('pageSysinfo.summary.labelBmcUptime') }}
      </b-col>
      <b-col>
        {{ uptimeToDhms }}
      </b-col>
      <div class="w-100"></div>
      <b-col cols="4">
        {{ $t('pageSysinfo.summary.labelActiveBMCFwBuildTime') }}
      </b-col>
      <b-col>
        {{ sysinfo.IPMIFW_BLDTIME }}
      </b-col>
      <div class="w-100"></div>
      <b-col cols="4">
        {{ $t('pageSysinfo.summary.labelActiveBMCFwRev') }}
      </b-col>
      <b-col>
        {{ sysinfo.BMCFW_VERSION }}
      </b-col>
      <template v-if="sysinfo.BACKUP_IPMIFW_BLDTIME">
        <div class="w-100"></div>
        <b-col cols="4">
          {{ $t('pageSysinfo.summary.labelBackupBMCFwBuildTime') }}
        </b-col>
        <b-col>
          {{ sysinfo.BACKUP_IPMIFW_BLDTIME }}
        </b-col>
      </template>
      <template v-if="sysinfo.BACKUP_BMCFW_VERSION">
        <div class="w-100"></div>
        <b-col cols="4">
          {{ $t('pageSysinfo.summary.labelBackupBMCFwRev') }}
        </b-col>
        <b-col>
          {{ sysinfo.BACKUP_BMCFW_VERSION }}
        </b-col>
      </template>
    </b-row>
    <sysinfo-summary-bios-info />
    <b-row align-v="center">
      <b-col cols="4">
        {{ $t('pageSysinfo.summary.labelBMCChipset') }}
      </b-col>
      <b-col>
        {{ sysinfo.BMC_CHIPSET }}
      </b-col>
      <div class="w-100"></div>
      <b-col cols="4">
        {{ $t('pageSysinfo.summary.labelBaseboardSerialNumber') }}
      </b-col>
      <b-col>
        {{ baseboardSn }}
      </b-col>
      <div class="w-100"></div>
      <b-col cols="4">
        {{ $t('pageSysinfo.summary.labelChassisSerialNumber') }}
      </b-col>
      <b-col>
        {{ chassisSn }}
      </b-col>
      <div class="w-100"></div>
      <b-col cols="4">
        {{ $t('pageSysinfo.summary.labelProductSerialNumber') }}
      </b-col>
      <b-col>
        {{ productSn }}
      </b-col>
      <div class="w-100"></div>
      <b-col cols="4">
        {{ $t('pageSysinfo.summary.labelFANTableVersion') }}
      </b-col>
      <b-col>
        {{ sysinfo.FAN_VER }}
      </b-col>
      <div class="w-100"></div>
      <b-col cols="4">
        {{ $t('pageSysinfo.summary.labelHostInterface') }}
      </b-col>
      <b-col>
        <b-form-checkbox
          v-model="hostInterfaceSelection"
          switch
          :disabled="hostInterfaceDisabled || $route.meta.viewOnly"
          @change="$v.hostInterfaceSelection.$touch()"
        >
          {{
            hostInterfaceSelection
              ? $t('global.status.on')
              : $t('global.status.off')
          }}
        </b-form-checkbox>
      </b-col>
    </b-row>
    <b-button
      type="button"
      variant="primary"
      class="mt-1"
      :disabled="!$v.$anyDirty || $route.meta.viewOnly"
      @click="doSave"
    >
      {{ $t('global.action.save') }}
    </b-button>
  </page-section>
</template>

<script>
import i18n from '@/i18n';

import PageSection from '@/components/Global/PageSection';

import SysinfoSummaryBiosInfo from './SysinfoSummaryBiosInfo';

export default {
  components: { PageSection, SysinfoSummaryBiosInfo },

  data() {
    return {
      hostInterfaceSelection: false,
      baseboardSn: '',
      chassisSn: '',
      productSn: '',
    };
  },
  computed: {
    sysinfo() {
      return this.$store.getters['sysinfo/sysinfo'];
    },
    chassis() {
      return this.$store.getters['sysinfo/chassis'].powerStatus.toUpperCase();
    },
    powerStatusColor() {
      return this.chassis == 'UNKNOWN'
        ? '#999999' /* Unknown */
        : this.chassis == 'ON'
        ? '#009900' /* ON */
        : '#990000' /* OFF */;
    },
    powerStatus() {
      return this.chassis == 'UNKNOWN'
        ? i18n.t('pageSysinfo.summary.hostUnknown')
        : this.chassis == 'ON'
        ? i18n.t('pageSysinfo.summary.hostOn')
        : i18n.t('pageSysinfo.summary.hostOff');
    },
    uptimeToDhms() {
      return this.secondsToDhms(this.sysinfo?.BMC_UPTIME ?? 0);
    },
    currentHostInterface() {
      return this.sysinfo?.HOST_INTERFACE?.ENABLE ?? 'false';
    },
    hostInterfaceDisabled() {
      let disable = true;
      // <!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN:(CONFIG_UDC_GADGET_DRV && CONFIG_INSYDE_BIOS_JOINT_FEATURE_HOST_INTERFACE_TOGGLE) -->
      if (this.chassis == 'ON') {
        disable = false;
      }
      // <!-- WEB_CONFIG_DEPEND_FEATURE_END:(CONFIG_UDC_GADGET_DRV && CONFIG_INSYDE_BIOS_JOINT_FEATURE_HOST_INTERFACE_TOGGLE) -->
      return disable;
    },
  },
  validations: {
    hostInterfaceSelection: {},
  },
  created() {
    const summaryBiosinfoPromise = new Promise((resolve) => {
      this.$root.$on('sysinfo-summary-biosinfo-complete', () => resolve());
    });
    const getstatus = this.getStatus();

    Promise.all([getstatus, summaryBiosinfoPromise]).finally(() => {
      // Emit initial data fetch complete to parent component
      this.$root.$emit('sysinfo-summary-complete');
    });
  },
  methods: {
    getStatus() {
      return this.$store
        .dispatch('sysinfo/getStatus')
        .then(() => {
          this.hostInterfaceSelection = this.currentHostInterface;
        })
        .catch(({ message }) => this.errorToast(message))
        .then(() => {
          return this.$store.dispatch('fru/getFru');
        })
        .then(() => {
          let frus = this.$store.getters['fru/fruValues'];
          if (frus.length > 0) {
            let baseFru = this.$store.getters['fru/fruValues'][0];
            this.baseboardSn = baseFru?.Board?.Serial;
            this.chassisSn = baseFru?.Chassis?.Serial;
            this.productSn = baseFru?.Product?.Serial;
          }
        })
        .catch(({ message }) => this.errorToast(message));
    },
    doSave() {
      this.startLoader();
      this.$store
        .dispatch('sysinfo/setHostInterface', this.hostInterfaceSelection)
        .then(() => {
          this.successToast();
          this.$v.$reset();
        })
        .catch(({ message }) => this.errorToast(message))
        .finally(() => {
          this.endLoader();
          // Workaround: Setting the host interface may clear the session and cause incoming requests to fail.
          // Here, do not obtain systeminfo in one step, but obtain it in two steps.
          this.$store.dispatch('sysinfo/getSysteminfo').then(() => {
            this.hostInterfaceSelection = this.currentHostInterface;
          });
        });
    },
    secondsToDhms(seconds) {
      let numdays = Math.floor(seconds / 86400);
      let numhours = Math.floor((seconds % 86400) / 3600);
      let numminutes = Math.floor(((seconds % 86400) % 3600) / 60);
      let numseconds = ((seconds % 86400) % 3600) % 60;

      if (numdays != 0)
        return `${numdays} ${i18n.t(
          'pageSysinfo.unit.days'
        )} ${numhours} ${i18n.t(
          'pageSysinfo.unit.hours'
        )} ${numminutes} ${i18n.t(
          'pageSysinfo.unit.minutes'
        )} ${numseconds} ${i18n.t('pageSysinfo.unit.seconds')}`;
      else if (numhours != 0)
        return `${numhours} ${i18n.t(
          'pageSysinfo.unit.hours'
        )} ${numminutes} ${i18n.t(
          'pageSysinfo.unit.minutes'
        )} ${numseconds} ${i18n.t('pageSysinfo.unit.seconds')}`;
      else if (numminutes != 0)
        return `${numminutes} ${i18n.t(
          'pageSysinfo.unit.minutes'
        )} ${numseconds} ${i18n.t('pageSysinfo.unit.seconds')}`;
      else return `${numseconds} ${i18n.t('pageSysinfo.unit.seconds')}`;
    },
  },
};
</script>
