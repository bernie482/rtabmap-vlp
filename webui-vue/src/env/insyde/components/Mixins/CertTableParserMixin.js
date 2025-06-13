export const genCertParser = (values) => {
  let msg = values?.msg;
  let result = values?.result;
  return { msg, result };
};

export const uploadCertParser = (values) => {
  let cert = values?.CERT;
  let key = values?.KEY;
  let result = values?.RESULT;
  return { cert, key, result };
};

export const certExpireDateParser = (values) => {
  let from = values?.VALID_FROM;
  let until = values?.VALID_UNTIL;
  let exist = values?.CERT_EXIST;
  return { from, until, exist };
};

export const getCertInfoParser = (values) => {
  let data = [];
  let errmsg = '';
  let decodeStr = '';
  let status = values?.SSLCERT?.CGI_STATUS;
  if (status != 1) {
    errmsg = 'Get SSL Certificate Failed';
  } else {
    let contant = values?.SSLCERT?.CONTENT;
    for (let i = 0, len = contant.length; i < len; i++) {
      decodeStr += atob(contant[i].CERT);
    }
    data = parseView(decodeStr);
  }

  function parseView(decodeStr) {
    var group = decodeStr.split(/\n/);
    var divs = [];
    var div = '';

    group.forEach((str) => {
      if (/\n/.test(str)) {
        div += str;
      } else {
        if (div) {
          divs.push(div);
          div = '';
        }
        divs.push(str);
      }
    });

    // filter out empty
    divs = divs.map((chunk) => {
      return chunk;
    });
    divs = divs.filter((chunk) => {
      return chunk;
    });
    return divs;
  }

  return { data, errmsg };
};
