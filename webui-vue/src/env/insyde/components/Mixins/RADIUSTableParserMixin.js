// utf8
let UTF8 = {
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
    var t = '';
    var n = 0;
    //var c1 = 0;
    var c2 = 0;
    var r = 0;
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
        let c3 = e.charCodeAt(n + 2);
        t += String.fromCharCode(
          ((r & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63)
        );
        n += 3;
      }
    }
    return t;
  },
};
var _keyStr =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
let Base64 = {
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
let Converter = {
  Base64: Base64,
};

export const netstatParser = (values) => {
  let usedPorts = [];
  if (values['RESULT'] == 'FAIL') {
    // fail
  } else {
    // result ok
    let states = Converter.Base64.decode(values['NETSTAT']).split('tcp');
    states.splice(0, 1); // remove title row
    states[states.length - 1] = states[states.length - 1].split('udp')[0]; // remove udp items
    states.forEach((state) => {
      let port = parseInt(state.match(/:(\d+)/)[1]);
      if (port !== isNaN && !usedPorts.includes(port)) usedPorts.push(port);
    });
  }
  return {
    usedPorts,
  };
};

export const RADIUSParser = (values) => {
  let cfgobj = values ?? null;
  let enabled = values?.enable ?? false;
  let v4addr = values?.ipv4Address ?? '0.0.0.0';
  let v6addr = values?.ipv6Address ?? '::';
  let port = values?.port ?? 1812;
  let vendor = values?.vendor ?? null;
  let admin = vendor?.admin ?? '';
  let oper = vendor?.operator ?? '';
  let user = vendor?.user ?? '';
  let callback = vendor?.callback ?? '';
  return {
    cfgobj,
    enabled,
    v4addr,
    v6addr,
    port,
    admin,
    oper,
    user,
    callback,
  };
};
