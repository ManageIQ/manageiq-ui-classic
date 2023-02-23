export const tableSampleData = [
  {
    event_type: 'ReconfigVM_Task_Complete',
    source: 'EVM',
    group_level: 'detail',
    provider: {
      is_link: true,
      href: '/ems_infra/show/3',
      label: 'vcenter5.tivlab.raleigh.ibm.com',
    },
    message: 'ReconfigVM_Task Completed',
    host: {
      is_link: true,
      href: '/host/show/12',
      label: 'sapm-x3750d.',
    },
    source_vm: {
      is_link: true,
      href: '/vm_infra/show/221',
      label: 'ella-im-appliance-ia3.6.2-0214',
    },
    source_vm_location: 'ella-im-appliance-ia3.6.2-0214/ella-im-appliance-ia3.6.2-0214.vmx',
    id: '301239',
  },
  {
    event_type: 'VmReconfiguredEvent',
    source: 'VC',
    group_level: 'critical',
    provider: {
      is_link: true,
      href: '/ems_infra/show/3',
      label: 'vcenter5.tivlab.raleigh.ibm.com',
    },
    message: "Reconfigured ella-im-appliance-ia3.6.2-0214 on sapm-x3750d.tivlab.raleigh.ibm.com in RTP.  \n \nModified:  \n \nconfig.hardware.device(1000).device: (2000) -> (2000, 2001); \n\n Added:  \n \nconfig.hardware.device(2001): (key = 2001, deviceInfo = (label = \"Hard disk 2\", summary = \"67,108,864 KB\"), backing = (fileName = \"ds:///vmfs/volumes/63584ea1-58b41a5c-33d4-e41f13da18a0/ella-im-appliance-ia3.6.2-0214/ella-im-appliance-ia3.6.2-0214_1.vmdk\", datastore = 'vim.Datastore:21892878-a373-4166-b229-ddcf52ad3037:datastore-6028', backingObjectId = \"\", diskMode = \"persistent\", split = false, writeThrough = false, thinProvisioned = false, eagerlyScrub = false, uuid = \"6000C292-b248-a6ce-bd09-262eb608a774\", contentId = \"29dcdb4ddc4a2fd6d70b5098fffffffe\", changeId = <unset>, parent = null, deltaDiskFormat = <unset>, digestEnabled = false, deltaGrainSize = <unset>, deltaDiskFormatVariant = <unset>, sharing = \"sharingNone\", keyId = null, cryptoIntegrityProtectionType = <unset>), connectable = null, slotInfo = null, controllerKey = 1000, unitNumber = 1, numaNode = <unset>, capacityInKB = 67108864, capacityInBytes = 68719476736, shares = (shares = 1000, level = \"normal\"), storageIOAllocation = (limit = -1, shares = (shares = 1000, level = \"normal\"), reservation = 0), diskObjectId = \"700-2001\", vFlashCacheConfigInfo = null, iofilter = <unset>, vDiskId = null, virtualDiskFormat = <unset>, nativeUnmanagedLinkedClone = false, independentFilters = <unset>); \n\nconfig.extraConfig(\"scsi0:1.redo\"): (key = \"scsi0:1.redo\", value = \"\"); \n\n Deleted:  \n \n",
    host: {
      is_link: true,
      href: '/host/show/12',
      label: 'sapm-x3750d.',
    },
    source_vm: {
      is_link: true,
      href: '/vm_infra/show/221',
      label: 'ella-im-appliance-ia3.6.2-0214',
    },
    source_vm_location: 'ella-im-appliance-ia3.6.2-0214/ella-im-appliance-ia3.6.2-0214.vmx',
    id: '301238',
  },
];
