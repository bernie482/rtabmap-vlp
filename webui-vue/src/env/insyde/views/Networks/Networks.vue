<template>
  <b-container fluid="xl">
    <page-title :description="$t('pageNetworks.pageDescription')" />
    <b-form novalidate @submit.prevent="handleGlobalSettingSubmit">
      <b-row v-if="channelCount > 1">
        <b-col md="12">
          <b-form-group label="Lan Failover">
            <b-form-checkbox
              v-model="form.failover"
              data-test-id="networks-checkbox-switchFailover"
              name="check-button-1"
              switch
              :disabled="loading"
              @change="changeFailoverValue"
            >
              <span v-if="form.failover">
                {{ $t('global.action.enable') }}
              </span>
              <span v-else>
                {{ $t('global.action.disable') }}
              </span>
            </b-form-checkbox>
            <label v-show="$v.form.failover.$dirty" class="warning">
              {{ $t('pageNetworks.form.failoverWarning') }}
            </label>
          </b-form-group>
        </b-col>
      </b-row>
      <b-row>
        <b-col cols="6" sm="5" md="4" lg="4">
          <b-form-group :label="$t('pageNetworks.form.lanChannel')">
            <b-form-select
              id="channel-select"
              v-model="selectedChannelIndex"
              data-test-id="networks-select-channel"
              :options="channelSelectOptions"
              :disabled="form.failover || loading"
              @change="changeChannel"
            >
            </b-form-select>
          </b-form-group>
        </b-col>
      </b-row>
      <b-row>
        <b-col cols="6" sm="5" md="4" lg="4">
          <b-form-group
            :label="$t('pageNetworks.form.macAddress')"
            label-for="mac-address"
          >
            <b-form-input
              id="mac-address"
              v-model.trim="form.macAddress"
              data-test-id="networkSettings-input-macAddress"
              type="text"
              disabled
              :state="getValidationState($v.form.macAddress)"
              @change="$v.form.macAddress.$touch()"
            />
            <b-form-invalid-feedback role="alert">
              <div v-if="!$v.form.macAddress.required">
                {{ $t('global.form.fieldRequired') }}
              </div>
              <div v-if="!$v.form.macAddress.validateMacAddress">
                {{ $t('global.form.invalidFormat') }}
              </div>
            </b-form-invalid-feedback>
          </b-form-group>
        </b-col>
        <b-col cols="6" sm="5" md="4" lg="4">
          <b-form-group
            :label="$t('pageNetworks.form.hostname')"
            label-for="hostname-field"
          >
            <b-form-input
              id="hostname-field"
              v-model.trim="form.hostname"
              data-test-id="networkSettings-input-hostname"
              type="text"
              :state="getValidationState($v.form.hostname)"
              :disabled="loading"
              @change="$v.form.hostname.$touch()"
            />
            <b-form-invalid-feedback role="alert">
              <div v-if="!$v.form.hostname.required">
                {{ $t('global.form.fieldRequired') }}
              </div>
              <div v-if="$v.form.hostname.$invalid">
                {{ $t('pageNetworks.form.hostnameFormat') }}
              </div>
            </b-form-invalid-feedback>
          </b-form-group>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <b-button variant="primary" type="submit" :disabled="loading">
            {{ $t('global.action.saveSettings') }}
          </b-button>
        </b-col>
      </b-row>
    </b-form>
    <b-row>
      <b-col cols="12" sm="12" md="11" lg="11" xl="10">
        <b-button
          v-b-toggle.collapse-ipv4
          data-test-id="networks-button-viewIPv4Network"
          variant="link"
          class="mt-3"
          :disabled="loading"
        >
          <icon-chevron />
          {{ $t('pageNetworks.viewIPv4Network') }}
        </b-button>
        <b-collapse id="collapse-ipv4" class="mt-3">
          <form-per-version
            version="4"
            :channel="selectedChannelV4"
            :loading="loading"
            @save="handleLanSettingsSubmit"
          />
        </b-collapse>
      </b-col>
    </b-row>
    <b-row>
      <b-col cols="12" sm="12" md="11" lg="11" xl="10">
        <b-button
          v-b-toggle.collapse-ipv6
          data-test-id="networks-button-viewIPv6Network"
          variant="link"
          class="mt-3"
          :disabled="loading"
        >
          <icon-chevron />
          {{ $t('pageNetworks.viewIPv6Network') }}
        </b-button>
        <b-collapse id="collapse-ipv6" class="mt-3">
          <form-per-version
            version="6"
            :channel="selectedChannelV6"
            :loading="loading"
            @save="handleLanSettingsSubmit"
          />
        </b-collapse>
      </b-col>
    </b-row>
    <b-row>
      <b-col cols="12" sm="12" md="11" lg="11" xl="10">
        <b-button
          v-b-toggle.collapse-vlan
          data-test-id="networks-button-viewVLAN"
          variant="link"
          class="mt-3"
          :disabled="loading"
        >
          <icon-chevron />
          {{ $t('pageNetworks.viewVLAN') }}
        </b-button>
        <b-collapse id="collapse-vlan" class="mt-3">
          <b-form novalidate @submit.prevent="handleVlanSubmit">
            <b-form-group>
              <b-card>
                <b-row>
                  <b-col md="12">
                    <b-form-group :label="$t('pageNetworks.form.vlan.enable')">
                      <b-form-checkbox
                        id="vlan-enable"
                        v-model="form.vlan.enable"
                        data-test-id="networks-checkbox-switchVLAN"
                        switch
                        :disabled="loading"
                        @change="$v.form.vlan.$touch()"
                      >
                        <span>
                          {{
                            $t(
                              `global.status.${form.vlan.enable ? 'on' : 'off'}`
                            )
                          }}
                        </span>
                      </b-form-checkbox>
                    </b-form-group>
                  </b-col>
                </b-row>
              </b-card>
              <b-card>
                <b-row>
                  <b-col cols="6" sm="5" md="4" lg="4">
                    <b-form-group
                      :label="$t('pageNetworks.form.vlan.id')"
                      label-for="input-vlan-id"
                    >
                      <b-form-input
                        id="input-vlan-id"
                        v-model.number="form.vlan.id"
                        type="number"
                        min="1"
                        max="4094"
                        data-test-id="networkSettings-input-vlan-id"
                        :state="
                          !form.vlan.enable ||
                          getValidationState($v.form.vlan.id)
                        "
                        :disabled="!form.vlan.enable || loading"
                        @change="$v.form.vlan.id.$touch()"
                      />
                      <b-form-invalid-feedback role="alert">
                        <div v-if="!$v.form.vlan.id.required">
                          {{ $t('global.form.fieldRequired') }}
                        </div>
                        <div v-if="$v.form.vlan.id.$invalid">
                          {{
                            $t('global.form.valueMustBeBetween', {
                              min: 1,
                              max: 4094,
                            })
                          }}
                        </div>
                      </b-form-invalid-feedback>
                    </b-form-group>
                  </b-col>
                  <b-col cols="6" sm="5" md="4" lg="4">
                    <b-form-group
                      :label="$t('pageNetworks.form.vlan.priority')"
                      label-for="input-vlan-priority"
                    >
                      <b-form-input
                        id="input-vlan-priority"
                        v-model.number="form.vlan.priority"
                        type="number"
                        min="0"
                        max="7"
                        data-test-id="networkSettings-input-vlan-priority"
                        :state="
                          !form.vlan.enable ||
                          getValidationState($v.form.vlan.priority)
                        "
                        :disabled="!form.vlan.enable || loading"
                        @change="$v.form.vlan.priority.$touch()"
                      />
                      <b-form-invalid-feedback
                        v-if="form.vlan.enable"
                        role="alert"
                      >
                        <div v-if="!$v.form.vlan.priority.required">
                          {{ $t('global.form.fieldRequired') }}
                        </div>
                        <div v-if="!$v.form.vlan.priority.validateVlanPriority">
                          {{
                            $t('global.form.valueMustBeBetween', {
                              min: 0,
                              max: 7,
                            })
                          }}
                        </div>
                      </b-form-invalid-feedback>
                    </b-form-group>
                  </b-col>
                </b-row>
              </b-card>
              <b-button
                variant="primary"
                type="submit"
                data-test-id="networkSettings-button-saveVlanSettings"
                :disabled="loading"
              >
                {{ $t('global.action.saveSettings') }}
              </b-button>
            </b-form-group>
          </b-form>
        </b-collapse>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
