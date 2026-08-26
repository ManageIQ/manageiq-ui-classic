/** Tab labels used for catalog summary and edit pages */
const catalog = {
  basic: __('Basic Information'),
  detail: __('Details'),
  resource: __('Selected Resources'),
  request: __('Request Info'),
  provision: __('Provisioning'),
  retirement: __('Retirement'),
};

/** Tab labels used for Utilization page. */
const utilization = {
  summary: __('Summary'),
  details: __('Details'),
  report: __('Report'),
};

/** Tab labels used for request info contents under catalog page. */
const requestInfo = {
  requester: __('Requester'),
  purpose: __('Purpose'),
  service: __('Catalog'),
  environment: __('Environment'),
  hardware: __('Properties'),
  customize: __('Customize'),
  schedule: __('Schedule'),
  volumes: __('Volumes'),
  network: __('Network'),
};

/** Tab labels used for settings in application settings page. */
const settings = {
  details: __('Details'),
  cu_collection: __('C & U Collection'),
  tags: __('Tags'),
  replication: __('Replication'),
  help_menu: __('Help'),
  advanced: __('Advanced'),
};

const settingsTags = {
  my_company_categories: __('My Company Categories'),
  my_company_tags: __('My Company Tags'),
  import_tags: ('Import Tags'),
  import_variables: __('Import Variables'),
  map_tags: __('Map Tags'),
};

/** Tab labels used for settings zone tabs. */
const settingsZone = {
  evm_servers: __('Zone'),
  smartproxy_affinity: __('SmartProxy Affinity'),
  advanced: __('Advanced'),
};

/** Tab labels used for settings server tabs. */
const settingsServer = {
  server: __('Server'),
  authentication: __('Authentication'),
  workers: __('Workers'),
  custom_logos: __('Custom Logos'),
  advanced: __('Advanced'),
};

/** Tab labels used for diagnostics zone tabs. */
const diagnosticsZone = {
  roles_servers: __('Roles by Servers'),
  servers_roles: __('Servers by Roles'),
  server_list: __('Servers'),
  cu_repair: __('C & U Gap Collection'),
};

/** Tab labels used for diagnostics server tabs. */
const diagnosticsServer = {
  summary: __('Summary'),
  workers: __('Workers'),
  evm_log: __('ManageIQ Log'),
  audit_log: __('Audit Log'),
  production_log: process.env.NODE_ENV === 'production' ? __('Production Log') : __('Development Log'),
};

/** Tab labels used for diagnostics root tabs. */
const diagnosticsRoot = {
  zones: __('Zones'),
  roles_servers: __('Roles by Servers'),
  servers_roles: __('Servers by Roles'),
  server_list: __('Servers'),
  database: __('Database'),
};

/** Tab labels used for service show tabs. */
const service = {
  details: __('Details'),
  output: __('Output'),
  provisioning: __('Provisioning'),
  retirement: __('Retirement'),
  tower_job: __('Job'),
};

/** Tab labels used for report info / saved reports tabs. */
const report = {
  report_info: __('Report Info'),
  saved_reports: __('Saved Reports'),
};

const aeClass = {
  instances: __('Instances'),
  methods: __('Methods'),
  props: __('Properties'),
  schema: __('Schema'),
};

/** Tab labels used for the Dialog details page. */
const dialog = {
  sample_tab: __('Sample'),
  info_tab: __('Basic Info'),
};

/** Function to select the tab labels. */
export const labelConfig = (type) => {
  const configMap = {
    CATALOG_SUMMARY: catalog,
    CATALOG_EDIT: catalog,
    UTILIZATION: utilization,
    CATALOG_REQUEST_INFO: requestInfo,
    SETTINGS: settings,
    SETTINGS_TAGS: settingsTags,
    SETTINGS_ZONE: settingsZone,
    SETTINGS_SERVER: settingsServer,
    DIAGNOSTICS_ZONE: diagnosticsZone,
    DIAGNOSTICS_SERVER: diagnosticsServer,
    DIAGNOSTICS_ROOT: diagnosticsRoot,
    SERVICE: service,
    REPORT: report,
    AE_CLASS: aeClass,
    DIALOG: dialog,
  };

  return configMap[type];
};

/** Function to find the tab text from the selectedLabels and label */
export const tabText = (selectedLabels, label) => {
  if (selectedLabels) {
    return selectedLabels[label] ? selectedLabels[label] : label;
  }
  return __('Unknown');
};
