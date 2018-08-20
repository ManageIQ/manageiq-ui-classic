export const testRecords = [
  {
    name: 'test 1',
    id: 1,
  },
  {
    name: 'test 2',
    id: 2,
  },
];

export const testDialogRecord = [
  {
    label: 'Test 1',
    id: 1,
  },
  {
    label: 'Test 2',
    id: 2,
  },
];

export const cloudTypesRecord = {
  credential_types: {
    embedded_ansible_credential_types: {
      testCredentialType: {
        label: 'test Credential type',
        type: 'cloud',
      },
    },
  },
};
export const sampleDropdowns = {
  dropdowns: {
    provision_playbooks: [
      { label: 'playbook 1', value: 1 },
    ],
  },
};

export const reduxStore = {
  catalogItem: {
    id: 1234,
    name: 'test',
    description: 'test',
    config_info: {
      provision: { cloud_credential_id: 123, cloud_type: 'Amazon' },
      retirement: {},
    },
  },
  dropdowns: {
    cloudTypes: [
      {
        label: 'Amazon',
        value: 'ManageIQ::Providers::EmbeddedAnsible::AutomationManager::AmazonCredential',
      },
      {
        label: 'Azure',
        value: 'ManageIQ::Providers::EmbeddedAnsible::AutomationManager::AzureCredential',
      },
      {
        label: 'Google Compute Engine',
        value: 'ManageIQ::Providers::EmbeddedAnsible::AutomationManager::GoogleCredential',
      },
      {
        label: 'OpenStack',
        value: 'ManageIQ::Providers::EmbeddedAnsible::AutomationManager::OpenstackCredential',
      },
      {
        label: 'Red Hat Virtualization',
        value: 'ManageIQ::Providers::EmbeddedAnsible::AutomationManager::RhvCredential',
      },
      {
        label: 'VMware',
        value: 'ManageIQ::Providers::EmbeddedAnsible::AutomationManager::VmwareCredential',
      },
    ],
    catalogs: [
      {
        label: 'Amazon Operations',
        value: '10000000000008',
      },
      {
        label: 'Ansible Demos',
        value: '10000000000001',
      },
    ],
    machineCredentials: [
      {
        label: 'Default Credential',
        value: '10000000000064',
      },
    ],
    repos: [
      {
        label: 'Sample Playbooks (jeromemarc)',
        value: '10000000000014',
      },
      {
        label: 'workflow-demo (jeromemarc)',
        value: '10000000000013',
      },
    ],
    dialogs: [
      {
        label: '101-vm-simple-rhel Dialog',
        value: '10000000000003',
      },
    ],
  },
};
export const sampleForm = {
  description: 'test',
  dialogOption: 'existing',
  dialog_id: '',
  display: false,
  long_description: '',
  name: 'test',
  provision_become_enabled: false,
  provision_cloud_credential_id: 123,
  provision_cloud_type: 'Amazon',
  provision_credential_id: '',
  provision_execution_ttl: '',
  provision_extra_vars: [],
  provision_hosts: 'localhost',
  provision_log_output: 'on_error',
  provision_playbook_id: '',
  provision_repository_id: '',
  provision_vault_credential_id: '',
  provision_verbosity: 0,
  remove_resources: 'no_without_playbook',
  retirement_become_enabled: false,
  retirement_cloud_credential_id: '',
  retirement_cloud_type: '',
  retirement_credential_id: '',
  retirement_execution_ttl: '',
  retirement_extra_vars: [],
  retirement_hosts: 'localhost',
  retirement_log_output: 'on_error',
  retirement_playbook_id: '',
  retirement_repository_id: '',
  retirement_vault_credential_id: '',
  retirement_verbosity: 0,
  service_template_catalog_id: '',
};

export const catalogActionCatalogItem = [
  {
    payload: {
      data: {},
    },
    type: '@@manageiq/ansibleCatalogItem/ LOAD_CATALOG_ITEM',
  },
];

export const catalogActionCatalogs = {
  payload: [
    ['test', 1],
    ['test 2', 2],
  ],
  type: '@@manageiq/ansibleCatalogItem/ Load catalogs',
};

export const catalogActionDialogs = [
  {
    payload: {
      resources: [
        {
          id: 1,
          name: 'test',
        },
      ],
    },
    type: '@@manageiq/ansibleCatalogItem/ Load dialogs',
  },
];

export const catalogActionRepos = {
  payload: {
    resources: [
      {
        id: 1,
        name: 'test',
      },
    ],
  },
  type: '@@manageiq/ansibleCatalogItem/ LOAD_REPOS',
};

export const catalogActionMachineCredentials = {
  payload: {
    resources: [
      {
        id: 1,
        name: 'test',
      },
    ],
  },
  type: '@@manageiq/ansibleCatalogItem/ LOAD_MACHINE_CREDENTIALS',
};

export const catalogActionCloudTypes = [
  {
    payload: [
      'test',
      'test1',
    ],
    type: '@@manageiq/ansibleCatalogItem/ LOAD_CLOUD_TYPES',
  },
];

export const catalogActionPlaybooks = [
  {
    payload: {
      playbookType: 'provision',
      resources: [
        {
          id: 1,
          name: 'test',
        },
      ],
    },
    type: '@@manageiq/ansibleCatalogItem/ LOAD_PLAYBOOKS',
  },
];

export const catalogActionLoadCloudCredentials = [
  {
    payload: {
      data: [],
      fieldType: 'provision',
    },
    type: '@@manageiq/ansibleCatalogItem/ LOAD_CLOUD_CREDENTIALS',
  },
];

export const catalogActionLoadCloudCredential = [
  {
    payload: {
      data: {},
    },
    type: '@@manageiq/ansibleCatalogItem/ LOAD_CLOUD_CREDENTIAL',
  },
];

export const catalogActionDuplicateDropdowns = [
  {
    payload: [
      'test',
      'test1',
    ],
    type: '@@manageiq/ansibleCatalogItem/ DUPLICATE_DROPDOWNS',
  },
];
export const catalogFormDefaults = {
  description: '',
  dialogOption: 'existing',
  dialog_id: '',
  display: false,
  long_description: '',
  name: '',
  provision_become_enabled: false,
  provision_cloud_credential_id: '',
  provision_cloud_type: '',
  provision_credential_id: '',
  provision_execution_ttl: '',
  provision_extra_vars: [],
  provision_hosts: 'localhost',
  provision_log_output: 'on_error',
  provision_playbook_id: '',
  provision_repository_id: '',
  provision_vault_credential_id: '',
  provision_verbosity: 0,
  remove_resources: 'no_without_playbook',
  retirement_become_enabled: false,
  retirement_cloud_credential_id: '',
  retirement_cloud_type: '',
  retirement_credential_id: '',
  retirement_execution_ttl: '',
  retirement_extra_vars: [],
  retirement_hosts: 'localhost',
  retirement_log_output: 'on_error',
  retirement_playbook_id: '',
  retirement_repository_id: '',
  retirement_vault_credential_id: '',
  retirement_verbosity: 0,
  service_template_catalog_id: '',
};
