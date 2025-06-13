<template>
  <b-container fluid="xl">
    <page-title />
    <div>
      <div>
        {{ $t('pageNicInformation.LANG_SYS_NIC_NUM') }} {{ NCSIs.length }}
      </div>
      <!-- use bootstrap magic 'thead-class="d-none"' to hide the header row -->
      <b-table
        responsive="md"
        hover
        show-empty
        thead-class="d-none"
        :items="NCSIs"
        :fields="fields"
        :empty-text="$t('global.table.emptyMessage')"
      >
        <!-- item -->
        <template #cell(deviceName)="{ item }">
          <b-row>
            <b-col class="title flex-w05">{{ item.deviceName }}</b-col>
          </b-row>
          <b-row>
            <b-col>{{ item.location }}</b-col>
          </b-row>
          <b-row>
            <b-col>{{ item.channelDescription }}</b-col>
          </b-row>
        </template>

        <!-- Expand chevron icon -->
        <template #cell(expandRow)="row">
          <b-button
            variant="link"
            data-test-id="hardwareStatus-button-expandSystem"
            :title="expandRowLabel"
            class="btn-icon-only"
            @click="toggleRowDetails(row)"
          >
            <icon-chevron />
            <span class="sr-only">{{ expandRowLabel }}</span>
          </b-button>
        </template>

        <template #row-details="{ item }">
          <b-container fluid>
            <!-- NIC info START -->
            <b-row>
              <b-col class="mt-2 title flex-w05">
                {{ $t('pageNicInformation.LANG_SYS_NIC_MANUFACTURER') }}:
              </b-col>
              <b-col class="mt-2">
                {{ item.manufacturer }}
              </b-col>
            </b-row>
            <b-row>
              <b-col class="mt-2 title flex-w05">
                {{ $t('pageNicInformation.LANG_SYS_NIC_VENDOR_NAME') }}:
              </b-col>
              <b-col class="mt-2">
                {{ item.vendorName }}
              </b-col>
            </b-row>
            <b-row>
              <b-col class="mt-2 title flex-w05">
                {{ $t('pageNicInformation.LANG_SYS_NIC_DEVICE_NAME') }}:
              </b-col>
              <b-col class="mt-2">
                {{ item.deviceName }}
              </b-col>
            </b-row>
            <b-row>
              <b-col class="mt-2 title flex-w05">
                {{ $t('pageNicInformation.LANG_SYS_NIC_SUBSYSTEM_NAME') }}:
              </b-col>
              <b-col class="mt-2">
                {{ item.subsystemName }}
              </b-col>
            </b-row>
            <b-row>
              <b-col class="mt-2 title flex-w05">
                {{ $t('pageNicInformation.LANG_SYS_NIC_FIRMWARE_NAME') }}:
              </b-col>
              <b-col class="mt-2">
                {{ item.firmwareName }}
              </b-col>
            </b-row>
            <b-row>
              <b-col class="mt-2 title flex-w05">
                {{ $t('pageNicInformation.LANG_SYS_NIC_FIRMWARE_VERSION') }}:
              </b-col>
              <b-col class="mt-2">
                {{ item.firmwareVersion }}
              </b-col>
            </b-row>
            <!-- NIC info END -->

            <div class="section-divider mb-3 mt-3"></div>

            <!-- port detail END -->
            <div>
              <div
                v-for="(item2, index2) in packages[item.index]['PackageInfo']"
                :key="`channel - content - ${index2}`"
                class="channel-content"
              >
                <b-row>
                  <b-col class="mt-2 channel-port">
                    Port {{ item2.ChannelIndex }} -
                  </b-col>
                  <b-col class="mt-2 channel-item">
                    {{ $t('pageNicInformation.LANG_SYS_NIC_LINK_STATUS') }}
                  </b-col>
                  <b-col
                    class="mt-2"
                    :class="linkStatus(item2.LinkStatus.Link)"
                  >
                    {{ $t('pageNicInformation.LANG_SYS_NIC_LINK_IS_DOWN') }}
                  </b-col>
                </b-row>
                <b-row>
                  <b-col class="mt-2 channel-port"></b-col>
                  <b-col class="mt-2 channel-item">
                    {{ $t('pageNicInformation.LANG_SYS_NIC_MACADDRESS') }}
                  </b-col>
                  <b-col class="mt-2">
                    {{ item2.MACAddress }}
                  </b-col>
                </b-row>
              </div>
            </div>
            <!-- port detail END -->
          </b-container>
        </template>
      </b-table>
    </div>
  </b-container>
</template>

<script>
import IconChevron from '@carbon/icons-vue/es/chevron--down/20';
import PageTitle from '@/components/Global/PageTitle';

import { mapFields } from 'vuex-map-fields';

import TableRowExpandMixin, {
  expandRowLabel,
} from '@/components/Mixins/TableRowExpandMixin';
import DataFormatterMixin from '@/components/Mixins/DataFormatterMixin';

export default {
  name: 'NicInformation',
  components: {
    PageTitle,
    IconChevron,
  },
  mixins: [TableRowExpandMixin, DataFormatterMixin],
  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
  data() {
    return {
      fields: [
        {
          key: 'expandRow',
          label: '',
          tdClass: 'table-row-expand',
        },
        {
          key: 'deviceName',
          label: this.$t('pageNicInformation.id'),
          formatter: this.dataFormatter,
        },
      ],
      expandRowLabel: expandRowLabel,
    };
  },
  computed: {
    ...mapFields('nicInformation', ['NCSIs', 'packages']),
  },
  created() {
    this.startLoader();
    const getPciIdsDataPromise = this.$store.dispatch(
      'nicInformation/getPciIdsData'
    );
    const getDataPromise = this.$store.dispatch('nicInformation/getData');
    Promise.all([getPciIdsDataPromise, getDataPromise]).finally(() =>
      this.endLoader()
    );
  },
  methods: {
    linkStatus(status) {
      if (status == 'Up') return 'up';
      return status == 'Down' ? 'down' : '';
    },
  },
};
</script>

<style scoped>
.hidden_header {
  display: none;
}
.channel-content {
  flex-grow: 1;
  background-color: #ddd;
  border-radius: 5px;
  padding: 16px 32px;
  margin: 12px 0;
  margin-right: 24px;
}
.channel-port {
  flex: 0 0 6em;
  color: #0070ae;
}
.channel-item {
  flex: 0 0 10em;
}
.up {
  color: green;
}
.down {
  color: rgb(244, 67, 54);
}
</style>
