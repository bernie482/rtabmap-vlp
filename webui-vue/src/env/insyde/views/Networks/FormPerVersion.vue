<template>
  <b-form novalidate @submit.prevent="submitForm">
    <b-form-group>
      <b-card>
        <b-row>
          <b-col cols="6" sm="5" md="4" lg="4">
            <b-form-group
              :label-for="'link-status-select-' + version"
              :label="$t('pageNetworks.form.networkInterface')"
            >
              <template v-if="version == '4'">
                <b-form-select
                  :id="'link_status-select' + version"
                  v-model="selectedLinkStatusIndex"
                  data-test-id="networkSettings-select-interface"
                  :options="linkStatusIpv4SelectOptions"
                  :disabled="loading"
                  @change="$v.form.$touch()"
                >
                </b-form-select>
              </template>
              <template v-else>
                <b-form-select
                  :id="'link_status-select' + version"
                  v-model="selectedLinkStatusIndex"
                  data-test-id="networkSettings-select-interface"
                  :options="linkStatusIpv6SelectOptions"
                  :disabled="loading"
                  @change="$v.form.$touch()"
                >
                </b-form-select>
              </template>
            </b-form-group>
          </b-col>
          <b-col cols="6" sm="5" md="4" lg="4">
            <b-form-group
              :label="$t('pageNetworks.form.gateway')"
              :label-for="'gateway-' + version"
            >
              <b-form-input
                :id="'gateway-' + version"
                v-model.trim="form.gateway"
                data-test-id="networkSettings-input-gateway"
                type="text"
                :readonly="dhcpEnabled"
                :disabled="linkDisabled || loading"
                :state="getValidationState($v.form.gateway)"
                @change="$v.form.gateway.$touch()"
              />
              <b-form-invalid-feedback role="alert">
                <div v-if="!$v.form.gateway.required">
                  {{ $t('global.form.fieldRequired') }}
                </div>
                <div v-if="!$v.form.gateway.validateAddress">
                  {{ $t('global.form.invalidFormat') }}
                </div>
              </b-form-invalid-feedback>
            </b-form-group>
          </b-col>
          <b-col v-if="version == '6'" lg="auto">
            <label>{{ $t('pageNetworks.table.linklocalAddress') }}</label>
            <b-form-input
              :id="'linklocal-' + version"
              v-model.trim="ipv6LinklocalAddr"
              type="text"
              :readonly="true"
            />
          </b-col>
        </b-row>
      </b-card>
      <template v-if="version == '6'">
        <b-card title="DHCPv6">
          <b-row>
            <b-col lg="9" class="mb-3">
              <b-form-group label="IPv6 DHCPv6/SLAAC">
                <b-form-checkbox
                  v-model="dhcpEnabled"
                  data-test-id="networks-checkbox-switch-ipv6-enable"
                  name="check-button-1"
                  switch
                  :disabled="linkDisabled || loading"
                  @change="changeIPv6Enable"
                >
                  <span v-if="dhcpEnabled">
                    {{ 'Enabled' }}
                  </span>
                  <span v-else>
                    {{ 'Disabled' }}
                  </span>
                </b-form-checkbox>
              </b-form-group>
              <b-table
                responsive="md"
                hover
                :fields="ipv6DynamicTableFields"
                :items="ip6DynamicTableNonEmptyItems"
                class="mb-0"
              >
                <template #cell(Address)="{ item, index }">
                  <b-form-input
                    v-model.trim="item.Address"
                    :data-test-id="`networkSettings-input-dynamicIpv6-address-${index}`"
                    :aria-label="
                      $t('pageNetworks.table.dynamicIpv6AddressRow') +
                      ' ' +
                      (index + 1)
                    "
                    :readonly="true"
                  />
                </template>
                <template #cell(SubnetMask)="{ item, index }">
                  <b-form-input
                    v-model.trim="item.SubnetMask"
                    :data-test-id="`networkSettings-input-dynamicIpv6-prefixLength-${index}`"
                    :aria-label="
                      $t('pageNetworks.table.dynamicIpv6PrefixLengthRow') +
                      ' ' +
                      (index + 1)
                    "
                    :readonly="true"
                  />
                </template>
              </b-table>
            </b-col>
          </b-row>
        </b-card>
      </template>
      <b-card title="IP Address">
        <b-row>
          <b-col lg="9" class="mb-3">
            <b-table
              responsive="md"
              hover
              :fields="staticAddressTableFields"
              :items="form.staticAddressTableItems"
              class="mb-0"
            >
              <template #cell(Address)="{ item, index }">
                <b-form-input
                  v-model.trim="item.Address"
                  :data-test-id="`networkSettings-input-staticIp-address-${index}`"
                  :aria-label="
                    $t('pageNetworks.table.staticIpAddressRow') +
                    ' ' +
                    (index + 1)
                  "
                  :disabled="!enableStaticAddressModify"
                  :state="
                    getValidationState(
                      $v.form.staticAddressTableItems.$each.$iter[index].Address
                    )
                  "
                  @change="
                    $v.form.staticAddressTableItems.$each.$iter[
                      index
                    ].Address.$touch()
                  "
                />
                <b-form-invalid-feedback role="alert">
                  <div
                    v-if="
                      !$v.form.staticAddressTableItems.$each.$iter[index]
                        .Address.required
                    "
                  >
                    {{ $t('global.form.fieldRequired') }}
                  </div>
                  <div
                    v-if="
                      !$v.form.staticAddressTableItems.$each.$iter[index]
                        .Address.validateAddress
                    "
                  >
                    {{ $t('global.form.invalidFormat') }}
                  </div>
                </b-form-invalid-feedback>
              </template>
              <template #cell(SubnetMask)="{ item, index }">
                <b-form-input
                  v-model.trim="item.SubnetMask"
                  :data-test-id="`networkSettings-input-staticIp-subnetMask-${index}`"
                  :aria-label="
                    $t('pageNetworks.table.staticIpSubnetRow') +
                    ' ' +
                    (index + 1)
                  "
                  :disabled="!enableStaticAddressModify"
                  :state="
                    getValidationState(
                      $v.form.staticAddressTableItems.$each.$iter[index]
                        .SubnetMask
                    )
                  "
                  @change="
                    $v.form.staticAddressTableItems.$each.$iter[
                      index
                    ].SubnetMask.$touch()
                  "
                />
                <b-form-invalid-feedback role="alert">
                  <div
                    v-if="
                      !$v.form.staticAddressTableItems.$each.$iter[index]
                        .SubnetMask.required
                    "
                  >
                    {{ $t('global.form.fieldRequired') }}
                  </div>
                  <div
                    v-if="
                      !$v.form.staticAddressTableItems.$each.$iter[index]
                        .SubnetMask.validateAddressOrLength
                    "
                  >
                    {{ $t('global.form.invalidFormat') }}
                  </div>
                </b-form-invalid-feedback>
              </template>
              <template #cell(actions)="{ item, index }">
                <table-row-action
                  v-for="(action, actionIndex) in item.actions"
                  :key="actionIndex"
                  :value="action.value"
                  :title="action.title"
                  :enabled="enableStaticAddressModify"
                  @click-table-action="
                    onDeleteStaticAddressTableRow($event, index)
                  "
                >
                  <template #icon>
                    <icon-trashcan v-if="action.value === 'delete'" />
                  </template>
                </table-row-action>
              </template>
            </b-table>
            <b-button
              variant="link"
              :disabled="!enableStaticAddressModify"
              @click="addStaticAddressTableRow"
            >
              <icon-add />
              {{ $t('pageNetworks.table.addStaticIpAddress') }}
            </b-button>
          </b-col>
        </b-row>
      </b-card>
      <b-card title="DNS Server">
        <b-row>
          <b-col lg="4" class="mb-3">
            <b-table
              responsive
              hover
              :fields="dnsTableFields"
              :items="form.dnsStaticTableItems"
              class="mb-0"
            >
              <template #cell(address)="{ item, index }">
                <b-form-input
                  v-model.trim="item.address"
                  :data-test-id="`networkSettings-input-dnsAddress-${index}`"
                  :aria-label="
                    $t('pageNetworks.table.staticDnsRow') + ' ' + (index + 1)
                  "
                  :disabled="!enableDnsAddressModify"
                  :state="
                    getValidationState(
                      $v.form.dnsStaticTableItems.$each.$iter[index].address
                    )
                  "
                  @change="
                    $v.form.dnsStaticTableItems.$each.$iter[
                      index
                    ].address.$touch()
                  "
                />
                <b-form-invalid-feedback role="alert">
                  <div
                    v-if="
                      !$v.form.dnsStaticTableItems.$each.$iter[index].address
                        .required
                    "
                  >
                    {{ $t('global.form.fieldRequired') }}
                  </div>
                  <div
                    v-if="
                      !$v.form.dnsStaticTableItems.$each.$iter[index].address
                        .validateAddress
                    "
                  >
                    {{ $t('global.form.invalidFormat') }}
                  </div>
                </b-form-invalid-feedback>
              </template>
              <template #cell(actions)="{ item, index }">
                <table-row-action
                  v-for="(action, actionIndex) in item.actions"
                  :key="actionIndex"
                  :value="action.value"
                  :title="action.title"
                  :enabled="enableDnsAddressModify"
                  @click-table-action="onDeleteDnsTableRow($event, index)"
                >
                  <template #icon>
                    <icon-trashcan v-if="action.value === 'delete'" />
                  </template>
                </table-row-action>
              </template>
            </b-table>
            <b-button
              variant="link"
              :disabled="!enableDnsAddressModify"
              @click="addDnsTableRow"
            >
              <icon-add /> {{ $t('pageNetworks.table.addDns') }}
            </b-button>
          </b-col>
        </b-row>
      </b-card>
      <b-button
        variant="primary"
        type="submit"
        data-test-id="networkSettings-button-saveNetworkSettings"
        :disabled="loading"
      >
        {{ $t('global.action.saveSettings') }}
      </b-button>
    </b-form-group>
  </b-form>
