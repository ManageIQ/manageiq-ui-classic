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
}

/** Function to select the tab labels. */
export const labelConfig = (type) => {
  const configMap = {
    CATALOG_SUMMARY: catalog,
    CATALOG_EDIT: catalog,
    UTILIZATION: utilization,
    CATALOG_REQUEST_INFO: requestInfo,
    SETTINGS: settings,
    SETTINGS_TAGS: settingsTags,
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
