import { rowData } from '../miq-data-table/helper';

/** Function to return the header information for the service catalog item's entry points. */
const entryPointsHeaderInfo = () => [
  { header: __('Name'), key: 'name' },
];

/** Function to return the cell data for a row item. */
const celInfo = (workflow) => [
  { text: workflow.name },
];

/** Function to return the row information for the list */
const rowInfo = (headers, response) => {
  const headerKeys = headers.map((item) => item.key);
  const rows = response.resources.filter((item) => item.payload).map((workflow) => ({
    id: workflow.id.toString(), cells: celInfo(workflow), clickable: true,
  }));
  const miqRows = rowData(headerKeys, rows, false);
  return miqRows.rowItems;
};

export const workflowsEntryPoints = (response) => {
  const headers = entryPointsHeaderInfo();
  return { headers, rows: rowInfo(headers, response) };
};
