<template>
  <b-container fluid="x1">
    <page-title />
    <page-section>
      <b-row>
        <b-col md="2">
          <label>{{ $t('pageAlerts.CONFALERT_LANCHANNEL') }}</label>
        </b-col>
        <b-col md="1">
          <select v-model="chn" :disabled="failover" @change="chnChange">
            <option
              v-for="(items, idx) in vlanArr"
              :key="idx"
              :value="items.channel"
            >
              {{
                `${
                  items.desc == 0
                    ? $t('pageDashboard.network.LANG_CONF_LAN_DEDICATED_NIC')
                    : $t('pageDashboard.network.LANG_CONF_LAN_SHARE_NIC')
                } (${items.channel})`
              }}
            </option>
          </select>
        </b-col>
      </b-row>
      <b-row cols="2">
        <b-col md="2">
          <label>
            {{ $t('pageVLAN.CONF_NETWORK_VLAN_ENABLE') }}
          </label>
        </b-col>
        <b-col
          ><b-form-checkbox v-model="enable" switch></b-form-checkbox
        ></b-col>
      </b-row>
      <b-row cols="2">
        <b-col md="2">
          <label>
            {{ $t('pageVLAN.CONF_NETWORK_VLAN_ID') }}
          </label>
        </b-col>
        <b-col>
          <input
            v-model.number="vid"
            type="number"
            min="1"
            max="4094"
            :disabled="!enable"
            :style="setStyle(vid, vid, $v.vid.$invalid)"
            class="textfield"
            @change="$v.vid.$touch()"
        /></b-col>
      </b-row>
      <b-row cols="2">
        <b-col md="2">
          <label>
            {{ $t('pageVLAN.CONF_NETWORK_VLAN_PRIORITY') }}
          </label>
        </b-col>
        <b-col>
          <input
            v-model.number="priority"
            type="number"
            min="0"
            max="7"
            :disabled="!enable"
            :style="setStyle(priority, priority, $v.priority.$invalid)"
            class="textfield"
            @change="$v.priority.$touch()"
        /></b-col>
      </b-row>
      <b-button variant="primary" @click="ConfigSave">
        {{ $t('global.action.save') }}
      </b-button>
    </page-section>
  </b-container>
</template>
<script>
import PageTitle from '@/components/Global/PageTitle';

import PageSection from '@/components/Global/PageSection';
import { VLANParser } from '@/env/insyde/components/Mixins/VLANParserMixin';
import { requiredIf, between } from 'vuelidate/lib/validators';

export default {
  name: 'VLAN',
  components: {
    PageTitle,
    PageSection,
  },

  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
  data() {
    return {
      vid: '',
      priority: '',
      failover: false,
      chn: '1',
      vlanArr: [],
      enable: false,
    };
  },
  validations: {
    vid: {
      required: requiredIf('enable'),
      between: function (v) {
        return between(this.enable ? 1 : 0, 4094)(v);
      },
    },
    priority: {
      required: requiredIf('enable'),
      between: between(0, 7),
    },
  },
  computed: {
    vlaninfo() {
      return VLANParser(this.$store.getters['vlan/vlancfgdata']);
    },
  },
  created() {
    this.startLoader();
    Promise.all([this.requestVLANData()]).finally(() => this.endLoader());
  },
  methods: {
    requestVLANData() {
      this.$store.dispatch('vlan/getVLANConfig').then(() => {
        this.vlanArr = this.vlaninfo?.vlan ?? [];
        this.chn = this.vlaninfo?.actchn;
        this.failover = this.vlaninfo?.failover ?? false;
        this.configVLAN(this.vlanArr);
      });
    },
    setStyle(elm_form, elm_src, invalid) {
      //console.log('elm_form=',elm_form, elm_src);
      return invalid ? { 'border-color': '#ff0000' } : {};
    },
    findChnIdx(channel, dataArr) {
      let IdxOfArray = 0;
      dataArr.forEach((d, idx) => {
        if (d.channel != channel) {
          return true; // continue
        } else {
          IdxOfArray = idx;
          return false;
        }
      });
      return IdxOfArray;
    },
    chnChange() {
      this.configVLAN(this.vlanArr);
    },
    configVLAN(cfginfo) {
      let chnidx = this.findChnIdx(this.chn, cfginfo);
      let vlandata = cfginfo[chnidx];
      this.chn = vlandata?.channel;
      this.priority = vlandata?.priority;
      this.vid = vlandata?.id;
      this.enable = vlandata?.enable;
    },
    ConfigSave() {
      if (this.$v.$invalid) return;
      this.$bvModal
        .msgBoxConfirm(this.$t('pageVLAN.toast.confirmMessage'), {
          title: this.$t('global.status.warning'),
          okTitle: this.$t('global.action.confirm'),
          cancelTitle: this.$t('global.action.cancel'),
        })
        .then((confirmed) => {
          if (confirmed) {
            let configObj = {
              channel: this.chn,
              enable: this.enable,
              vlanId: this.vid,
              vlanPriority: this.priority,
            };
            this.startLoader();
            this.$store
              .dispatch('vlan/postVLANConfig', configObj)
              .then(() => {
                this.requestVLANData();
                this.successToast();
              })
              .catch((/*{ message }*/) => {
                // Don't show error messages due to the network is not available after saving changes.
                // this.errorToast(message);
                this.successToast(this.$t('pageVLAN.toast.successRequestSent'));
              })
              .finally(() => {
                this.endLoader();
              });
          }
        });
    },
  },
};
</script>
<style scoped>
.textfield {
  font-size: 12px;
  line-height: 28px;
  position: relative;
  border: 2px solid #0077ae;
  border-radius: 3px;
  outline: none;
  padding: 0px 4px;
  min-width: 230px;
}
</style>
