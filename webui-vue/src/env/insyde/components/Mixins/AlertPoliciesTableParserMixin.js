import i18n from '@/i18n';

export const ParmParser = (values) => {
  let nicinfo = values?.NIC ?? [];
  let action = values?.PolicyAction ?? [];
  let workchn = values?.act_chl ?? 1;
  let failover = values?.failover ?? false;
  let groupNumberMAX = values?.GroupNumber ?? 15;
  let selectorMAX = values?.DestSel ?? 5;
  let stringkeyMAX = values?.AlertStringKey ?? 40;
  return {
    nicinfo,
    action,
    workchn,
    failover,
    groupNumberMAX,
    selectorMAX,
    stringkeyMAX,
  };
};

export const policyTabParser = (values) => {
  let PLCYRecords = [];
  let plcyValues = values?.Policies_TABLE ?? {};
  let entryRows = Object.keys(plcyValues).length;
  for (let idx = 0; idx < entryRows; idx++) {
    let preTag = 'E' + (idx + 1).toString(10);
    let values = plcyValues[preTag] ?? '';
    let record = {
      entryNumber: idx + 1,
      groupNumber:
        parseInt(values.substr(4, 1), 16) != 0
          ? parseInt(values.substr(4, 1), 16)
          : i18n.t('global.status.na'),
      enableAlert:
        parseInt(values.substr(5, 1), 16) & 0x8
          ? i18n.t('global.status.yes')
          : i18n.t('global.status.no'),
      policyAct: i18n.t(
        'pageAlertPolicies.CONFALERT_POLICIES_ACTION_POLICY' +
          (parseInt(values.substr(5, 1), 16) & 0x7).toString()
      ),
      LANChn:
        parseInt(values.substr(2, 1), 16) != 0
          ? parseInt(values.substr(2, 1), 16)
          : i18n.t('global.status.na'),
      DESTSelector:
        parseInt(values.substr(3, 1), 16) != 0
          ? parseInt(values.substr(3, 1), 16)
          : i18n.t('global.status.na'),
      EvtSpecAlertStr:
        parseInt(values.substr(0, 1), 16) & 0x8
          ? i18n.t('global.status.yes')
          : i18n.t('global.status.no'),
      AlertStrKey:
        (parseInt(values.substr(0, 2), 16) & 0x7f) != 0
          ? parseInt(values.substr(0, 2), 16) & 0x7f
          : i18n.t('global.status.na'),
      PolicyValue: plcyValues[preTag],
    };
    PLCYRecords.push(record);
  }
  return PLCYRecords;
};

export const stringsParser = (values) => {
  let stringKeyArr = values?.StringKey ?? [];
  let stringTab = [];
  stringKeyArr.forEach((d) => {
    let tmp = {};
    tmp['number'] = d.idx;
    tmp['strings'] = d.string;
    stringTab.push(tmp);
  });
  return stringTab;
};
