export const nmsuspendtimersParser = (values) => {
  let count = values?.NUM_PERIODS;
  let suspendTimersArr = values?.SUSPEND_PERIOD;
  return { count, suspendTimersArr };
};

export const policyEntryStateParser = (values) => {
  let state = '';
  state = values?.Status?.State ?? 'Disabled';
  return state;
};

export const policyMembersParser = (values) => {
  let existArr = new Array(256);
  let memArr = values?.Members ?? [];
  memArr.forEach((d) => {
    let tmpArr = d['@odata.id'].split('/');
    let id = tmpArr[tmpArr.length - 1];
    existArr[parseInt(id)] = true;
  });
  return existArr;
};
// <!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN:CONFIG_NM_OFFLOAD -->
function getDomainName(data) {
  let tranferDomainID = {
    ACTotalPlatformPower: 0,
    CPUSubsystem: 1,
    MemorySubsystem: 2,
    DCTotalPlatformPower: 3,
    PCIe: 4,
  };
  let str = [];
  str = data.split('/');
  return tranferDomainID[str[str.length - 1]];
}

export const policyEntryParser = (values) => {
  let actChangeState = values?.Actions['#NmPolicy.ChangeState']?.target;
  let actResetStatistics = values?.Actions['#NmPolicy.ResetStatistics']?.target;
  let period = values?.StatisticsReportingPeriod;
  let plyObj = {};
  plyObj['id'] = values?.Id;
  plyObj['domain'] = getDomainName(values?.Domain['@odata.id']);
  plyObj['enable'] = values?.Status?.State != 'Enabled' ? 0 : 1;
  plyObj['shutdown'] =
    values?.LimitException == 'HardPowerOff' || values?.LimitException == 'Oem'
      ? 1
      : 0;
  plyObj['logevent'] =
    values?.LimitException == 'LogEventOnly' || values?.LimitException == 'Oem'
      ? 1
      : 0;
  plyObj['powerlimit'] = values?.Limit;
  let policyID = values?.Id;
  let domain = values?.Domain['@odata.id'];
  let enabled = values?.Status?.State != 'Enabled' ? false : true;
  let limitException = values?.LimitException;
  let limit = values?.Limit;
  return {
    plyObj,
    actChangeState,
    actResetStatistics,
    policyID,
    domain,
    enabled,
    limitException,
    limit,
    period,
  };
};

export const policyCollectionParser = (values) => {
  let membersArr = values?.Members ?? [];
  return { membersArr };
};
// <!-- WEB_CONFIG_DEPEND_FEATURE_END:CONFIG_NM_OFFLOAD -->
// <!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN:!CONFIG_NM_OFFLOAD -->
export const nmpolicyParser = (values) => {
  let policyArr = [];
  let dataArr = values?.POLICY ?? [];
  dataArr.forEach((d) => {
    delete d['COMP_CODE'];
    let policy = {};
    policy['id'] = d?.NM_POLICY;
    policy['domain'] = d?.NM_DOMAIN;
    //policy['timers'] = d?.NUM_PERIODS; // expect to 2023
    policy['enable'] = d?.NM_ENABLED;
    policy['shutdown'] = d?.NM_SHUTDOWN;
    policy['logevent'] = d?.NM_ALERT;
    policy['powerlimit'] = d?.NM_POWERLIMIT;
    policyArr.push(policy);
  });
  return { policyArr };
};
// <!-- WEB_CONFIG_DEPEND_FEATURE_END:!CONFIG_NM_OFFLOAD -->
