// import { componentTypes } from '@data-driven-forms/react-form-renderer';
// import { componentTypes } from '../component-types';
import { componentTypes } from '@@ddf';

export const dynamicFields = {
  categories: { label: __('Categories'), name: 'categories', field: componentTypes.SELECT },
  defaultCheckboxValue: { label: __('Default value'), name: 'checked', field: componentTypes.SWITCH },
  defaultDatePickerValue: { label: __('Default value'), name: 'value', field: componentTypes.DATE_PICKER },
  defaultDateTimePickerValue: { label: __('Default value'), name: 'value', field: 'date-time-picker' },
  defaultDropdownValue: { label: __('Default value'), name: 'value', field: componentTypes.SELECT },
  defaultValue: { label: __('Default value'), name: 'value', field: componentTypes.TEXT_FIELD },
  dynamic: { label: __('Dynamic'), name: 'dynamic', field: componentTypes.SWITCH },
  entries: { label: __('Entries'), name: 'items', field: componentTypes.FIELD_ARRAY },
  automationType: { label: __('Automation Type'), name: 'automationType', field: componentTypes.SELECT },
  automateEntryPoint: { label: __('Entry point'), name: 'automateEntryPoint', field: 'embedded-automate-entry-point' },
  workflowEntryPoint: { label: __('Entry point'), name: 'workflowEntryPoint', field: 'embedded-workflow-entry-point' },
  fieldsToRefresh: { label: __('Fields to refresh'), name: 'fieldsToRefresh', field: componentTypes.SELECT },
  help: { label: __('Help'), name: 'helperText', field: componentTypes.TEXTAREA },
  label: { label: __('Label'), name: 'label', field: componentTypes.TEXT_FIELD },
  loadOnInit: { label: __('Load values on init'), name: 'loadOnInit', field: componentTypes.SWITCH },
  multiselect: { label: __('Multiselect'), name: 'multiselect', field: componentTypes.SWITCH },
  name: { label: __('Name'), name: 'name', field: componentTypes.TEXT_FIELD },
  protected: { label: __('Protected'), name: 'protected', field: componentTypes.SWITCH },
  reconfigurable: { label: __('Reconfigurable'), name: 'reconfigurable', field: componentTypes.SWITCH },
  required: { label: __('Required'), name: 'required', field: componentTypes.SWITCH },
  readOnly: { label: __('Read only'), name: 'readOnly', field: componentTypes.SWITCH },
  showRefresh: { label: __('Show refresh button'), name: 'showRefresh', field: componentTypes.SWITCH },
  sortBy: { label: __('Sort by'), name: 'sortBy', field: componentTypes.SELECT },
  sortOrder: { label: __('Sort order'), name: 'sortOrder', field: componentTypes.SELECT },
  showPastDates: { label: __('Show Past Dates'), name: 'showPastDates', field: componentTypes.SWITCH },
  singleValue: { label: __('Single value'), name: 'singleValue', field: componentTypes.SWITCH },
  subCategories: { label: __('Entries'), name: 'subCategories', field: componentTypes.SELECT },
  visible: { label: __('Visible'), name: 'visible', field: componentTypes.SWITCH },
  valueType: { label: __('Value type'), name: 'dataType', field: componentTypes.SELECT },
  validation: { label: __('Validation'), name: 'validation', field: componentTypes.SWITCH },
  validatorRule: {
    condition: { when: 'validation', is: true },
    label: __('Validator Rule'),
    name: 'validatorRule',
    field: componentTypes.TEXT_FIELD,
    placeholder: __('Regular Expression'),
  },
  validatorMessage: {
    condition: { when: 'validation', is: true },
    label: __('Validation Message'),
    name: 'validationMessage',
    field: componentTypes.TEXT_FIELD,
  },
};

export const fieldTab = {
  fieldInformation: __('Field Information'),
  options: __('Options'),
  advanced: __('Advanced'),
  overridableOptions: __('Overridable Options'),
};

export const fieldInformation = () => ({
  name: fieldTab.fieldInformation,
  fields: [
    dynamicFields.label,
    dynamicFields.name,
    dynamicFields.help,
    dynamicFields.dynamic, // not there for tag control.
  ],
});

export const advanced = () => ({
  name: fieldTab.advanced,
  fields: [dynamicFields.reconfigurable],
});

const defaultValField = (type) => {
  switch (type) {
    case 'checkBox':
      // return dynamicFields.defaultCheckboxValue;
      return undefined;
    case 'dropDown':
      return dynamicFields.defaultDropdownValue;
    case 'datePicker':
      return dynamicFields.defaultDatePickerValue;
    case 'timePicker':
      return dynamicFields.defaultDateTimePickerValue;
    default:
      return dynamicFields.defaultValue;
  }
};


export const overridableOptions = (type) => ({
  name: fieldTab.overridableOptions,
  fields: [
    dynamicFields.readOnly,
    dynamicFields.visible,
    defaultValField(type),
  ].filter(Boolean),
});

export const overridableOptionsWithSort = () => ({
  name: fieldTab.overridableOptions,
  fields: [
    dynamicFields.readOnly,
    dynamicFields.visible,
    dynamicFields.sortBy,
    dynamicFields.sortOrder,
  ],
});
