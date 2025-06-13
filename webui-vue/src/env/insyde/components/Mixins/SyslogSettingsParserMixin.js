export const getsyslogbasicParser = (values) => {
  let enabled = values?.enableSyslog;
  let loglevel = values?.level.toString();
  return { enabled, loglevel };
};

export const getsyslogsrvParser = (values) => {
  let renabled = values?.enableRemote;
  let rsrv = values?.remoteServer != null ? values.remoteServer : '';
  let rfacility = values?.facility;
  let prop = values?.protocol;
  return { renabled, rsrv, rfacility, prop };
};
