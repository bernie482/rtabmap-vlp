export const advstateParser = (values) => {
  let config = {};
  config = values;
  return { config };
};

export const adParser = (values) => {
  let group = [];
  group = values?.group ?? [];
  return { group };
};
