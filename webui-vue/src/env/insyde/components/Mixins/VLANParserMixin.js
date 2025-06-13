export const VLANParser = (values) => {
  let vlan = values?.vlan ?? [];
  let failover = values?.failover ?? false;
  let actchn = values?.act_chl ?? 1;
  return { actchn, failover, vlan };
};
