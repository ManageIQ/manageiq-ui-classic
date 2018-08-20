import PropTypes from 'prop-types';

export const DROPDOWN_OPTIONS = {
  LOGGING_OUTPUT: [
    { label: __('On Error'), value: 'on_error' },
    { label: __('Always'), value: 'always' },
    { label: __('Never'), value: 'never' },
  ],
  VERBOSITY: [
    { label: __('0 (Normal)'), value: 0 },
    { label: __('1 (Verbose)'), value: 1 },
    { label: __('2 (More Verbose)'), value: 2 },
    { label: __('3 (Debug)'), value: 3 },
    { label: __('4 (Connection Debug)'), value: 4 },
    { label: __('5 (WinRM Debug)'), value: 5 },
  ],
  DIALOG: [
    { label: __('Use Existing'), value: 'existing' },
    { label: __('Create New'), value: 'new' },
  ],
  PLAYBOOK: [
    { label: __('No'), value: 'no_with_playbook' },
    { label: __('Before Playbook runs'), value: 'pre_with_playbook' },
    { label: __('After Playbook runs'), value: 'post_with_playbook' },
  ],
};
export const FORM_DEFAULTS = {
  name: '',
  description: '',
  display: false,
  long_description: '',
  service_template_catalog_id: '',
  remove_resources: 'no_without_playbook',
  dialog_id: '',
  dialogOption: 'existing',
};

export const ANSIBLE_FIELDS = ['repository_id',
  'playbook_id', 'credential_id', 'vault_credential_id',
  'cloud_type', 'cloud_credential_id', 'execution_ttl', 'hosts',
  'become_enabled', 'verbosity', 'log_output', 'extra_vars'];

export const DEFAULT_PLACEHOLDER = __('<Choose>');

export const CATALOG_ITEM_PROPS = {
  ansibleCatalog: PropTypes.shape({}).isRequired,
  loadCatalogs: PropTypes.func.isRequired,
  loadDialogs: PropTypes.func.isRequired,
  loadRepos: PropTypes.func.isRequired,
  loadPlaybooks: PropTypes.func.isRequired,
  loadCloudCredential: PropTypes.func.isRequired,
  loadCredentials: PropTypes.func.isRequired,
  loadCloudTypes: PropTypes.func.isRequired,
  loadCatalogItem: PropTypes.func.isRequired,
  duplicateDropdowns: PropTypes.func.isRequired,
  region: PropTypes.number.isRequired,
  catalogItemFormId: PropTypes.number,
  availableCatalogs: PropTypes.array,
};

export const PROVISIONING_FORM_FIELDS = {
  repository_id: '',
  playbook_id: '',
  credential_id: '',
  vault_credential_id: '',
  cloud_type: '',
  cloud_credential_id: '',
  execution_ttl: '',
  hosts: 'localhost',
  become_enabled: false,
  verbosity: 0,
  log_output: 'on_error',
  extra_vars: [],
};
export const ANSIBLE_PLAYBOOK_FIELDS_PROPS = {
  region: PropTypes.number,
  prefix: PropTypes.string,
  loadPlaybooks: PropTypes.func.isRequired,
  loadCloudCredentials: PropTypes.func.isRequired,
  formValues: PropTypes.shape({}).isRequired,
  initialValues: PropTypes.shape({}).isRequired,
  changeField: PropTypes.func.isRequired,
  addExtraVars: PropTypes.func.isRequired,
  children: PropTypes.node,
};
