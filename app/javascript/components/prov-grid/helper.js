export const appendSortData = (data, headerItems) => headerItems.map((column) => ({
  ...column,
  sortData: data.find((item) => item.text === column.key).sort_data,
}));

/* Same as the one used in RequestInfoHelper's PROV_FIELD_TYPES */
export const ProvGridTypes = {
  vm: 'vm',
  host: 'host',
  pxeImg: 'pxe_img',
  isoImg: 'iso_img',
  ds: 'ds',
  template: 'template',
  vc: 'vc',
  windowImage: 'window_image',
};
