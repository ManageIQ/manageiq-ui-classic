/** Function to generate a header item */
const headerItem = (key, header) => ({ key, header });

/** Function to generate table's header contents */
const tableHeaders = () => {
  const header = [];
  header.push(headerItem('objectType', __('Object Types')));
  return header;
};

/** Function to generate table body's row contents */
const tableRows = (list) => list.map((item, index) => ({
  id: index.toString(),
  objectType: item[0],
  nodeKey: `xx-${item[1]}`,
  clickable: true,
}));

/** Function to generate table's header and row contents */
export const tableData = ({ list }) => {
  const headers = tableHeaders();
  const rows = tableRows(list);
  return { headers, rows };
};
