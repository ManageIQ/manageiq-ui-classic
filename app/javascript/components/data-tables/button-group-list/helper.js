import { formatName } from '../../button-group/helper';

/** Function to generate a header item */
const headerItem = (key, header) => ({ key, header });

/** Function to generate table's header contents */
const tableHeader = (treeBox) => {
  const header = [];
  header.push(headerItem('name', __('Name')));
  if (treeBox === 'sand_tree') {
    header.push(headerItem('recType', __('Type')));
  }
  header.push(headerItem('hoverText', __('Description')));
  return header;
};

/** Function to add information to row items */
const rowInfo = (buttonIcon, buttonColor, name, hoverText, nodeKey) => ({
  name: { text: formatName(name), icon: buttonIcon, props: { style: { color: buttonColor } } },
  hoverText,
  nodeKey,
  clickable: true,
});

/** Function to generate table body's row contents */
const tableRows = (list, nodeKey, treeBox, treeId, type, recType) => list.map((item, index) => {
  const rItem = {
    id: index.toString(),
    treeBox,
    recType,
  };
  if (typeof (item) === 'string') {
    const stringItem = rowInfo('pficon pficon-folder-close', '', item, item, nodeKey);
    return { ...rItem, ...stringItem };
  }
  const objectItem = rowInfo(item.button_icon, item.button_color, item.name, item.description, `${treeId}_${type}-${item.id}`);
  return { ...rItem, ...objectItem };
});

/** Function to generate table's header and row contents */
export const tableData = ({
  list, nodeKey, treeBox, treeId, type, recType,
}) => {
  const headers = tableHeader(treeBox);
  const rows = tableRows(list, nodeKey, treeBox, treeId, type, recType);
  return { headers, rows };
};
