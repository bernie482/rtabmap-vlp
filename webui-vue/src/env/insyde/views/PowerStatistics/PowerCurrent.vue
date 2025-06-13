<template>
  <b-container fluid="x1">
    <div id="gauge-wrapper">
      <!-- <p>{{ currentPowerData }}</p> -->
      <div>
        <div id="gauge-lbl-entire-platform" class="gauge-lbl">
          Entire Platform
        </div>
        <div
          id="gaugeEntirePlatform"
          ref="gaugeEntirePlatform"
          class="gauge"
        ></div>
        <div class="power-consumption-info-wrapper">
          <table class="power-consumption-info">
            <tr>
              <td class="period-lbl">Period</td>
              <td id="period0" ref="period0">N/A</td>
            </tr>
          </table>
        </div>
      </div>
      <div>
        <div id="gauge-lbl-cpu" class="gauge-lbl">CPU</div>
        <div id="gaugeCPU" ref="gaugeCPU" class="gauge"></div>
        <div class="power-consumption-info-wrapper">
          <table class="power-consumption-info">
            <tr>
              <td class="period-lbl">Period</td>
              <td id="period1" ref="period1">N/A</td>
            </tr>
          </table>
        </div>
      </div>
      <div>
        <div id="gauge-lbl-memory" class="gauge-lbl">Memory</div>
        <div id="gaugeMemory" ref="gaugeMemory" class="gauge"></div>
        <div class="power-consumption-info-wrapper">
          <table class="power-consumption-info">
            <tr>
              <td class="period-lbl">Period</td>
              <td id="period2" ref="period2">N/A</td>
            </tr>
          </table>
        </div>
      </div>
    </div>
  </b-container>
</template>
<script>
import { mapState } from 'vuex';

//import d3 from './d3';
import * as d3 from 'd3';

/**
 ***************************************************************************
 * @file d3_gauge.js
 *
 * @section LICENSE
 *
 * Copyright (c) 2003-2021, Insyde Software Corp. All Rights Reserved.
 *
 * You may not reproduce, distribute, publish, display, perform, modify, adapt,
 * transmit, broadcast, present, recite, release, license or otherwise exploit
 * any part of this publication in any form, by any means, without the prior
 * written permission of Insyde Software Corp.
 *
 *****************************************************************************/

