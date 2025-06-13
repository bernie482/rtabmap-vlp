export const buildTreeNodeConfig = (attrs, display, childs) => {
  let node = {
    childs: childs ?? [],
  };
  if (attrs) Object.assign(node, attrs);
  // The _display attribute will be string or array of string
  // string : only show one string
  // array of string : show multiple string
  if (display) node._display = display(node);
  return node;
};