//import IconTrashcan from '@carbon/icons-vue/es/trash-can/20';
//import IconAdd from '@carbon/icons-vue/es/add--alt/20';

//import PageSection from '@/components/Global/PageSection';
import PageTitle from '@/components/Global/PageTitle';
import FormPerVersion from './FormPerVersion';
//import TableRowAction from '@/components/Global/TableRowAction';
import { mapState } from 'vuex';
import {
  required,
  helpers,
  between,
  minLength,
  maxLength,
} from 'vuelidate/lib/validators';
import IconChevron from '@carbon/icons-vue/es/chevron--up/20';
import Validator from '@/env/insyde/utilities/Validator';

// MAC address pattern
const validateMacAddress = helpers.regex(
  'validateMacAddress',
  /^(?:[0-9A-Fa-f]{2}([:-]?)[0-9A-Fa-f]{2})(?:(?:\1|\.)(?:[0-9A-Fa-f]{2}([:-]?)[0-9A-Fa-f]{2})){2}$/
);

export default {
  name: 'Networks',
  components: {
    PageTitle,
    //PageSection,
    FormPerVersion,
    //TableRowAction,
    //IconTrashcan,
    //IconAdd,
    IconChevron,
  },

  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
  data() {
    return {
      selectedChannelIndex: 0,
      selectedChannelV4: {},
      selectedChannelV6: {},
      form: {
        failover: false,
        hostname: '',
        macAddress: '',
        vlan: {
          enable: false,
          id: 1,
          priority: 1,
        },
      },
    };
  },
  validations() {
    return {
      form: {
        failover: {},
        macAddress: { required, validateMacAddress },
        hostname: {
          required,
          hostname: Validator.HostName,
          minLength: minLength(2),
          maxLength: maxLength(64),
        },
        vlan: {
          enable: {},
          id: {
            required,
            validateVlanId(v) {
              return between(this.form.vlan.enable ? 1 : 0, 4094)(v);
            },
          },
          priority: { required, validateVlanPriority: between(0, 7) },
        },
      },
    };
  },
  computed: {
    ...mapState('networks', [
      'activeChannel',
      'failover',
      'ipv4Nics',
      'ipv6Nics',
      'vlan',
    ]),
    activeChannelIndex() {
      if (this.ipv4Nics.some((nic) => nic.channel == this.activeChannel)) {
        return this.activeChannel;
      } else {
        return this.ipv4Nics?.[0]?.channel ?? 0;
      }
    },
    vlanInfoOnChannel() {
      if (this.form.failover) {
        return this.vlan[0];
      } else {
        return (
          this.vlan.find((info) => info.channel == this.selectedChannelIndex) ??
          this.vlan[0]
        );
      }
    },
    channelSelectOptions() {
      return this.ipv4Nics.map((option) => {
        return {
          text: 'channel-' + option.channel,
          value: option.channel,
        };
      });
    },
    channelCount() {
      return this.ipv4Nics.length;
    },
  },
  watch: {
    ipv4Nics: function () {
      this.form.failover = Boolean(this.failover == 1);
      this.selectChannel(4, this.form.failover);
    },
    ipv6Nics: function () {
      this.form.failover = Boolean(this.failover == 1);
      this.selectChannel(6, this.form.failover);
    },
    vlan: function (vlan) {
      if (vlan) {
        this.form.vlan.enable = this.vlanInfoOnChannel.enable;
        this.form.vlan.id = this.vlanInfoOnChannel.id;
        this.form.vlan.priority = this.vlanInfoOnChannel.priority;
      }
    },
    failover: function () {
      if (this.form.failover != this.failover) {
        this.$v.form.failover.$touch();
      } else {
        this.$v.form.failover.$reset();
      }
    },
  },
  created() {
    this.startLoader();
    Promise.all([
      this.$store.dispatch('networks/getIPv4ConfigInfo'),
      this.$store.dispatch('networks/getIPv6ConfigInfo'),
      this.$store.dispatch('networks/getVlanConfigInfo'),
    ])
      .then(() => {
        this.form.failover = Boolean(this.failover == 1);
        if (this.form.failover) {
          this.selectedChannelIndex = this.ipv4Nics?.[0]?.channel ?? 0;
        } else {
          this.selectedChannelIndex = this.activeChannelIndex;
        }
      })
      .finally(() => this.endLoader());
  },
  methods: {
    selectChannel(version, failover) {
      failover = failover || false;
      const vm = this;
      if (version == 4) {
        if (failover) {
          this.selectedChannelV4 = this.ipv4Nics[0];
        } else {
          this.selectedChannelV4 =
            this.ipv4Nics.find(
              (info) => info.channel == vm.selectedChannelIndex
            ) ?? this.ipv4Nics[0];
        }
      } else if (version == 6) {
        if (failover) {
          this.selectedChannelV6 = this.ipv6Nics[0];
        } else {
          this.selectedChannelV6 =
            this.ipv6Nics.find(
              (info) => info.channel == vm.selectedChannelIndex
            ) ?? this.ipv6Nics[0];
        }
      }
      this.getChannelSettings();
    },
    getChannelSettings() {
      this.form.hostname = this.selectedChannelV4?.hostname ?? '';
      this.form.macAddress = this.selectedChannelV4?.mac ?? '';
    },
    handleGlobalSettingSubmit() {
      if (this.$v.form.hostname.$invalid) return;
      let settings = {
        mode: 'ip4',
        enable: Boolean(this.selectedChannelV4.ipv4.enable),
        dhcp: this.selectedChannelV4.ipv4.source === 2,
      };
      this.handleLanSettingsSubmit(settings);
    },
    handleLanSettingsSubmit(channelSettingsForm) {
      if (this.$v.form.hostname.$invalid) return;
      this.$bvModal
        .msgBoxConfirm(this.$t('pageNetworks.toast.confirmMessage'), {
          title: this.$t('global.status.warning'),
          okTitle: this.$t('global.action.confirm'),
          cancelTitle: this.$t('global.action.cancel'),
        })
        .then((confirmed) => {
          if (confirmed) {
            this.startLoader();
            channelSettingsForm.channel = this.selectedChannelV4.channel;
            channelSettingsForm.mac = this.form.macAddress;
            channelSettingsForm.hostname = this.form.hostname;
            channelSettingsForm.failover = Boolean(this.form.failover);
            let destination = null;
            if (channelSettingsForm.mode == 'ip4') {
              destination = 'networks/updateIPv4ChannelSettings';
            } else if (channelSettingsForm.mode == 'ip6') {
              destination = 'networks/updateIPv6ChannelSettings';
            }
            this.$store
              .dispatch(destination, channelSettingsForm)
              .then((success) => {
                this.successToast(success);
              })
              .catch((/*{ message }*/) => {
                // Don't show error messages due to the network is not available after saving changes.
                // this.errorToast(message);
                this.successToast(
                  this.$t('pageNetworks.toast.successRequestSent')
                );
              })
              .finally(() => {
                //this.$v.form.$reset();
                this.endLoader();
              });
          }
        });
    },
    handleVlanSubmit() {
      if (this.$v.form.vlan.$invalid) return;
      this.$bvModal
        .msgBoxConfirm(this.$t('pageNetworks.toast.confirmMessage'), {
          title: this.$t('global.status.warning'),
          okTitle: this.$t('global.action.confirm'),
          cancelTitle: this.$t('global.action.cancel'),
        })
        .then((confirmed) => {
          if (confirmed) {
            this.startLoader();
            const data = {
              channel: this.selectedChannelIndex,
              enable: this.form.vlan.enable,
              vlanId: this.form.vlan.id,
              vlanPriority: this.form.vlan.priority,
            };
            this.$store
              .dispatch('networks/updateVlanSettings', data)
              .then((success) => {
                this.successToast(success);
              })
              .catch((/*{ message }*/) => {
                // Don't show error messages due to the network is not available after saving changes.
                // this.errorToast(message);
                this.successToast(
                  this.$t('pageNetworks.toast.successRequestSent')
                );
              })
              .finally(() => {
                //this.$v.form.$reset();
                this.endLoader();
              });
          }
        });
    },
    changeSettings(failoverState) {
      this.selectChannel(4, failoverState);
      this.selectChannel(6, failoverState);
      // Update VLAN
      this.form.vlan.enable = this.vlanInfoOnChannel.enable;
      this.form.vlan.id = this.vlanInfoOnChannel.id;
      this.form.vlan.priority = this.vlanInfoOnChannel.priority;
    },
    changeFailoverValue(failoverState) {
      if (failoverState != this.failover) {
        this.$v.form.failover.$touch();
      } else {
        this.$v.form.failover.$reset();
      }
      if (failoverState) {
        this.lastSelectedChannelIndex = this.selectedChannelIndex;
        this.selectedChannelIndex = this.ipv4Nics?.[0]?.channel ?? 0;
      } else {
        this.selectedChannelIndex =
          this.lastSelectedChannelIndex ?? this.ipv4Nics?.[0]?.channel ?? 0;
      }
      this.changeSettings(failoverState);
    },
    changeChannel() {
      this.form.failover = Boolean(this.failover == 1);
      if (this.form.failover) {
        this.selectedChannelIndex = this.ipv4Nics?.[0]?.channel ?? 0;
      }
      this.changeSettings(this.form.failover);
    },
  },
};
</script>

<style lang="scss" scoped>
.warning {
  color: #da1416;
}
.btn.collapsed {
  svg {
    transform: rotate(180deg);
  }
}
</style>
