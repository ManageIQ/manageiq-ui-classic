import { headerData, rowData } from '../../miq-data-table/helper';

const headers = (hasOptions) => {
  const columns = [
    { text: 'groups', header_text: __('Group') },
    { text: 'description', header_text: __('Description (Column Name in Report)') },
  ];

  if (hasOptions) {
    columns.push({ text: 'sub_metric', header_text: __('Sub Metric') });
  }

  [
    { text: 'range_start', header_text: __('Range Start') },
    { text: 'range_finish', header_text: __('Range Finish') },
    { text: 'rate_fixed', header_text: __('Rate Fixed') },
    { text: 'rate_variable', header_text: __('Rate Variable') },
    { text: 'units', header_text: __('Units') },
  ].map((item) => columns.push(item));

  return columns;
};

export const tableData = (initialData, hasOptions) => {
  const columns = headers(hasOptions);
  const { headerKeys, headerItems } = headerData(columns, false);
  const rows = rowData(headerKeys, initialData, true);
  return { headers: headerItems, rows: rows.rowItems };
};
