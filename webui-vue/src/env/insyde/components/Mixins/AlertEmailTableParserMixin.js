export const CertCheckParser = (values) => {
  let state = values?.CRT_CHK_STATUS ?? false;
  return { state };
};

export const SMTPsrvInfoParser = (values) => {
  let smtpobj = values ?? null;
  let domain = values?.domain ?? '';
  let senderaddr = values?.senderAddress ?? '';
  let portnum = values?.port ?? 0;
  let username = values?.authUserName ?? '';
  let ssltls = values?.tlsEnable ?? false;
  let startls = values?.startTlsEnable ?? false;
  let authmethod = 0;
  let method = 0;
  if (values.authMethod < 2) {
    authmethod = values.authMethod;
  } else {
    authmethod = 2;
    method = values.authMethod;
  }
  return {
    smtpobj,
    domain,
    senderaddr,
    portnum,
    username,
    ssltls,
    startls,
    authmethod,
    method,
  };
};
