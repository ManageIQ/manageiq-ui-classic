/* eslint-disable no-eval */
import { headerData, rowData } from '../../miq-data-table/helper';

/** Function to return the header data. */
const columnData = (header) => header.map((item) => ({ header_text: item, text: item }));

/** Function to return the table data. */
export const tableData = (initialData) => {
  const columns = columnData(initialData.headers);
  const { headerKeys, headerItems } = headerData(columns, false);
  const rows = rowData(headerKeys, initialData.rows, true);
  return { headers: headerItems, rows: rows.rowItems, merged: rows.merged };
};

/** Function to execute the row's click event. */
export const onSelectEvent = (selectedRow, { rows }) => {
  const item = rows.find((row) => row.id === selectedRow.id);
  if (item && item.onclick) {
    eval(item.onclick);
  }
};
