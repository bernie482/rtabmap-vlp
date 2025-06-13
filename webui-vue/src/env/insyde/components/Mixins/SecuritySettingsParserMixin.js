export const CipherParser = (values) => {
  let type = values?.CIPHER_TYPE ?? 'ADVANCED';
  return { type };
};

export const NETServiceParser = (values) => {
  let httpsvc = values?.HTTP_SERVICE ?? true;
  let webuisvc = values?.WEBUI_SERVICE ?? true;
  let redfishsvc = values?.REDFISH_SERVICE ?? true;
  let ipmioverlansvc = values?.RMCP_SERVICE ?? true;
  return { httpsvc, webuisvc, redfishsvc, ipmioverlansvc };
};

export const HTTPSPortParser = (values) => {
  let httpsPort = values?.HTTPS_PORT ?? '443';
  return httpsPort;
};

export const IPBlockingParser = (values) => {
  let blocking = values?.IPBLOCKING ?? false;
  let badnumoftime = values?.BADTHRESHOLD ?? 3;
  let failinterval = values?.ATTEMPTINTERVAL ?? 20;
  let lockouttime = values?.LOCKOUTINTERVAL ?? 120;
  return { blocking, badnumoftime, failinterval, lockouttime };
};

export const PAMOrderParser = (values) => {
  let pamOrder = [];
  let allowValue = [];
  let pamArray = [];
  pamOrder = values?.PAMOrder ?? [];
  allowValue = values?.['PAMOrder@Redfish.AllowableValues'] ?? [];
  pamOrder.forEach(function (order, index) {
    pamArray.push([
      order, // Name
      index + 1, // Value
      allowValue.indexOf(order) != -1,
    ]);
  });
  return { pamArray };
};