var Gauge;
(function () {
  var stringWatt = 'Watt';
  var stringAvg = 'AVG';

  Gauge = function (el, config) {
    config.unitColor = '#607D8B';
    config.minMaxColor = '#757575';
    config.avgColor = '#BDBDBD';

    var primaryColor = config.primaryColor;
    var secondaryColor = config.secondaryColor;
    //console.log(secondaryColor);

    this.config = config;

    var margin = { top: 12, right: 48, bottom: 0, left: 48 };

    var arcRadius = 180;

    var width = arcRadius + margin.left + margin.right,
      height = arcRadius + margin.top + margin.bottom;

    var svg = d3
      .select(el)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    var startRad = deg2rad(225),
      endRad = deg2rad(495);

    var bgArc = d3
      .arc()
      .innerRadius(arcRadius / 2 - 6)
      .outerRadius(arcRadius / 2)
      .startAngle(startRad)
      .cornerRadius(10);

    var fgArc = d3
      .arc()
      .innerRadius(arcRadius / 2 - 8)
      .outerRadius(arcRadius / 2 + 2)
      .startAngle(startRad)
      .cornerRadius(10);

    var gArc = svg
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    // background arc
    var background = gArc
      .append('path')
      .datum({ endAngle: endRad })
      .style('fill', secondaryColor)
      .attr('d', bgArc);
    console.log(background);

    // foreground
    var foreground = gArc
      .append('path')
      .datum({ endAngle: startRad })
      .style('fill', config.primaryColor)
      .attr('d', fgArc);

    // unit label
    var gUnitLabel = svg
      .append('g')
      // .attr('transform', `translate(${width / 2 + (arcRadius / 3)}, ${height / 2 + arcRadius / 8})`);
      .attr(
        'transform',
        `translate(${width / 2}, ${height / 2 + arcRadius / 3})`
      );
    var unitLabelText = gUnitLabel
      .append('text')
      .text(stringWatt)
      .attr('font-family', 'monospace')
      .attr('font-size', '18px')
      .attr('font-weight', 'bold')
      .attr('fill', config.unitColor)
      .style('text-anchor', 'middle');
    console.log(unitLabelText);

    // Current Value
    var gCurrent = svg
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);
    var currentText = gCurrent
      .append('text')
      .text('--')
      .attr('font-family', 'monospace')
      .attr('font-size', '50px')
      .attr('font-weight', 'bold')
      .attr('fill', config.primaryColor)
      .style('text-anchor', 'middle');

    var heightShift = Math.sqrt(Math.pow(arcRadius / 2, 2) / 2); // a^2 + b^2 = c^2
    //var leftShift = arcRadius / 2 - heightShift;

    // Minimum Value
    var gMinLabel = svg
      .append('g')
      .attr(
        'transform',
        `translate(${margin.left}, ${margin.top + arcRadius / 2 + heightShift})`
      );
    var minLabelText = gMinLabel
      .append('text')
      .text('N/A')
      .attr('font-family', 'monospace')
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .attr('fill', config.minMaxColor)
      .style('text-anchor', 'middle');

    // Maximum Value
    var gMaxLabel = svg
      .append('g')
      .attr(
        'transform',
        `translate(${margin.left + arcRadius}, ${
          margin.top + arcRadius / 2 + heightShift
        })`
      );
    var maxLabelText = gMaxLabel
      .append('text')
      .text('N/A')
      .attr('font-family', 'monospace')
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .attr('fill', config.minMaxColor)
      .style('text-anchor', 'middle');

    // Average Value
    var gAvgLabel = svg
      .append('g')
      // .attr('transform', `translate(${width / 2}, ${height / 2 + arcRadius / 4})`);
      .attr(
        'transform',
        `translate(${width / 2 + arcRadius / 6}, ${height / 2 + arcRadius / 6})`
      );
    var avgLabelText = gAvgLabel
      .append('text')
      .text(stringAvg + ' N/A')
      .attr('font-family', 'monospace')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .attr('font-style', 'italic')
      .attr('fill', config.avgColor)
      .style('text-anchor', 'middle');

    this.update = function (config) {
      var arcScale = d3
        .scaleLinear()
        .domain([config.minValue, config.maxValue])
        .range([startRad, endRad]);

      if (config.maxValue > config.minValue) {
        foreground
          .transition()
          .duration(config.transitionMs)
          .styleTween('fill', function () {
            return d3.interpolate(primaryColor, primaryColor);
          })
          .call(arcTween, arcScale(config.curValue));
      }

      currentText
        .transition()
        .duration(config.transitionMs)
        .text(config.curValue);
      minLabelText
        .transition()
        .duration(config.transitionMs)
        .text(config.minValue);
      maxLabelText
        .transition()
        .duration(config.transitionMs)
        .text(config.maxValue);
      avgLabelText
        .transition()
        .duration(config.transitionMs)
        .text(stringAvg + ' ' + config.avgValue);
    };

    function arcTween(transition, newAngle) {
      transition.attrTween('d', function (d) {
        var interpolate = d3.interpolate(d.endAngle, newAngle);
        return function (t) {
          d.endAngle = interpolate(t);
          return fgArc(d);
        };
      });
    }
  };

  function deg2rad(deg) {
    return (deg * Math.PI) / 180;
  }
})();

var strDay = 'd',
  strHour = 'h',
  strMinute = 'm',
  strSecond = 's';
