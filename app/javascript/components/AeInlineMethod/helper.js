export const namespaceUrls = {
  aeMethodsUrl: '/miq_ae_class/ae_methods',
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
  { key: 'delete', header: __('Delete') },
];

/** Function to format the method data needed for the data-table list. */
export const formatMethods = (methods) => (methods.map((item) => ({
  id: item.id.toString(),
  name: { text: item.name, icon: 'icon node-icon fa-ruby' },
  path: item.relative_path,
})));

const deleteMethodButton = () => ({
  is_button: true,
  title: __('Delete'),
  text: __('Delete'),
  alt: __('Delete'),
  kind: 'ghost',
  callback: 'removeMethod',
});

export const formatListMethods = (methods) => (methods.map((item, index) => ({
  id: item.id.toString(),
  name: { text: item.name, icon: 'icon node-icon fa-ruby' },
  path: item.relative_path,
  delete: deleteMethodButton(item, index),
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
