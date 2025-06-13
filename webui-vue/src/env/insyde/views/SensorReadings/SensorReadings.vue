<template>
  <b-container fluid="x1">
    <page-title />
    <b-row class="align-items-end">
      <b-col sm="4" md="3" xl="2">
        <label>Select a sensor owner: </label>
      </b-col>
      <b-col>
        <select v-model="sensorOwnerSel" @change="onChangedCategory($event)">
          <option v-for="(item, idx) in sensorOwner" :key="idx" :value="idx">
            {{ item }}
          </option>
        </select>
      </b-col>
    </b-row>
    <b-row class="align-items-end">
      <b-col sm="4" md="3" xl="2">
        <label>Select a sensor type category: </label> </b-col
      ><b-col>
        <select v-model="sensorCategory" @change="onChangedType($event)">
          <option :value="0">All Sensors</option>
          <option v-for="cat in sensorType" :key="cat" :value="cat">
            {{
              `${$t(
                'sensoreadings.LANG_SENSOR_SNRTYPE' +
                  cat.toString(16).toUpperCase()
              )}`
            }}
          </option>
          <option v-if="sensorTypeOEM.length != 0">
            {{ `${$t('sensoreadings.LANG_SENSOR_SNRTYPEC0')}` }}
          </option>
        </select>
      </b-col>
    </b-row>
    <b-row class="align-items-end">
      <b-col sm="4" md="3" xl="2"> <label>Auto Refresh(sec): </label> </b-col
      ><b-col>
        <select v-model="refreshTime" @change="onChangedRefreshSecs($event)">
          <option v-for="secs in seconds" :key="secs" :value="secs">
            {{ secs }}
          </option>
          <option value="255">Never</option>
        </select>
      </b-col>
      <b-col class="text-right">
        <label>Sensor Readings: </label>
        {{ sensorsAmount }} sensors
      </b-col>
    </b-row>
    <b-table
      ref="table"
      responsive="md"
      selectable
      no-select-on-click
      sort-icon-left
      hover
      no-sort-reset
      sticky-header="55vh"
      sort-by="status"
      show-empty
      :no-border-collapse="true"
      :items="sensorItems"
      :fields="fields"
      :sort-desc="true"
      :sort-compare="sortCompare"
      :filter="searchFilter"
      :empty-text="$t('global.table.emptyMessage')"
      :empty-filtered-text="$t('global.table.emptySearchMessage')"
      @filtered="onFiltered"
      @row-selected="onRowSelected($event, filteredSensors.length)"
    >
      <template #cell(Healthy)="data">
        <div v-html="data.value"></div>
      </template>
      <!--<template #cell(status)="{ value }">
        <status-icon :status="statusIcon(value)" /> {{ value }}
      </template>-->
      <template #cell(currentValue)="data">
        <div v-html="data.value"></div>
      </template>
    </b-table>
    <b-row class="align-items-end">
      <b-col sm="3" md="2" xl="1">
        <b-button variant="primary" type="button" @click="RefreshBtn">
          {{ $t('global.action.refresh') }}
        </b-button>
      </b-col>
      <b-col>
        <b-button variant="primary" type="button" @click="ThresholdBtn">
          {{ $t('global.action.showThresholds') }}
        </b-button>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import PageTitle from '@/components/Global/PageTitle';
import BVTableSelectableMixin, {
  selectedRows,
  tableHeaderCheckboxModel,
  tableHeaderCheckboxIndeterminate,
} from '@/components/Mixins/BVTableSelectableMixin';

import TableFilterMixin from '@/components/Mixins/TableFilterMixin';
import DataFormatterMixin from '@/components/Mixins/DataFormatterMixin';
import TableSortMixin from '@/components/Mixins/TableSortMixin';
import SearchFilterMixin, {
  searchFilter,
} from '@/components/Mixins/SearchFilterMixin';
import { sensorsValuesParser } from '@/env/insyde/components/Mixins/SensorReadingsTableParserMixin';
import * as d3 from 'd3';
//import i18n from '@/i18n';

const DELTA_Y = 30;
//var chooseSensorId = undefined;

var Defined = function (d) {
  return typeof d !== 'undefined';
};
var NullType = function (n) {
  return n === null;
};
var NumberType = function (num) {
  return typeof num === 'number' && Number.isFinite(num);
};

var BooleanType = function (b) {
  return typeof b === 'boolean';
};

var StringType = function (s) {
  return typeof s === 'string';
};

var ObjectType = function (o) {
  return typeof o === 'object';
};

var ArrayType = function (a) {
  return Array.isArray(a);
};

var EmptyString = function (str) {
  return StringType(str) && str.length <= 0;
};

var NoopObject = function (o) {
  return ObjectType(o) && Object.keys(o).length <= 0;
};

var FunctionType = function (f) {
  return typeof f === 'function';
};

var ElementType = function (e) {
  return (
    e instanceof Element ||
    e instanceof HTMLElement ||
    e instanceof HTMLDocument
  );
};

// Percent
var Percent = function (str) {
  return Validator.StringType(str) && checkRegexp(/^[+-]*[\d]+%$/, str);
};

