/** Function to generate table's header contents */
const tableHeaders = () => [
  { key: 'name', header: __('Name') },
  { key: 'hoverText', header: __('Description') },
];

const generateNodeKey = (nodeType, itemId, treeId) => (nodeType.split('-')[1] === 'ub' ? `${nodeType}_cb-${itemId}` : `${treeId}_cb-${itemId}`);

/** Function to generate table body's row contents */
const tableRows = (list, nodeType, treeId, treeBox) => list.map((item, index) => ({
  id: index.toString(),
  name: { text: item.name, icon: item.button_icon, props: { style: { color: item.button_color } } },
  hoverText: item.description,
  treeBox,
  nodeKey: generateNodeKey(nodeType, item.id, treeId),
  clickable: true,
}));

/** Function to generate table's header and row contents */
export const tableData = (
  {
    list, nodeType, treeId, treeBox,
  }
) => {
  const headers = tableHeaders();
  const rows = tableRows(list, nodeType, treeId, treeBox);
  return { headers, rows };
};
