import { headerData, rowData } from '../miq-data-table/helper';

export const tableData = (folders) => {
  let headers = {};
  let rows = [];
  const columns = [
    { text: 'name', header_text: __('Name') },
  ];
  const { headerKeys, headerItems } = headerData(columns, false);
  headers = headerItems;

  const initialData = [
    {
      // Add the system folder (Examples)
      id: 'xx-xx-system',
      clickable: true,
      cells: [{ text: __('Examples (read only)'), icon: 'carbon--Folder' }],
    },
  ];

  folders.forEach((folder) => {
    initialData.push(
      {
        id: `pit-${folder.id}`,
        clickable: true,
        cells: [{ text: folder.name, icon: 'carbon--Folder' }],
      }
    );
  });

  rows = rowData(headerKeys, initialData, false);
  return { headers, rows };
};
