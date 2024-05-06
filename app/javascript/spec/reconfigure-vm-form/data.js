export const valueFromHelpers = {
  recordId: [12],
  requestId: 'new',
  roles: {
    allowMemoryChange: true,
    allowCpuChange: true,
    allowDiskChange: true,
    allowDiskSizeChange: true,
    allowNetworkChange: true,
    allowCdromsChange: true,
    isVmwareInfra: true,
    isVmwareCloud: false,
    isRedhat: true,
  },
  memory: {
    min: 1024,
    max: 10,
  },
  options: {
    controller_types: [
      'VirtualController',
      'ParaVirtualController',
      'VirtualBusController',
    ],
    vlan_options: [
      'vlan test 0',
      'vlan test 1',
      'vlan test 3',
    ],
    avail_adapter_names: [],
    host_file_options: [
      [
        'host file test 1.iso',
        'host file test 1.iso,18',
      ],
      [
        'host file test 2.iso',
        'host file test 2.iso,18',
      ],
      [
        'host file test 3.iso',
        'host file test 3.iso,18',
      ],
    ],
    socket_options: [1, 2, 3, 4],
    cores_options: [1, 2, 3, 4],
  },
};

export const valueFromHelpersTwo = {
  recordId: [12, 13],
  requestId: 'new',
  roles: {
    allowMemoryChange: true,
    allowCpuChange: true,
    allowDiskChange: true,
    allowDiskSizeChange: true,
    allowNetworkChange: true,
    allowCdromsChange: true,
    isVmwareInfra: true,
    isVmwareCloud: false,
    isRedhat: true,
  },
  memory: {
    min: 1024,
    max: 10,
  },
  options: {
    controller_types: [],
    vlan_options: [],
    avail_adapter_names: [],
    host_file_options: [],
    socket_options: [1, 2, 3, 4],
    cores_options: [1, 2, 3, 4],
  },
};

export const valueFromHelpersThree = {
  recordId: [12],
  requestId: 'new',
  roles: {
    allowMemoryChange: true,
    allowCpuChange: false,
    allowDiskChange: false,
    allowDiskSizeChange: false,
    allowNetworkChange: false,
    allowCdromsChange: true,
    isVmwareInfra: true,
    isVmwareCloud: false,
    isRedhat: true,
  },
  memory: {
    min: 1024,
    max: 10,
  },
  options: {
    controller_types: [
      'VirtualController',
      'ParaVirtualController',
      'VirtualBusController',
    ],
    vlan_options: [
      'vlan test 0',
      'vlan test 1',
      'vlan test 3',
    ],
    avail_adapter_names: [],
    host_file_options: [
      [
        'host file test 1.iso',
        'host file test 1.iso,18',
      ],
      [
        'host file test 2.iso',
        'host file test 2.iso,18',
      ],
      [
        'host file test 3.iso',
        'host file test 3.iso,18',
      ],
    ],
    socket_options: [1, 2, 3, 4],
    cores_options: [1, 2, 3, 4],
  },
};

export const responseDataOne = {
  objectIds: [
    12,
  ],
  memory: '16',
  memory_type: 'GB',
  socket_count: '4',
  cores_per_socket_count: '1',
  disks: [
    {
      hdFilename: 'disk-test-file',
      hdType: 'thin',
      hdMode: 'persistent',
      hdSize: '90',
      hdUnit: 'GB',
      cb_bootable: true,
      orgHdSize: '90',
      orgHdUnit: 'GB',
    },
  ],
  network_adapters: [
    {
      name: 'nic1',
      vlan: 'vm_network2',
      mac: '00:1a:4a:16:01:bc',
    },
  ],
  cdroms: [],
  orchestration_stack_id: null,
  cb_memory: false,
  cb_cpu: false,
};

export const responseDataTwo = {
  objectIds: [
    '13',
  ],
  memory: '2',
  memory_type: 'GB',
  socket_count: '2',
  cores_per_socket_count: '1',
  disks: [
    {
      hdFilename: 'disk test 2',
      hdType: 'thin',
      hdMode: 'persistent',
      hdSize: '16',
      hdUnit: 'GB',
      cb_bootable: null,
      orgHdSize: '16',
      orgHdUnit: 'GB',
    },
  ],
  network_adapters: [],
  cdroms: [
    {
      id: 39202,
      device_name: 'CD/DVD drive 1',
      filename: 'teset',
      type: 'cdrom-raw',
      storage_id: '',
    },
  ],
  orchestration_stack_id: null,
  cb_memory: false,
  cb_cpu: false,
};

export const responseDataThree = {
  objectIds: [
    '12', '13',
  ],
  memory: '4',
  memory_type: 'GB',
  socket_count: '3',
  cores_per_socket_count: '1',
  disks: [],
  network_adapters: [],
  cdroms: [],
  orchestration_stack_id: null,
  cb_memory: true,
  cb_cpu: true,
};
