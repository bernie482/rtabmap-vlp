<template>
  <div>
    <input
      ref="element"
      :value="value"
      :type="type"
      :class="classStyle"
      :style="newStyle"
      :disabled="disabled"
      :placeholder="placeholder"
      :maxlength="maxlength"
      @input="
        $emit('input', $event.target.value);
        v.$touch();
      "
      @click="onChanged"
    />

    <template
      v-if="type == 'password'"
      style="display: inline; float: right; width: 100%"
    >
      <slot></slot>
      <b-button
        :title="togglePasswordLabel"
        variant="link"
        class="input-action-btn btn-icon-only force-alignment"
        :class="{ isVisible: isVisible }"
        :disabled="disabled"
        @click="toggleVisibility"
      >
        <icon-view-off v-if="isVisible" />
        <icon-view v-else />
        <span class="sr-only">{{ togglePasswordLabel }}</span>
      </b-button>
    </template>

    <b-form-datepicker
      v-if="type == 'date_selector'"
      v-model="tmpDateData"
      class="btn-datepicker btn-icon-only force-alignment"
      button-only
      right
      :hide-header="true"
      :locale="locale"
      :label-help="$t('global.calendar.useCursorKeysToNavigateCalendarDates')"
      :title="$t('global.calendar.selectDate')"
      :disabled="disabled"
      button-variant="link"
      aria-controls="input-manual-date"
    >
      <template #button-content>
        <icon-calendar />
        <span class="sr-only">
          {{ $t('global.calendar.selectDate') }}
        </span>
      </template>
    </b-form-datepicker>

    <div
      v-if="type != 'password' && type != 'date_selector'"
      v-show="value.length > 0"
      style="display: inline; float: right; width: 100%"
    >
      <slot></slot>
      <b-button
        :title="clearInputLabel"
        variant="link"
        class="input-action-btn btn-icon-only force-alignment"
        :disabled="disabled"
        @click="clearInput()"
      >
        <icon-close v-if="value.length > 0" />
        <span class="sr-only">{{ clearInputLabel }}</span>
      </b-button>
    </div>

    <div :class="v.$invalid ? 'tip-error' : 'tip_none'">
      {{ message }}
    </div>
  </div>
</template>

<script>
import IconClose from '@carbon/icons-vue/es/close/16';
import IconView from '@carbon/icons-vue/es/view/16';
import IconViewOff from '@carbon/icons-vue/es/view--off/16';
import IconCalendar from '@carbon/icons-vue/es/calendar/16';

export default {
  // features:
  //    quick way to create a complex input component (input + error check message).
  //    Support parent validate rule.
  //    Auto mark as dirty when user start to input. (dirty means the data field that user modified)
  //    add icon to switch password visable
  //    add icon to enable date_selector.
  //    add icon to clean text. (password / date_selector not support)
  //    support ok status
  // TODO: allow multi error check rules
  name: 'InsydeTextInput',
  components: { IconClose, IconView, IconViewOff, IconCalendar },
  props: {
    value: {
      // item value
      type: String,
      default: '',
    },
    msg: {
      // (optional) error message when check failed
      type: String,
      default: '',
    },
    v: {
      // Vuelidate object of item
      type: Object,
      default() {
        return {};
      },
    },
    type: {
      // (optional) input type, Ex: text, password, date_selector
      type: String,
      default: 'text',
    },
    disabled: {
      // (optional) disabled property, Ex: true/false
      type: Boolean,
      default: false,
    },
    placeholder: {
      // (optional) tip when empty, Ex: "fill your name here"
      type: String,
      default: '',
    },
    maxlength: {
      // (optional) maxlength property, Ex: 10
      type: String,
      default: '',
    },
    // https://stackoverflow.com/questions/65827288/pass-class-as-props-in-vue-js
    myClass: {
      // (optional) class property
      type: String,
      default: '',
    },
    addClass: {
      // (optional) append class property
      type: String,
      default: '',
    },
    myStyle: {
      // (optional) style property
      type: String,
      default: '',
    },
    addStyle: {
      // (optional) append style property
      type: String,
      default: '',
    },
  },
  data() {
    return {
      oldValue: '', // used for reset dirty status
      isVisible: false, // password text visable status
      tmpDateData_1: this.value, // a virtual variable for handle calendar data
      locale: this.$store.getters['global/languagePreference'], // date-time locale
      togglePasswordLabel: this.$t('global.ariaLabel.showPassword'),
      clearInputLabel: this.$t('global.ariaLabel.clearInput'),
    };
  },
  computed: {
    classStyle() {
      let styles = ['form-control'];
      if (this.myClass != '') styles = [this.myClass];
      if (this.addClass != '') styles.push(this.addClass);
      if (this.v.$invalid) styles.push('input_error');
      else if (this.v.$dirty && this.oldValue != this.value)
        styles.push('input_ok');
      else styles.push('input_normal');

      return styles.join(' ');
    },
    newStyle() {
      let styles = [];
      if (this.myStyle != '') styles = [this.myStyle];
      if (this.addStyle != '') styles.push(this.addStyle);
      return styles.join('; ');
    },
    message() {
      return this.msg;
    },
    // a virtual variable for handle calendar data
    tmpDateData: {
      get() {
        return this.tmpDateData_1;
      },
      set(value) {
        this.tmpDateData_1 = value;
        this.$emit('input', value);
      },
    },
  },
  created() {
    this.oldValue = this.value;
  },
  methods: {
    onChanged() {
      this.$emit('input', this.value);
    },
    toggleVisibility() {
      this.isVisible = !this.isVisible;
      const inputEl = this.$refs['element'];
      if (inputEl && inputEl.nodeName === 'INPUT') {
        inputEl.type = this.isVisible ? 'text' : 'password';
      }

      this.isVisible
        ? (this.togglePasswordLabel = this.$t('global.ariaLabel.hidePassword'))
        : (this.togglePasswordLabel = this.$t('global.ariaLabel.showPassword'));
    },
    clearInput() {
      this.$emit('input', '');
    },
  },
};
</script>

<style scoped>
.input_error {
  border-color: red !important;
}
.input_normal {
  border-color: black;
}
.input_ok {
  border-color: #24ee24 !important;
}
.tip_none {
  color: black;
  display: none;
}
.force-alignment {
  /*position: absolute;*/
  right: 16px;
}
</style>
