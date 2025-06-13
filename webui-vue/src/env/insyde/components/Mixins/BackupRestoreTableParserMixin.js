export const BackupCheckParser = (values) => {
  let state = values?.BCK_CHK_STATUS ?? false;
  return { state };
};
