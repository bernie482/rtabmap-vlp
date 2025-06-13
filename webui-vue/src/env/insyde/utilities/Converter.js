import Validator from '@/env/insyde/utilities/Validator';

// math
var degree2radius = function (degree) {
  return (degree * Math.PI) / 180;
};

// string
var int2hexstr = function (num) {
  return parseInt(num).toString(16).toUpperCase();
};

// base64
var _keyStr =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
var Base64 = {
  encode: function (e) {
    var t = '';
    var n, r, i, s, o, u, a;
    var f = 0;
    e = UTF8.encode(e);
    while (f < e.length) {
      n = e.charCodeAt(f++);
      r = e.charCodeAt(f++);
      i = e.charCodeAt(f++);
      s = n >> 2;
      o = ((n & 3) << 4) | (r >> 4);
      u = ((r & 15) << 2) | (i >> 6);
      a = i & 63;
      if (isNaN(r)) {
        u = a = 64;
      } else if (isNaN(i)) {
        a = 64;
      }
      t =
        t +
        _keyStr.charAt(s) +
        _keyStr.charAt(o) +
        _keyStr.charAt(u) +
        _keyStr.charAt(a);
    }
    return t;
  },
  decode: function (e) {
    var t = '';
    var n, r, i;
    var s, o, u, a;
    var f = 0;
    e = e.replace(/[^A-Za-z0-9+/=]/g, '');
    while (f < e.length) {
      s = _keyStr.indexOf(e.charAt(f++));
      o = _keyStr.indexOf(e.charAt(f++));
      u = _keyStr.indexOf(e.charAt(f++));
      a = _keyStr.indexOf(e.charAt(f++));
      n = (s << 2) | (o >> 4);
      r = ((o & 15) << 4) | (u >> 2);
      i = ((u & 3) << 6) | a;
      t = t + String.fromCharCode(n);
      if (u != 64) {
        t = t + String.fromCharCode(r);
      }
      if (a != 64) {
        t = t + String.fromCharCode(i);
      }
    }
    t = UTF8.decode(t);
    return t;
  },
};

