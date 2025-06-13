import { buildTreeNodeConfig } from '@/env/insyde/components/TreeView/TreeViewUtil';

const isAvailableDrive = (driveInfo) =>
  driveInfo.mediaType &&
  driveInfo.model &&
  (driveInfo.port || driveInfo.physicalLocation);
const sortDrivefunc = (a, b) => {
  let mediaTypeA = a.mediaType,
    mediaTypeB = b.mediaType,
    modelA = a.model,
    modelB = b.model,
    portA = a.port,
    portB = b.port,
    physicLocA = a.physicalLocation,
    physicLocB = b.physicalLocation;
  if (mediaTypeA !== mediaTypeB) return mediaTypeA.localeCompare(mediaTypeB);
  if (modelA !== modelB) return modelA.localeCompare(modelB);
  if (physicLocA != physicLocB) return physicLocA - physicLocB;
  if (portA && portB && portA != portB) return portA - portB;
  return 0;
};

const RedfishSataParserMixin = {
  computed: {
    sortedAvailDrives() {
      const vm = this;
      let availDrives = vm.drives.filter(isAvailableDrive);

      availDrives.sort(sortDrivefunc);
      return availDrives;
    },
  },
  methods: {
    buildTree(drives) {
      return tree(drives);
    },
  },
};

const convertReadableBytes = (bytes) => {
  const sizeLabels = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
    sizeLevel = Math.floor(Math.log(bytes) / Math.log(1024));

  return `${(bytes / Math.pow(1024, sizeLevel)).toFixed(3)} ${
    sizeLabels[sizeLevel]
  }`;
};

const tree = (drives) => {
  return drives.reduce((tree, drive) => {
    // search mediaTypeNode
    let mediaTypeNode = tree.find((node) => node.mediaType === drive.mediaType);
    if (!mediaTypeNode) {
      mediaTypeNode = buildTreeNodeConfig(
        {
          mediaType: drive.mediaType,
        },
        (node) => node.mediaType
      );
      tree.push(mediaTypeNode);
    }

    // search modelNode
    let modelNode = mediaTypeNode.childs.find(
      (node) => node.model === drive.model
    );
    if (!modelNode) {
      modelNode = buildTreeNodeConfig(
        {
          model: drive.model,
        },
        (node) => node.model
      );
      mediaTypeNode.childs.push(modelNode);
    }

    // search locationNode
    let locationNode = modelNode.childs.find(
      (node) =>
        node.port === drive.port ||
        node.physicalLocation === drive.physicalLocation
    );
    if (!locationNode) {
      locationNode = buildTreeNodeConfig(
        {
          port: drive.port,
          physicalLocation: drive.physicalLocation,
        },
        (node) => {
          return `Port: ${
            node.physicalLocation ? `(${node.physicalLocation})` : ''
          } ${node.port ? `(${node.port})` : ''}`;
        }
      );
      modelNode.childs.push(locationNode);
    }

    // search leafNode
    let leafNode = modelNode.childs.find(
      (node) =>
        node.serialNumber === drive.serialNumber &&
        node.firmwareRevision === drive.revision
    );
    if (!leafNode) {
      locationNode.childs.push(
        buildTreeNodeConfig(drive, (node) => [
          `Model: ${node.model}`,
          `Capacity: ${convertReadableBytes(node.capacityBytes)}`,
          `PhysicalLocation: ${node.physicalLocation}`,
          `MediaType: ${node.mediaType}`,
          `RotationSpeedRPM: ${
            node.mediaType === 'SSD' ? 'NA' : node.rotationSpeedRPM
          }`,
          `SerialNumber: ${node.serialNumber}`,
          `Firmware Revision: ${node.Revision}`,
        ])
      );
    }

    return tree;
  }, []);
};

export default RedfishSataParserMixin;
