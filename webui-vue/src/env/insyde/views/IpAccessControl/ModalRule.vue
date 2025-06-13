<template>
  <b-modal :id="`modal-rule-${target}`" ref="modal" @hidden="resetForm">
    <template #modal-title>
      {{ $t('pageIpAccessControl.' + target + '.title') }}
      <template v-if="getScenario == 'add'">
        {{ $t('pageIpAccessControl.modal.addRule') }}
      </template>
      <template v-else-if="getScenario == 'insert'">
        {{ $t('pageIpAccessControl.modal.insertRule') }}
      </template>
      <template v-else>
        {{ $t('pageIpAccessControl.modal.editRule') }}
      </template>
    </template>
    <b-form id="form-ipAccessControl" novalidate @submit.prevent="handleSubmit">
      <b-container>
        <b-row>
          <b-col>
            <b-form-group :label="$t('pageIpAccessControl.form.ruleNo')">
              <b-form-input
                id="rule-no"
                v-model="getRuleNo"
                type="text"
                data-test-id="rule-input-ruleNo"
                disabled
              />
            </b-form-group>
            <b-form-group :label="$t('pageIpAccessControl.form.policy')">
              <b-form-select
                id="policy"
                v-model="form.policy"
                :options="selectItems.policy"
                data-test-id="rule-select-policy"
                @input="$v.form.policy.$touch()"
              >
                <template #first>
                  <b-form-select-option :value="null" disabled>
                    {{ $t('global.form.selectAnOption') }}
                  </b-form-select-option>
                </template>
              </b-form-select>
            </b-form-group>
            <b-form-group :label="$t('pageIpAccessControl.form.ruleType')">
              <b-form-select
                id="rule-type"
                v-model="form.ruleType"
                :options="selectItems.ruleType"
                data-test-id="rule-select-ruleType"
                @input="$v.form.ruleType.$touch()"
              >
                <template #first>
                  <b-form-select-option :value="null" disabled>
                    {{ $t('global.form.selectAnOption') }}
                  </b-form-select-option>
                </template>
              </b-form-select>
            </b-form-group>
            <b-form-group>
              <div v-if="form.ruleType == 'ipMask'">
                {{ $t('pageIpAccessControl.form.ipMask') }}:
                <b-form-input
                  id="ipMask"
                  v-model="form.ipMask"
                  type="text"
                  data-test-id="rule-input-ipMask"
                  @input="$v.form.ipMask.$touch()"
                />
                <div v-if="$v.form.ipMask.$invalid" class="tip-error">
                  {{ $t('global.form.invalidFormat') }}
                </div>
              </div>
              <div v-if="form.ruleType == 'ipRange'">
                {{ $t('pageIpAccessControl.form.ipRange') }}
                {{ $t('pageIpAccessControl.form.start') }}:
                <b-form-input
                  id="ip-start"
                  v-model="form.ipStart"
                  type="text"
                  data-test-id="rule-input-ip-start"
                  @input="$v.form.ipStart.$touch()"
                />
                <div v-if="$v.form.ipStart.$invalid" class="tip-error">
                  {{ $t('global.form.invalidFormat') }}
                </div>
                {{ $t('pageIpAccessControl.form.end') }}:
                <b-form-input
                  id="ip-end"
                  v-model="form.ipEnd"
                  type="text"
                  data-test-id="rule-input-ip-end"
                  @input="$v.form.ipEnd.$touch()"
                />
                <div v-if="$v.form.ipEnd.$invalid" class="tip-error">
                  {{ $t('global.form.invalidFormat') }}
                </div>
              </div>
              <div v-if="form.ruleType == 'mac'">
                {{ $t('pageIpAccessControl.form.mac') }}:
                <b-form-input
                  id="addr"
                  v-model="form.mac"
                  type="text"
                  data-test-id="rule-input-mac"
                  @input="$v.form.mac.$touch()"
                />
                <div v-if="$v.form.mac.$invalid" class="tip-error">
                  {{ $t('global.form.invalidFormat') }}
                </div>
              </div>
              <div v-if="form.ruleType == 'port'">
                {{ $t('pageIpAccessControl.form.protocol') }}:
                <b-form-select
                  id="protocol"
                  v-model="form.protocol"
                  :options="selectItems.protocols"
                  data-test-id="rule-select-protocol"
                  @input="$v.form.protocol.$touch()"
                >
                  <template #first>
                    <b-form-select-option :value="null" disabled>
                      {{ $t('global.form.selectAnOption') }}
                    </b-form-select-option>
                  </template>
                </b-form-select>
              </div>
              <div v-if="form.ruleType == 'port'">
                {{ $t('pageIpAccessControl.form.start') }}:
                <b-form-input
                  id="port-start"
                  v-model="form.portStart"
                  type="text"
                  data-test-id="rule-input-port-start"
                  @input="$v.form.portStart.$touch()"
                />
                <div v-if="$v.form.portStart.$invalid" class="tip-error">
                  {{ $t('global.form.invalidFormat') }}
                </div>
                {{ $t('pageIpAccessControl.form.end') }}:
                <b-form-input
                  id="port-end"
                  v-model="form.portEnd"
                  type="text"
                  data-test-id="rule-input-port-end"
                  @input="$v.form.portEnd.$touch()"
                />
                <div v-if="$v.form.portEnd.$invalid" class="tip-error">
                  {{ $t('global.form.invalidFormat') }}
                </div>
              </div>
            </b-form-group>
          </b-col>
        </b-row>
      </b-container>
    </b-form>
    <template #modal-footer="{ cancel }">
      <b-button
        variant="secondary"
        data-test-id="rule-button-cancel"
        @click="cancel()"
      >
        {{ $t('global.action.cancel') }}
      </b-button>
      <b-button
        form="form-ipAccessControl"
        data-test-id="rule-button-submit"
        type="submit"
        variant="primary"
        :disabled="$v.form.$invalid"
        @click="onOk"
      >
        <template v-if="getScenario == 'add'">
          {{ $t('pageIpAccessControl.modal.addRule') }}
        </template>
        <template v-else-if="getScenario == 'insert'">
          {{ $t('pageIpAccessControl.modal.insertRule') }}
        </template>
        <template v-else>
          {{ $t('global.action.save') }}
        </template>
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import {
  required,
  between,
  ipAddress,
  macAddress,
  helpers,
} from 'vuelidate/lib/validators';

