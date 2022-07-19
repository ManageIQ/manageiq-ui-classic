/** Function to handle the onclick event for rows in table. */
export const onSelectRender = (selectedRow) => {
  miqSparkleOn();
  miqTreeActivateNode('iso_datastores_tree', `isi-${selectedRow.id}`);
  miqSparkleOff();
};

/** Function to generate ISO Datastore table. */
export const tableData = (initialData) => {
  const headers = [{ key: 'name', header: __('Name') }];
  initialData.forEach((item) => {
    item.id = item.id.toString();
    item.clickable = true;
  });
  return { headers, rows: initialData };
};
