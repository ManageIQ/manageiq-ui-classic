import { rowData } from '../miq-data-table/helper';

/** Function to return the header information for the service catalog item's entry points. */
const entryPointsHeaderInfo = () => [
  { header: __('Repository'), key: 'configuration_script_source.name' },
  { header: __('Workflow name'), key: 'name' },
];

/** Function to return the cell data for a row item. */
const cellInfo = (workflow) => {
  const isValid = workflow.payload_valid;
  const workflowNameTitle = !isValid ? `${workflow.name} (${__('Invalid Workflow')})` : workflow.name;

  return [
    { text: workflow.configuration_script_source ? workflow.configuration_script_source.name : '' },
    { text: workflow.name, title: workflowNameTitle },
  ];
};

/** Function to return the row information for the list */
const rowInfo = (headers, response) => {
  const headerKeys = headers.map((item) => item.key);
  const rows = response.resources.map((workflow) => {
    const isValid = workflow.payload_valid;
    return {
      id: workflow.id.toString(),
      name: workflow.name,
      cells: cellInfo(workflow),
      clickable: isValid,
      disabled: !isValid,
    };
  });

  const miqRows = rowData(headerKeys, rows, false);
  return miqRows.rowItems;
};

export const workflowsEntryPoints = (response) => {
  const headers = entryPointsHeaderInfo();
  return { headers, rows: rowInfo(headers, response) };
};
