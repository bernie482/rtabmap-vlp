<template>
  <b-container v-if="supportPamAuthOrder" fluid="x1">
    <page-section :section-title="$t('pageSecuritySettings.CONF_SEC_PAM_TITLE')"
      ><b-row>
        <draggable v-model="pamList" class="sortablelist">
          <div
            v-for="pname in pamList"
            :key="pname"
            class="sortable_item"
            style="width: 212px"
          >
            {{ pname }}
          </div>
        </draggable>
      </b-row>
      <b-button variant="primary" @click="saveConfig">
        {{ $t('global.action.save') }}
      </b-button>
    </page-section>
  </b-container>
</template>

<script>
import PageSection from '@/components/Global/PageSection';
import { PAMOrderParser } from '@/env/insyde/components/Mixins/SecuritySettingsParserMixin';
import draggable from 'vuedraggable';

export default {
  name: 'PamAuthOrder',
  components: {
    PageSection,
    draggable,
  },

  data() {
    return {
      pamList: null,
    };
  },
  computed: {
    getpamlist() {
      return PAMOrderParser(this.$store.getters['securitysettings/PAMOrder']);
    },
    supportPamAuthOrder() {
      return this.$store.getters['securitysettings/PAMOrder'] !== undefined;
    },
  },
  created() {
    const pam = this;
    pam.startLoader();
    Promise.all([
      pam.$store.dispatch('securitysettings/getPAMList').then(() => {
        pam.buildPAMList(pam.getpamlist.pamArray);
      }),
    ]).finally(() => {
      pam.endLoader();
    });
  },
  methods: {
    buildPAMList(PAMArray) {
      const pam = this;
      let pList = [];
      PAMArray.forEach((d) => {
        pList.push(d[0]);
      });
      pam.pamList = pList;
    },
    saveConfig() {
      const pam = this;
      let dataArr = [];
      pam.pamList.forEach((d) => {
        dataArr.push(d);
      });
      pam.startLoader();
      pam.$store
        .dispatch('securitysettings/setPAMList', dataArr)
        .then((success) => {
          pam.successToast(success);
        })
        .catch((message) => {
          pam.errorToast(message);
        })
        .finally(() => {
          pam.endLoader();
        });
    },
  },
};
</script>
<style lang="scss" scoped>
.sortablelist {
  border: 1px solid #eee;
  min-width: 11em;
  min-height: 20px;
  list-style-type: none;
  margin: 0;
  padding: 5px;
  float: left;
  margin-right: 10px;
  background-color: #ffffff;
}
.sortable_item {
  margin: 0 5px 5px 5px;
  padding: 5px;
  padding-left: 10px;
  padding-right: 10px;
  min-width: 200px;
  cursor: pointer;
  text-align: center;
  font-size: 16px;
  font-weight: normal;
  background-color: #2585bd;
  color: #fff;
  user-select: none;
  -o-user-select: none;
  -moz-user-select: -moz-none;
  -webkit-user-select: none;
}
.sortablelist_div {
  display: inline-block;
}
</style>
