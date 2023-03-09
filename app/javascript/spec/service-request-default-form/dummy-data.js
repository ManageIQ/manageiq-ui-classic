export const sampleData = {
  states: [
    {
      label: 'Pending Approval',
      checked: true,
      value: 'pending_approval',
    },
    {
      label: 'Approved',
      checked: true,
      value: 'approved',
    },
    {
      label: 'Denied',
      checked: true,
      value: 'denied',
    },
  ],
  users: [
    {
      label: 'Administrator',
      value: 1,
    },
    {
      label: 'All',
      value: 'all',
    },
  ],
  selectedUser: 'all',
  types: [
    {
      label: 'All',
      value: 'all',
    },
    {
      label: 'Foreman Provision',
      value: 'provision_via_foreman',
    },
    {
      label: 'VM Provision',
      value: 'template',
    },
    {
      label: 'VM Clone',
      value: 'clone_to_vm',
    },
    {
      label: 'VM Publish',
      value: 'clone_to_template',
    },
    {
      label: 'Orchestration Stack Retire',
      value: 'orchestration_stack_retire',
    },
    {
      label: 'Physical Server Provision',
      value: 'provision_physical_server',
    },
    {
      label: 'Physical Server Firmware Update',
      value: 'physical_server_firmware_update',
    },
    {
      label: 'Service Retire',
      value: 'service_retire',
    },
    {
      label: 'Service Reconfigure',
      value: 'service_reconfigure',
    },
    {
      label: 'Service Provision',
      value: 'clone_to_service',
    },
    {
      label: 'VM Cloud Reconfigure',
      value: 'vm_cloud_reconfigure',
    },
    {
      label: 'VM Migrate',
      value: 'vm_migrate',
    },
    {
      label: 'VM Reconfigure',
      value: 'vm_reconfigure',
    },
    {
      label: 'VM Retire',
      value: 'vm_retire',
    },
  ],
  selectedType: 'all',
  timePeriods: [
    {
      label: 'Last 24 Hours',
      value: 1,
    },
    {
      label: 'Last 7 Days',
      value: 7,
    },
    {
      label: 'Last 365 Days',
      value: 365,
    },
  ],
  selectedPeriod: 7,
  reasonText: null,
  requestType: [
    'MiqProvisionConfiguredSystemRequest',
    'MiqProvisionRequest',
    'OrchestrationStackRetireRequest',
    'PhysicalServerProvisionRequest',
    'PhysicalServerFirmwareUpdateRequest',
    'ServiceRetireRequest',
    'ServiceReconfigureRequest',
    'ServiceTemplateProvisionRequest',
    'VmCloudReconfigureRequest',
    'VmMigrateRequest',
    'VmReconfigureRequest',
    'VmRetireRequest',
  ],
};
