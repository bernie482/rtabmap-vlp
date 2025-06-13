<template>
  <b-container fluid="xl">
    <div class="form-background pl-4 pr-4 pt-4 pb-4" @click="onclick">
      <!-- healthy gauge -->
      <vue-svg-gauge
        ref="gauge"
        class="mini-gauge"
        :start-angle="-135"
        :end-angle="135"
        :value="getValue"
        :values="values"
        :min="min"
        :max="max"
        :height="'100%'"
        :separator-step="separatorStep"
        :gauge-color="[
          { offset: 0, color: '#FF3333' },
          { offset: 50, color: '#FFCC33' },
          { offset: 100, color: '#33CC33' },
        ]"
        :inner-radius="80"
        :easing="'Circular.Out'"
        base-color="#d0cdcd"
      >
        <div class="inner-text inner-text--3">
          <span :style="textColor">{{ getText }}</span>
        </div>
      </vue-svg-gauge>

      <!-- start-end text -->
      <div class="start-end" style="width: 100%">
        <div class="text-box start-text">{{ min }} %</div>
        <div class="text-box"></div>
        <div class="text-box"></div>
        <div class="text-box"></div>
        <div class="text-box end-text">{{ max }} %</div>
      </div>
    </div>
  </b-container>
</template>

<script>
import VueSvgGauge from '@/env/insyde/components/Chart/Gauge';

/*
Features:
  * basic vue-svg-gauge usage
  * support to show start-end value

TODO:
  * colored text with value
  * add a text to show score
*/
export default {
  name: 'HealthGauge',
  components: {
    VueSvgGauge,
  },
  props: {
    value: {
      type: [Number, String],
      default: NaN,
    },
    values: {
      type: Array,
      default() {
        return [];
      },
    },
    min: {
      type: Number,
      default: 0,
    },
    max: {
      type: Number,
      default: 100,
    },
    text: {
      type: String,
      default: '',
    },
    separatorStep: {
      type: Number,
      default: 0,
    },
  },
  computed: {
    textColor() {
      // TODO: color text by value
      return 'color: black';
    },
    getValue() {
      // NOTE: single mode: value will display by radius, summary mode: always full radius
      if (this.values.length > 0) return this.max;
      return parseInt(this.value);
    },
    getText() {
      // NOTE: show N/A when value/values is invalid
      if (this.values.length > 0) return this.text;
      let num = parseInt(this.value);
      return isNaN(num) ? 'N/A' : this.text;
    },
  },
  methods: {
    onclick() {
      console.log('onclick', this.$refs);
    },
  },
};
</script>

<style scoped>
.inner-text {
  width: 100%;
  height: 100%;
}
.inner-text--3 {
  display: flex;
  justify-content: center;
  margin-top: 85px;
  font-size: 20px;
  color: #de3a21;
  font-weight: bold;
}

.start-end {
  display: flex;
  flex-wrap: nowrap;
  justify-content: center;
}
.text-box {
  width: 20%;
}
.start-text {
  text-align: center;
}
.end-text {
  text-align: center;
}
</style>
