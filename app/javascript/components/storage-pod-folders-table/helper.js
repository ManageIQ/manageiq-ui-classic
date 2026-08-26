import { rowData } from '../miq-data-table/helper';

export const tableData = (folders) => {
  const headerKey = 'name';
  const initialData = folders.map((folder) => ({
    id: `${folder.id}`,
    clickable: true,
    cells: [{ text: folder.name, icon: 'carbon--Folder' }],
  }));

  return rowData([headerKey], initialData, false);
};