export default {
  components: {},
  props: {
    target: {
      type: String,
      default: '',
    },
    scenario: {
      type: String,
      default: '',
    },
    nextRuleNo: {
      type: Number,
      default: 0,
    },
    rule: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      ipv4MaskPattern: {
        pattern: helpers.regex(
          'pattern',
          /^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\/\d{1,3})$/
        ),
      },
      ipv6Pattern: {
        pattern: helpers.regex(
          'pattern',
          /^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/
        ),
      },
      form: {
        ruleNo: '0', // 0: means unknown, >0: normal, n+1: add new rule
        ruleType: 'ipMask', // TODO: merge ipv6 as a ruleType
        policy: 'accept',
        // content & detail
        //content: '',
        ipMask: this.target == 'ipv4' ? '192.168.2.0/24' : '::192.168.2.0/128',
        ipStart: this.target == 'ipv4' ? '192.168.3.1' : '::192.168.3.1',
        ipEnd: this.target == 'ipv4' ? '192.168.3.255' : '::192.168.3.255',
        protocol: 'tcp',
        portStart: '1',
        portEnd: '65535',
        mac: '00-00-00-00-00-00',
      },
      selectItems: {
        ruleType: [
          { value: 'ipMask', text: 'ipMask' },
          { value: 'ipRange', text: 'ipRange' },
          { value: 'mac', text: 'mac' },
          { value: 'port', text: 'port' },
        ],
        policy: [
          { value: 'accept', text: 'accept' },
          { value: 'drop', text: 'drop' },
        ],
        protocols: [
          { value: 'tcp', text: 'tcp' },
          { value: 'udp', text: 'udp' },
        ],
      },
    };
  },
  computed: {
    getScenario() {
      return this.scenario;
    },
    getRuleNo() {
      return this.scenario == 'add' ? this.nextRuleNo : this.form.ruleNo;
    },
  },
  watch: {
    rule: function (value) {
      if (value === null) return;
      //console.log('watch', this.scenario, value);
      this.form.ruleNo = value.ruleNo;
      this.form.ruleType = value.ruleType;
      this.form.policy = value.policy;
      //this.form.content = value.content;
      switch (this.form.ruleType) {
        case 'ipMask': {
          this.form.ipMask = value.content;
          break;
        }
        case 'mac':
          this.form.mac = value.content;
          break;
        case 'ipRange': {
          let tmp = value.content.match(/(\d+\.\d+\.\d+\.\d+)/g);
          this.form.ipEnd = tmp.pop();
          this.form.ipStart = tmp.pop();
          break;
        }
        case 'port': {
          this.form.protocol = value.content.match(/tcp/i) ? 'tcp' : 'udp';
          let tmp = value.content.match(/(\d+)/g);
          this.form.portEnd = tmp.pop();
          this.form.portStart = tmp.pop();
          break;
        }
      }
    },
  },
  validations() {
    return {
      form: {
        ruleNo: { required },
        ruleType: { required },
        policy: { required },
        ipMask: this.validIpPattern(this.form.ipMask),
        ipStart: this.validIpPattern(this.form.ipStart),
        ipEnd: this.validIpPattern(this.form.ipEnd),
        mac: { macAddress: macAddress('-') },
        protocol: {},
        portStart: {
          between: between(1, 65535),
        },
        portEnd: {
          between: between(1, 65535),
        },
      },
    };
  },
  updated() {
    this.form.ruleNo = this.getRuleNo;
  },
  methods: {
    handleSubmit() {
      this.$v.$touch();
      if (this.$v.$invalid) {
        console.log('handleSubmit failed:', this.$v.form);
        return;
      }

      let ruleData = {}; // NOTE: in post form
      ruleData.isV6 = this.target == 'ipv6';
      ruleData.mode = this.scenario;
      ruleData.index = Number(this.getRuleNo);
      ruleData.type = this.form.ruleType;
      ruleData.policy = this.form.policy;
      // handle content
      switch (ruleData.type) {
        case 'ipMask': {
          let ip = this.form.ipMask.match(/\d+\.\d+\.\d+\.\d+/)?.pop() || '';
          if (this.target == 'ipv6') {
            ip =
              this.form.ipMask
                .match(/[:\da-fA-F]+:\d+\.\d+\.\d+\.\d+/)
                ?.pop() || '';
          }
          let mask = Number(this.form.ipMask.match(/\/(\d+)$/)?.pop()) || -1;
          ruleData.ipMask = { ip, mask };
          break;
        }
        case 'mac':
          ruleData.mac = this.form.mac;
          break;
        case 'ipRange':
          ruleData.ipRange = { start: this.form.ipStart, end: this.form.ipEnd };
          break;
        case 'port':
          ruleData.port = {
            start: Number(this.form.portStart),
            end: Number(this.form.portEnd),
            protocol: this.form.protocol,
          };
          break;
      }
      // PATCH for .cgi format
      if (ruleData.mode == 'edit') ruleData.mode = 'modify';

      //console.log('handleSubmit', this.scenario, ruleData);

      this.$emit('ok', { scenario: this.scenario, ruleData });
      this.closeModal();
    },
    closeModal() {
      this.$nextTick(() => {
        this.$refs.modal.hide();
      });
    },
    resetForm() {
      this.form.ruleNo = '0';
      this.form.ruleType = 'ipMask';
      this.form.policy = 'accept';
      //this.form.content = '';
      this.form.ipMask =
        this.target == 'ipv4' ? '192.168.2.0/24' : '::192.168.2.0/128';
      this.form.mac = '00-00-00-00-00-00';
      this.form.ipStart =
        this.target == 'ipv4' ? '192.168.3.1' : '::192.168.3.1';
      this.form.ipEnd =
        this.target == 'ipv4' ? '192.168.3.255' : '::192.168.3.255';
      this.form.protocol = 'tcp';
      this.form.portStart = '1';
      this.form.portEnd = '65535';
      this.$v.$reset();
      this.$emit('hidden');
    },
    onOk(bvModalEvt) {
      // prevent modal close
      bvModalEvt.preventDefault();
      this.handleSubmit();
    },
    validIpPattern(ip) {
      if (this.target == 'ipv4') {
        if (ip.match(/\//)) {
          return this.ipv4MaskPattern;
        }
        return { ipAddress: ipAddress };
      } else {
        // TODO: ipv4 with mask pattern
        if (ip.match(/\//)) return {};

        return {
          pattern: helpers.regex(
            'pattern',
            /^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/
          ),
        };
      }
    },
  },
};
</script>