</template>

<script>
import IconTrashcan from '@carbon/icons-vue/es/trash-can/20';
import IconAdd from '@carbon/icons-vue/es/add--alt/20';
//
//import PageSection from '@/components/Global/PageSection';
//import PageTitle from '@/components/Global/PageTitle';
//import FormPerVersion from './FormPerVersion';
import TableRowAction from '@/components/Global/TableRowAction';
//import { mapState } from 'vuex';
import { requiredIf, helpers } from 'vuelidate/lib/validators';
//import IconChevron from '@carbon/icons-vue/es/chevron--up/20';

// IP address, gateway and subnet pattern
const IPv4Regex = /^(?=.*[^.]$)((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.?){4}$/;
const validateIPv4Address = helpers.regex('validateIPv4Address', IPv4Regex);
const IPv6Regex = /^((?:[0-9A-Fa-f]{1,4}))((?::[0-9A-Fa-f]{1,4}))*::((?:[0-9A-Fa-f]{1,4}))((?::[0-9A-Fa-f]{1,4}))*|((?:[0-9A-Fa-f]{1,4}))((?::[0-9A-Fa-f]{1,4})){7}$/;
const validateIPv6Address = helpers.regex('validateIPv6Address', IPv6Regex);
const validateLength = helpers.regex('validateLength', /^[0-9]{1,3}$/);
export default {
  components: {
    //PageTitle,
    //PageSection,
    //FormPerVersion,
    TableRowAction,
    IconTrashcan,
    IconAdd,
    //IconChevron,
  },
  props: {
    loading: {
      type: Boolean,
      default: false,
    },
    version: {
      type: String,
      default: null,
    },
    channel: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      dhcpEnabled: null,
      linkDisabled: null,
      ipv6LinklocalAddr: '',
      staticAddressTableFields: [
        {
          key: 'Address',
          label: this.$t('pageNetworks.table.ipAddress'),
        },
        {
          key: 'SubnetMask',
          label:
            this.version == 4
              ? this.$t('pageNetworks.table.subnet')
              : this.$t('pageNetworks.table.prefixLength'),
        },
        { key: 'actions', label: '', tdClass: 'text-right' },
      ],
      ipv6DynamicTableFields: [
        {
          key: 'Address',
          label: this.$t('pageNetworks.table.ipAddress'),
        },
        {
          key: 'SubnetMask',
          label:
            this.version == 4
              ? this.$t('pageNetworks.table.subnet')
              : this.$t('pageNetworks.table.prefixLength'),
        },
      ],
      dnsTableFields: [
        {
          key: 'address',
          label: this.$t('pageNetworks.table.ipAddress'),
        },
        { key: 'actions', label: '', tdClass: 'text-right' },
      ],
      selectedLinkStatusIndex: 0,
      linkStatusIpv4SelectOptions: [
        { value: 0, text: this.$t('pageNetworks.status.linkDisabled') },
        { value: 1, text: this.$t('pageNetworks.status.manualAddress') },
        { value: 2, text: this.$t('pageNetworks.status.dhcpEnabled') },
      ],
      linkStatusIpv6SelectOptions: [
        { value: 0, text: this.$t('pageNetworks.status.linkDisabled') },
        {
          value: 1,
          text: this.$t('pageNetworks.status.linkEnabled'),
        },
      ],
      form: {
        gateway: '',
        staticAddressTableItems: [],
        dynamicAddressTableItems: [],
        dnsStaticTableItems: [],
      },
    };
  },
  computed: {
    ip6StaticTableNonEmptyItems() {
      return this.form.staticAddressTableItems.filter((addr) => {
        return addr.Address != '';
      });
    },
    ip6DynamicTableNonEmptyItems() {
      return this.form.dynamicAddressTableItems.filter((addr) => {
        return addr.Address != '';
      });
    },
    enableStaticAddressModify() {
      if (this.version == '4') {
        return !this.linkDisabled && !this.dhcpEnabled && !this.loading;
      } else {
        return !this.linkDisabled && !this.loading;
      }
    },
    enableDnsAddressModify() {
      if (this.version == '4') {
        return !this.linkDisabled && !this.dhcpEnabled && !this.loading;
      } else {
        return !this.linkDisabled && !this.loading;
      }
    },
  },
  validations() {
    let validateAddress =
      this.version == '4' ? validateIPv4Address : validateIPv6Address;
    return {
      form: {
        gateway: {
          validateAddress,
        },
        staticAddressTableItems: {
          $each: {
            Address: {
              required: requiredIf(function () {
                return !this.linkDisabled && !this.dhcpEnabled;
              }),
              validateAddress,
            },
            SubnetMask: {
              required: requiredIf(function () {
                return !this.linkDisabled && !this.dhcpEnabled;
              }),
              validateAddressOrLength:
                this.version == '4' ? validateIPv4Address : validateLength,
            },
          },
        },
        dnsStaticTableItems: {
          $each: {
            address: {
              required: requiredIf(function () {
                return !this.linkDisabled && !this.dhcpEnabled;
              }),
              validateAddress,
            },
          },
        },
      },
    };
  },
  watch: {
    channel: function (value) {
      if (this.version == '4') {
        this.linkDisabled = !value.ipv4.enable;
        if (this.linkDisabled) {
          this.selectedLinkStatusIndex = 0;
        } else {
          this.selectedLinkStatusIndex = value.ipv4.source;
        }
        this.form.gateway = value.ipv4.gateway;
        if (value.ipv4.addr) {
          this.form.staticAddressTableItems = [
            {
              Address: value.ipv4.addr,
              SubnetMask: value.ipv4.subnet,
              actions: [
                {
                  value: 'delete',
                  title: this.$t('pageNetworks.table.deleteStaticIpAddress'),
                },
              ],
            },
          ];
        }
      } else if (this.version == '6') {
        this.dhcpEnabled = Boolean(value.ipv6.router_control & 2);
        this.linkDisabled = !value.ipv6.enable;
        this.selectedLinkStatusIndex = this.linkDisabled ? 0 : 1;
        this.ipv6LinklocalAddr = value.ipv6.link_local_addr;
        if (value.ipv6.router_control & 1) {
          this.form.gateway = value.ipv6.router.static?.[0]?.addr ?? '';
        }
        if (value.ipv6.address) {
          if (value.ipv6.address.static) {
            this.form.staticAddressTableItems = value.ipv6.address.static
              .filter((staticInfo) => {
                return Boolean(staticInfo.addr);
              })
              .map((staticInfo) => {
                return {
                  Address: staticInfo.addr,
                  SubnetMask: staticInfo.prefix_len,
                  actions: [
                    {
                      value: 'delete',
                      title: this.$t(
                        'pageNetworks.table.deleteStaticIpAddress'
                      ),
                    },
                  ],
                };
              });
          }
          if (value.ipv6.address.dynamic) {
            this.form.dynamicAddressTableItems = value.ipv6.address.dynamic.map(
              (dynamicInfo) => {
                return {
                  Address: dynamicInfo.addr,
                  SubnetMask: dynamicInfo.prefix_len,
                };
              }
            );
          }
        }
      }
      if (value.dns_server) {
        let vm = this;
        vm.form.dnsStaticTableItems = value.dns_server
          .filter((dns) => {
            let regex = new RegExp(vm.version == '4' ? IPv4Regex : IPv6Regex);
            return dns.addr != '' && regex.test(dns.addr);
          })
          .map((dns) => {
            return {
              address: dns.addr,
              actions: [
                {
                  value: 'delete',
                  title: this.$t('pageNetworks.table.deleteDns'),
                },
              ],
            };
          });
      } else {
        this.form.dnsStaticTableItems = [];
      }
    },
    selectedLinkStatusIndex: function (value) {
      if (this.version == '4') {
        // is link up
        this.linkDisabled = Boolean(value == 0);
        // is dhcp enable
        this.dhcpEnabled = Boolean(value == 2);
        if (!this.linkDisabled) this.$v.form.dnsStaticTableItems.$touch();
      } else {
        if (value == 1) this.$v.form.dnsStaticTableItems.$touch();
        this.linkDisabled = Boolean(value == 0);
      }
    },
  },
  methods: {
    // DNS Part
    addDnsTableRow() {
      this.$v.form.dnsStaticTableItems.$touch();
      try {
        if (this.form.dnsStaticTableItems.length > 1) {
          throw this.$t('pageNetworks.toast.tableLimit');
        }
        this.form.dnsStaticTableItems.push({
          address: '',
          actions: [
            {
              value: 'delete',
              title: this.$t('pageNetworks.table.deleteDns'),
            },
          ],
        });
        this.$v.form.dnsStaticTableItems.$touch();
      } catch (message) {
        this.errorToast(message);
      }
    },
    deleteDnsTableRow(index) {
      this.$v.form.dnsStaticTableItems.$touch();
      this.form.dnsStaticTableItems.splice(index, 1);
    },
    onDeleteDnsTableRow(action, row) {
      this.deleteDnsTableRow(row);
    },
    addStaticAddressTableRow() {
      this.$v.form.staticAddressTableItems.$touch();
      try {
        if (this.form.staticAddressTableItems.length > 0) {
          throw this.$t('pageNetworks.toast.tableLimit');
        }
        this.form.staticAddressTableItems.push({
          Address: '',
          SubnetMask: '',
          actions: [
            {
              value: 'delete',
              title: this.$t('pageNetworks.table.deleteStaticIpAddress'),
            },
          ],
        });
        this.$v.form.staticAddressTableItems.$touch();
      } catch (message) {
        this.errorToast(message);
      }
    },
    deleteStaticAddressTableRow(index) {
      this.$v.form.staticAddressTableItems.$touch();
      this.form.staticAddressTableItems.splice(index, 1);
    },
    onDeleteStaticAddressTableRow(action, row) {
      this.deleteStaticAddressTableRow(row);
    },
    // IPv6 Part
    changeIPv6Enable() {},
    // Submit
    submitForm() {
      this.$v.$touch();
      if (this.$v.$invalid) return;
      let dhcp = Boolean(this.dhcpEnabled);
      let enable = !this.linkDisabled;
      //let hostname = this.form.hostname;
      let mode = 'ip' + this.version;
      let lanChannelSettingsForm = {
        mode,
        dhcp,
        enable,
      };

      // IPv4
      if (this.version == '4') {
        let ipv4StaticSetting = this.form.staticAddressTableItems[0];
        lanChannelSettingsForm.staticIpv4 = {
          address: ipv4StaticSetting?.Address ?? '',
          subnetMask: ipv4StaticSetting?.SubnetMask ?? 0,
          gateway: this.form.gateway ?? '',
        };
      } else if (this.version == '6') {
        let ipv6StaticSetting = this.form.staticAddressTableItems[0];
        lanChannelSettingsForm.staticIpv6 = {
          address: ipv6StaticSetting?.Address ?? '',
          prefixLen: Number(ipv6StaticSetting?.SubnetMask) || 64, // 1-128
          gateway: this.form.gateway ?? '',
        };
      }

      lanChannelSettingsForm.staticNameServers = this.form.dnsStaticTableItems.map(
        (updateDns) => updateDns.address
      );
      this.$emit('save', lanChannelSettingsForm);
    },
  },
};
</script>
