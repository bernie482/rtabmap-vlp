// <!-- WEB_CONFIG_DEPEND_FEATURE_BEGIN:CONFIG_NM_OFFLOAD -->
function getDomainId(domainName) {
  let DomainsObj = {
    ACTotalPlatformPower: 0,
    CPUSubsystem: 1,
    MemorySubsystem: 2,
    DCTotalPlatformPower: 3,
    PCIe: 4,
  };
  return DomainsObj[domainName] ?? 0;
}

function durToSec(durations) {
  let DUR = durations != 'PT' ? durations : 'PT10S';
  const [, day, , hour, minute, second] = DUR.match(
    /P(\d+D)?(T{1,1}(\d+H)?(\d+M)?(\d+(\.\d+)?S)?)?/
  );
  /*
  console.log(
    day,
    hour,
    minute,
    second,
    durations.match(/P(\d+D)?(T{1,1}(\d+H)?(\d+M)?(\d+(\.\d+)?S)?)?/)
  );*/
  return (
    parseInt(day ?? 0) * 24 * 60 * 60 +
    parseInt(hour ?? 0) * 60 * 60 +
    parseInt(minute ?? 0) * 60 +
    parseInt(second ?? 0)
  );
}

export const domainsParser = (values) => {
  let statisticsObj = {};
  let domain = values?.Name ?? '';
  let powerArr = values?.Statistics;
  powerArr.forEach((d) => {
    if (d?.Name == 'Power') {
      statisticsObj['period'] = durToSec(d?.AveragingInterval ?? 'PT');
      statisticsObj['currentValue'] = d?.Current ?? 0;
      statisticsObj['minimumValue'] = d?.Min ?? 0;
      statisticsObj['maximumValue'] = d?.Max ?? 0;
      statisticsObj['averageValue'] = d?.Average ?? 0;
      statisticsObj['domain'] = getDomainId(domain);
    }
  });
  return statisticsObj;
};

export const domainCollectionParser = (values) => {
  let memArr = [];
  let tempArr = values?.Members ?? [];
  tempArr.forEach((d) => {
    let tmp = d['@odata.id'].split('/');
    let domainName = tmp[tmp.length - 1];
    memArr.push(domainName);
  });
  return { memArr };
};
// <!-- WEB_CONFIG_DEPEND_FEATURE_END:CONFIG_NM_OFFLOAD -->
