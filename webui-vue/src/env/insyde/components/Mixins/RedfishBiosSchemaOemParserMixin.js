import { parse } from 'date-fns';

export const OemAttributeParser = (node, attr, values, nodeList) =>
  OemAttributeParseRule.reduce(
    (currNode, rule) => rule(currNode, attr, values, nodeList),
    node
  );

const OemAttributeParseRule = [
  // transfer OEM Link
  (node, attr, values, nodelist) => {
    const oemLinks = attr?.Oem?.Link?.reduce((links, currLink) => {
      const value = nodelist?.[currLink]?.CurrentValue ?? undefined;
      if (!value) links.push(value);
      return links;
    }, []);
    if (oemLinks && oemLinks.length > 0) {
      node.value.default = node.value.init = oemLinks;
      node.type = 'ArrayString';
    }
    return node;
  },
  // date & time
  (node, attr) => {
    const oemDateTime = attr?.Oem?.DateTime;
    if (oemDateTime) {
      if (node.value.default)
        node.value.default = parse(node.value.default, oemDateTime, new Date());
      if (node.value.init)
        node.value.init = parse(node.value.init, oemDateTime, new Date());
      node.type = 'DateTime';
    }
    return node;
  },
  // bitmap
  (node, attr) => {
    const oemBitmaps = attr?.Oem?.Bitmap ?? {};
    // collect the description on each bit.
    const bitDescriptions = Object.keys(oemBitmaps).map(
      (bit) => `Bit ${bit} : ${oemBitmaps[bit]}`
    );
    if (bitDescriptions.length > 0) {
      node.text.bits = bitDescriptions;
      node.type = 'HexString';
    }
    return node;
  },
];
