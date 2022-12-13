import textualSummaryGenericClick from '../../../react/textual_summary_click';

/** Function to handle the onclick event for rows in table. */
export const onSelectRender = (record, selectedRow, rows) => {
  miqSparkleOn();
  const rowItem = rows.find((item) => item.id === selectedRow.id);
  const link = `/catalog/x_show/${record.id}?rec_id=${rowItem.id}`;
  // window.DoNav(`/catalog/service_catalog_item/?item=${rowItem.id}&id=${record.id}`);
  textualSummaryGenericClick({ explorer: true, link });
  miqSparkleOff();
};

/** Function to generate data for catalog items table. */
export const tableData = (initialData) => {
  const headers = [{ key: 'description', header: __('Catalog Items') }];
  initialData.forEach((item) => {
    item.id = item.id.toString();
    if (item.description === '' || item.description === undefined || item.description === null) {
      item.description = item.name;
    }
    item.clickable = true;
  });
  return { headers, rows: initialData };
};
