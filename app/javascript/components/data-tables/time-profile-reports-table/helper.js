import { headerData, rowData } from '../../miq-data-table/helper';

/** Function to generate data for time profile reports table. */
export const tableData = (initialData) => {
  let headers;
  let rows;
  if (initialData) {
    const columns = [
      { text: 'name', header_text: __('Name') },
      { text: 'title', header_text: __('Title') },
    ];
    const { headerKeys, headerItems } = headerData(columns, false);
    headers = headerItems;
    rows = rowData(headerKeys, initialData, false);
  }
  return { headers, rows };
};