function second2Period(sec) {
  var pad = (num) => {
    return ('0' + num).slice(-2);
  };
  var sec_num = parseInt(sec);
  var d = Math.floor(sec_num / (24 * 60 * 60));
  d = d > 0 ? d + strDay + ' ' : '';
  sec_num = sec_num % (24 * 60 * 60);
  var h = Math.floor(sec_num / 3600);
  h = h > 0 ? pad(h) + strHour + ' ' : '';
  sec_num = sec_num % 3600;
  var m = Math.floor(sec_num / 60);
  m = m > 0 ? pad(m) + strMinute + ' ' : '';
  var s = pad(sec_num % 60) + strSecond;

  return d + h + m + s;
}
// <!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN:CONFIG_NM_OFFLOAD -->
import {
  domainCollectionParser,
  domainsParser,
} from '@/env/insyde/components/Mixins/PowerStatisticsParserMixin';
// <!-- WEB_CONFIG_DEPEND_FEATURE_END:CONFIG_NM_OFFLOAD -->
export default {
  name: 'CurrentPowerConsumption',
  components: {},
  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
  data() {
    return {
      activeRule: null,
      scenario: '', // how to use modify page: add, insert, modify
      gaugeEntirePlatform: null,
      gaugeCPU: null,
      gaugeMemory: null,
      curPowerData: [],
    };
  },
  computed: {
    ...mapState('powerStatisticsStore', ['currentPowerData']),
    // <!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN:CONFIG_NM_OFFLOAD -->
    power_Statistics() {
      return domainsParser(
        this.$store.getters['powerStatisticsStore/domainData']
      );
    },
    domainCollection() {
      return domainCollectionParser(
        this.$store.getters['powerStatisticsStore/domains']
      );
    },
    // <!-- WEB_CONFIG_DEPEND_FEATURE_END:CONFIG_NM_OFFLOAD -->
  },
  created() {
    let statistics = this;
    // <!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN:!CONFIG_NM_OFFLOAD -->
    statistics.getPowerStatistics();
    // <!-- WEB_CONFIG_DEPEND_FEATURE_END:!CONFIG_NM_OFFLOAD -->
    // <!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN:CONFIG_NM_OFFLOAD -->
    statistics.getAllDomains();
    // <!-- WEB_CONFIG_DEPEND_FEATURE_END:CONFIG_NM_OFFLOAD -->
  },
  mounted() {},
  methods: {
    // <!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN:CONFIG_NM_OFFLOAD -->
    getAllDomains() {
      const powerStatistics = this;
      powerStatistics.startLoader();
      powerStatistics.$store
        .dispatch('powerStatisticsStore/getDomainCollection')
        .then(() => {
          return powerStatistics.domainCollection.memArr;
        })
        .then((members) => {
          let reqArr = [];
          members.forEach((d) => {
            let domainId = d;
            reqArr.push(
              powerStatistics.$store
                .dispatch('powerStatisticsStore/getDomains', domainId)
                .then(() => {
                  powerStatistics.curPowerData.push(
                    powerStatistics.power_Statistics
                  );
                })
            );
          });
          return reqArr;
        })
        .then((reqArr) => {
          Promise.all(reqArr).finally(() => {
            //console.log(powerStatistics.curPowerData);
            powerStatistics.endLoader();
            powerStatistics.processD3(powerStatistics.curPowerData);
          });
        });
    },
    // <!-- WEB_CONFIG_DEPEND_FEATURE_END:CONFIG_NM_OFFLOAD -->
    // <!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN:!CONFIG_NM_OFFLOAD -->
    getPowerStatistics() {
      const powerStatistics = this;
      powerStatistics.startLoader();
      powerStatistics.$store
        .dispatch('powerStatisticsStore/fetchCurrentReading')
        .finally(() => {
          powerStatistics.endLoader();
          powerStatistics.processD3(powerStatistics.currentPowerData);
        });
    },
    // <!-- WEB_CONFIG_DEPEND_FEATURE_END:!CONFIG_NM_OFFLOAD -->
    processD3(currentPowerData) {
      //console.log('=====> created(), current ', currentPowerData);
      this.gaugeEntirePlatform = new Gauge(this.$refs.gaugeEntirePlatform, {
        primaryColor: '#6437C8',
        secondaryColor: 'rgba(100,55,200,.25)',
      });
      //console.log(this.gaugeEntirePlatform);
      this.gaugeCPU = new Gauge(this.$refs.gaugeCPU, {
        primaryColor: '#3DB5AC',
        secondaryColor: 'rgba(61,181,172,.25)',
      });
      //console.log(this.gaugeCPU);
      this.gaugeMemory = new Gauge(this.$refs.gaugeMemory, {
        primaryColor: '#B5CB20',
        secondaryColor: 'rgba(181,203,32,.25)',
      });
      //console.log(this.gaugeMemory);
      var gauge = [this.gaugeEntirePlatform, this.gaugeCPU, this.gaugeMemory];
      // console.log(gauge);
      // console.log(
      //   '=====> mounted(), current, this.currentPowerData=',
      //   this.currentPowerData
      // );
      //console.log('=====> mounted(), data=', data);
      currentPowerData.forEach(function (d) {
        if (d.domain > 2) return true; // continue
        //console.log(d, gauge[d.domain]);
        let periodId = 'period' + d.domain;
        //console.log(periodId);
        document.getElementById(periodId).innerText = second2Period(d.period);
        gauge[d.domain].update({
          minValue: parseInt(d.minimumValue),
          curValue: parseInt(d.currentValue),
          maxValue: parseInt(d.maximumValue),
          avgValue: parseInt(d.averageValue),
          transitionMs: 750,
        });
      });
    },
  },
};
</script>
<style>
.gauge,
.linechart {
  line-height: 1;
  font-weight: bold;
  font-family: monospace;
  font-size: 16px;
}
.power-consumption-info-wrapper {
  display: flex;
  justify-content: center;
}
.power-consumption-info tr td:first-child {
  padding-right: 16px;
}
#gauge-wrapper {
  display: flex;
  flex-wrap: wrap;
  margin-top: 12px;
}

#gauge-wrapper > div {
  margin-right: 32px;
}

.gauge-lbl {
  text-align: center;
  font-size: 16px;
}
</style>
