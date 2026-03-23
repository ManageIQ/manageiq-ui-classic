import { headerData, rowData } from '../miq-data-table/helper';

export const tableData = (folders) => {
  let rows = [];
  const columns = [
    { text: 'name', header_text: __('name') },
  ];
  const { headerKeys } = headerData(columns, false);
  const initialData = [];

  folders.forEach((folder) => {
    initialData.push(
      {
        id: `${folder[1]}`,
        clickable: true,
        cells: [{ text: folder[0], icon: 'carbon--Folder' }],
      }
    );
  });

  rows = rowData(headerKeys, initialData, false);
  return rows;
};