// utf8
var UTF8 = {
  encode: function (e) {
    e = e.replace(/\r\n/g, '\n');
    var t = '';
    for (var n = 0; n < e.length; n++) {
      var r = e.charCodeAt(n);
      if (r < 128) {
        t += String.fromCharCode(r);
      } else if (r > 127 && r < 2048) {
        t += String.fromCharCode((r >> 6) | 192);
        t += String.fromCharCode((r & 63) | 128);
      } else {
        t += String.fromCharCode((r >> 12) | 224);
        t += String.fromCharCode(((r >> 6) & 63) | 128);
        t += String.fromCharCode((r & 63) | 128);
      }
    }
    return t;
  },
  decode: function (e) {
    let t = '';
    let n = 0;
    let r = 0;
    let c2 = 0;
    let c3 = 0;
    while (n < e.length) {
      r = e.charCodeAt(n);
      if (r < 128) {
        t += String.fromCharCode(r);
        n++;
      } else if (r > 191 && r < 224) {
        c2 = e.charCodeAt(n + 1);
        t += String.fromCharCode(((r & 31) << 6) | (c2 & 63));
        n += 2;
      } else {
        c2 = e.charCodeAt(n + 1);
        c3 = e.charCodeAt(n + 2);
        t += String.fromCharCode(
          ((r & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63)
        );
        n += 3;
      }
    }
    return t;
  },
};

// xml
var xml2string = function (xml) {
  let result = '';
  if (xml != null) {
    result = new XMLSerializer().serializeToString(xml);
  }
  return result;
};

var xmlGetPropertyByPath = function (xml, target) {
  let result = null;
  if (xml != null && target != null) {
    let root = xml.documentElement;
    if (root != null) {
      let targets = root.getElementsByTagName(target);
      result = objectGetPropertyByPath(targets, '[0].firstChild.nodeValue');
    }
  }
  return result;
};

// object
var objectGetPropertyByPath = function (object, target) {
  if (
    object != null &&
    object != undefined &&
    target != null &&
    target != undefined
  ) {
    target = target.replace(/\[(\w+)\]/g, '.$1');
    target = target.replace(/^\./, '');
    let part = target.split('.');
    for (let i = 0, n = part.length; i < n; i++) {
      let param = part[i];
      if (param in object) {
        object = object[param];
      } else {
        return null;
      }
    }
    return object;
  } else {
    return null;
  }
};

// Time
var seconds2str = function (seconds) {
  let numdays = Math.floor(seconds / 86400);
  let numhours = Math.floor((seconds % 86400) / 3600);
  let numminutes = Math.floor(((seconds % 86400) % 3600) / 60);
  let numseconds = ((seconds % 86400) % 3600) % 60;

  if (numdays != 0)
    return (
      numdays +
      ' ' +
      top.topmenu.gLang.getStr('CONF_LOGIN_STR_WEB_UNIT_DAY') +
      ' ' +
      numhours +
      ' ' +
      top.topmenu.gLang.getStr('CONF_LOGIN_STR_WEB_UNIT_HOUR') +
      ' ' +
      numminutes +
      ' ' +
      top.topmenu.gLang.getStr('CONF_LOGIN_STR_WEB_UNIT_MINUTES') +
      ' ' +
      numseconds +
      ' ' +
      top.topmenu.gLang.getStr('CONF_LOGIN_STR_WEB_UNIT_SECOND')
    );
  else if (numhours != 0)
    return (
      numhours +
      ' ' +
      top.topmenu.gLang.getStr('CONF_LOGIN_STR_WEB_UNIT_HOUR') +
      ' ' +
      numminutes +
      ' ' +
      top.topmenu.gLang.getStr('CONF_LOGIN_STR_WEB_UNIT_MINUTES') +
      ' ' +
      numseconds +
      ' ' +
      top.topmenu.gLang.getStr('CONF_LOGIN_STR_WEB_UNIT_SECOND')
    );
  else if (numminutes != 0)
    return (
      numminutes +
      ' ' +
      top.topmenu.gLang.getStr('CONF_LOGIN_STR_WEB_UNIT_MINUTES') +
      ' ' +
      numseconds +
      ' ' +
      top.topmenu.gLang.getStr('CONF_LOGIN_STR_WEB_UNIT_SECOND')
    );
  else
    return (
      numseconds +
      ' ' +
      top.topmenu.gLang.getStr('CONF_LOGIN_STR_WEB_UNIT_SECOND')
    );
};

var monthToNumber = function (monthStr) {
  if (Validator.NumberRule(monthStr)) return parseInt(monthStr);
  if (typeof monthStr === 'string') {
    let result = [
      'JAN',
      'FEB',
      'MAR',
      'APR',
      'MAY',
      'JUN',
      'JUL',
      'AUG',
      'SEP',
      'OCT',
      'NOV',
      'DEC',
    ].findIndex((m) => monthStr.toUpperCase() === m);
    if (result != -1) return result + 1;
  }
};

var timeOffset2Seconds = function (sign, hour, minute) {
  let seconds = 0;
  if (Validator.NumberRule(hour)) seconds += parseInt(hour) * 60 * 60;
  if (Validator.NumberRule(minute)) seconds += parseInt(minute) * 60;
  return sign === '-' ? seconds * -1 : seconds;
};

// file
const sizeMountStr = ['K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'];
const bytesStr = 'Bytes';
const SIStr = 'B';
const IEC60027Str = 'iB';

var size2byte = function (size) {
  if (!(Validator.StringType(size) || Validator.NumberType(size))) return -1;
  // only include number
  if (Validator.NumberRule(size) || Validator.HexRule(size))
    return parseInt(size);
  let strLen = size.length;
  // include KB/MB/GB/TB/PB/EB/ZB/YB (SI)
  if (Validator.ContainSizeStr_SI(size)) {
    return (
      parseInt(size.slice(0, strLen - 2)) *
      Math.pow(10, (sizeMountStr.indexOf(size[strLen - 2]) + 1) * 3)
    );
  }
  // include KiB/MiB/GiB/TiB/PiB/EiB/ZiB/YiB (IEC 60027-2)
  else if (Validator.ContainSizeStr_IEC60027_2(size)) {
    return (
      parseInt(size.slice(0, strLen - 3)) *
      Math.pow(2, (sizeMountStr.indexOf(size[strLen - 3]) + 1) * 10)
    );
  } else {
    return -1;
  }
};

var commonSizeStr = function (bytes, fixed, interval, sizeStr) {
  let count = 0,
    divideSize,
    nextDivideSize;
  divideSize = nextDivideSize = interval;
  fixed = fixed || 0;
  while (bytes > nextDivideSize) {
    count++;
    divideSize = nextDivideSize;
    nextDivideSize = Math.pow(interval, count + 1);
  }
  if (count == 0) return [bytes, bytesStr];
  else
    return [
      (bytes / divideSize).toFixed(fixed),
      sizeMountStr[count - 1] + sizeStr,
    ];
};

var byteSI2size = function (bytes, fixed) {
  return commonSizeStr(bytes, fixed, 1000, SIStr);
};

var byteIEC60027_2size = function (bytes, fixed) {
  return commonSizeStr(bytes, fixed, 1024, IEC60027Str);
};

// network
var subnetmask2cidr = function (subnetMask) {
  if (Validator.IPV4SubnetMask(subnetMask)) {
    return subnetMask
      .split('.')
      .map(Number)
      .map((mask) => mask.toString(2))
      .join('')
      .replace(/0/g, '').length;
  }
  return null;
};

var cidr2subnetmask = function (cidr) {
  if (Validator.Range(1, 32, cidr)) {
    return cidr2binary(cidr)
      .map((block) => parseInt(block, 2))
      .join('.');
  }
  return null;
};

var ipv4GetNetworkId = function (ipv4, cidr) {
  cidr = cidr || -1;
  ipv4 = ipv4.split('/')[0].split('.').map(Number);
  if (!Validator.Range(0, 32, cidr)) return null;
  cidr = cidr2binary(cidr).map((cidr) => parseInt(cidr, 2));
  return ipv4.map((ipv4Part, index) => ipv4Part & cidr[index]).join('.');
};

var ipv4GetBroadcast = function (ipv4, cidr) {
  cidr = cidr || -1;
  ipv4 = ipv4.split('/')[0].split('.').map(Number);
  if (!Validator.Range(0, 32, cidr)) return null;
  let cidrBinary = cidr2binary(cidr);
  let hostBinary = cidrBinary.map((block) =>
    block.replace(/0/g, 'x').replace(/1/g, '0').replace(/x/g, '1')
  );
  let networkId = ipv4.map(
    (ipv4Part, index) => ipv4Part & parseInt(cidrBinary[index], 2)
  );
  let hostId = hostBinary.map((hostPart) => parseInt(hostPart, 2));

  return [0, 0, 0, 0]
    .map(function (num, index) {
      return networkId[index] | hostId[index];
    })
    .join('.');
};

// Internal Network
var cidr2binary = function (cidr) {
  return [0, 0, 0, 0]
    .map(function (num, index) {
      let count = cidr - index * 8;
      return count > 8 ? 8 : count > 0 ? count : 0;
    })
    .map((block) => ''.padStart(block, '1').padEnd(8, '0'));
};

export default {
  // math
  deg2rad: degree2radius,
  // string
  int2hexstr: int2hexstr,
  Base64: Base64,

  // xml
  xml2string: xml2string,
  xmlGetPropertyByPath: xmlGetPropertyByPath,

  // object
  objectGetPropertyByPath: objectGetPropertyByPath,

  // time
  seconds2str: seconds2str,
  monthToNumber: monthToNumber,
  timeOffsetToSeconds: timeOffset2Seconds,

  // file
  sizeStrToByteNumber: size2byte,
  ByteNumberToSizeSIStr: byteSI2size,
  ByteNumberToSizeIEC60027Str: byteIEC60027_2size,

  // network
  subnetMaskToCidr: subnetmask2cidr,
  cidrToSubnetMask: cidr2subnetmask,
  ipv4GetNetworkId: ipv4GetNetworkId,
  ipv4GetBroadcast: ipv4GetBroadcast,
};