// Color
var HexColor = function (str) {
  return (
    Validator.StringType(str) && checkRegexp(/^#(?:[0-9A-Fa-f]{3}){1,2}$/, str)
  );
};

var RGBAColor = function (str) {
  return (
    Validator.StringType(str) &&
    checkRegexp(
      /^rgba\((?:\s*[0-9]{1,3}\s*,){3}(?:\s*(\.[1-9]+|0|1)\s*)\)$/,
      str
    )
  );
};

var Validator = {
  // Type
  Defined: Defined,
  NullType: NullType,
  NumberType: NumberType,
  HexColor: HexColor,
  EmptyString: EmptyString,
  RGBAColor: RGBAColor,
  NoopObject: NoopObject,
  Percent: Percent,
  BooleanType: BooleanType,
  StringType: StringType,
  ObjectType: ObjectType,
  FunctionType: FunctionType,
  ArrayType: ArrayType,
  ElementType: ElementType,
};

function checkRegexp(regexp, str) {
  'use strict';
  var result = false;
  var matched = str.match(regexp);
  if (!matched) {
    result = false;
  } else {
    result = true;
  }
  return result;
}

/* start IconTemplate.js */
var IconTemplate = function IconTemplate(element, settings) {
  //console.log('IconTemplate#219 input data:',element,settings);
  this.element = element || null;
  this.settings = {
    id: Object.prototype.hasOwnProperty.call(settings, 'id')
      ? settings.id
      : null,
    class: Object.prototype.hasOwnProperty.call(settings, 'class')
      ? settings.class
      : null,
  };
  this.icons = null;
  //console.log('IconTemplate#230 this.settings: ', this.settings);
};

IconTemplate.prototype.Create = function (icons, parameter) {
  let result = {};

  if (typeof icons === 'string') {
    icons = [[icons, parameter]];
  } else if (!Array.isArray(icons)) {
    console.error('Not Available');
    return this;
  }
  icons.forEach(function (icon) {
    let div = document.createElement('div');

    // element
    if (this.settings['id'] != null) {
      div.setAttribute(
        'id',
        this.settings['id'] + '-' + icon[0].split('.').join('-')
      );
    }
    if (this.settings['class'] != null) {
      div.classList.add(
        this.settings['class'] + '-' + icon[0].split('.').join('-')
      );
    }

    // content append
    div.append(InputHint.Icon(icon[0], icon[1]));
    if (this.element !== null) this.element.append(div);
    result[icon[0]] = div;
  }, this);

  this.icons = result;
  return this;
};

IconTemplate.prototype.Insert = function (element) {
  this.element = element || null;

  let $$element = this.element;
  if ($$element !== null && this.icons !== null) {
    Object.keys(this.icons).forEach((iconDiv) => {
      $$element.append(iconDiv);
    }, this);
  }
};

IconTemplate.prototype.Element = function (icon) {
  if (icon != undefined && icon != null) {
    return this.icons[icon];
  } else {
    return this.icons;
  }
};

IconTemplate.prototype.Update = function (status) {
  if (this.icons != null) {
    Object.keys(status).forEach(function (category) {
      if (Object.prototype.hasOwnProperty.call(this.icons, category)) {
        let icon = this.icons[category];
        if (status[category]) {
          icon.classList.add('active');
        } else {
          icon.classList.remove('active');
        }
      }
    }, this);
  }
  return this;
};

IconTemplate.prototype.Hint = function (icons) {
  Object.keys(icons).forEach(function (category) {
    if (Object.prototype.hasOwnProperty.call(this.icons, category)) {
      let icon = this.icons[category];
      icon.append('<span>' + icons[category] + '</span>');
    }
  }, this);
  return this;
};

// InputHintGenerator
var InputHint = {
  Liter: function (literal) {
    return (
      '<div class="Insyde_TF_Message_Error_Literal_Section">' +
      '<label>' +
      literal +
      '</label>' +
      '</div>'
    );
  },
  Tag: function (tag, argu) {
    console.log(argu);
    let validWord = {
      ipv6: ['IPv6', 'Input fe80:100xxxxxx '],
      domain: ['Domain', 'Input xxx.xxx.xxx.xxx '],
      email: ['Email', 'Input xxx@xxx.xxx'],
      user: ['User', 'Input xxxxx'],
      password: ['Password', 'Input xxxxx'],
      number: ['Number', 'Input xx~xx'],
    };

    tag = tag || null;
    if (tag != null) {
      return (
        '<div class="Insyde_TF_Message_Error_Tag_Section">' +
        '<label>' +
        validWord[tag][0] +
        ' </label>' +
        '<span>' +
        validWord[tag][1] +
        '</span>' +
        '</div>'
      );
    } else {
      return '';
    }
  },
  Icon: function (icon, parameter) {
    let svg = document.createElementNS(IconTemplate.iconNS, 'svg');
    let rootFunc = IconTemplate.iconRule;
    if (
      icon.split('.').every((path) => {
        if (!Object.prototype.hasOwnProperty.call(rootFunc, path)) return false;
        rootFunc = rootFunc[path];
        return true;
      })
    ) {
      rootFunc(svg, parameter);
    }
    return svg;
  },
};

IconTemplate.iconNS = 'http://www.w3.org/2000/svg';
IconTemplate.iconRule = {
  hint: {
    correct: function (svg) {
      svg.classList.add('icon-correct');
      svg.appendChild(document.createElementNS(IconTemplate.iconNS, 'circle'));
      let polyline = document.createElementNS(IconTemplate.iconNS, 'polyline');
      polyline.setAttribute('points', '5,10 8,15 18,2');
      svg.appendChild(polyline);
    },
    error: function (svg) {
      svg.classList.add('icon-error');
      svg.appendChild(document.createElementNS(IconTemplate.iconNS, 'circle'));
      let polyline1 = document.createElementNS(IconTemplate.iconNS, 'polyline');
      let polyline2 = document.createElementNS(IconTemplate.iconNS, 'polyline');
      polyline1.setAttribute('points', '5.5,5.5 14.5,14.5');
      polyline2.setAttribute('points', '14.5,5.5 5.5,14.5');
      svg.appendChild(polyline1);
      svg.appendChild(polyline2);
    },
    info: function (svg) {
      svg.classList.add('icon-icon');
      let circle1 = document.createElementNS(IconTemplate.iconNS, 'circle');
      let circle2 = document.createElementNS(IconTemplate.iconNS, 'circle');
      circle1.classList.add('outer_circle');
      circle1.classList.add('question_circle');
      svg.appendChild(circle1);
      svg.appendChild(circle2);
      let polyline1 = document.createElementNS(IconTemplate.iconNS, 'circle');
      polyline1.setAttribute('points', '10,15 10,9');
      svg.appendChild(polyline1);
    },
    delete: function (svg) {
      svg.classList.add('icon-delete');
      svg.appendChild(document.createElementNS(IconTemplate.iconNS, 'circle'));
      let polyline1 = document.createElementNS(IconTemplate.iconNS, 'polyline');
      let polyline2 = document.createElementNS(IconTemplate.iconNS, 'polyline');
      polyline1.setAttribute('points', '3.5,3.5 12.5,12.5');
      polyline2.setAttribute('points', '12.5,3.5 3.5,12.5');
      svg.appendChild(polyline1);
      svg.appendChild(polyline2);
    },
    eye: function (svg) {
      svg.classList.add('icon-eye');
      svg.setAttribute('viewBox', '0 0 24 24');
      let path = document.createElementNS(IconTemplate.iconNS, 'path');
      path.setAttribute('fill', '#757575');
      path.setAttribute(
        'd',
        'M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z'
      );
      svg.appendChild(path);
    },
  },
  load: {
    error: function (svg) {
      svg.classList.add('load-error');
      svg.setAttribute('viewBox', '0 0 24 24');
      let path = document.createElementNS(IconTemplate.iconNS, 'path');
      path.setAttribute('fill', '#c0c0c0');
      path.setAttribute(
        'd',
        'M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z'
      );
      svg.appendChild(path);
    },
  },
  check: {
    box: function (svg, parameter) {
      svg.classList.add('check-box');
      if (parameter) {
        svg.classList.add('check');
        svg.appendChild(document.createElementNS(IconTemplate.iconNS, 'rect'));
        let polyline1 = document.createElementNS(
          IconTemplate.iconNS,
          'polyline'
        );
        polyline1.setAttribute('points', '2,6 6,11 13,3');
        svg.appendChild(polyline1);
      } else {
        svg.classList.add('uncheck');
        svg.appendChild(document.createElementNS(IconTemplate.iconNS, 'rect'));
        let polyline1 = document.createElementNS(
          IconTemplate.iconNS,
          'polyline'
        );
        let polyline2 = document.createElementNS(
          IconTemplate.iconNS,
          'polyline'
        );
        polyline1.setAttribute('points', '3,3 12,12');
        polyline2.setAttribute('points', '12,3 3,12');
        svg.appendChild(polyline1);
        svg.appendChild(polyline2);
      }
    },
    circle: function (svg, parameter) {
      svg.classList.add('check-circle');
      if (parameter) {
        svg.classList.add('check');
        svg.appendChild(
          document.createElementNS(IconTemplate.iconNS, 'circle')
        );
        let polyline1 = document.createElementNS(
          IconTemplate.iconNS,
          'polyline'
        );
        polyline1.setAttribute('points', '4,8 7,13 13,5');
        svg.appendChild(polyline1);
      } else {
        svg.classList.add('uncheck');
        svg.appendChild(
          document.createElementNS(IconTemplate.iconNS, 'circle')
        );
        let polyline1 = document.createElementNS(
          IconTemplate.iconNS,
          'polyline'
        );
        let polyline2 = document.createElementNS(
          IconTemplate.iconNS,
          'polyline'
        );
        polyline1.setAttribute('points', '5,5 13,13');
        polyline2.setAttribute('points', '5,13 13,5');
        svg.appendChild(polyline1);
        svg.appendChild(polyline2);
      }
    },
  },
  close: {
    circle: function (svg, parameter) {
      console.log('#498 cricle: ', svg, parameter);
      svg.classList.add('close-circle');
      svg.appendChild(document.createElementNS(IconTemplate.iconNS, 'circle'));
      let polyline1 = document.createElementNS(IconTemplate.iconNS, 'polyline');
      let polyline2 = document.createElementNS(IconTemplate.iconNS, 'polyline');
      polyline1.setAttribute('points', '5,5 31,31');
      polyline2.setAttribute('points', '5,31 31,5');
      svg.appendChild(polyline1);
      svg.appendChild(polyline2);
    },
  },
};
/* end IconTemplate.js */

/* start floatPanel.js */
/* floatPanel */
{
  // {
  //     size: {
  //         width: [number | percent],
  //         height: [number | percent]
  //     },
  //     indent: [number | {
  //         top: [number],
  //         bottom: [number],
  //         left: [number],
  //         right: [number],
  //     }],
  //     // panel background color
  //     color: {
  //         foreground: #?????? || rgba(),
  //         background: #?????? || rgba()
  //     },
  //     // function
  //     func: {
  //         build: function(){},
  //         update: function(){}
  //     },
  //     // extension
  //     extension: {
  //         cancelButton: {}
  //     }
  // }
  var FloatPanel = function FloatPanel(element, floatPanelId, config) {
    this.source =
      Validator.Defined(element) && !Validator.NullType(element)
        ? element
        : undefined;
    this.container = undefined;
    this.element = undefined;

    this._config = FloatPanel.setDefaultConfig();
    FloatPanel.loadConfig.call(this, config);

    // initial element
    //console.log('initial elm init elm 566 566: ', this);
    FloatPanel.init.call(this);

    this.active = function () {
      this.container.classList.add('active');
      this.container.classList.remove('deactive');
    };

    this.deactive = function () {
      this.container.classList.remove('active');
      this.container.classList.add('deactive');
    };
    if (Validator.Defined(this.source)) this.source.prepend(this.container);
  };

  FloatPanel.init = function () {
    let $$config = this._config;
    //console.log('55555555555558888888888888888844444444444:', this._config);

    this.container = document.createElement('div');
    this.container.classList.add('float-panel-container', 'deactive');

    // FloatPanel name
    FloatPanel.IncreaseCurrentFloatPanelNum();
    this.name = 'FloatPanel' + FloatPanel.CurrentFloatPanelNum;

    // cover panel
    FloatPanel.buildCoverPaenl.call(this);

    // panel
    //console.log('fpanel init pre-build596 596: ', this);
    FloatPanel.buildPanel.call(this);

    // extension
    FloatPanel.buildExtension.call(this);

    // customize content
    if (Validator.Defined($$config.buildFunc)) {
      this._internal = $$config.buildFunc(this.element);
    }
  };

  FloatPanel.prototype.update = function (data) {
    let $$config = this._config;
    $$config.updateFunc(this.element, data, this._internal);
  };

  FloatPanel.setDefaultConfig = function () {
    return {
      // size
      width: 0,
      height: 0,
      // indent
      indentTop: 0,
      indentBottom: 0,
      indentLeft: 0,
      indentRight: 0,
      // color
      foregroundColor: undefined,
      backgroundColor: '#FFFFFF',
      // func
      buildFunc: undefined,
      updateFunc: undefined,
      // extension
      extension: {},
    };
  };
  FloatPanel.loadConfig = function (config) {
    let $$config = this._config;

    // size
    if (Validator.Defined(config.size)) {
      let sizeConfig = config.size;
      if (Validator.Defined(sizeConfig.width)) {
        if (
          Validator.NumberType(sizeConfig.width) ||
          Validator.Percent(sizeConfig.width)
        ) {
          $$config.width = sizeConfig.width;
        }
      }
      if (Validator.Defined(sizeConfig.height)) {
        if (
          Validator.NumberType(sizeConfig.height) ||
          Validator.Percent(sizeConfig.height)
        ) {
          $$config.height = sizeConfig.height;
        }
      }
    }

    // indent
    if (Validator.Defined(config.indent)) {
      let indentConfig = config.indent;
      if (Validator.NumberType(config.indent)) {
        $$config.indentTop = config.indent;
        $$config.indentBottom = config.indent;
        $$config.indentLeft = config.indent;
        $$config.indentRight = config.indent;
      } else if (
        Validator.ObjectType(config.indent) &&
        !Validator.NoopObject(config.indent)
      ) {
        if (
          Validator.Defined(indentConfig.top) &&
          Validator.NumberType(indentConfig.top)
        )
          $$config.indentTop = indentConfig.top;
        if (
          Validator.Defined(indentConfig.bottom) &&
          Validator.NumberType(indentConfig.bottom)
        )
          $$config.indentBottom = indentConfig.bottom;
        if (
          Validator.Defined(indentConfig.left) &&
          Validator.NumberType(indentConfig.left)
        )
          $$config.indentLeft = indentConfig.left;
        if (
          Validator.Defined(indentConfig.right) &&
          Validator.NumberType(indentConfig.right)
        )
          $$config.indentRight = indentConfig.right;
      }
    }

    // color
    if (
      Validator.Defined(config.color) &&
      !Validator.NoopObject(config.color)
    ) {
      let colorConfig = config.color;
      if (
        Validator.Defined(colorConfig.foreground) &&
        (Validator.HexColor(colorConfig.foreground) ||
          Validator.RGBAColor(colorConfig.foreground))
      )
        $$config.foregroundColor = colorConfig.foreground;
      if (
        Validator.Defined(colorConfig.background) &&
        (Validator.HexColor(colorConfig.background) ||
          Validator.RGBAColor(colorConfig.background))
      )
        $$config.backgroundColor = colorConfig.background;
    }

    if (Validator.Defined(config.func)) {
      let funcConfig = config.func;
      if (
        Validator.Defined(funcConfig.build) &&
        Validator.FunctionType(funcConfig.build)
      )
        $$config.buildFunc = funcConfig.build;
      if (
        Validator.Defined(funcConfig.update) &&
        Validator.FunctionType(funcConfig.update)
      )
        $$config.updateFunc = funcConfig.update;
    }

    if (Validator.Defined(config.extension)) {
      let extConfig = config.extension;
      FloatPanel.extensionConfig.call(this, extConfig);
    }
  };

  FloatPanel.extensionConfig = function (extConfig) {
    let $$config = this._config;

    Object.keys(extConfig).forEach((ext) => {
      if (Validator.Defined(FloatPanel.extensionSupport[ext])) {
        $$config.extension[ext] = {
          instance: new FloatPanel.extensionSupport[ext](
            null,
            null,
            extConfig[ext]
          ),
          layer: FloatPanel.extensionSetupLayer[ext],
          initalize: false,
        };
      }
    });
  };
  FloatPanel.extensionSetupLayerTransfer = function (layer) {
    switch (layer) {
      case 1:
        return this.element;
      case 0:
      default:
        return this.container;
    }
  };

  FloatPanel.buildCoverPaenl = function () {
    let $$config = this._config;

    // CoverPanel element
    this.cover = document.createElement('div');
    this.cover.classList.add('float-cover');
    this.container.append(this.cover);

    if (Validator.Defined($$config.backgroundColor)) {
      this.cover.style.backgroundColor = $$config.backgroundColor;
    }
  };

  FloatPanel.buildPanel = function () {
    let $$config = this._config;
    //console.log('fpanel building 773 773', this.container)
    // FloatPanel element
    this.floatpanel = document.createElement('div');
    this.floatpanel.classList.add('float-panel');
    this.container.append(this.floatpanel);

    // indent
    this.floatpanel.style.padding = `${$$config.indentTop}px ${$$config.indentRight}px ${$$config.indentBottom}px ${$$config.indentLeft}px`;

    // element
    this.element = document.createElement('div');
    this.floatpanel.append(this.element);

    // size
    this.floatpanel.style.width = $$config.width;
    this.floatpanel.style.height = $$config.height;

    // color
    if (Validator.Defined($$config.foregroundColor)) {
      this.element.style.backgroundColor = $$config.foregroundColor;
    }
  };

  // Static Property
  FloatPanel.IncreaseCurrentFloatPanelNum = function () {
    FloatPanel.CurrentFloatPanelNum++;
  };

  FloatPanel.CurrentFloatPanelNum = 0;

  // extension
  FloatPanel.buildExtension = function () {
    let $$config = this._config,
      extensions = $$config.extension;
    // extension
    Object.keys(extensions).forEach((extName) => {
      let extConfig = extensions[extName],
        extInstance = extConfig.instance;
      if (!extConfig.initalize) {
        FloatPanel.extensionInit[extName].call(
          extInstance,
          FloatPanel.extensionSetupLayerTransfer.call(this, extConfig.layer)
        );
        extConfig.initalize = true;
      }
    }, this);
  };
  FloatPanel.extensionSupport = {};
  FloatPanel.extensionInit = {};
  FloatPanel.extensionSetupLayer = {};
}

/* IconButton */
{
  var IconButton = function IconButton(element, iconButtonId, config) {
    //console.log('IconButton element 829: ',element);
    this.source =
      Validator.Defined(element) && !Validator.NullType(element)
        ? element
        : undefined;
    //console.log('IconButton this source:', this.source);
    this._button = undefined;
    this._iconMachine = undefined;
    this.element = undefined;

    this._config = IconButton.setDefaultConfig();
    IconButton.loadConfig.call(this, config);

    IconButton.init.call(this);
    //console.log('var IconButton 846: ',this);

    if (Validator.Defined(this.source)) {
      this.source.append(this._button);
      this.source.append(this.element);
    }
  };

  IconButton.setDefaultConfig = function () {
    return {
      id: '',
      class: 'icon-button',
      enable: true,
      value: '',
      // style
      style: '',
      // event handler
      actionEnable: true,
      action: {},
    };
  };
  IconButton.loadConfig = function (config) {
    let $$config = this._config;

    if (Validator.Defined(config.id) && Validator.StringType(config.id)) {
      $$config.id = config.id;
    }

    if (
      Validator.Defined(config.enable) &&
      Validator.BooleanType(config.enable)
    ) {
      $$config.enable = config.enable;
    }

    if (Validator.Defined(config.value) && Validator.StringType(config.value)) {
      $$config.value = config.value;
    }

    if (Validator.Defined(config.actionEnable)) {
      if (Validator.FunctionType(config.actionEnable)) {
        let result = config.actionEnable();
        if (Validator.BooleanType(result)) $$config.actionEnable = result;
      } else if (Validator.BooleanType(config.actionEnable))
        $$config.actionEnable = config.actionEnable;
    }

    if (Validator.Defined(config.action)) {
      let actionConfig = config.action;
      if (
        Validator.ObjectType(actionConfig) &&
        !Validator.NoopObject(actionConfig)
      ) {
        Object.keys(actionConfig).forEach((evt) => {
          let eventCallback = actionConfig[evt];
          $$config.action[evt] = [];

          if (Validator.ArrayType(eventCallback)) {
            // multiple action
            eventCallback.forEach((callback) => {
              $$config.action[evt].push(callback);
            });
          } else if (Validator.FunctionType(eventCallback)) {
            // single action
            $$config.action[evt].push(eventCallback);
          }
        }, this);
      }
    }

    if (Validator.Defined(config.style) && Validator.StringType(config.style)) {
      $$config.style = config.style;
    }
  };
  IconButton.init = function () {
    //console.log('#919 IconButton.init');
    let $$ = this,
      $$config = $$._config;

    // build Button
    let button = document.createElement('input');

    // type
    button.type = 'button';

    // id
    if (!Validator.EmptyString($$config.id))
      button.setAttribute('id', $$config.id);

    // class
    button.classList.add(`${$$config.class}_button`);

    // value
    if (!Validator.EmptyString($$config.value)) button.value = $$config.value;

    // enable
    button.disabled = !$$config.enable;

    this._button = button;

    // Icon
    this._iconMachine = new IconTemplate(null, {}).Create('close.circle');
    //console.log('this._iconMachine 946:',this._iconMachine);
    this.element = this._iconMachine.Element('close.circle');
    this.element.classList.add(`${$$config.class}_icon`);

    // add Listener
    if ($$config.actionEnable) {
      if (!Validator.NoopObject($$config.action)) {
        Object.keys($$config.action).forEach((evtType) => {
          $$config.action[evtType].forEach((callback) => {
            button.addEventListener(evtType, callback);
            this.element.addEventListener(evtType, function (evt) {
              button.dispatchEvent(new Event(evt.type));
            });
          });
        }, this);
      }
    }
  };

  /* command */
  IconButton.prototype.Enable = function () {
    if (Validator.Defined(this._button)) this._button.disabled = false;
  };

  IconButton.prototype.Disable = function () {
    if (Validator.Defined(this._button)) this._button.disabled = true;
  };

  /* for FloatPanel Support */
  if (Validator.Defined(FloatPanel)) {
    //console.log('#976 FloatPanel:', FloatPanel);
    FloatPanel.extensionSupport.iconButton = IconButton;
    //console.log('#978 IconButton:', IconButton);
    FloatPanel.extensionSetupLayer.iconButton = 1;
    FloatPanel.extensionInit.iconButton = function (panel) {
      panel.append(this._button);
      panel.append(this.element);
    };
  }
}
/* end floatPanel.js */

//uiTool
var uiTool = {};

uiTool.setAttribute = function (element, defaults, settings) {
  settings = settings || {};
  if (element != undefined) {
    let result = {};
    //TODO:
    //$.extend(result, defaults, settings);
    if (
      Object.prototype.hasOwnProperty.call(defaults, 'css') &&
      Object.prototype.hasOwnProperty.call(settings, 'css')
    ) {
      let css = {};
      //TODO:
      //$.extend(css, defaults['css'], settings['css']);
      result['css'] = css;
    }

    for (let attribute in result) {
      if (attribute == 'css') {
        element.css(result[attribute]);
      } else {
        element.attr(attribute, result[attribute]);
      }
    }
  }
};

// Object
//var uiTool = {};

uiTool.getProperty = function (o, key, defaultValue) {
  return Validator.Defined(o[key]) ? o[key] : defaultValue;
};

uiTool.trace = function (data, str) {
  str = str.replace(/\[(\w+)\]/g, '.$1');
  str = str.replace(/^\./, '');
  let part = str.split('.');
  for (let i = 0, n = part.length; i < n; i++) {
    let param = part[i];
    if (data !== null && Object.prototype.hasOwnProperty.call(data, param)) {
      data = data[param];
    } else {
      return undefined;
    }
  }
  return data;
};

// element
uiTool.getFirstElement = function (query) {
  return document.querySelectorAll(query)[0];
};

uiTool.removeAllChildElement = function (element) {
  if (Validator.ElementType(element)) {
    while (!Validator.NullType(element.firstChild)) {
      element.firstChild.remove();
    }
  }
};
//end of uiTool

/* Start svg.js */
var SVG = function (id, config) {
  this.src = undefined;
  this.element = undefined;

  // svg name
  SVG.IncreaseCurrentSVGNum();
  this.name = 'SVG' + SVG.CurrentSVGNum;
  this.svgId = id || this.name;

  //console.log('SVG, config', config);
  this._config = SVG.setDefaultConfig();
  //console.log('SVG, this._config', this._config);
  if (SVG.loadConfig.call(this, config)) {
    // initialize
    SVG.updateSVG.call(this);
  }
};

Object.defineProperty(SVG.prototype, 'width', {
  get: function () {
    return this._config.width;
  },
});

Object.defineProperty(SVG.prototype, 'height', {
  get: function () {
    return this._config.height;
  },
});

Object.defineProperty(SVG.prototype, 'contentWidth', {
  get: function () {
    return (
      this._config.width - this._config.paddingLeft - this._config.paddingRight
    );
  },
});

Object.defineProperty(SVG.prototype, 'contentHeight', {
  get: function () {
    return (
      this._config.height - this._config.paddingTop - this._config.paddingBottom
    );
  },
});

Object.defineProperty(SVG.prototype, 'x', {
  get: function () {
    return this._config.paddingLeft;
  },
});

Object.defineProperty(SVG.prototype, 'y', {
  get: function () {
    return this._config.paddingTop;
  },
});

SVG.setDefaultConfig = function () {
  return {
    sizeWidth: undefined,
    sizeHeight: undefined,
    width: 0,
    height: 0,
    // padding
    paddingTop: 0,
    paddingLeft: 0,
    paddingRight: 0,
    paddingBottom: 0,
    // target
    target: undefined,
  };
};

SVG.loadConfig = function (config) {
  let configModified = false;
  if (
    Validator.Defined(config) &&
    Validator.ObjectType(config) &&
    !NoopObject(config)
  ) {
    configModified = SVG.setSize.call(this, config) || configModified;
    configModified = SVG.setPadding.call(this, config) || configModified;
    configModified = SVG.setTarget.call(this, config) || configModified;
  }
  return configModified;
};

// size
SVG.setSize = function (config) {
  let $$config = this._config;
  let modified = false;
  if (Validator.Defined(config.size)) {
    let sizeConfig = config.size;
    // width
    if (Validator.Defined(sizeConfig.width)) {
      if (Validator.NumberType(sizeConfig.width) || Percent(sizeConfig.width)) {
        $$config.sizeWidth = sizeConfig.width;
        modified = true;
      }
    }
    // height
    if (Validator.Defined(sizeConfig.height)) {
      if (
        Validator.NumberType(sizeConfig.height) ||
        Percent(sizeConfig.height)
      ) {
        $$config.sizeHeight = sizeConfig.height;
        modified = true;
      }
    }
  }

  return modified;
};

// padding
SVG.setPadding = function (config) {
  let $$config = this._config;
  let modified = false;

  if (Validator.Defined(config.padding)) {
    let paddingConfig = config.padding;
    if (Validator.Defined(paddingConfig.top)) {
      if (Validator.NumberType(paddingConfig.top)) {
        $$config.paddingTop = paddingConfig.top;
        modified = true;
      }
    }
    if (Validator.Defined(paddingConfig.left)) {
      if (Validator.NumberType(paddingConfig.left)) {
        $$config.paddingLeft = paddingConfig.left;
        modified = true;
      }
    }
    if (Validator.Defined(paddingConfig.right)) {
      if (Validator.NumberType(paddingConfig.right)) {
        $$config.paddingRight = paddingConfig.right;
        modified = true;
      }
    }
    if (Validator.Defined(paddingConfig.bottom)) {
      if (Validator.NumberType(paddingConfig.bottom)) {
        $$config.paddingBottom = paddingConfig.bottom;
        modified = true;
      }
    }
  }

  return modified;
};

// target
SVG.setTarget = function (config) {
  let $$config = this._config;
  let modified = false;

  if (Validator.Defined(config.target)) {
    $$config.target = config.target;
    modified = true;
  }

  return modified;
};

SVG.prototype.resize = function (size) {
  if (Validator.Defined(size)) {
    let config = {};
    config.size = size;
    if (SVG.loadConfig.call(this, config)) {
      // redraw
      SVG.updateSVG.call(this);
    }
  }
};

SVG.prototype.update = function (target, settings) {
  if (Validator.Defined(target) || Validator.Defined(settings)) {
    settings = settings || {};
    if (Validator.Defined(target)) {
      settings.target = target;
    }
    // console.log(target, settings);
    if (SVG.loadConfig.call(this, settings)) {
      SVG.updateSVG.call(this);
    }
  }
};

// SVG.prototype.append = function(element){
//     this.element.append(element);
// }

SVG.updateSVG = function () {
  let $$config = this._config;

  if (!Validator.Defined(this.src)) {
    let target = $$config.target;
    if (Validator.Defined(target)) {
      if (Validator.StringType(target)) {
        let element = document.querySelectorAll(target)[0];
        if (Validator.ElementType(element)) this.src = element;
      } else if (Validator.ElementType(target)) {
        this.src = target;
      }
    }
  }

  if (Validator.Defined(this.src)) {
    // this.element = document.createElement('svg');
    // this.src.append(this.element);
    // this.element.setAttribute('width', $$config.sizeWidth);
    // this.element.setAttribute('height', $$config.sizeHeight);
    if (!Validator.Defined(this.element)) {
      this.element = d3.select(this.src).append('svg');
    }
    this.element
      .attr('width', $$config.sizeWidth)
      .attr('height', $$config.sizeHeight);
    let svgBox = this.element.node().getBoundingClientRect();
    $$config.width = svgBox.width;
    $$config.height = svgBox.height;
  }
};

SVG.IncreaseCurrentSVGNum = function () {
  SVG.CurrentSVGNum++;
};

SVG.CurrentSVGNum = 0;
/* End svg.js */

/* Start d3LineChart.js */
/* Start linechart.js */
// let chart = new LineChart({
//     size: {
//         width: 960,
//         height: 300
//     },
//     padding: {
//         top: 0,
//         bottom: 0,
//         left: 0,
//         right: 0
//     },
//     data: {
//         x: x_data_name,
//         y: [y_data_name, ...],
//         types: {
//              check for Line.js
//         }
//     },
//     axis: {
//         x : axis_name,
//         y : axis_name,
//         types: {
//             check for Axis.js
//         }
//     },
//     extension: {
//         focusLine: {
//             check for FocusLine.js
//         },
//         tooltip: {
//             check for Tooltip.js
//         }
//         click: {
//             check for Click.js
//         }
//     }
// })
var LineChart = function (element, lineChartId, config) {
  // eslint-disable-next-line prettier/prettier
  //console.log('parameter elm: ',element);
  this.src =
    Validator.Defined(element) && !Validator.NullType(element)
      ? element
      : undefined;
  this.container = document.createElement('div');
  this.container.classList.add('linechart-container');
  // here for vue
  //console.log('LineCharteml, this.src', this.src.innerHTML);
  let temp_elm = this.src.innerHTML;
  let stringArr = temp_elm.split('<div');
  if (stringArr != -1) {
    this.src.innerHTML = stringArr[0];
  }

  if (Validator.Defined(this.src)) {
    this.src.append(this.container);
  }

  // lineChart name
  LineChart.IncreaseCurrentLineChartNum();
  this.name = 'LineChart' + LineChart.CurrentLineChartNum;
  this.lineChartId = lineChartId || this.name;

  // console.log(config);

  this._config = LineChart.setDefaultConfig();
  //console.log('LineChart, this._config', this._config);
  LineChart.loadConfig.call(this, config);

  // console.log(this.config);

  // initialize
  LineChart.buildLineChart.call(this);

  // data
  this.update = function (data) {
    LineChart.dataSrcManipulate.call(this, data, data.length, false);
    LineChart.updateAction.call(this);
  };

  this.remove = function (number) {
    LineChart.dataSrcManipulate.call(this, undefined, number, false);
    LineChart.updateAction.call(this);
  };

  this.clear = function () {
    LineChart.dataSrcManipulate.call(this, undefined, 0, true);
    LineChart.updateAction.call(this);
  };

  this.reload = function (data) {
    LineChart.dataSrcManipulate.call(this, data, data.length, true);
    LineChart.updateAction.call(this);
  };

  // Line
  this.show = function (lineNames) {
    LineChart.updateLine.call(this, [], {}, undefined, lineNames);
  };

  this.hide = function (lineNames) {
    LineChart.updateLine.call(this, [], {}, lineNames);
  };

  this.error = function (div) {
    this.container.append(div);
  };
};

LineChart.setDefaultConfig = function () {
  return {
    // svg
    svg: undefined,
    svgConfig: {},
    // data
    // dataColumns: {},
    dataX: undefined,
    dataColumns: [],
    dataDepends: {},
    dataTypes: {},
    dataSrc: [],
    dataMax: undefined,
    dataMin: undefined,
    // axis
    axisX: undefined,
    axisY: undefined,
    axisTypes: {},
    // extension
    extension: {},
  };
};

LineChart.loadConfig = function (config) {
  //console.log('LineChart.loadConfig', config);
  if (Validator.Defined(config)) {
    LineChart.svgConfig.call(
      this,
      Validator.Defined(config.svg) ? config.svg : {}
    );
    LineChart.dataConfig.call(
      this,
      Validator.Defined(config.data) ? config.data : {}
    );
    LineChart.axisConfig.call(
      this,
      Validator.Defined(config.axis) ? config.axis : {}
    );
    //console.log('LineChart.loadConfig', config.extension);
    LineChart.extensionConfig.call(
      this,
      Validator.Defined(config.extension) ? config.extension : {}
    );
  }
};

LineChart.prototype.resize = function (size) {
  if (Validator.Defined(this._config.svg)) {
    this._config.svg.resize(size);
  } else {
    this._config.svgConfig.size = size;
  }
  LineChart.buildLineChart.call(this);
  LineChart.updateAction.call(this);
};

LineChart.prototype.refresh = function () {
  LineChart.buildLineChart.call(this);
  LineChart.updateAction.call(this);
};

Object.defineProperty(LineChart.prototype, 'axisXY', {
  get: function () {
    return [this._config.axisX, this._config.axisY];
  },
  set: function (nameX, nameY) {
    LineChart.changeAxisX.call(this, nameX);
    LineChart.changeAxisY.call(this, nameY);
    LineChart.buildAxis.call(this);
    LineChart.updateAction.call(this);
  },
  enumerable: true,
  configurable: false,
});

Object.defineProperty(LineChart.prototype, 'axisX', {
  get: function () {
    return this._config.axisX;
  },
  set: function (nameX) {
    LineChart.changeAxisX.call(this, nameX);
    LineChart.buildAxis.call(this, true, undefined, false);
    LineChart.updateAction.call(this);
  },
  enumerable: true,
  configurable: false,
});

Object.defineProperty(LineChart.prototype, 'axisY', {
  get: function () {
    return this._config.axisY;
  },
  set: function (nameY) {
    LineChart.changeAxisY.call(this, nameY);
    LineChart.buildAxis.call(this, undefined, true, false);
    LineChart.updateAction.call(this);
  },
  enumerable: true,
  configurable: false,
});

// svg
LineChart.svgConfig = function (svg) {
  let $$config = this._config;

  if (Validator.Defined(svg)) {
    if (Validator.ObjectType(svg) && !NoopObject(svg)) {
      $$config.svgConfig = svg;
    }
  }
};

// data
LineChart.dataColumnsInit = function (columns) {
  let $$config = this._config;

  if (Validator.Defined(columns)) {
    if (Validator.ArrayType(columns) && columns.length > 0) {
      columns.forEach((column) => {
        if (Validator.StringType(column)) $$config.dataColumns.push(column);
      });
    }
    if (Validator.StringType(columns)) $$config.dataColumns.push(columns);
  }
  // let columnDepends = {};
  // columns.forEach(function(column){
  //     if(Validator.ArrayType(column) && column.length > 1 && Validator.StringType(column[0])){
  //         columnDepends[column[0]] = column.slice(1, column.length);
  //     }
  // });
  // if(Object.keys(columnDepends).length <= 0) return;   // column of data isn't enough.
  // this.config.dataColumns = columnDepends;
};

LineChart.dataDependInit = function (single) {
  let $$config = this._config;

  if (
    Validator.Defined(single) &&
    Validator.StringType(single) && // single x - line
    $$config.dataColumns.length > 0
  ) {
    $$config.dataDepends[single] = {};
    $$config.dataX = single;
    $$config.dataColumns.forEach((d) => {
      $$config.dataDepends[single][d] = null;
    });
  }
};

LineChart.dataNumberInit = function (config) {
  let $$config = this._config;

  if (
    Validator.Defined(config.max) &&
    Validator.NumberType(config.max) &&
    config.max > 0
  )
    $$config.dataMax = config.max;
  if (
    Validator.Defined(config.min) &&
    Validator.NumberType(config.min) &&
    config.min > 0
  )
    $$config.dataMin = config.min;
  if (
    Validator.Defined($$config.dataMax) &&
    Validator.Defined($$config.dataMin)
  ) {
    // if max is lower than min, then sync the max to min value.
    if ($$config.dataMax < $$config.dataMin) {
      $$config.dataMax = $$config.dataMin;
    }
  }
};

LineChart.dataConfig = function (config) {
  let $$config = this._config;

  LineChart.dataColumnsInit.call(this, config.columns);
  LineChart.dataDependInit.call(this, config.x);
  LineChart.dataNumberInit.call(this, config);

  if (Validator.Defined(config.types) && Validator.ObjectType(config.types)) {
    Object.keys(config.types).forEach((type) => {
      let line = new Line(type, config.types[type]);
      $$config.dataTypes[type] = line.config;
      $$config.dataDepends[$$config.dataX][type] = line;
    });
  }
};

LineChart.dataCheck = function () {
  let $$config = this._config,
    dataLength = $$config.dataSrc.length;

  // min
  if (Validator.Defined($$config.dataMin) && $$config.dataMin > dataLength)
    return [];

  // max
  if (Validator.Defined($$config.dataMax) && $$config.dataMax < dataLength)
    return $$config.dataSrc.slice(dataLength - $$config.dataMax, dataLength);

  return $$config.dataSrc;
};

LineChart.dataSrcManipulate = function (data, dataNumber, clear) {
  let $$config = this._config,
    number = Validator.NumberType(dataNumber) ? dataNumber : 0;

  if (clear) $$config.dataSrc = [];

  if (Validator.ArrayType(data)) {
    // add
    if (data.length == number) $$config.dataSrc = $$config.dataSrc.concat(data);
  } else {
    // remove
    if (number > 0) $$config.dataSrc = $$config.dataSrc.slice(dataNumber);
    else $$config.dataSrc = $$config.dataSrc.slice(0, dataNumber);
  }
};

LineChart.getPositionDataFromAxis = function (dataByAxis) {
  let $$config = this._config,
    xAxis = $$config.axisX,
    yAxis = $$config.axisY,
    $$depend = $$config.dataDepends;

  dataByAxis[$$config.dataX] = dataByAxis[$$config.dataX].map((d) =>
    xAxis.scale(d)
  );

  Object.keys($$depend[$$config.dataX]).forEach((subKey) => {
    dataByAxis[subKey] = dataByAxis[subKey].map((d) => yAxis.scale(d));
  });

  return dataByAxis;
};

// build
LineChart.buildLineChart = function () {
  //console.log('#1625 buildLineChart!!');
  let $$config = this._config;

  if (!Validator.Defined($$config.svg)) {
    $$config.svg = new SVG(undefined, $$config.svgConfig);
    $$config.svg.update(this.container, {});
    this.wrapper = $$config.svg.element;
  }

  if (!Validator.Defined(this.lineChart)) {
    this.lineChart = this.wrapper.append('g').attr('class', 'linechart');
  }
  LineChart.buildAxis.call(this);
};

LineChart.buildAxis = function (updateX, updateY, doBuildLine) {
  let $$config = this._config;
  //console.log('LineChart.buildAxis, $$config', $$config);
  updateX = Validator.Defined(updateX) ? updateX : true;
  updateY = Validator.Defined(updateY) ? updateY : true;
  doBuildLine = Validator.Defined(doBuildLine) ? doBuildLine : true;
  // x axis
  // console.log($$config.axisX);

  if (updateX && Validator.Defined($$config.axisX)) {
    $$config.axisX.update(this.lineChart, {
      direction: 0,
      x: $$config.svg.x,
      y: $$config.svg.y,
      width: $$config.svg.contentWidth,
      height: $$config.svg.contentHeight,
    });
    // console.log($$config.svg.contentHeight, _axesHeight);
  }

  // y axis
  // console.log($$config.axisY);
  if (updateY && Validator.Defined($$config.axisY)) {
    $$config.axisY.update(this.lineChart, {
      direction: 1,
      x: $$config.svg.x,
      y: $$config.svg.y,
      width: $$config.svg.contentWidth,
      height: $$config.svg.contentHeight,
    });
    // console.log($$config.svg.contentWidth, _axesWidth);
  }

  // Dynamic Adjust X Axis
  if (Validator.Defined($$config.axisX)) {
    $$config.axisX.update(this.lineChart, {
      width: $$config.axisY.width,
      x: $$config.axisY.x,
    });
  }

  // Dynamic Adjust Y Axis
  if (Validator.Defined($$config.axisY)) {
    $$config.axisY.update(this.lineChart, {
      height: $$config.axisX.height,
    });
  }
  //console.log('LineChart.buildAxis, $$config', $$config);
  if (doBuildLine) LineChart.buildLines.call(this);
};

LineChart.buildLines = function () {
  //let $$config = this._config;
  //console.log('LineChart.buildLines, $$config', $$config);
  // lines
  if (!Validator.Defined(this.lineBoard))
    this.lineBoard = this.lineChart.append('g').attr('class', 'lineboard');

  //if (
  //  Object.prototype.hasOwnProperty.call($$config.dataDepends, $$config.dataX)
  //) {
  //  Object.keys($$config.dataDepends[$$config.dataX]).forEach((line) => {
  //    $$config.dataDepends[$$config.dataX][Line].init(this.lineBoard);
  //  }, this);
  //}
  LineChart.buildMouseRegion.call(this);
  LineChart.buildExtension.call(this);
};
LineChart.buildMouseRegion = function () {
  let $$config = this._config,
    origin,
    size;
  console.log($$config);
  // MouseRegion
  if (!Validator.Defined(this.mouseRegion)) {
    this.mouseRegion = {
      Svg: undefined,
      Chart: undefined,
      Line: undefined,
    };
    LineChart.initMouseRegion.call(this, this.wrapper);
    Object.keys(this.mouseRegion).forEach((regionName) => {
      //console.log('buildMouseRegion, regionName', regionName);
      [origin, size] = LineChart.calculateRegion[regionName].call(this);
      //console.log('buildMouseRegion, [origin, size]', [origin, size]);
      this.mouseRegion[regionName] = new MouseRegion(regionName, origin, size);
    }, this);
  }
  //console.log('buildMouseRegion, this.mouseRegion', this.mouseRegion);
};

LineChart.buildExtension = function () {
  //console.log('LineChart.buildExtension, this._config', this._config);
  let $$config = this._config;
  //console.log('LineChart.buildExtension, $$config', $$config);
  //console.log('LineChart.buildExtension, extensions', extensions);
  // extension
  let extensions = $$config.extension;
  //console.log(extensions);
  Object.keys(extensions).forEach((extName) => {
    let extConfig = extensions[extName];
    let extInstance = extConfig.instance;
    if (!extConfig.initalize) {
      LineChart.extensionInit[extName].call(
        extInstance,
        LineChart.extensionSetupLayerTransfer.call(this, extConfig.layer)
      );
      Object.keys(extInstance.eventTrigger).forEach((trigger) => {
        this.mouseRegion[trigger].register(
          extName,
          extInstance.eventTrigger[trigger]
        );
      }, this);
      extConfig.initalize = true;
    }
  }, this);
};

// update
LineChart.updateAction = function () {
  let data = LineChart.dataCheck.call(this);
  let dataByAxis = LineChart.updateAxis.call(this, data);
  let pData = LineChart.getPositionDataFromAxis.call(this, dataByAxis);
  LineChart.updateBoard.call(this, data, pData);
  LineChart.updateLine.call(this, data, pData);
  LineChart.updateMouseRegion.call(this, data, pData);
};

LineChart.updateAxis = function (data) {
  let $$config = this._config,
    xAxis = $$config.axisX,
    yAxis = $$config.axisY,
    $$depend = $$config.dataDepends,
    dataByAxis = {},
    keys = [$$config.dataX],
    min,
    max;

  dataByAxis[$$config.dataX] = [];
  Object.keys($$depend[$$config.dataX]).forEach((depend) => {
    dataByAxis[depend] = [];
    keys.push(depend);
  });

  if (Validator.ArrayType(data) && data.length > 0) {
    data.forEach((d) => {
      keys.forEach((key) => dataByAxis[key].push(d[key]));
    });
  }

  // update main Axis
  [min, max] = getMaxAndMin(dataByAxis[$$config.dataX]);
  xAxis.update(this.lineChart, {
    LimitMax: max,
    LimitMin: min,
  });

  // update sub Axis
  [min, max] = getMaxAndMin(
    Object.keys($$depend[$$config.dataX]).reduce(function (arr, subKey) {
      return arr.concat(dataByAxis[subKey]);
    }, [])
  );
  yAxis.update(this.lineChart, {
    LimitMax: max,
    LimitMin: min,
  });

  return dataByAxis;

  function getMaxAndMin(target) {
    if (Validator.ArrayType(target) && target.length > 0) {
      return [Math.min.apply(null, target), Math.max.apply(null, target)];
    }
    return [undefined, undefined];
  }
};

LineChart.updateBoard = function (data, posData) {
  console.log(data, posData);
  let $$config = this._config,
    xAxis = $$config.axisX,
    yAxis = $$config.axisY,
    // default : origin on left-top corner.
    origin = { x: xAxis.x, y: yAxis.y };

  if (origin.x < yAxis.x) origin.x = yAxis.x;

  // lineBoard
  this.lineBoard.attr('transform', `translate(${origin.x},${origin.y})`);
};

LineChart.updateLine = function (data, posData, hideLines, showLines) {
  // Use scale to get data.
  let $$config = this._config,
    $$depend = $$config.dataDepends,
    lines = $$depend[$$config.dataX];

  // Update data to line
  if (
    Validator.Defined(posData) &&
    Validator.ObjectType(posData) &&
    !NoopObject(posData)
  ) {
    Object.keys(lines).forEach((dataY) => {
      lines[dataY].update(this.lineBoard, {
        data: posData[$$config.dataX].map((dataX, index) => [
          dataX,
          posData[dataY][index],
        ]),
      });
    }, this);
  }

  // hide
  if (Validator.Defined(hideLines)) {
    if (
      Validator.StringType(hideLines) &&
      Validator.Defined(lines[hideLines])
    ) {
      lines[hideLines].show(false);
    } else if (Validator.ArrayType(hideLines) && hideLines.length > 0) {
      hideLines.forEach((hideLine) => {
        lines[hideLine].show(false);
      });
    }
  }

  // show
  if (Validator.Defined(showLines)) {
    if (
      Validator.StringType(showLines) &&
      Validator.Defined(lines[showLines])
    ) {
      lines[showLines].show(true);
    } else if (Validator.ArrayType(showLines) && showLines.length > 0) {
      showLines.forEach((showLine) => {
        lines[showLine].show(true);
      });
    }
  }
};

// axis
LineChart.axisConfig = function (axisConfig) {
  let $$config = this._config;

  $$config._axisObj = {};

  if (
    Validator.Defined(axisConfig.types) &&
    Validator.ObjectType(axisConfig.types)
  ) {
    Object.keys(axisConfig.types).forEach((type) => {
      let axis = ($$config._axisObj[type] = new Axis(
        type,
        axisConfig.types[type]
      ));
      $$config.axisTypes[type] = axis.config;
    });
  }
  // axisX, axisY
  if (Validator.Defined(axisConfig.x))
    $$config.axisX = uiTool.getProperty(
      $$config._axisObj,
      axisConfig.x,
      undefined
    );
  if (Validator.Defined(axisConfig.y))
    $$config.axisY = uiTool.getProperty(
      $$config._axisObj,
      axisConfig.y,
      undefined
    );
};

LineChart.changeAxisX = function (xName) {
  let $$config = this._config;
  if (xName && Validator.Defined($$config._axisObj[xName])) {
    $$config.axisX.remove();
    $$config.axisX = $$config._axisObj[xName];
  } else {
    console.error(`The Axis X: ${xName} isn't exist.`);
  }
};

LineChart.changeAxisY = function (yName) {
  let $$config = this._config;
  if (yName && Validator.Defined($$config._axisObj[yName])) {
    $$config.axisY.remove();
    $$config.axisY = $$config._axisObj[yName];
  } else {
    console.error(`The Axis Y: ${yName} isn't exist.`);
  }
};

LineChart.extensionSupport = {};
LineChart.extensionInit = {};
LineChart.extensionSetupLayer = {};

// extension
LineChart.extensionConfig = function (extConfig) {
  //console.log('LineChart.extensionConfig, extConfig', extConfig);
  let $$config = this._config;
  //let $$config = extConfig;
  //console.log('LineChart.extensionConfig, $$config', $$config);

  Object.keys(extConfig).forEach((ext) => {
    //console.log('extensionConfig, ext, extConfig[ext]', ext, extConfig[ext]);
    //console.log(
    //  'extensionConfig, LineChart.extensionSupport',
    //  LineChart.extensionSupport
    //);
    if (Validator.Defined(LineChart.extensionSupport[ext])) {
      $$config.extension[ext] = {
        instance: new LineChart.extensionSupport[ext](extConfig[ext]),
        layer: LineChart.extensionSetupLayer[ext],
        initalize: false,
      };
    }
  });
  //console.log('LineChart.extensionConfig, $$config', $$config);
};

LineChart.extensionSetupLayerTransfer = function (layer) {
  switch (layer) {
    case 1:
      return this.lineChart;
    case 0:
    default:
      return this.container;
  }
};

// Mosue Region
LineChart.initMouseRegion = function (element) {
  let $$ = this;

  element
    .on('mouseenter', function (event) {
      if (!Validator.Defined(event)) event = getMousePos(d3.pointer(this)); //d3.mouse(removed in d3v6) --> d3.pointer
      triggerMouseRegion(event, 'enter');
    })
    .on('mousemove', function (event) {
      if (!Validator.Defined(event)) event = getMousePos(d3.pointer(this));
      triggerMouseRegion(event, 'move');
    })
    .on('mouseleave', function (event) {
      if (!Validator.Defined(event)) event = getMousePos(d3.pointer(this));
      triggerMouseRegion(event, 'leave');
    })
    .on('click', function (event) {
      if (!Validator.Defined(event)) event = getMousePos(d3.pointer(this));
      triggerMouseRegion(event, 'click');
    });

  function triggerMouseRegion(event, eventType) {
    Object.keys($$.mouseRegion).forEach((regionName) => {
      $$.mouseRegion[regionName].trigger(event, eventType);
    });
  }

  // Work Arround for backward compatibility
  function getMousePos(pos) {
    return {
      offsetX: pos[0],
      offsetY: pos[1],
    };
  }
};

LineChart.updateMouseRegion = function (data, posData) {
  let $$ = this,
    $$config = this._config,
    origin,
    size;

  Object.keys($$.mouseRegion).forEach((regionName) => {
    [origin, size] = LineChart.calculateRegion[regionName].call($$);
    // console.log(`MouseRegion ${regionName}`, origin, size);
    $$.mouseRegion[regionName].config(origin, size);
    // extension
    $$.mouseRegion[regionName]._eventReceiver.forEach((receiverName) => {
      $$config.extension[receiverName].instance.config({
        data: data,
        posData: posData,
        config: $$config,
        origin: origin,
        size: size,
      });
    });
  });
};

LineChart.calculateRegion = {};

LineChart.calculateRegion.Svg = function () {
  let $$config = this._config;

  // Test
  // this.lineChart.append('rect')
  //     .attr('transform', `translate(${0}, ${0})`)
  //     .style('width', $$config.svg.width)
  //     .style('height', $$config.svg.height)
  //     .style('fill', $$config.svg.height)
  //     .style('opacity', 0.1)

  return [
    { x: 0, y: 0 },
    { width: $$config.svg.width, height: $$config.svg.height },
  ];
};

LineChart.calculateRegion.Chart = function () {
  let $$config = this._config,
    xAxis = $$config.axisX,
    yAxis = $$config.axisY,
    // default : origin on left-top corner.
    origin = { x: xAxis.x, y: yAxis.y },
    size = { width: xAxis.width, height: yAxis.height };

  if (origin.x < yAxis.x) origin.x = yAxis.x;

  // Test
  // this.lineChart.append('rect')
  //     .attr('transform', `translate(${origin.x}, ${origin.y})`)
  //     .style('width', size.width)
  //     .style('height', size.height)
  //     .style('fill', size.height)
  //     .style('opacity', 0.1)

  return [origin, size];
};

LineChart.calculateRegion.Line = function () {
  let $$config = this._config,
    xAxis = $$config.axisX,
    yAxis = $$config.axisY,
    origin = { x: xAxis.x, y: yAxis.y },
    size = { width: 0, height: 0 };

  if (origin.x < yAxis.x) origin.x = yAxis.x;

  if (Validator.Defined($$config.dataX)) {
    let lines = $$config.dataDepends[$$config.dataX];
    if (!NoopObject(lines)) {
      let minX = 0,
        maxX = xAxis.width,
        lineNames = Object.keys(lines);
      if (lineNames.length > 0) {
        minX = lines[lineNames[0]]._originInParent.x1;
        maxX = lines[lineNames[0]]._originInParent.x2;
        if (lineNames.length > 1) {
          lineNames.slice(1).forEach((lineName) => {
            if (minX > lines[lineName].x1) minX = lines[lineName].x1;
            if (maxX < lines[lineName].x2) maxX = lines[lineName].x2;
          });
        }
      }

      origin.x += minX;
      size.width = maxX - minX;
      if (size.width > 0) size.height = yAxis.height;
    }
  }

  // Test
  // this.lineChart.append('rect').attr('transform', `translate(${origin.x}, ${origin.y})`)
  //     .style('width', size.width)
  //     .style('height', size.height)
  //     .style('fill', size.height)
  //     .style('opacity', 0.1)

  return [origin, size];
};

// Static Property
LineChart.IncreaseCurrentLineChartNum = function () {
  LineChart.CurrentLineChartNum++;
};

LineChart.CurrentLineChartNum = 0; /* End linechart.js */
/* Start axis.js */
// let axis = new Axis({
//     [axis_name]: {
//         label: [label] || {
//             title: label,
//             position: ['out-center', 'out-left', 'out-right', 'in-center', 'in-left', 'in-right'],
//             show: true,
//             color: #??????,
//             style: {
//                 only for css style
//             },
//             padding: [number]
//         },
//         margin: {
//             top: ,
//             bottom: ,
//             left: ,
//             right:
//         },
//         show: true,
//         type: [timeseries, indexed],
//         limit: {
//             min: 400,
//             max: 200,
//             padding: 0,
//             paddingLeft: ,
//             paddingRight:
//         },
//         domain: {
//             color: #??????,
//             style: {
//                 only for css style
//             }
//         }
//         tick: {
//             format: function(x){return [format];},
//             count: 5,
//             interval: 5,
//             values: [val1, val2, val3],
//             padding: 12,
//             color: {
//                 line: [color1, color2, color3],
//                 text: [color1, color2, color3],
//             },
//             innerTick: false,
//             style:{
//                 line:
//                 text:
//             },
//             show: {
//                 line: true,
//                 text: true
//             }
//         },
//         orient: ['bottom', 'top', 'left', 'right', 'none'],
//     }
// });
function Axis(name, config) {
  this.config = Axis.setDefaultConfig();
  Axis.loadConfig.call(this, config);

  this.name = name;
  this.axis = undefined;

  this.update = function (target, settings) {
    if (Axis.setDynamicConfig.call(this, settings)) {
      if (Validator.Defined(this.axis)) this.axis.remove();
      Axis.draw.call(this, target);
    }
  };

  this.remove = function () {
    let $$config = this.config;
    if (Validator.Defined(this.axis)) {
      this.axis.remove();
      this.axis = undefined;
    }
    $$config.axisParentX = undefined;
    $$config.axisParentY = undefined;
    $$config.axisOriginX = 0;
    $$config.axisOriginY = 0;
    $$config.axisWidth = undefined;
    $$config.axisHeight = undefined;
  };

  this.show = function (isShow) {
    this.axis.attr('opacity', isShow ? 1 : 0);
  };
}

Object.defineProperty(Axis.prototype, 'label', {
  configurable: false,
  set: function (label) {
    if (Validator.Defined(label) && Validator.StringType(label)) {
      this.config.axisLabelTitle = label;
      if (Validator.Defined(this.config.axisLabel)) {
        this.config.axisLabel.text(label);
      }
    }
  },
  get: function () {
    return this.config.axisLabelTitle;
  },
});

Object.defineProperty(Axis.prototype, 'width', {
  get: function () {
    return this.config.axisWidth;
  },
});

Object.defineProperty(Axis.prototype, 'height', {
  get: function () {
    return this.config.axisHeight;
  },
});

Object.defineProperty(Axis.prototype, 'x', {
  get: function () {
    return this.config.axisOriginX;
  },
});

Object.defineProperty(Axis.prototype, 'y', {
  get: function () {
    return this.config.axisOriginY;
  },
});

Axis.setDefaultConfig = function () {
  return {
    // Label
    axisLabelTitle: '',
    axisLabelPosition: 'out-center',
    axisLabelColor: undefined,
    axisLabelShow: true,
    axisLabelStyle: {},
    axisLabelPadding: 50,
    axisLabel: undefined,
    // show
    axisShow: true,
    axisContentType: 'indexed',
    // width, height
    axisParentX: undefined,
    axisParentY: undefined,
    axisOriginX: 0,
    axisOriginY: 0,
    axisWidth: undefined,
    axisHeight: undefined,
    // margin
    axisMarginTop: 0,
    axisMarginLeft: 0,
    axisMarginRight: 0,
    axisMarginBottom: 0,
    // Limit
    axisLimitMin: undefined,
    axisLimitMax: undefined,
    axisLimitPadding: 0,
    axisLimitPaddingFunc: undefined,
    axisLimitPaddingLeft: undefined,
    axisLimitPaddingRight: undefined,
    // axisLimitSet: false,
    // Domain
    axisDomainShow: true,
    axisDomainColor: undefined,
    axisDomainStyle: {},
    // Tick
    axisTickFormat: undefined,
    axisTickInterval: undefined,
    axisTickCount: -1,
    axisTickValues: [],
    axisTickPadding: 0,
    axisTickLineColor: undefined,
    axisTickTextColor: undefined,
    axisTickLineStyle: {},
    axisTickTextStyle: {},
    axisTickTextShow: true,
    axisTickLineShow: true,
    // Tick Extension
    axisInnerTick: false,
    // orient
    axisOrient: 'none',
    axisReverse: false,
  };
};

Axis.loadConfig = function (config) {
  let $$config = this.config;

  if (Validator.Defined(config.label)) {
    let labelConfig = config.label;
    if (
      Validator.Defined(labelConfig.title) &&
      Validator.StringType(labelConfig.title)
    )
      $$config.axisLabelTitle = labelConfig.title;
    if (
      Validator.Defined(labelConfig.position) &&
      Validator.StringType(labelConfig.position) &&
      [
        'out-center',
        'out-left',
        'out-right',
        'in-center',
        'in-left',
        'in-right',
      ].indexOf(labelConfig.position) != -1
    )
      $$config.axisLabelPosition = labelConfig.position;
    if (Validator.Defined(labelConfig.style) && !NoopObject(labelConfig.style))
      $$config.axisLabelStyle = labelConfig.style;
    if (Validator.Defined(labelConfig.color) && HexColor(labelConfig.color))
      $$config.axisLabelColor = labelConfig.color;
    if (
      Validator.Defined(labelConfig.show) &&
      Validator.BooleanType(labelConfig.show)
    )
      $$config.axisLabelShow = labelConfig.show;
    if (
      Validator.Defined(labelConfig.padding) &&
      Validator.NumberType(labelConfig.padding)
    )
      $$config.axisLabelPadding = labelConfig.padding;
  }

  // show
  if (Validator.Defined(config.show)) $$config.axisShow = config.show;

  // type
  if (
    Validator.Defined(config.type) &&
    ['timeseries', 'indexed'].indexOf(config.type) != -1
  )
    $$config.axisContentType = config.type;

  // margin
  if (Validator.Defined(config.margin)) {
    let marginConfig = config.margin;
    if (
      Validator.Defined(
        marginConfig.top && Validator.NumberType(marginConfig.top)
      )
    )
      $$config.axisMarginTop = marginConfig.top;
    if (
      Validator.Defined(
        marginConfig.bottom && Validator.NumberType(marginConfig.bottom)
      )
    )
      $$config.axisMarginBottom = marginConfig.bottom;
    if (
      Validator.Defined(
        marginConfig.left && Validator.NumberType(marginConfig.left)
      )
    )
      $$config.axisMarginLeft = marginConfig.left;
    if (
      Validator.Defined(
        marginConfig.right && Validator.NumberType(marginConfig.right)
      )
    )
      $$config.axisMarginRight = marginConfig.right;
  }

  // limit
  if (Validator.Defined(config.limit)) {
    let limitConfig = config.limit;
    $$config._axisLimitSet = false;
    if (Validator.Defined(limitConfig.min)) {
      $$config.axisLimitMin = limitConfig.min;
      $$config._axisLimitMin = limitConfig.min;
      $$config._axisLimitSet = true;
    }
    if (Validator.Defined(limitConfig.max)) {
      $$config.axisLimitMax = limitConfig.max;
      $$config._axisLimitMax = limitConfig.max;
      $$config._axisLimitSet = true;
    }
    if (Validator.Defined(limitConfig.padding)) {
      if (Validator.NumberType(limitConfig.padding)) {
        $$config.axisLimitPadding = limitConfig.padding;
      } else if (Validator.FunctionType(limitConfig.padding)) {
        $$config.axisLimitPaddingFunc = limitConfig.padding;
      }
    }
    if (
      Validator.Defined(limitConfig.paddingLeft) &&
      Validator.NumberType(limitConfig.paddingLeft)
    )
      $$config.axisLimitPaddingLeft = limitConfig.paddingLeft;
    if (
      Validator.Defined(limitConfig.paddingLeft) &&
      Validator.NumberType(limitConfig.paddingRight)
    )
      $$config.axisLimitPaddingRight = limitConfig.paddingRight;
  }

  // domain
  if (Validator.Defined(config.domain)) {
    let domainConfig = config.domain;
    if (
      Validator.Defined(domainConfig.show) &&
      Validator.BooleanType(domainConfig.show)
    )
      $$config.axisDomainShow = domainConfig.show;
    if (Validator.Defined(domainConfig.color) && HexColor(domainConfig.color))
      $$config.axisDomainColor = domainConfig.color;
    if (
      Validator.Defined(domainConfig.style) &&
      !NoopObject(domainConfig.style)
    )
      $$config.axisDomainStyle = domainConfig.style;
  }

  // tick
  if (Validator.Defined(config.tick)) {
    let tickConfig = config.tick;
    if (Validator.Defined(tickConfig.format))
      $$config.axisTickFormat = tickConfig.format;
    if (
      Validator.Defined(tickConfig.interval) &&
      Validator.NumberType(tickConfig.interval) &&
      tickConfig.interval > 0
    )
      $$config.axisTickInterval = tickConfig.interval;
    if (Validator.Defined(tickConfig.count) && tickConfig.count >= 0)
      $$config.axisTickCount = tickConfig.count;
    if (
      Validator.Defined(tickConfig.values) &&
      Validator.ArrayType(tickConfig.values)
    )
      $$config.axisTickValues = tickConfig.values;
    if (
      Validator.Defined(tickConfig.padding) &&
      Validator.NumberType(tickConfig.padding) &&
      tickConfig.padding > 0
    )
      $$config.axisTickPadding = tickConfig.padding;

    if (Validator.Defined(tickConfig.color) && !NoopObject(tickConfig.color)) {
      let tickColorConfig = tickConfig.color;
      if (
        Validator.Defined(tickColorConfig.line) &&
        HexColor(tickColorConfig.line)
      )
        $$config.axisTickLineColor = tickColorConfig.line;
      if (
        Validator.Defined(tickColorConfig.text) &&
        HexColor(tickColorConfig.text)
      )
        $$config.axisTickTextColor = tickColorConfig.text;
    }
    if (Validator.Defined(tickConfig.style) && !NoopObject(tickConfig.style)) {
      let tickStyleConfig = tickConfig.style;
      if (
        Validator.Defined(tickStyleConfig.line) &&
        !NoopObject(tickStyleConfig.line)
      )
        $$config.axisTickLineStyle = tickStyleConfig.line;
      if (
        Validator.Defined(tickStyleConfig.text) &&
        !NoopObject(tickStyleConfig.text)
      )
        $$config.axisTickTextStyle = tickStyleConfig.text;
    }
    if (Validator.Defined(tickConfig.show)) {
      if (Validator.BooleanType(tickConfig.show)) {
        $$config.axisTickLineShow = tickConfig.show;
        $$config.axisTickTextShow = tickConfig.show;
      } else if (
        Validator.ObjectType(tickConfig.show) &&
        !NoopObject(tickConfig.show)
      ) {
        let tickShowConfig = tickConfig.show;
        if (
          Validator.Defined(tickShowConfig.line) &&
          Validator.BooleanType(tickShowConfig.line)
        )
          $$config.axisTickLineShow = tickShowConfig.line;
        if (
          Validator.Defined(tickShowConfig.text) &&
          Validator.BooleanType(tickShowConfig.text)
        )
          $$config.axisTickTextShow = tickShowConfig.text;
      }
    }
    if (
      Validator.Defined(tickConfig.innerTick) &&
      Validator.BooleanType(tickConfig.innerTick)
    ) {
      $$config.axisInnerTick = tickConfig.innerTick;
    }
  }

  // orient
  if (
    Validator.Defined(config.orient) &&
    ['bottom', 'top', 'left', 'right'].indexOf(config.orient) != -1
  )
    $$config.axisOrient = config.orient;

  // reverse
  if (Validator.Defined(config.reverse)) $$config.axisReverse = config.reverse;
};

Axis.setOrigin = function (data) {
  let $$config = this.config;
  let modified = false;

  // origin x
  if (Validator.Defined(data.x) && Validator.NumberType(data.x)) {
    let x = data.x;
    $$config.axisParentX = x;
    modified = true;
  }

  // origin y
  if (Validator.Defined(data.y) && Validator.NumberType(data.y)) {
    let y = data.y;
    $$config.axisParentY = y;
    modified = true;
  }

  // console.log(this.name, $$config.axisParentX, $$config.axisParentY);

  return modified;
};

Axis.setLength = function (data) {
  let $$config = this.config;
  let modified = false;

  // length
  if (Validator.Defined(data.width) && Validator.NumberType(data.width)) {
    let width = data.width - $$config.axisMarginLeft - $$config.axisMarginRight;
    $$config.axisWidth = width < 0 ? 0 : width;
    modified = true;
  }
  if (Validator.Defined(data.height) && Validator.NumberType(data.height)) {
    let height =
      data.height - $$config.axisMarginTop - $$config.axisMarginBottom;
    $$config.axisHeight = height < 0 ? 0 : height;
    modified = true;
  }

  // console.log($$config.axisWidth, $$config.axisHeight);

  return modified;
};

Axis.setOrient = function (data) {
  let $$config = this.config,
    modified = false,
    beforeAxisOrient = $$config._axisOrient;

  // direction
  // 0 : x
  // 1 : y
  const _direction = ['bottom', 'left', 'top', 'right'];
  if (
    Validator.Defined($$config.axisOrient) &&
    $$config.axisOrient !== 'none'
  ) {
    $$config._axisOrient = $$config.axisOrient;
  } else {
    if (Validator.Defined(data.direction)) {
      if (_direction.length > data.direction) {
        $$config._axisOrient = _direction[data.direction];
      } else {
        $$config._axisOrient = _direction[0];
      }
    }
  }
  if (!Validator.Defined($$config._axisOrient))
    $$config._axisOrient = _direction[0];

  if (beforeAxisOrient !== $$config._axisOrient) modified = true;

  return modified;
};

Axis.setLimit = function (data) {
  let $$config = this.config,
    modified = false,
    beforeLimitMax = $$config._axisLimitMax,
    beforeLimitMin = $$config._axisLimitMin;

  // Limit
  $$config._axisLimitMax = $$config.axisLimitMax;
  if (Validator.Defined(data.LimitMax)) {
    if (
      !Validator.Defined($$config._axisLimitMax) ||
      $$config._axisLimitMax < data.LimitMax
    ) {
      $$config._axisLimitMax = data.LimitMax;
    }
  }

  $$config._axisLimitMin = $$config.axisLimitMin;
  if (Validator.Defined(data.LimitMin)) {
    if (
      !Validator.Defined($$config._axisLimitMin) ||
      $$config._axisLimitMin > data.LimitMin
    ) {
      $$config._axisLimitMin = data.LimitMin;
    }
  }

  $$config._axisLimitSet = Boolean(
    Validator.Defined($$config._axisLimitMax) ||
      Validator.Defined($$config._axisLimitMin)
  );

  // console.log($$config._axisLimitMax, $$config._axisLimitMin, $$config._axisLimitSet);

  if (
    beforeLimitMax !== $$config._axisLimitMax ||
    beforeLimitMin !== $$config._axisLimitMin
  ) {
    modified = true;
  }

  return modified;
};

Axis.setDynamicConfig = function (settings) {
  let configModified = false;
  if (Validator.ObjectType(settings) && !NoopObject(settings)) {
    configModified = Axis.setOrigin.call(this, settings) || configModified;
    configModified = Axis.setLength.call(this, settings) || configModified;
    configModified = Axis.setOrient.call(this, settings) || configModified;
    configModified = Axis.setLimit.call(this, settings) || configModified;
  }
  return configModified;
};

Axis.draw = function (target) {
  let $$config = this.config,
    axis,
    origin = {
      x: Validator.Defined($$config.axisParentX) ? $$config.axisParentX : 0,
      y: Validator.Defined($$config.axisParentY) ? $$config.axisParentY : 0,
    };

  // console.log(origin);

  // create
  let axisG = target.append('g').attr('class', `axis ${this.name}`);

  // scale
  let scale;
  switch ($$config.axisContentType) {
    case 'timeseries':
      scale = d3.scaleTime();
      break;
    case 'indexed':
      scale = d3.scaleLinear();
      break;
  }
  this.scale = scale;

  // domain & range
  if ($$config._axisLimitSet) {
    let max, min, padding;
    if (Validator.Defined($$config._axisLimitMax)) max = $$config._axisLimitMax;
    if (Validator.Defined($$config._axisLimitMin)) min = $$config._axisLimitMin;
    padding = $$config.axisLimitPadding;
    if (Validator.Defined($$config.axisLimitPaddingFunc)) {
      let padding = $$config.axisLimitPaddingFunc(
        $$config._axisLimitMax,
        $$config._axisLimitMin
      );
      if (Validator.NumberType(padding)) $$config._axisLimitPadding = padding;
    }
    $$config._axisLimitPadding = [padding, padding];
    if (Validator.Defined($$config.axisLimitPaddingLeft))
      $$config._axisLimitPadding[0] = $$config.axisLimitPaddingLeft;
    if (Validator.Defined($$config.axisLimitPaddingRight))
      $$config._axisLimitPadding[1] = $$config.axisLimitPaddingRight;
    // sync max and min value
    if (!Validator.Defined(max) || !Validator.Defined(min)) {
      let value = Validator.Defined(max) ? max : min;
      max = min = $$config._axisLimitMax = $$config._axisLimitMin = value;
    }
    // console.log(max, min, $$config._axisLimitPadding);
    switch ($$config.axisContentType) {
      case 'timeseries':
        min = new Date(min - $$config._axisLimitPadding[0]);
        max = new Date(max + $$config._axisLimitPadding[1]);
        break;
      case 'indexed':
        min -= $$config._axisLimitPadding[0];
        max += $$config._axisLimitPadding[1];
        break;
    }

    scale.domain([min, max]);
  } else {
    scale.domain([]);
  }

  switch ($$config._axisOrient) {
    case 'top':
      // scale.range([0, $$config.axisWidth]);
      axis = d3.axisTop(scale);
      origin.x += $$config.axisMarginLeft;
      origin.y += $$config.axisMarginTop;
      break;
    case 'bottom':
      // scale.range([0, $$config.axisWidth]);
      axis = d3.axisBottom(scale);
      origin.x += $$config.axisMarginLeft;
      origin.y += $$config.axisHeight + $$config.axisMarginTop;
      break;
    case 'left':
      // scale.range([$$config.axisHeight, 0]);
      axis = d3.axisLeft(scale);
      origin.x += $$config.axisMarginLeft;
      origin.y += $$config.axisMarginTop;
      break;
    case 'right':
      // scale.range([$$config.axisHeight, 0]);
      axis = d3.axisRight(scale);
      origin.x += $$config.axisWidth + $$config.axisMarginLeft;
      origin.y += $$config.axisMarginTop;
      break;
  }

  // label
  const labelSize = 16; // TODO : need to detect the label's size automatically

  if ($$config.axisLabelTitle !== '' && $$config.axisLabelShow) {
    let text = axisG
      .append('text')
      .text($$config.axisLabelTitle)
      .attr('class', 'axis-label');

    if (!NoopObject($$config.axisLabelStyle)) {
      Object.keys($$config.axisLabelStyle).forEach((style) => {
        text.style(style, $$config.axisLabelStyle[style]);
      });
    }

    if (Validator.Defined($$config.axisLabelColor)) {
      text.style('fill', $$config.axisLabelColor);
    }

    if ($$config._axisOrient === 'left' || $$config._axisOrient === 'right') {
      text.attr('transform', 'rotate(-90)');
    }

    // switch($$config._axisOrient){
    //     case 'top':
    //         origin.y += labelSize;
    //         $$config.axisHeight -= labelSize;
    //         console.log('top', $$config.axisWidth, $$config.axisHeight);
    //         break;
    //     case 'bottom':
    //         origin.y -= labelSize;
    //         $$config.axisHeight -= labelSize;
    //         console.log('bottom', $$config.axisWidth, $$config.axisHeight);
    //         break;
    //     case 'left':
    //         origin.x += labelSize;
    //         $$config.axisWidth -= labelSize;
    //         console.log('left', $$config.axisWidth, $$config.axisHeight);
    //         break;
    //     case 'right':
    //         origin.x -= labelSize;
    //         $$config.axisWidth -= labelSize;
    //         console.log('right', $$config.axisWidth, $$config.axisHeight);
    //         break;
    // }

    let labelBaseLoc = { x: 0, y: 0 };
    let positions = $$config.axisLabelPosition.split('-');
    let axisDomainWidth = $$config.axisWidth;
    switch ($$config._axisOrient) {
      case 'top':
        positions[0] = positions[0] === 'in' ? 'out' : 'in';
        break;
      case 'bottom':
        break;
      case 'left':
        positions[0] = positions[0] === 'in' ? 'out' : 'in';
        labelBaseLoc.x -= $$config.axisHeight;
        axisDomainWidth = $$config.axisHeight;
        break;
      case 'right':
        labelBaseLoc.x -= $$config.axisHeight;
        axisDomainWidth = $$config.axisHeight;
        break;
    }
    // console.log($$config.axisWidth)
    // $$config._axisLabelPosition = positions.join('-');
    // console.log(labelBaseLoc);
    // console.log($$config._axisLabelPosition);
    if (positions[0] === 'in') {
      // in
      labelBaseLoc.y -= $$config.axisLabelPadding;
    } else {
      // out
      labelBaseLoc.y += labelSize + $$config.axisLabelPadding;
    }
    if (positions[1] === 'left') {
      // left
      text.style('text-anchor', 'start');
    } else if (positions[1] === 'center') {
      // center
      labelBaseLoc.x += axisDomainWidth / 2;
      text.style('text-anchor', 'middle');
    } else {
      // right
      labelBaseLoc.x += axisDomainWidth;
      text.style('text-anchor', 'end');
    }
    text.attr('x', labelBaseLoc.x);
    text.attr('y', labelBaseLoc.y);

    $$config.axisLabel = text;
  }

  // ticks
  if (
    $$config._axisLimitSet &&
    ($$config.axisTickTextShow || $$config.axisTickLineShow)
  ) {
    let ticksValue = scale.domain();
    $$config._axisTickValues =
      $$config.axisTickValues.length > 0 ? $$config.axisTickValues : [];
    $$config._axisTickCount =
      $$config.axisTickCount != -1 ? $$config.axisTickCount : 10;
    $$config._axisTickFormat = undefined;
    switch ($$config.axisContentType) {
      case 'timeseries':
        // format
        $$config._axisTickFormat = !Validator.Defined($$config.axisTickFormat)
          ? d3.timeFormat('%Y-%m-%d')
          : Validator.StringType($$config.axisTickFormat)
          ? d3.timeFormat($$config.axisTickFormat)
          : Validator.FunctionType($$config.axisTickFormat)
          ? $$config.axisTickFormat
          : undefined;
        ticksValue = ticksValue.map((date) => date.getTime());
        break;
      case 'indexed':
        // format
        $$config._axisTickFormat =
          Validator.Defined($$config.axisTickFormat) &&
          Validator.FunctionType($$config.axisTickFormat)
            ? $$config.axisTickFormat
            : undefined;
        break;
    }

    // console.log(ticksValue, $$config.axisTickInterval);
    if (
      $$config._axisTickValues.length <= 0 &&
      Validator.Defined($$config.axisTickInterval) &&
      ticksValue.every((d) => Validator.NumberType(d))
    ) {
      let interval = $$config.axisTickInterval;
      let diff = ticksValue[1] - ticksValue[0];
      // console.log(interval, diff);
      // if interval >= diff, then ticksValue = [min, max]
      if (interval < diff) {
        if (interval * 2 >= diff) {
          ticksValue.splice(1, 0, Math.ceil(ticksValue[0] + diff / 2));
          $$config._axisTickValues = ticksValue;
        } else {
          let isDivideClear = diff % interval == 0;
          let divideCount = Math.floor(diff / interval);
          let newTicks = [];
          // console.log(isDivideClear, divideCount);
          if (isDivideClear) {
            for (let i = 0; i < divideCount - 1; i++)
              newTicks.push(ticksValue[0] + interval * (i + 1));
          } else {
            let middleValue = diff,
              pair = 0,
              start = ticksValue[0],
              end = ticksValue[1];
            while (middleValue > 2 * interval) {
              start = start + interval;
              end = end - interval;
              middleValue = end - start;
              // add left
              newTicks.splice(pair, 0, start);
              // add right
              newTicks.splice(newTicks.length - pair, 0, end);
              pair++;
            }
          }
          ticksValue.splice.apply(ticksValue, [1, 0].concat(newTicks));
          $$config._axisTickValues = ticksValue;
        }
      }
      // console.log(ticksValue);
      $$config._axisTickValues = ticksValue;
      $$config._axisTickCount = $$config._axisTickValues.length;
    }

    // console.log($$config._axisTickFormat);
    // console.log($$config._axisTickValues);
    // console.log($$config._axisTickCount);

    // tick priority : Values > Interval > Count
    if ($$config._axisTickValues.length > 0) {
      axis.tickValues($$config._axisTickValues);
    } else {
      axis.ticks($$config._axisTickCount);
    }

    if (Validator.Defined($$config._axisTickFormat)) {
      axis.tickFormat($$config._axisTickFormat);
    }

    // defualt tickSize = 0, TODO: can set tickSize by user.
    if ($$config.axisInnerTick) {
      axis.tickSizeOuter([0]);
      axis.tickSizeInner([`${-$$config.axisWidth}`]);
    } else {
      axis.tickSize([0]);
    }
    // padding
    axis.tickPadding($$config.axisTickPadding);
  } else {
    // no tick
    $$config._axisTickCount = 0;
    $$config._axisTickValues = [];
    $$config._axisTickFormat = undefined;
    axis.ticks($$config._axisTickCount);
    axis.tickSize([0]);
  }

  // console.log($$config._axisOrient, $$config.axisWidth, $$config.axisHeight);

  switch ($$config._axisOrient) {
    case 'top':
      scale.range([0, $$config.axisWidth]);
      break;
    case 'bottom':
      scale.range([0, $$config.axisWidth]);
      break;
    case 'left':
      scale.range([$$config.axisHeight, 0]);
      break;
    case 'right':
      scale.range([$$config.axisHeight, 0]);
      break;
  }

  axisG.call(axis);

  // domain style
  // show
  if (!$$config.axisDomainShow) {
    axisG.call((g) => g.select('.domain').remove());
  }

  // tick style
  if (
    $$config._axisLimitSet &&
    ($$config.axisTickTextShow || $$config.axisTickLineShow)
  ) {
    let tickText = axisG.selectAll('.tick text');
    let tickLine = axisG.selectAll('.tick line');

    // text
    if ($$config.axisTickTextShow) {
      // style
      if (!NoopObject($$config.axisTickTextStyle)) {
        Object.keys($$config.axisTickTextStyle).forEach((style) => {
          tickText.style(style, $$config.axisTickTextStyle[style]);
        });
      }

      // color
      if (Validator.Defined($$config.axisTickTextColor)) {
        tickText.style('fill', $$config.axisTickTextColor);
      }
    }

    // line
    if ($$config.axisTickLineShow) {
      // style
      if (!NoopObject($$config.axisTickLineStyle)) {
        Object.keys($$config.axisTickLineStyle).forEach((style) => {
          tickLine.style(style, $$config.axisTickLineStyle[style]);
        });
      }

      // color
      if (Validator.Defined($$config.axisTickLineColor)) {
        tickLine.style('stroke', $$config.axisTickLineColor);
      }
    }

    // tick show
    // text
    tickText.style('opacity', $$config.axisTickTextShow ? 1 : 0);

    // line
    tickLine.style('opacity', $$config.axisTickLineShow ? 1 : 0);
  }

  axisG.attr('transform', `translate(${origin.x},${origin.y})`);

  // console.log(origin);
  $$config.axisOriginX = origin.x;
  $$config.axisOriginY = origin.y;

  this.axis = axisG;
};
/* End axis.js */

/* Start line.js */
// let line = new Line({
//     label: [title] || {
//         title: string,
//         color: #??????,
//         show: boolean
//     },
//     type: [stright, curveMonotoneX],
//     stroke: {
//         color: #??????,
//         type: [],
//         width: number
//     }
// })
function Line(name, config) {
  this.config = Line.setDefaultConfig();
  Line.loadConfig.call(this, config);

  this.name = name;
  this.line = undefined;

  this.update = function (target, settings) {
    if (Line.setDynamicConfig.call(this, settings)) {
      Line.draw.call(this, target);
    }
  };

  this.remove = function () {
    if (Validator.Defined(this.line)) {
      this.line.remove();
      this.line = undefined;
    }
    this._originInParent = { x1: 0, y1: 0, x2: 0, y2: 0 };
  };

  this.show = function (isShow) {
    this.line.attr('opacity', isShow ? 1 : 0);
  };

  this._originInParent = { x1: 0, y1: 0, x2: 0, y2: 0 };
}

Line.setDefaultConfig = function () {
  return {
    // Label
    lineLabelTitle: '',
    lineLabelColor: undefined,
    lineLabelShow: true,
    // Type
    lineType: 'stright',
    // margin
    lineMarginTop: 0,
    lineMarginLeft: 0,
    lineMarginRight: 0,
    lineMarginBottom: 0,
    // Style
    lineStrokeColor: undefined,
    lineStrokeType: undefined,
    lineStrokeOpacity: 1,
    lineStrokeWidth: -1,
    // data
    lineData: [],
  };
};

Line.loadConfig = function (config) {
  let $$config = this.config;

  // label
  if (Validator.Defined(config.label)) {
    if (Validator.StringType(config.label))
      $$config.lineLabelTitle = config.label;
    else if (Validator.ObjectType(config.label) && !NoopObject(config.label)) {
      let labelConfig = config.label;
      if (
        Validator.Defined(labelConfig.title) &&
        Validator.StringType(labelConfig.title)
      )
        $$config.lineLabelTitle = labelConfig.title;
      if (
        Validator.Defined(labelConfig.color) &&
        (HexColor(labelConfig.color) || RGBAColor(labelConfig.color))
      )
        $$config.lineLabelColor = labelConfig.color;
      if (
        Validator.Defined(labelConfig.show) &&
        Validator.BooleanType(labelConfig.show)
      )
        $$config.lineLabelShow = labelConfig.show;
    }
  }

  // type
  if (
    Validator.Defined(config.type) &&
    ['stright', 'curveMonotoneX'].findIndex(config.type) != -1
  ) {
    $$config.lineType = config.type;
  }

  // stroke
  if (
    Validator.Defined(config.stroke) &&
    Validator.ObjectType(config.stroke) &&
    !NoopObject(config.stroke)
  ) {
    let strokeConfig = config.stroke;
    if (
      Validator.Defined(strokeConfig.color) &&
      (HexColor(strokeConfig.color) || RGBAColor(strokeConfig.color))
    )
      $$config.lineStrokeColor = strokeConfig.color;
    if (
      Validator.Defined(strokeConfig.opacity) &&
      strokeConfig.opacity <= 1 &&
      strokeConfig.opacity >= 0
    )
      $$config.lineStrokeOpacity = strokeConfig.opacity;
    // TODO : check the stroke type
    // if(Validator.Defined(strokeConfig.type) && Validator.StringType(strokeConfig.color)) $$config.lineStrokeColor = strokeConfig.color;
    if (
      Validator.Defined(strokeConfig.width) &&
      Validator.NumberType(strokeConfig.width)
    )
      $$config.lineStrokeWidth = strokeConfig.width;
  }
};

Line.setMargin = function (margin) {
  let $$config = this.config;
  let modified = false;
  if (Validator.Defined(margin)) {
    if (Validator.Defined(margin.top)) $$config.lineMarginTop = margin.top;
    if (Validator.Defined(margin.left)) $$config.lineMarginLeft = margin.left;
    if (Validator.Defined(margin.right))
      $$config.lineMarginRight = margin.right;
    if (Validator.Defined(margin.bottom))
      $$config.lineMarginBottom = margin.bottom;
    modified = true;
  }
  return modified;
};

Line.setData = function (data) {
  let $$config = this.config;
  let modified = false;
  if (Validator.Defined(data)) {
    $$config.lineData = data;
    modified = true;
  }
  return modified;
};

Line.setDynamicConfig = function (settings) {
  let configModified = false;

  if (Validator.ObjectType(settings) && !NoopObject(settings)) {
    configModified =
      Line.setMargin.call(this, settings.margin) || configModified;
    configModified = Line.setData.call(this, settings.data) || configModified;
  }

  return configModified;
};

Line.draw = function (target) {
  let $$config = this.config,
    minX,
    minY,
    maxX,
    maxY;

  // create
  let lineG = this.line;
  if (!Validator.Defined(lineG)) {
    lineG = this.line = target
      .append('g')
      .attr('class', `line ${this.name}`)
      .append('path');
  }

  let line;
  switch ($$config.lineType) {
    case 'stright':
      line = d3.line();
      break;
    case 'curveMonotoneX':
      line = d3.line().curve(d3.curveMonotoneX);
      break;
  }

  // line data Mapping
  line.x((d) => d[0]).y((d) => d[1]);
  //console.log($$config.lineData);
  lineG.datum($$config.lineData).attr('d', line);

  lineG.attr('fill', 'none');

  // line Color
  if (Validator.StringType($$config.lineStrokeColor)) {
    lineG.attr('stroke', $$config.lineStrokeColor);
  }

  // line Opacity
  if (Validator.StringType($$config.lineStrokeOpacity)) {
    lineG.attr('opacity', $$config.lineStrokeOpacity);
  }

  // line Width
  if ($$config.lineStrokeWidth >= 0) {
    lineG.attr('stroke-width', $$config.lineStrokeWidth);
  }

  if ($$config.lineData.length > 0) {
    minX = maxX = $$config.lineData[0][0];
    minY = maxY = $$config.lineData[0][1];

    if ($$config.lineData.length > 1) {
      $$config.lineData.slice(1).forEach((point) => {
        if (point[0] > maxX) maxX = point[0];
        else if (point[0] < minX) minX = point[0];
        if (point[1] > maxY) maxY = point[1];
        else if (point[1] < minY) minY = point[1];
      });
    }
  }

  // assign the origin point
  this._originInParent.x1 = minX;
  this._originInParent.y1 = minY;
  this._originInParent.x2 = maxX;
  this._originInParent.y2 = maxY;
}; /* End line.js */

/* Start mouseRegion.js */
function MouseRegion(name, origin, size) {
  this.name = name || '';

  this.origin = {
    x: undefined,
    y: undefined,
  };

  this.size = {
    width: 0,
    height: 0,
  };

  this.config = function (origin, size) {
    this.origin.x = uiTool.getProperty(origin, 'x', undefined);
    this.origin.y = uiTool.getProperty(origin, 'y', undefined);
    this.size.width = uiTool.getProperty(size, 'width', 0);
    this.size.height = uiTool.getProperty(size, 'height', 0);
  };

  this.register = function (receiver, eventObj) {
    let supportNum = 0;
    Object.keys(eventObj).forEach((eventType) => {
      supportNum += MouseRegion.registerEvents.call(
        this,
        eventType,
        eventObj[eventType]
      );
    }, this);
    if (supportNum > 0) this._eventReceiver.push(receiver);
  };

  this.trigger = function (event, eventType) {
    let data;
    data = data || MouseRegion.getPositions.call(this, event);
    if (this._active != MouseRegion.CheckPositionStatus.call(this, event)) {
      this._active = !this._active;
      if (this._active) {
        this._mouseEnter.forEach((callback) => {
          callback(data);
        });
      } else {
        this._mouseLeave.forEach((callback) => {
          callback(data);
        });
      }
    }
    if (this._active) {
      this._mouseMove.forEach((callback) => {
        callback(data);
      });
    }
    switch (eventType) {
      case 'click':
        this._click.forEach((callback) => {
          callback(data);
        });
        break;
    }
  };

  this.config(origin || {}, size || {});

  this._active = false;
  this._eventReceiver = [];
  this._mouseEnter = [];
  this._mouseMove = [];
  this._mouseLeave = [];
  this._click = [];
}

MouseRegion.CheckPositionStatus = function (event) {
  let xDiffer = event.offsetX - this.origin.x;
  let yDiffer = event.offsetY - this.origin.y;
  // console.log(`Differ X : ${xDiffer}`,
  //             `Differ Y : ${yDiffer}`,
  //             `size : ${this.size.width}, ${this.size.height}`);
  return (
    Boolean(xDiffer > 0 && yDiffer > 0) &&
    Boolean(xDiffer < this.size.width && yDiffer < this.size.height)
  );
};

MouseRegion.getPositions = function (event) {
  // console.log(event,
  //             `PosX : ${event.offsetX - this.origin.x}`,
  //             `PosY : ${event.offsetY - this.origin.y}`);
  return {
    x: event.offsetX - this.origin.x,
    y: event.offsetY - this.origin.y,
  };
};

MouseRegion.registerEvents = function (eventType, callback) {
  switch (eventType) {
    case 'mouseenter':
      this._mouseEnter.push(callback);
      return 1;
    case 'mousemove':
      this._mouseMove.push(callback);
      return 1;
    case 'mouseleave':
      this._mouseLeave.push(callback);
      return 1;
    case 'click':
      this._click.push(callback);
      return 1;
    default:
      return 0;
  }
};
/* End mouseRegion.js */

/* Start focusLine.js */
// focusLine: {
//     color: #?????? || {
//         x: #??????,
//         y: #??????
//     },
//     show: {
//         x: true,
//         y: false
//     }
// }
function FocusLineRegion(config) {
  this._config = FocusLineRegion.setDefaultConfig();
  FocusLineRegion.loadConfig.call(this, config);

  this.config = function (config) {
    FocusLineRegion.config.call(this, config);
  };

  this.update = function (data) {
    FocusLineRegion.update.call(this, data);
  };

  this.show = function (isShowX, isShowY) {
    this._focusLineX.style('opacity', isShowX ? 1 : 0);
    this._focusLineY.style('opacity', isShowY ? 1 : 0);
  };

  this.eventTrigger = {};
  this._axisHeight = 0;
  this._axisWidth = 0;
}

Object.defineProperty(FocusLineRegion.prototype, 'x', {
  get: function () {
    return this._config.originX;
  },
});

Object.defineProperty(FocusLineRegion.prototype, 'y', {
  get: function () {
    return this._config.originY;
  },
});

FocusLineRegion.setDefaultConfig = function () {
  return {
    originX: undefined,
    originY: undefined,
    // focusLine
    lineX: undefined,
    lineY: undefined,
    // color
    lineColor: undefined,
    lineXColor: undefined,
    lineYColor: undefined,
    // show
    isShowX: false,
    isShowY: true,
  };
};

FocusLineRegion.loadConfig = function (config) {
  let $$config = this._config;

  if (Validator.Defined(config.color)) {
    let colorConfig = config.color;
    if (
      Validator.StringType(colorConfig) &&
      (HexColor(colorConfig) || RGBAColor(colorConfig))
    )
      $$config.lineColor = $$config.lineXColor = $$config.lineYColor = colorConfig;
    else if (Validator.ObjectType(colorConfig) && !NoopObject(colorConfig)) {
      if (
        Validator.Defined(colorConfig.x) &&
        Validator.StringType(colorConfig.x) &&
        (HexColor(colorConfig.x) || RGBAColor(colorConfig.x))
      )
        $$config.lineXColor = colorConfig.x;
      if (
        Validator.Defined(colorConfig.y) &&
        Validator.StringType(colorConfig.y) &&
        (HexColor(colorConfig.y) || RGBAColor(colorConfig.y))
      )
        $$config.lineYColor = colorConfig.y;
    }
  }

  if (Validator.Defined(config.show)) {
    let showConfig = config.show;
    if (Validator.Defined(showConfig.x) && Validator.BooleanType(showConfig.x))
      $$config.isShowX = showConfig.x;
    if (Validator.Defined(showConfig.y) && Validator.BooleanType(showConfig.y))
      $$config.isShowY = showConfig.y;
  }
};

FocusLineRegion.init = function (target) {
  let $$ = this,
    $$config = this._config;
  $$.focusLineBoard = target.append('g').attr('class', 'focusline-board');
  $$config.lineX = $$._focusLineX = $$.focusLineBoard
    .append('line')
    .attr('class', 'focusline');
  $$config.lineY = $$._focusLineY = $$.focusLineBoard
    .append('line')
    .attr('class', 'focusline');

  if (Validator.Defined($$config.lineXColor)) {
    $$._focusLineX.style('stroke', $$config.lineXColor);
  }

  if (Validator.Defined($$config.lineYColor)) {
    $$._focusLineY.style('stroke', $$config.lineYColor);
  }

  // event Trigger
  $$.eventTrigger = {
    Chart: {
      mouseenter: mouseenter,
      mouseleave: mouseleave,
      mousemove: mousemove,
    },
  };

  function mouseenter() {
    // console.log('FocusLine mouse enter');
    $$.show(true && $$config.isShowX, true && $$config.isShowY);
  }

  function mouseleave() {
    // console.log('FocusLine mouse leave');
    $$.show(false, false);
  }

  function mousemove(data) {
    $$.update(data);
  }
};

FocusLineRegion.config = function (config) {
  if (Validator.Defined(config.origin)) {
    let originConfig = config.origin;
    if (Validator.Defined(originConfig.x))
      this._config.originX = originConfig.x;
    if (Validator.Defined(originConfig.y))
      this._config.originY = originConfig.y;
  }

  if (Validator.Defined(config.config)) {
    if (Validator.Defined(config.config.axisX))
      this._axisWidth = config.config.axisX.config.axisWidth;
    if (Validator.Defined(config.config.axisY))
      this._axisHeight = config.config.axisY.config.axisHeight;
  }

  this.focusLineBoard.attr(
    'transform',
    `translate(${this._config.originX},${this._config.originY})`
  );
};

FocusLineRegion.update = function (data) {
  this._focusLineX
    .attr('x1', 0)
    .attr('y1', data.y)
    .attr('x2', this._axisWidth)
    .attr('y2', data.y);

  this._focusLineY
    .attr('x1', data.x)
    .attr('y1', 0)
    .attr('x2', data.x)
    .attr('y2', this._axisHeight);
};

LineChart.extensionSupport.focusLine = FocusLineRegion;
LineChart.extensionInit.focusLine = FocusLineRegion.init;
LineChart.extensionSetupLayer.focusLine = 1;
/* End focusLine.js */

/* Start tooltip.js */
// tooltip: {
//     title: 'data_name'
//     label: [data_name, data_name, data_name],
//     alias: { // only support for label
//         data_name: 'static String',
//         data_name: function(x){return value;}
//     },
//     format: {
//         data_name: 'static string',
//         data_name: function(x){return value;}
//     },
//     width: xxx,
//     color: {
//         data_name: #??????
//     }
//     style: {
//         data_name: {
//             color: #??????,
//             text-align: []
//         }
//     }
// }

function TooltipRegion(config) {
  this._config = TooltipRegion.setDefaultConfig();
  TooltipRegion.loadConfig.call(this, config);

  this.config = function (config) {
    TooltipRegion.config.call(this, config);
  };

  this.update = function (data) {
    TooltipRegion.update.call(this, data);
  };

  this.show = function (isShow) {
    if (isShow) {
      this._tooltipBoard.classList.remove('d-none');
    } else {
      this._tooltipBoard.classList.add('d-none');
    }
  };

  this._originInParent = { x: 0, y: 0 };
  this._data = [];
  this._posData = {};
  this.eventTrigger = {};
  this._xScale = undefined;
  this._width = 0;
  this._height = 0;
  this._dataX = undefined;
}

Object.defineProperty(TooltipRegion.prototype, 'x', {
  get: function () {
    return this._config.originX;
  },
});

Object.defineProperty(TooltipRegion.prototype, 'y', {
  get: function () {
    return this._config.originY;
  },
});

TooltipRegion.setDefaultConfig = function () {
  return {
    // Tooltip
    originX: undefined,
    originY: undefined,

    title: undefined,
    width: undefined,
    height: undefined,
    labels: [],
    alias: {},
    format: {},
    // label's Name && title Color
    color: {},
    // label && title Style
    style: {},
  };
};

TooltipRegion.loadConfig = function (config) {
  let $$config = this._config;

  // title
  if (Validator.Defined(config.title) && Validator.StringType(config.title)) {
    $$config.title = config.title;
  }

  // width
  if (Validator.Defined(config.width) && Validator.NumberType(config.width)) {
    $$config.width = config.width;
  }
  // height
  if (Validator.Defined(config.height) && Validator.NumberType(config.height)) {
    $$config.height = config.height;
  }

  // label
  if (Validator.Defined(config.label)) {
    let labelConfig = config.label;
    if (Validator.StringType(labelConfig)) {
      $$config.labels = [labelConfig];
    } else if (Validator.ArrayType(labelConfig)) {
      labelConfig.forEach((label) => {
        if (Validator.StringType(label)) $$config.labels.push(label);
      });
    }
  }

  // alias
  if (Validator.Defined(config.alias)) {
    let aliasConfig = config.alias;
    if (Validator.ObjectType(aliasConfig) && !NoopObject(aliasConfig)) {
      Object.keys(aliasConfig).forEach((aliasKey) => {
        if (
          Validator.StringType(aliasConfig[aliasKey]) ||
          Validator.FunctionType(aliasConfig[aliasKey])
        ) {
          $$config.alias[aliasKey] = aliasConfig[aliasKey];
        }
      });
    }
  }

  // format
  if (Validator.Defined(config.format)) {
    let formatConfig = config.format;
    if (Validator.ObjectType(formatConfig) && !NoopObject(formatConfig)) {
      Object.keys(formatConfig).forEach((formatKey) => {
        if (
          Validator.StringType(formatConfig[formatKey]) ||
          Validator.FunctionType(formatConfig[formatKey])
        ) {
          $$config.format[formatKey] = formatConfig[formatKey];
        }
      });
    }
  }

  // color
  if (Validator.Defined(config.color)) {
    let colorConfig = config.color;
    if (Validator.ObjectType(colorConfig) && !NoopObject(colorConfig)) {
      Object.keys(colorConfig).forEach((labelName) => {
        if (
          Validator.StringType(colorConfig[labelName]) &&
          (HexColor(colorConfig[labelName]) ||
            RGBAColor(colorConfig[labelName]))
        ) {
          $$config.color[labelName] = colorConfig[labelName];
        }
      });
    }
  }

  // style
  if (Validator.Defined(config.style)) {
    let styleConfig = config.style;
    if (Validator.ObjectType(styleConfig) && !NoopObject(styleConfig)) {
      Object.keys(styleConfig).forEach((labelName) => {
        if (
          Validator.ObjectType(styleConfig[labelName]) &&
          !NoopObject(styleConfig[labelName])
        ) {
          $$config.style[labelName] = styleConfig[labelName];
        }
      });
    }
  }
};

TooltipRegion.init = function (target) {
  let $$ = this,
    $$config = this._config;

  let board = document.createElement('div');
  board.classList.add('tooltip-board', 'd-none');
  target.append(board);
  $$._tooltipBoard = board;

  // Table
  let table = document.createElement('table');
  table.classList.add('tooltip-table');
  $$._tooltipBoard.append(table);
  $$._tooltipTable = table;
  let tableHeader = document.createElement('thead');
  let tableBody = document.createElement('tbody');
  table.append(tableHeader);
  table.append(tableBody);

  // Title
  let titleTr = document.createElement('tr');
  titleTr.classList.add('tooltip-title');
  let titleTh = document.createElement('th');
  titleTh.setAttribute('colspan', 2);
  if (Validator.Defined($$config.title)) {
    let title = $$config.title;
    if (Validator.Defined($$config.color[title])) {
      titleTh.style.color = $$config.color[title];
    }

    if (Validator.Defined($$config.style[title])) {
      let styleConfig = $$config.style[title];
      Object.keys(styleConfig).forEach((style) => {
        titleTh.style[style] = styleConfig[style];
      });
    }
  }
  titleTr.append(titleTh);
  tableHeader.append(titleTr);
  $$._tooltipTableTitle = titleTh;

  // Label
  $$._tooltipTableLabel = {};
  $$config.labels.forEach((label) => {
    let labelTr = document.createElement('tr');
    labelTr.classList.add('tooltip-label');
    tableBody.append(labelTr);

    let name = label;
    if (Validator.Defined($$config.alias[label])) {
      if (Validator.StringType($$config.alias[label]))
        name = $$config.alias[label];
      else name = $$config.alias[label](name) || name;
    }

    let nameTd = document.createElement('td');
    nameTd.classList.add('tooltip-label-name');
    let nameText = document.createTextNode(name);
    nameTd.append(nameText);
    labelTr.append(nameTd);

    let valueTd = document.createElement('td');
    valueTd.classList.add('tooltip-label-value');
    labelTr.append(valueTd);

    if (Validator.Defined($$config.color[label])) {
      nameTd.style.color = $$config.color[label];
      // valueTd.style.color = $$config.color[label];
    }

    if (Validator.Defined($$config.style[label])) {
      let styleConfig = $$config.style[label];
      Object.keys(styleConfig).forEach((style) => {
        nameTd.style[style] = styleConfig[style];
        valueTd.style[style] = styleConfig[style];
      });
    }

    $$._tooltipTableLabel[label] = valueTd;
  });

  // event Trigger
  $$.eventTrigger = {
    Line: {
      mouseenter: mouseenter,
      mouseleave: mouseleave,
      mousemove: mousemove,
    },
  };

  function mouseenter() {
    $$.show(true);
  }

  function mouseleave() {
    $$.show(false);
  }

  function mousemove(data) {
    $$.update(data);
  }
};

TooltipRegion.config = function (config) {
  if (Validator.Defined(config.origin)) {
    let originConfig = config.origin;
    if (Validator.Defined(originConfig.x))
      this._config.originX = originConfig.x;
    if (Validator.Defined(originConfig.y))
      this._config.originY = originConfig.y;
  }

  if (Validator.Defined(config.data) && Validator.ArrayType(config.data)) {
    let dataArr = config.data;
    this._data = [];
    dataArr.forEach((data) => {
      if (Validator.ObjectType(data) && !NoopObject(data))
        this._data.push(data);
    });
  }

  if (
    Validator.Defined(config.posData) &&
    Validator.ObjectType(config.posData) &&
    !NoopObject(config.posData)
  ) {
    this._posData = config.posData[config.config.dataX];
  }

  if (Validator.Defined(config.config.dataX)) {
    this._dataX = config.config.dataX;
  }

  if (Validator.Defined(config.config.axisX)) {
    let axisX = config.config.axisX;
    // get Axis X width
    this._width = axisX.width;
    // get Axis X scale
    if (Validator.Defined(axisX.scale)) this._xScale = axisX.scale;
  }

  if (Validator.Defined(config.config.axisY)) {
    let axisY = config.config.axisY;
    // get Axis Y Height
    this._height = axisY.height;
  }
};

TooltipRegion.update = function (data) {
  let $$ = this,
    $$config = $$._config,
    x = data.x,
    y = data.y,
    index;
  index = getDataIndexOnMousePosX(x);

  // console.log(index);
  // console.log(x, y);

  // tooltip title
  if (Validator.Defined($$config.title)) {
    let title = $$config.title;
    let value = $$._data[index][title];

    // format for title
    if (Validator.Defined($$config.format[title])) {
      let format = $$config.format[title];
      if (Validator.StringType(format)) value = format;
      else value = format(value) || value;
    }

    let titleText = document.createTextNode(value);
    clearText($$._tooltipTableTitle);
    $$._tooltipTableTitle.append(titleText);
  }

  // tooltip label
  $$config.labels.forEach((label) => {
    let value = $$._data[index][label];

    // format for value
    if (Validator.Defined($$config.format[label])) {
      let format = $$config.format[label];
      if (Validator.StringType(format)) value = format;
      else value = format(value) || value;
    }

    let labelText = document.createTextNode(value);
    clearText($$._tooltipTableLabel[label]);
    $$._tooltipTableLabel[label].append(labelText);
  });

  if (
    Validator.Defined($$config.width) &&
    this._tooltipBoard.clientWidth < $$config.width
  ) {
    $$._tooltipTable.style.width = `${$$config.width}px`;
  }

  if (
    Validator.Defined($$config.height) &&
    this._tooltipBoard.clientHeight < $$config.height
  ) {
    $$._tooltipTable.style.height = `${$$config.height}px`;
  }

  // tooltip position
  // console.log($$config.originX, $$config.originY);
  x += $$config.originX;
  y += $$config.originY;

  // // tooltip mouse icon offset
  let icon = { width: 20, height: 20 };

  // // tooltip boundary offset
  // console.log(x, this._width, this._tooltipBoard.clientWidth);
  if (x >= this._width / 2) {
    x -=
      icon.width +
      (this._tooltipBoard.style.width === ''
        ? this._tooltipBoard.clientWidth
        : $$config.width);
  } else {
    x += icon.width;
  }

  // console.log(y, this._height, this._tooltipBoard.clientHeight);
  if (y >= this._height / 2) {
    y -=
      icon.height +
      (this._tooltipBoard.style.height === ''
        ? this._tooltipBoard.clientHeight
        : $$config.height);
  } else {
    y += icon.height;
  }

  // set position
  this._tooltipBoard.style.left = `${x}px`;
  this._tooltipBoard.style.top = `${y}px`;

  function clearText(element) {
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  }

  function getDataIndexOnMousePosX(pos) {
    let bisect = d3.bisector((d) => d).left,
      index = bisect($$._posData, pos, 0),
      leftDiffer = Math.abs(pos - $$._posData[index - 1]),
      rightDiffer = Math.abs(pos - $$._posData[index]);
    return leftDiffer <= rightDiffer ? index - 1 : index;
  }
};

LineChart.extensionSupport.tooltip = TooltipRegion;
LineChart.extensionInit.tooltip = TooltipRegion.init;
LineChart.extensionSetupLayer.tooltip = 0; /* End tooltip.js */
/* Start clickRegion.js */
// click: {
//     callback: function(div){}
// }

function ClickRegion(config) {
  this._config = ClickRegion.setDefaultConfig();
  ClickRegion.loadConfig.call(this, config);

  this.config = function (config) {
    //TODO
    console.log(config);
  };

  this.update = function (data) {
    //TODO
    console.log(data);
  };
  this.eventTrigger = {};
}

ClickRegion.setDefaultConfig = function () {
  return {
    callback: [],
  };
};

ClickRegion.loadConfig = function (config) {
  let $$config = this._config;

  if (Validator.Defined(config.callback)) {
    let callbackConfig = config.callback;
    if (Validator.FunctionType(callbackConfig)) {
      $$config.callback.push(callbackConfig);
    } else if (Validator.ArrayType(callbackConfig)) {
      callbackConfig.forEach((callback) => {
        if (Validator.FunctionType(callback)) {
          $$config.callback.push(callback);
        }
      });
    }
  }
};

ClickRegion.init = function (target) {
  //TODO
  console.log(target);
  let $$ = this,
    $$config = this._config;

  // event Trigger
  $$.eventTrigger = {
    Svg: {
      click: click,
    },
  };

  function click() {
    $$config.callback.forEach((callback) => {
      callback();
    });
  }
};

LineChart.extensionSupport.click = ClickRegion;
LineChart.extensionInit.click = ClickRegion.init;
LineChart.extensionSetupLayer.click = 0; /* End clickRegion.js */
/* End d3LineChart.js */
/*
function buildPanel(div) {
  var $threshold = [
    `${i18n.t('sensoreadings.LANG_SENSOR_TABLE_HEADTITLE4')}:`,
    `${i18n.t('sensoreadings.LANG_SENSOR_TABLE_HEADTITLE5')}:`,
    `${i18n.t('sensoreadings.LANG_SENSOR_TABLE_HEADTITLE6')}:`,
    `${i18n.t('sensoreadings.LANG_SENSOR_TABLE_HEADTITLE7')}:`,
    `${i18n.t('sensoreadings.LANG_SENSOR_TABLE_HEADTITLE8')}:`,
    `${i18n.t('sensoreadings.LANG_SENSOR_TABLE_HEADTITLE9')}:`,
  ];
  //console.log($threshold);
  let $table = document.createElement('table');
  $table.classList.add('panel-table-position');
  let row = document.createElement('tr');
  for (let j = 0; j < 6; j++) {
    let $td = document.createElement('td');
    let $tdText = document.createTextNode($threshold[j]);
    let $tdNA = document.createElement('td');
    let $tdNAText = document.createTextNode('N/A');
    $tdNA.appendChild($tdNAText);
    $td.appendChild($tdText);
    row.appendChild($td);
    row.appendChild($tdNA);
  }
  //console.log('buildPanel buildPanel: ', $table);
  $table.appendChild(row);
  /*
  let $tr = document.getElementsByTagName('<tr>');
  $tr.append(document.getElementsByTagName('<td>').text($threshold[0]));
  $tr.append(document.getElementsByTagName('<td>').text('N/A'));
  $tr.append(document.getElementsByTagName('<td>').text($threshold[1]));
  $tr.append(document.getElementsByTagName('<td>').text('N/A'));
  $tr.append(document.getElementsByTagName('<td>').text($threshold[2]));
  $tr.append(document.getElementsByTagName('<td>').text('N/A'));

  $tr.append(document.getElementsByTagName('<td>').text($threshold[3]));
  $tr.append(document.getElementsByTagName('<td>').text('N/A'));
  $tr.append(document.getElementsByTagName('<td>').text($threshold[4]));
  $tr.append(document.getElementsByTagName('<td>').text('N/A'));
  $tr.append(document.getElementsByTagName('<td>').text($threshold[5]));
  $tr.append(document.getElementsByTagName('<td>').text('N/A'));
  $table.append($tr);
  //document.getElementsById(div).append($table);
  div.appendChild($table);
  let sensorLineChart = new LineChart(div, null, {
    svg: {
      padding: {
        top: 130,
        bottom: 80,
        left: 80,
        right: 30,
      },
    },
    axis: {
      x: 'extend_x',
      y: 'extend_y',
      types: {
        extend_x: {
          label: {
            title: 'Time',
            position: 'out-middle',
          },
          type: 'indexed',
          limit: {
            min: 0,
            max: DELTA_Y - 1,
          },
          tick: {
            interval: 1,
            show: {
              line: false,
              text: false,
            },
          },
        },
        extend_y: {
          label: {
            title: 'Unit',
            position: 'out-middle',
            padding: 75,
          },
          margin: {
            left: 30,
          },
          type: 'indexed',
          // margin: {
          //     bottom: 50
          // },
          tick: {
            padding: 10,
          },
        },
      },
    },
    data: {
      x: 'index',
      columns: 'data',
      max: DELTA_Y,
      types: {
        data: {
          stroke: { color: '#FF0000', opacity: '100%' },
        },
      },
    },
  });

  return {
    table: $table,
    lineChart: sensorLineChart,
  };
}
/*
function updatePanel(div, data, buildParameter) {
  let $table = buildParameter.table;
  let $td = $table.children('tr').eq(0).find('td');
  $td.eq(1).text(data.lnr);
  $td.eq(3).text(data.lct);
  $td.eq(5).text(data.lnc);
  $td.eq(7).text(data.hnc);
  $td.eq(9).text(data.hct);
  $td.eq(11).text(data.hnr);

  buildParameter.lineChart.reload(data.data);
  buildParameter.lineChart.resize({ width: '100%', height: '100%' });
  buildParameter.lineChart.axisY.label = data.unit;
}

function initFloatPanel() {
  //console.log('initfloatpanel: ', document.getElementById('main-content'));
  //let panel = new FloatPanel(document.querySelectorAll('main')[0], null, {
  let panel = new FloatPanel(document.getElementById('main-content'), null, {
    size: {
      width: '100%',
      height: '100%',
    },
    indent: 50,
    func: {
      build: buildPanel,
      update: updatePanel,
    },
    color: {
      foreground: '#FFFFFF',
    },
    extension: {
      iconButton: {
        style: 'close-circle',
        action: {
          click: function () {
            panel.deactive();
            chooseSensorId = undefined;
          },
        },
      },
    },
  });
  return panel;
}*/

//function lineChart(svg_id_div, arr_data, sensorId, floatPanel) {
function lineChart(svg_id_div, arr_data) {
  let create_linechart = new LineChart(
    document.getElementById(svg_id_div),
    null,
    {
      svg: {
        size: { width: 90, height: 19 },
      },
      axis: {
        x: 'normal_x',
        y: 'normal_y',
        types: {
          normal_x: {
            domain: { show: false },
            limit: {
              min: 0,
              max: DELTA_Y - 1,
            },
            tick: {
              interval: 1,
              padding: 10,
              show: {
                line: false,
                text: false,
              },
            },
          },
          normal_y: {
            domain: { show: false },
            tick: {
              padding: 10,
              show: {
                line: false,
                text: false,
              },
            },
          },
        },
      },
      data: {
        x: 'index',
        columns: 'data',
        max: DELTA_Y,
        types: {
          data: {
            stroke: { color: '#FF0000', opacity: 0.5 },
          },
        },
      },
      /*extension: {
        click: {
          callback: function () {
            chooseSensorId = sensorId;
            floatPanel.active();
            floatPanel.update(arr_data);
          },
        },
      },*/
    }
  );
  create_linechart.reload(arr_data.data);
}

export default {
  name: 'SensorReadings',
  components: {
    PageTitle,
  },
  mixins: [
    TableFilterMixin,
    BVTableSelectableMixin,

    DataFormatterMixin,
    TableSortMixin,
    SearchFilterMixin,
  ],
  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
  data() {
    return {
      floatPanel: null,
      rChartData: {},
      refreshTime: 60,
      timeoutID: null,
      sensorThresholdShow: false,
      sensorOwnerSel: 0,
      sensorCategory: 0,
      seconds: [5, 10, 15, 30, 60, 150, 300],
      sensorsAmount: 0,
      sensorOwner: {
        0: 'BMC',
        1: 'SATELLITE',
        2: 'ME',
      },
      sensorType: [],
      sensorTypeOEM: [],
      fields: [
        {
          key: 'Healthy',
          sortable: false,
          label: 'Healthy',
        },
        {
          key: 'name',
          sortable: true,
          label: this.$t('pageSensors.table.name'),
        },
        {
          key: 'Status',
          sortable: true,
          label: this.$t('pageSensors.table.status'),
          tdClass: 'text-nowrap',
        },
        {
          key: 'currentValue',
          formatter: (value) => {
            //console.log('currentValue: ', value);
            return value;
          },
          label: this.$t('pageSensors.table.currentValue'),
        },
      ],
      tableFilters: [
        {
          key: 'status',
          label: this.$t('pageSensors.table.status'),
          values: ['OK', 'Warning', 'Critical'],
        },
      ],
      tabItems: [],
      tabItemsKeep: [],
      activeFilters: [],
      searchFilter: searchFilter,
      searchTotalFilteredRows: 0,
      selectedRows: selectedRows,
      tableHeaderCheckboxModel: tableHeaderCheckboxModel,
      tableHeaderCheckboxIndeterminate: tableHeaderCheckboxIndeterminate,
      destroyed: false,
    };
  },
  computed: {
    sensorsInfo() {
      return sensorsValuesParser(
        this.$store.getters['sensoreadings/sensors'],
        this.sensorOwnerSel
      );
    },
    allSensors() {
      return this.$store.getters['sensors/sensors'];
    },
    filteredRows() {
      return this.searchFilter
        ? this.searchTotalFilteredRows
        : this.filteredSensors.length;
    },
    filteredSensors() {
      return this.getFilteredTableData(this.allSensors, this.activeFilters);
    },
    sensorItems() {
      return this.tabItems;
    },
  },
  created() {
    this.refreshTime = parseInt(
      localStorage.getItem('autoRefreshSensorSeconds') ?? 60
    );
    this.getSensorInfo().finally(() => {
      if (this.refreshTime >= 5 && this.refreshTime != 255) {
        if (this.destroyed) return;
        this.timeoutID = setTimeout(() => {
          this.onChangedRefreshSecs();
        }, 1000 * this.refreshTime);
      }
    });
  },
  destroyed() {
    this.destroyed = true;
    clearTimeout(this.timeoutID);
  },
  methods: {
    onChangedRefreshSecs(event) {
      if (event != undefined) {
        console.log(event.target.value);
        localStorage.setItem('autoRefreshSensorSeconds', event.target.value);
        this.refreshTime = parseInt(event.target.value);
      }
      this.updateSensorInfo().finally(() => {
        if (this.destroyed) return;
        clearTimeout(this.timeoutID);
        if (this.refreshTime >= 5 && this.refreshTime != 255) {
          this.timeoutID = setTimeout(() => {
            this.onChangedRefreshSecs();
          }, 1000 * this.refreshTime);
        }
      });
    },
    onChangedType() {
      let SelectCategory = this.sensorCategory;
      if (SelectCategory == 0) {
        // noChanged.
        this.tabItems = this.tabItemsKeep; // init
      } else if (SelectCategory == 'c0') {
        this.tabItems = this.tabItemsKeep.filter((items) => {
          return items.SensorType >= 0xc0 && items.SensorType <= 0xff;
        });
      } else {
        this.tabItems = this.tabItemsKeep.filter((items) => {
          return items.SensorType == parseInt(SelectCategory, 16);
        });
      }
      this.sensorsAmount = this.tabItems.length;
    },
    onChangedCategory() {
      this.getSensorInfo();
    },
    updateChardData(chartDataObj) {
      Object.keys(chartDataObj).forEach((sensor_name, index) => {
        let elmID = 'd3_div_' + sensor_name;
        if (document.getElementById(elmID) != null) {
          let $sensor = {};
          let delta_d = [];
          let max_len = chartDataObj[sensor_name].READING.length;
          let idx = DELTA_Y - max_len;
          for (let j = 0; j < max_len; j++) {
            delta_d[j] = {};
            delta_d[j].index = idx++;
            delta_d[j].time = chartDataObj[sensor_name].TIMESTAMP[j];
            delta_d[j].data = parseFloat(
              chartDataObj[sensor_name].READING[j],
              10
            );
            if (delta_d[j].data < 0) {
              // if negative of value, reset to zero.
              delta_d[j].data = 0;
            }
          }
          $sensor['data'] = delta_d;
          $sensor['unit'] = chartDataObj[sensor_name].UNIT;
          $sensor['lnr'] = chartDataObj[sensor_name].LNR;
          $sensor['lct'] = chartDataObj[sensor_name].LCT;
          $sensor['lnc'] = chartDataObj[sensor_name].LNC;
          $sensor['hnc'] = chartDataObj[sensor_name].HNC;
          $sensor['hct'] = chartDataObj[sensor_name].HCT;
          $sensor['hnr'] = chartDataObj[sensor_name].HNR;
          lineChart(elmID, $sensor, index);
          //lineChart(elmID, $sensor, index, this.floatPanel); //modified 4/19
          /*if (
            typeof chooseSensorId !== 'undefined' &&
            index == chooseSensorId
          ) {
            this.floatPanel.update($sensor);
          }*/
        }
      });
    },
    ThresholdBtn() {
      this.sensorThresholdShow = !this.sensorThresholdShow;
      if (this.sensorThresholdShow) {
        let ThresholdHead = [
          {
            key: 'Low_NR',
            formatter: (value) => {
              return value;
            },
            label: this.$t('sensoreadings.LANG_SENSOR_TABLE_HEADTITLE4'),
          },
          {
            key: 'Low_CT',
            formatter: (value) => {
              return value;
            },
            label: this.$t('sensoreadings.LANG_SENSOR_TABLE_HEADTITLE5'),
          },
          {
            key: 'Low_NC',
            formatter: (value) => {
              return value;
            },
            label: this.$t('sensoreadings.LANG_SENSOR_TABLE_HEADTITLE6'),
          },
          {
            key: 'High_NC',
            formatter: (value) => {
              return value;
            },
            label: this.$t('sensoreadings.LANG_SENSOR_TABLE_HEADTITLE7'),
          },
          {
            key: 'High_CT',
            formatter: (value) => {
              return value;
            },
            label: this.$t('sensoreadings.LANG_SENSOR_TABLE_HEADTITLE8'),
          },
          {
            key: 'High_NR',
            formatter: (value) => {
              return value;
            },
            label: this.$t('sensoreadings.LANG_SENSOR_TABLE_HEADTITLE9'),
          },
        ];
        ThresholdHead.forEach((d) => {
          this.fields.push(d);
        });
      } else {
        //hide threshold
        let i = 0;
        for (i = 0; i < 6; i++) {
          this.fields.pop();
        }
      }
    },
    RefreshBtn() {
      //this.floatPanel = initFloatPanel();
      this.updateSensorInfo();
    },
    updateSensorInfo() {
      let sensorReadings = this;
      sensorReadings.startLoader();
      return sensorReadings.$store
        .dispatch('sensoreadings/getSensors')
        .then(() => {
          sensorReadings.tabItemsKeep =
            sensorReadings.sensorsInfo.bmc.SensorRecords;
          if (parseInt(sensorReadings.sensorCategory, 16) != 0) {
            sensorReadings.tabItems = sensorReadings.tabItemsKeep.filter(
              (d) => {
                return (
                  d.SensorType == parseInt(sensorReadings.sensorCategory, 16)
                );
              }
            );
          } else {
            sensorReadings.tabItems = sensorReadings.tabItemsKeep;
          }
          sensorReadings.rChartData =
            sensorReadings.sensorsInfo.recordChartData;
        })
        .finally(() => {
          sensorReadings.updateChardData(sensorReadings.rChartData);
          sensorReadings.endLoader();
        });
    },
    failSensors({ message }) {
      this.errorToast(message);
    },
    doneSensors() {
      if (this.sensorsInfo.message.length != 0) {
        // system error
        this.errorToast(this.sensorsInfo.message);
        return;
      }
      //console.log('BMC ',this.sensorsInfo.bmc);
      this.tabItems = this.tabItemsKeep = this.sensorsInfo.bmc.SensorRecords;
      this.sensorsAmount = this.sensorsInfo.bmc.SensorRecords.length;
      this.sensorType = this.sensorsInfo.bmc.SensorType;
      this.sensorTypeOEM = this.sensorsInfo.bmc.SensorTypeOEM ?? null;
      //this.successToast(success);
      //console.log('recordData = ',this.sensorsInfo.recordChartData);
      this.rChartData = this.sensorsInfo.recordChartData;
    },
    getSensorInfo() {
      this.startLoader();
      return this.$store
        .dispatch(
          'sensoreadings/getSensors',
          localStorage.getItem('storedLanguage')
        )
        .then(this.doneSensors, this.failSensors)
        .finally(() => {
          //this.floatPanel = initFloatPanel();
          //console.log('getSensorInfo finally: ',this.floatPanel);
          this.endLoader();
        });
    },
    sortCompare(a, b, key) {
      if (key === 'status') {
        return this.sortStatus(a, b, key);
      }
    },
    onFiltered(filteredItems) {
      this.searchTotalFilteredRows = filteredItems.length;
    },
  },
};
</script>
<style scoped>
.line-chart .linechart-container {
  height: 19px !important;
}

.linechart-container {
  margin: 0;
  padding: 0;
  border: 0;
  /*font-size: 100%;
  font: inherit;
  vertical-align: baseline;*/
  height: 100%;
  position: relative;
}

.linechart-container .linechart .chart-region rect {
  fill: none;
  pointer-events: all;
}

.linechart-container .linechart .line-region rect {
  fill: none;
  pointer-events: all;
}

.normal {
  background: #24bd62;
}

.critical {
  background: #dc2929;
}

.warning {
  background: #fff100;
}

.unknown {
  background: #f5f5f0;
}

.line-chart {
  display: flex !important;
}

.float-panel-container {
  position: absolute;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}

.float-panel-container.active {
  display: block;
}

.float-panel-container.deactive {
  display: none;
}

/* Cover Panel */
.float-cover {
  z-index: 40;
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0.534;
  overflow: hidden;
  z-index: 40;
  box-sizing: border-box;
}

/* Panel */
.float-panel {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 41;
  box-sizing: border-box;
}

.float-panel > div {
  position: relative;
  width: 100%;
  height: 100%;
}

/* for FloatPanel */
.float-panel .icon-button_button {
  display: none;
}

.float-panel .icon-button_icon {
  position: absolute;
  z-index: 40;
  cursor: pointer;
}

/* close */
svg.close-circle {
  width: 36px;
  height: 36px;
}

svg.close-circle polyline {
  fill: none;
  stroke-width: 2px;
  stroke: rgb(0, 0, 0);
}
</style>
