import i18n from '@/i18n';
export const DDNSParser = (values) => {
  let enabled = values?.enable;
  let enabledtsig = values?.enableTsig;
  let dns = values?.dnsServer;
  let domain = values?.domainName;
  let host = values?.hostname;
  let tsigKeyname =
    `${i18n.t('pageDynamicDNS.LANG_CONF_DDNS_KEY_INFO_NAME')}: ` +
    values?.tsigKeyName?.name +
    `${i18n.t('pageDynamicDNS.LANG_CONF_DDNS_KEY_INFO_UPLOAD_TIME')} ` +
    new Date(values?.tsigKeyName?.time);
  return { enabled, enabledtsig, dns, domain, host, tsigKeyname };
};
