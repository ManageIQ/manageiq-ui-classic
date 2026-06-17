/** Function to handle the onclick event for rows in table. */
export const onSelectRender = (selectedRow) => {
  miqSparkleOn();
  miqTreeActivateNode('pxe_servers_tree', `wi-${selectedRow.id}`);
  miqSparkleOff();
};

/** Function to generate Windows Images table. */
export const tableData = (initialData) => {
  const headers = [
    { key: 'name', header: __('Name') },
    { key: 'description', header: __('Description') },
    { key: 'path', header: __('Path') },
    { key: 'index', header: __('Index') },
  ];

  const rows = initialData.map((item) => ({
    id: item.id.toString(),
    name: item.name,
    description: item.description,
    path: item.path,
    index: item.index,
    clickable: true,
  }));

  return { headers, rows };
};
