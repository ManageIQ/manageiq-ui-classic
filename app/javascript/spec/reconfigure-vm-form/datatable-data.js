export const driveHeaders = [
  { key: 'name', header: __('Name') },
  { key: 'hostFile', header: __('Host File') },
  { key: 'disconnect', header: __('Disconnect') },
  { key: 'action', header: __('Actions') },
];
export const driveRows = [
  {
    id: 'drive0',
    name: 'test drive',
    hostFile: 'teset',
    action: {
      is_button: true,
      title: 'Connect',
      text: 'Connect',
      alt: 'Connect',
      disabled: true,
      callback: 'connectDrives',
    },
    disconnect: {
      is_button: true,
      title: 'Disconnect',
      text: 'Disconnect',
      alt: 'Disconnect',
      disabled: false,
      callback: 'disconnectDrives',
    },
  },
];

export const networkHeaders = [
  { key: 'name', header: 'Name' },
  { key: 'mac', header: 'MAC address' },
  { key: 'vlan', header: 'vLan' },
  { key: 'edit', header: 'Edit' },
  { key: 'action', header: 'Action' },
];

export const networkRows = [
  {
    id: 'network0',
    name: 'nic1',
    mac: 'test',
    action: {
      is_button: true,
      title: 'Delete',
      text: 'Delete',
      alt: 'Delete',
      kind: 'danger',
      callback: 'deleteNetwork',
      disabled: false,
    },
    edit: {
      is_button: true,
      title: 'Edit',
      text: 'Edit',
      alt: 'Edit',
      kind: 'secondary',
      disabled: false,
      callback: 'editNetwork',
    },
    vlan: 'vm_network2',
  },
];

export const diskHeaders = [
  { key: 'name', header: 'Name' },
  { key: 'type', header: 'Type' },
  { key: 'size', header: 'Size' },
  { key: 'unit', header: 'Unit' },
  { key: 'mode', header: 'Mode' },
  { key: 'controller', header: 'Controller Type' },
  { key: 'dependent', header: 'Dependent' },
  { key: 'backing', header: 'Delete Backing' },
  { key: 'resize', header: 'Resize' },
  { key: 'action', header: 'Action' },
];

export const diskRows = [
  {
    id: 'disk0',
    name: 'test.vmdk',
    type: 'thin',
    size: '16',
    unit: 'GB',
    action: {
      is_button: true,
      title: 'Delete',
      text: 'Delete',
      alt: 'Delete',
      kind: 'danger',
      disabled: false,
      callback: 'deleteDisk',
    },
    dependent: 'No',
    mode: 'persistent',
    controller: 'None',
    backing: {
      is_toggle: true,
      labelText: 'Delete Backing',
      labelA: 'Yes',
      labelB: 'No',
      toggled: true,
      disabled: false,
    },
    resize: {
      is_button: true,
      title: 'Resize',
      text: 'Resize',
      alt: 'Resize',
      kind: 'secondary',
      callback: 'resizeDisk',
      disabled: false,
    },
  },
];
