import { rowData } from '../../miq-data-table/helper';

/** Converts the header items from type [string, string][] to {key:string, header: string}[]. */
const convertHeader = (headerItems) => headerItems.map((item) => ({ key: item[0], header: item[1] }));

/** Attributes needed for a button. */
const buttonData = (item) => ({
  alt: __('Queue Report'),
  disabled: false,
  is_button: true,
  onclick: {
    remote: true,
    action: {
      name: 'miqQueueReport',
      id: item.id,
    },
  },
  text: __('Queue Report'),
  title: __('Queue Report'),
});

/** Function to generate the values of the attribute cell for an item in rows.  */
const cellData = (item, headerKeys) => {
  const cells = [];
  headerKeys.forEach((hKey) => {
    const data = (hKey === 'action') ? buttonData(item) : { text: item[hKey] };
    cells.push(data);
  });
  return cells;
};

/** Additional attribute named cell and its values are required to print the data at MiqTableCell. */
const convertRows = (rowItems, headerKeys) => rowItems.map((item) => {
  item.cells = cellData(item, headerKeys);
  return item;
});

/** Function to change the type of rows and columns to be used at MiqDataTable. */
export const tableData = (headerItems, rowItems) => {
  const miqColumns = convertHeader(headerItems);
  const headerKeys = miqColumns.map((h) => h.key);
  const miqRows = convertRows(rowItems, headerKeys);
  const rows = rowData(headerKeys, miqRows);
  return { miqColumns, miqRows: rows.rowItems };
};
