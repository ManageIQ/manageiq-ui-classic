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

/** Function to select the tab labels. */
export const labelConfig = (type) => {
  const configMap = {
    CATALOG_SUMMARY: catalog,
    CATALOG_EDIT: catalog,
    UTILIZATION: utilization,
    CATALOG_REQUEST_INFO: requestInfo,
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
