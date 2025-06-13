<template>
  <page-section :section-title="$t('pageSysinfo.systemFirmware.title')">
    <div v-if="bios_version">
      <template v-for="(val, idx) in bios_version">
        <b-row :key="idx" align-v="center">
          <b-col cols="4" class="title"> {{ val.key }} : </b-col>
          <b-col> {{ val.value }} </b-col>
          <div class="w-100"></div>
        </b-row>
      </template>
    </div>
    <insyde-unavailable v-else />
  </page-section>
</template>

<script>
import PageSection from '@/components/Global/PageSection';

export default {
  components: { PageSection },

  data() {
    return {};
  },
  computed: {
    bios_version() {
      let sysinfo = this.$store.getters['sysinfo/sysinfo'];
      let biosID = this.getOEMFWVersion(sysinfo);
      let bios_version = biosID.replace(/\|/g, '');
      if (bios_version == null || bios_version.length < 1) {
        return null;
      } else {
        return this.biosInfoToArray(biosID);
      }
    },
  },
  created() {
    this.$root.$emit('sysinfo-systemfw-complete');
  },
  methods: {
    getOEMFWVersion(json) {
      var result = '';
      if (
        json != null &&
        Object.prototype.hasOwnProperty.call(json, 'BIOS_ID')
      ) {
        var jsonFWVer = json.BIOS_ID;
        if (jsonFWVer.length > 0) {
          if (typeof jsonFWVer == 'string') {
            //console.log("string");
            result = jsonFWVer;
          } else if (typeof jsonFWVer == 'object') {
            //console.log("json");
            var locale_idx = -1;
            var bmcLocale = '';
            if (localStorage.getItem('storedLanguage') != undefined) {
              bmcLocale = localStorage.getItem('storedLanguage').toLowerCase();
            }
            for (var idx = 0; idx < jsonFWVer.length; idx++) {
              var target = jsonFWVer[idx];
              if (Object.prototype.hasOwnProperty.call(target, 'locale')) {
                var targetLocale = target.locale;
                targetLocale = targetLocale.toLowerCase();
                if (bmcLocale == targetLocale) {
                  locale_idx = idx;
                  break;
                } else if (
                  targetLocale.toLowerCase() == 'default' &&
                  locale_idx < 0
                ) {
                  //found & set default locale.
                  locale_idx = idx;
                }
              }
            }
            if (locale_idx < 0) {
              locale_idx = 0; //set first locale as default.
            }
            var targetFWVer = jsonFWVer[locale_idx];
            if (Object.prototype.hasOwnProperty.call(targetFWVer, 'version')) {
              result = targetFWVer.version;
            }
          }
        }
      }
      return result;
    },
    biosInfoToArray(bios_info) {
      let token = bios_info.split('|');
      let array = [];
      if (token.length > 0) {
        let info = '',
          index = 0;
        for (let i = 0; i < token.length; i++) {
          info = token[i];
          index = info.indexOf(':');
          // console.log(info[index], info.slice(0, index), info.slice(index+1))
          let paramName = this.$t(
            `pageSysinfo.systemFirmware.LANG_SYS_INFO_${info
              .slice(0, index)
              .trim()
              .replace(/ /g, '_')
              .toUpperCase()}`
          );
          let paramValue = info.slice(index + 1).trim();
          array.push({ key: paramName, value: paramValue });
        }
      }
      // console.log(array);
      return array;
    },
  },
};
</script>
