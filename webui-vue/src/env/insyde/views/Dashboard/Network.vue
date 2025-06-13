<template>
  <overview-card
    :title="$t('pageDashboard.networkZone')"
    :to="`/settings/networks`"
  >
    <div class="dashboard-refresh">
      <icon-restart class="pointer" @click="onIconAction($event)" />
    </div>
    <div class="dashboard-info">
      <b-row>
        <b-button
          v-for="(btn, idx) in nicinfo"
          :key="idx"
          :pressed.sync="btn.active"
          variant="primary"
          @click="onSelectChanged(idx, nicinfo)"
        >
          {{ nicinfo[idx].channel }}
        </b-button>
      </b-row>
      <b-row class="mt-2">
        <b-col sm="6">
          <dt>{{ $t('pageDashboard.network.LANG_CONF_NETWORK_IP_ADDR') }}</dt>
        </b-col>
        <b-col sm="6">
          <dd>{{ view.ipaddr }}</dd>
        </b-col>
      </b-row>
      <b-row class="mt-2">
        <b-col sm="6">
          <dt>{{ $t('pageDashboard.network.LANG_CONF_NETWORK_GATEWAY') }}</dt>
        </b-col>
        <b-col sm="6">
          <dd>
            {{ view.gateway }}
          </dd>
        </b-col>
      </b-row>
      <b-row class="mt-2">
        <b-col sm="6">
          <dt>{{ $t('pageDashboard.network.LANG_CONF_NETWORK_MASK') }}</dt>
        </b-col>
        <b-col sm="6">
          <dd>
            {{ view.subnet }}
          </dd>
        </b-col>
      </b-row>
      <b-row class="mt-2">
        <b-col sm="6">
          <dt>
            {{
              $t('pageDashboard.network.LANG_CONF_NETWORK_IPV6_STATIC_ADDRESS')
            }}
          </dt>
        </b-col>
        <b-col sm="6">
          <dd>
            {{ view.ipv6_static_addr }}
          </dd>
        </b-col>
      </b-row>
      <b-row class="mt-2">
        <b-col sm="6">
          <dt>
            {{
              $t('pageDashboard.network.LANG_CONF_NETWORK_IPV6_DYNAMIC_ADDRESS')
            }}
          </dt>
        </b-col>
        <b-col sm="6">
          <dd>
            {{ view.ipv6_dynamic_addr }}
          </dd>
        </b-col>
      </b-row>
      <b-row class="mt-2">
        <b-col sm="6">
          <dt>{{ $t('pageDashboard.network.LANG_CONF_NETWORK_MAC_ADDR') }}</dt>
        </b-col>
        <b-col sm="6">
          <dd>
            {{ view.mac }}
          </dd>
        </b-col>
      </b-row>
    </div>
  </overview-card>
</template>

<script>
import OverviewCard from './OverviewCard';
import DataFormatterMixin from '@/components/Mixins/DataFormatterMixin';
import { mapState } from 'vuex';
import IconRestart from '@carbon/icons-vue/es/restart/24';

export default {
  name: 'Network',
  components: {
    OverviewCard,
    IconRestart,
  },
  mixins: [DataFormatterMixin],
  data() {
    return {
      view: {
        ipaddr: '',
        gateway: '',
        subnet: '',
        ipv6_static_addr: '',
        ipv6_dynamic_addr: '',
        mac: '',
      },
      nic: [],
    };
  },
  computed: {
    ...mapState({
      nicData: (state) => state.dashboardstore.nicinfo[0],
      ipaddr() {
        return this.nicData.ipaddr;
      },
    }),
    nicinfo() {
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      this.nic = this.$store.getters['dashboardstore/nicinfo'];
      return this.$store.getters['dashboardstore/nicinfo'];
    },
  },
  created() {
    this.$store
      .dispatch('dashboardstore/getNetwork')
      .catch(({ message }) => this.errorToast(message))
      .finally(() => {
        this.$root.$emit('dashboard-network-complete');
        this.onSelectChanged(0, this.nic);
      });
  },
  methods: {
    onSelectChanged(idx, nic) {
      this.view.ipaddr = nic[idx].ipaddr;
      this.view.gateway = nic[idx].gateway;
      this.view.subnet = nic[idx].subnet;
      this.view.ipv6_static_addr = nic[idx].ipv6_static_addr;
      this.view.ipv6_dynamic_addr = nic[idx].ipv6_dynamic_addr;
      this.view.mac = nic[idx].mac;
      this.nicinfo.forEach((b, index) => (b.active = idx === index));
    },
    onIconAction() {
      this.$store
        .dispatch('dashboardstore/getNetwork')
        .catch(({ message }) => this.errorToast(message))
        .finally(() => {
          this.$root.$emit('dashboard-network-complete');
          this.onSelectChanged(0, this.nic);
        });
    },
  },
};
</script>
