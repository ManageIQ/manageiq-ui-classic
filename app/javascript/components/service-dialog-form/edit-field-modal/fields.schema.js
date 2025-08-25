import { componentTypes } from '@@ddf';

export const textFieldComponent = (field) => ({
  component: componentTypes.TEXT_FIELD,
  label: field.label,
  maxLength: 128,
  id: field.name,
  name: field.name,
  ...(field.condition && { condition: field.condition }), // required to setup the validation fields
  ...(field.placeholder && { placeholder: field.placeholder }),
  ...(field.name === 'label' && {
    isRequired: true,
    validate: [{ type: 'required' }]
  }),
  ...(field.name === 'name' && {
    isRequired: true,
    validate: [{ type: 'required' }]
  }),
});

export const textAreaComponent = (field) => ({
  component: componentTypes.TEXTAREA,
  id: field.name,
  name: field.name,
  label: field.label,
  rows: 10,
  ...(field.condition && { condition: field.condition }),
  ...(field.placeholder && { placeholder: field.placeholder }),
});

export const switchComponent = (field) => ({
  component: componentTypes.SWITCH,
  id: field.name,
  name: field.name,
  label: field.label,
  maxLength: 50,
});

export const fieldArrayComponent = (field) => ({
  component: componentTypes.FIELD_ARRAY,
  name: field.name,
  label: field.label,
  id: field.name,
  // className: 'field-array-item',
  AddButtonProps: {
    size: 'small',
  },
  RemoveButtonProps: {
    size: 'small',
  },
  itemDefaultExpanded: true, // ensures fields are always visible
  noLabel: true, // removes the duplicate label for each item
  fields: [
    {
      component: componentTypes.TEXT_FIELD,
      name: 'description',
      // placeholder: 'Description',
      label: 'Description',
      isRequired: true,
      className: 'field-column',
    },
    {
      component: componentTypes.TEXT_FIELD,
      name: 'value',
      // placeholder: 'Value',
      label: 'Value',
      isRequired: true,
      className: 'field-column',
    },
  ],
});

// ToDo:: with below code, desc and value fields shows up side by side,
// but the data wont be displayed in the fields; check why
// export const fieldArrayComponent = (field) => ({
//   component: componentTypes.FIELD_ARRAY,
//   name: field.name,
//   label: field.label,
//   id: field.name,
//   AddButtonProps: {
//     size: 'small',
//   },
//   RemoveButtonProps: {
//     size: 'small',
//   },
//   itemDefaultExpanded: true,
//   noLabel: true,
//   fields: [
//     {
//       component: componentTypes.SUB_FORM, // use sub-form as layout wrapper
//       // name: `${field.name}-row`,
//       className: 'field-array-item',
//       fields: [
//         {
//           component: componentTypes.TEXT_FIELD,
//           name: 'description',
//           label: 'Description',
//           isRequired: true,
//           className: 'field-column',
//         },
//         {
//           component: componentTypes.TEXT_FIELD,
//           name: 'value',
//           label: 'Value',
//           isRequired: true,
//           className: 'field-column',
//         },
//       ],
//     },
//   ],
// });

export const datePickerComponent = (field) => ({
  component: componentTypes.DATE_PICKER,
  id: field.name,
  name: field.name,
  label: field.label,
  value: field.value,
});

export const dateTimePickerComponent = (field, initialData, onChange) => ({
  component: 'date-time-picker',
  id: field.name,
  name: field.name,
  label: field.label,
  value: field.value,
  initialData,
  onChange,
});

export const automateEntryPointComponent = (field, initialData) => ({
  component: 'embedded-automate-entry-point',
  id: field.name,
  name: field.name,
  label: field.label,
  field: field.name,
  selected: initialData.automateEntryPoint,
  type: 'provision',
  isRequired: true,
  validate: [{ type: 'required' }]
});

export const workflowEntryPointComponent = (field) => ({
  component: 'embedded-workflow-entry-point',
  id: 'provisioning_entry_point_workflow',
  name: 'provisioning_entry_point_workflow',
  label: field.label,
  field: field.name,
  selected: '',
  type: 'provision',
  // isRequired: true,
  // validate: [{ type: 'required' }]
});

const valueTypes = [
  { label: __('String'), value: 'String' },
  { label: __('Integer'), value: 'Integer' },
];

const sortOrder = [
  { label: __('Ascending'), value: 'ascending' },
  { label: __('Descending'), value: 'descending' },
];

const sortBy = [
  { label: __('Description'), value: 'description' },
  { label: __('Value'), value: 'value' },
];

const automationType = [
  { label: __('Embedded Workflow'), value: 'embedded_workflow' },
  { label: __('Embedded Automate'), value: 'embedded_automate' },
];

const assignProfiles = [
  { label: __('Copy of sample1'), value: 'Copy of sample101' },
  { label: __('default'), value: 'default' },
  { label: __('host default'), value: 'host default' },
  { label: __('host sample'), value: 'host sample' },
  { label: __('sample'), value: 'sample' },
];

export const defaultRadioButtonOptions = [
  // Radio button needs 'id' & 'text'
  // Dropdown in edit pop up needs 'text' and 'value'
  // Option entries need 'value' & 'description'

  { text: 'AA', id: '1', value: '11', description: 'AA' },
  { text: 'BB', id: '2', value: '22', description: 'BB' },
  { text: 'cc', id: '3', value: '333', description: 'cc' },
  { text: 'CC', id: '4', value: '44', description: 'CC' },
  { text: 'DD', id: '55', value: '55', description: 'DD' },
];

export const defaultDropdownOptions = [

  // Dropdown component needs 'value' & 'description'
  // Dropdown in edit pop up needs 'text' and 'value'
  // Option entries need 'value' & 'description'

  { text: 'A', description: 'A', label: 'A', value: '1' },
  { text: 'B', description: 'B', label: 'B', value: '2' },
  { text: 'C', description: 'C', label: 'C', value: '3' },
  { text: 'b', description: 'b', label: 'b', value: '4' },
  { text: 'D', description: 'D', label: 'D', value: '5' },
];

const selectOptions = (field, initialData) => {
  switch (field.name) {
    case 'dataType':
      return valueTypes;
    case 'sortOrder':
      return sortOrder;
    case 'sortBy':
      return sortBy;
    case 'automationType':
      return automationType;
    case 'value':
      return initialData.items;
    case 'categories':
      return initialData.categories;
    case 'subCategories':
      return initialData.subCategories;
    case 'fieldsToRefresh':
      return initialData.fieldsToRefresh;
    default:
      return assignProfiles;
  }
};

export const selectComponent = (field, initialData) => ({
  component: componentTypes.SELECT,
  id: field.name,
  name: field.name,
  label: field.label,
  placeholder: __('<Choose>'),
  includeEmpty: true,
  options: selectOptions(field, initialData),
  ...(field.name === 'value' && initialData.multiselect && { isMulti: initialData.multiselect }),
});
