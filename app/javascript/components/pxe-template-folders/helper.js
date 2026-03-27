import { headerData, rowData } from '../miq-data-table/helper';

export const tableData = (folders) => {
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

  const columns = [
    { text: 'name', header_text: __('Name') },
  ];
  const { headerKeys, headerItems: headers } = headerData(columns, false);
  const rows = rowData(headerKeys, initialData, false);

  return { headers, rows };
};
