import { rowData } from '../miq-data-table/helper';

/** Function to return the header information for the service catalog item's entry points. */
const entryPointsHeaderInfo = () => [
  { header: __('Repository'), key: 'configuration_script_source.name' },
  { header: __('Workflow name'), key: 'name' },
];

/** Function to return the cell data for a row item. */
const cellInfo = (workflow) => [
  { text: workflow.configuration_script_source ? workflow.configuration_script_source.name : '' },
  { text: workflow.name },
];

/** Function to return the row information for the list */
const rowInfo = (headers, response) => {
  const headerKeys = headers.map((item) => item.key);
  const rows = response.resources.filter((item) => item.payload).map((workflow) => ({
    id: workflow.id.toString(), cells: cellInfo(workflow), clickable: true,
  }));
  const miqRows = rowData(headerKeys, rows, false);
  return miqRows.rowItems;
};

export const workflowsEntryPoints = (response) => {
  const headers = entryPointsHeaderInfo();
  return { headers, rows: rowInfo(headers, response) };
};
