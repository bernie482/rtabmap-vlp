<template>
  <b-modal
    id="modal-modify-strings"
    ref="modal"
    :title="$t('pageAlertPolicies.CONFALERT_POLICIES_ALERT_STRING_KEY_TABLE')"
    size="xl"
    number
    strings
  >
    <b-row cols="2">
      <b-col md="2">
        <label class="title">
          {{ `${$t('global.table.prefixNumber')}` }}
        </label>
      </b-col>
      <b-col>
        <select v-model="stringsKey" class="select" disabled="true">
          <option v-for="(val, idx) in selector" :key="idx">
            {{ val + 1 }}
          </option>
        </select>
      </b-col>
    </b-row>
    <b-row cols="2">
      <b-col md="2">
        <label class="title">{{
          `${$t('pageAlertPolicies.CONFALERT_POLICIES_ALERT_STRING_KEY')}`
        }}</label>
      </b-col>
      <b-col>
        <input v-model="stringsTxt" type="text" class="textfield" />
      </b-col>
    </b-row>
    <!--button-->
    <template #modal-footer="{ cancel }">
      <b-button variant="secondary" @click="cancel()">
        {{ $t('global.action.cancel') }}
      </b-button>
      <b-button variant="primary" @click="onOk">
        {{ $t('global.action.save') }}
      </b-button>
    </template>
  </b-modal>
</template>
<script>
export default {
  components: {},
  props: {
    number: {
      type: Number,
      default: 1,
    },
    strings: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      selector: [...Array(40).keys()],
      stringsKey: 1,
      stringsTxt: '',
    };
  },
  computed: {},
  watch: {
    strings: function (value) {
      if (value == null) return;
      this.stringsTxt = value;
    },
    number: function (value) {
      if (value === null) return;
      this.stringsKey = value;
    },
  },
  created() {},
  validations: {},
  methods: {
    handleSubmit() {
      let stringsObj = {};
      stringsObj['ID'] = this.stringsKey;
      stringsObj['Strings'] = this.stringsTxt;
      console.log('handleSubmit = ', stringsObj);
      this.$emit('ok', stringsObj);
      this.closeModal();
    },
    closeModal() {
      this.$nextTick(() => {
        this.$refs.modal.hide();
      });
    },
    onOk(bvModalEvt) {
      bvModalEvt.preventDefault();
      this.handleSubmit();
    },
  },
};
</script>
<style lang="scss" scoped>
label.title {
  position: relative;
  top: 2px;
  min-width: 250px;
  user-select: none;
  -o-user-select: none;
  -moz-user-select: -moz-none;
  -webkit-user-select: none;
}

.select:disabled {
  border-color: #696969;
  background-color: #ffffff;
  color: #000000;
  cursor: not-allowed;
}

.select {
  border: 2px solid #0077ae;
  padding: 2.5px 10px 6.5px;
  text-align: center;
  text-align-last: center;
  font-weight: normal;
  font-variant: normal;
  text-transform: none;
  border-radius: 5px;
  background-color: #ffffff;
  outline: none;
  width: 158px;
  cursor: pointer;
  font-size: 15px;
  min-width: 230px;
}

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
.fontsize {
  font-size: 12px;
}
</style>
