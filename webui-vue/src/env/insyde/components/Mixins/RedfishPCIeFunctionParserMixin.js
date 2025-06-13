import { buildTreeNodeConfig } from '@/env/insyde/components/TreeView/TreeViewUtil';

const isUnknownStr = (val) =>
  typeof val == 'string' && val.toUpperCase() == 'UNKNOWN(0000H)';
const slotRe = new RegExp(/^slot/i);
const isSlotComponent = (val) => typeof val == 'string' && slotRe.test(val);

const isAvailableComponent = (pcieInfo) =>
  !isSlotComponent(pcieInfo.component) ||
  (pcieInfo.deviceId && !isUnknownStr(pcieInfo.deviceId)) ||
  (pcieInfo.vendorId && !isUnknownStr(pcieInfo.vendorId)) ||
  (pcieInfo.subsystemId && !isUnknownStr(pcieInfo.subsystemId)) ||
  (pcieInfo.subsystemVendorId && !isUnknownStr(pcieInfo.subsystemVendorId));

const sortPCIeComponentFunc = (a, b) => {
  let pathA = a.component,
    pathB = b.component,
    posA = pathA.indexOf('Slot'),
    posB = pathB.indexOf('Slot');
  if (posA != posB && (posA == 0 || posB == 0)) return posA == 0 ? 1 : -1;
  if (pathA == pathB) {
    // same component
    let classCodeA = a.classCode,
      classCodeB = b.classCode;
    const unknownRe = new RegExp(/^Unknown/i);
    const unassignedRe = new RegExp(/^Unassigned class/i);

    if (classCodeA != classCodeB) {
      if (unknownRe.test(classCodeB) || unassignedRe.test(classCodeB))
        return -1;
      else if (unknownRe.test(classCodeA) || unassignedRe.test(classCodeA))
        return 1;
      else return parseInt(classCodeA, 16) - parseInt(classCodeB, 16);
    } else {
      // same class code
      let deviceIdA = a.deviceId,
        deviceIdB = b.deviceId;
      if (deviceIdA == deviceIdB) return 0; // same deviceId
      return parseInt(deviceIdA, 16) - parseInt(deviceIdB);
    }
  } else {
    return pathA.localeCompare(pathB);
  }
};

const RedfishPCIeFunctionParserMixin = {
  computed: {
    sortedAvailPCIeComponents() {
      const vm = this;
      let availComponents = vm.pcieComponents
        .filter(isAvailableComponent)
        .map((pcieInfo) => {
          // converter
          // Class Code
          if (pcieInfo.classCode && pcieInfo.classCode?.length > 2)
            pcieInfo.classCode = pcieInfo.classCode.substr(2, 2);

          // Component Path
          if (!pcieInfo.component) pcieInfo.component = 'CPU0/IIO';

          return pcieInfo;
        });
      availComponents.sort(sortPCIeComponentFunc);
      return availComponents;
    },
  },
  methods: {
    buildTree(components) {
      return tree(components);
    },
  },
};

const tree = (components) => {
  return components.reduce((tree, component) => {
    // search componentNode
    let compNode = tree.find((node) => node.name === component.component);
    if (!compNode) {
      compNode = buildTreeNodeConfig(
        {
          name: component.component,
        },
        (node) => node.name
      );
      tree.push(compNode);
    }

    // search classNode
    let classNode = compNode.childs.find(
      (node) => node.classCode === component.classCode
    );
    if (!classNode) {
      classNode = buildTreeNodeConfig(
        {
          class: component.class,
          classCode: component.classCode,
        },
        (node) => node.class
      );
      compNode.childs.push(classNode);
    }

    // search deviceNode
    let deviceNode = classNode.childs.find(
      (node) => node.deviceId === component.deviceId
    );
    if (!deviceNode) {
      deviceNode = buildTreeNodeConfig(
        {
          device: component.device,
          deviceId: component.deviceId,
        },
        (node) => node.device
      );
      classNode.childs.push(deviceNode);
    }

    // search leafNode
    if (!deviceNode.childs.find((node) => node.bdf === component.bdf)) {
      deviceNode.childs.push(
        buildTreeNodeConfig(
          {
            bdf: component.bdf,
            vendor: component.vendor,
            class: component.class,
            classCode: component.classCode,
          },
          (node) => [node.bdf, node.vendor, node.class]
        )
      );
    }

    return tree;
  }, []);
};

export default RedfishPCIeFunctionParserMixin;
