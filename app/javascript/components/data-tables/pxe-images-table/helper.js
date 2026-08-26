/** Function to handle the onclick event for rows in table. */
export const onSelectRender = (selectedRow) => {
  miqSparkleOn();
  miqTreeActivateNode('pxe_servers_tree', `pi-${selectedRow.id}`);
  miqSparkleOff();
};

/** Function to generate PXE Images table. */
export const tableData = (initialData) => {
  const headers = [
    { key: 'name', header: __('Name') },
    { key: 'description', header: __('Description') },
    { key: 'kernel', header: __('Kernel') },
    { key: 'default_for_windows', header: __('Windows Boot Env') },
  ];

  const rows = initialData.map((item) => ({
    id: item.id.toString(),
    name: item.name,
    description: item.description,
    kernel: item.kernel,
    default_for_windows: item.default_for_windows ? __('Yes') : '',
    clickable: true,
  }));

  return { headers, rows };
};
