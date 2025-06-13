// for insyde
export const roleId2PrivilegeLevel = (p) => {
  const privilegeTable = {
    NoAccess: 0x0f,
    Callback: 1,
    ReadOnly: 2,
    User: 2,
    Operator: 3,
    Administrator: 4,
  };
  return privilegeTable[p];
};

export const privilegeLevel2RoleId = (p) => {
  const privilegeTable = {
    NoAccess: 0x0f,
    Callback: 1,
    ReadOnly: 2,
    Operator: 3,
    Administrator: 4,
  };
  return Object.keys(privilegeTable).find((key) => privilegeTable[key] === p);
};

// basic
export const objectDeepSet = (obj, path, value) => {
  let a = path.split('.');
  let o = obj;
  while (a.length - 1) {
    let n = a.shift();
    if (!(n in o)) o[n] = {};
    o = o[n];
  }
  o[a[0]] = value;
};

export const isObject = (item) => {
  return item && typeof item === 'object' && !Array.isArray(item);
};

export const objectDeepMerge = (target, ...sources) => {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        objectDeepMerge(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return objectDeepMerge(target, ...sources);
};

export const getInsydeTimestamp = (d) => {
  return d.toISOString().split('.')[0];
};

import axios from 'axios';
export const fileDownloader = ({
  url,
  filename = 'Download',
  mineType = 'application/octet-stream',
  method = 'get',
}) => {
  // HACK: bind method by string
  let api = axios.get;
  let str_method = method.toUpperCase();
  if (str_method == 'POST') api = axios.post;
  if (str_method == 'PUT') api = axios.put;
  if (str_method == 'PATCH') api = axios.patch;
  if (str_method == 'DELETE') api = axios.delete;

  api(url, { responseType: 'blob' })
    .then((response) => {
      const blob = new Blob([response.data], { type: mineType });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      URL.revokeObjectURL(link.href);
    })
    .catch(console.error);
};

export const cloneClass = (Target, Source) => {
  return Object.defineProperties(
    Object.setPrototypeOf(Target, Object.getPrototypeOf(Source)),
    {
      ...Object.getOwnPropertyDescriptors(Source),
      prototype: {
        value: Object.create(
          Object.getPrototypeOf(Source.prototype),
          Object.getOwnPropertyDescriptors(Source.prototype)
        ),
      },
    }
  );
};
