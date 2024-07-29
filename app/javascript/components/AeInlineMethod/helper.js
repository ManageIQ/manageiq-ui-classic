export const namespaceUrls = {
  aeMethodsUrl: '/miq_ae_class/ae_methods',
  aeMethodOperationsUrl: '/miq_ae_class/ae_method_operations',
  aeDomainsUrl: '/miq_ae_class/ae_domains',
};

export const noSelect = 'NONE';

/** Headers needed for the data-table list. */
export const methodSelectorHeaders = [
  {
    key: 'name',
    header: 'Name',
  },
  {
    key: 'path',
    header: 'Relative path',
  },
];

export const methodListHeaders = [
  ...methodSelectorHeaders,
  { key: 'remove', header: __('Remove'), actionCell: true },
];

/** Function to format the method data needed for the data-table list. */
export const formatMethods = (methods) => (methods.map((item) => ({
  id: item.id.toString(),
  name: { text: item.name, icon: 'icon node-icon fa-ruby' },
  path: item.relative_path,
})));

const removeMethodButton = () => ({
  is_button: true,
  actionCell: true,
  title: __('Remove'),
  text: __('Remove'),
  alt: __('Remove'),
  kind: 'danger',
  callback: 'removeMethod',
});

export const formatListMethods = (methods) => (methods.map((item, index) => ({
  id: item.id.toString(),
  name: { text: item.name, icon: 'icon node-icon fa-ruby' },
  path: item.relative_path,
  remove: removeMethodButton(item, index),
})));

/** Function to return a conditional URL based on the selected filters. */
export const searchUrl = (selectedDomain, text) => {
  const queryParams = [];
  if (selectedDomain && selectedDomain !== noSelect) {
    queryParams.push(`domain_id=${selectedDomain}`);
  }
  if (text && text !== noSelect) {
    queryParams.push(`search=${text}`);
  }
  const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
  return `${namespaceUrls.aeMethodsUrl}${queryString}`;
};
