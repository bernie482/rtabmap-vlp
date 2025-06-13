export const KRBParser = (values) => {
  let enabled = values?.KRB_ENABLE ?? '0';
  let addr = values?.KRB_ADDR ?? '';
  let port = values?.KRB_PORT ?? '';
  let realm = values?.KRB_REALM ?? '';
  return { enabled, addr, port, realm };
};
