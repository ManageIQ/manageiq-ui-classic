import { headerData, rowData } from '../../miq-data-table/helper';

const hasCheckbox = (type, { domain, schema, fields }) => ![domain, schema, fields].includes(type);

/** Function which returns the header data for table with type ns_list. */
const nsListHeaders = (hasOptions) => {
  const columns = [
    { text: 'defaultKey_0', header_text: '' },
    { text: 'defaultKey_1', header_text: '' },
    { text: 'Name', header_text: __('Name') },
    { text: 'Description', header_text: __('Description') },
    { text: 'Enabled', header_text: __('Enabled') },
  ];
  if (hasOptions) columns.push({ text: 'Tenant', header_text: __('Tenant') });
  return columns;
};

/** Function which returns the header data for table with type ns_details, class_instances, class_methods. */
const commonHeaders = () => [
  { text: 'defaultKey_0', header_text: '' },
  { text: 'defaultKey_1', header_text: '' },
  { text: 'defaultKey_3', header_text: '' },
];

/** Function which returns the header data for table with type domain_overrides. */
const domainOverridesHeaders = () => [{ text: 'defaultKey_0', header_text: __('Domain') }];

/** Function which returns the header data for table with type class_fields schema. */
const schemaHeaders = () => [
  { text: 'Name', header_text: __('Name') },
  { text: 'Description', header_text: __('Description') },
  { text: 'DefaultValue', header_text: __('Default Value') },
  { text: 'Collect', header_text: __('Collect') },
  { text: 'Message', header_text: __('Message') },
  { text: 'OnEntry', header_text: __('On Entry') },
  { text: 'OnExit', header_text: __('On Exit') },
  { text: 'OnError', header_text: __('On Error') },
  { text: 'MaxRetries', header_text: __('Max Retries') },
  { text: 'MaxTime', header_text: __('Max Time') },
];

/** Function which returns the header data for table with type instant_fields. */
const instantFieldHeaders = (hasOptions) => {
  const columns = [{ text: 'Name', header_text: __('Name') }, { text: 'Value', header_text: __('Value') }];
  if (hasOptions) {
    [
      { text: 'OnEntry', header_text: __('On Entry') },
      { text: 'OnExit', header_text: __('On Exit') },
      { text: 'OnError', header_text: __('On Error') },
      { text: 'MaxRetries', header_text: __('Max Retries') },
      { text: 'MaxTime', header_text: __('Max Time') },
    ].map((item) => columns.push(item));
  }
  [{ text: 'Collect', header_text: __('Collect') }, { text: 'Message', header_text: __('Message') }].map((item) => columns.push(item));
  return columns;
};

/** Function which returns the header items based on its type. */
const datastoreHeaders = (type, hasOptions, {
  list, details, instances, methods, domain, schema, fields,
}) => {
  switch (type) {
    case list:
      return nsListHeaders(hasOptions);
    case details:
    case instances:
    case methods:
      return commonHeaders();
    case domain:
      return domainOverridesHeaders();
    case schema:
      return schemaHeaders();
    case fields:
      return instantFieldHeaders(hasOptions);
    default:
      return [];
  }
};

/** Function which returns the data needed for table. */
export const tableData = (type, hasOptions, initialData, datastoreTypes) => {
  const cBox = hasCheckbox(type, datastoreTypes);
  const nodeTree = type === datastoreTypes.domain ? 'x_show' : 'tree_select';
  const columns = datastoreHeaders(type, hasOptions, datastoreTypes);
  const { headerKeys, headerItems } = headerData(columns, cBox);
  const miqRows = rowData(headerKeys, initialData, true);
  return {
    miqHeaders: headerItems, miqRows, hasCheckbox: cBox, nodeTree,
  };
};

/** Function to add item to array. */
export const addSelected = (array, item) => {
  if (array.indexOf(item) === -1) {
    array.push(item);
  }
  return array;
};

/** Function to remove item from an array. */
export const removeSelected = (array, item) => {
  const index = array.indexOf(item);
  if (index !== -1) {
    array.splice(index, 1);
  }
  return array;
};
