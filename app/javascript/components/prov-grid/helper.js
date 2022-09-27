export const appendSortData = (data, headerItems) => headerItems.map((column) => ({
  ...column,
  sortData: data.find((item) => item.text === column.key).sort_data,
}));
