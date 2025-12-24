import { componentTypes } from '@data-driven-forms/react-form-renderer';

export const dynamicFields = {
  defaultValue: { label: __('Default value'), field: componentTypes.TEXT_FIELD },
  dynamic: { label: __('Dynamic'), field: componentTypes.SWITCH },
  entries: { label: __('Entries'), field: 'component', component: componentTypes.SELECT },
  entryPoint: { label: __('Entry point'), field: componentTypes.SELECT },
  fieldsToRefresh: { label: __('Fields to refresh'), field: componentTypes.SELECT },
  help: { label: __('Help'), field: componentTypes.TEXTAREA },
  label: { label: __('Label'), field: componentTypes.TEXT_FIELD },
  loadOnInit: { label: __('Load values on init'), field: componentTypes.SWITCH },
  multiselect: { label: __('Multiselect'), field: componentTypes.SWITCH },
  name: { label: __('Name'), field: componentTypes.TEXT_FIELD },
  protected: { label: __('Protected'), field: componentTypes.SWITCH },
  reconfigurable: { label: __('Reconfigurable'), field: componentTypes.SWITCH },
  required: { label: __('Required'), field: componentTypes.SWITCH },
  readOnly: { label: __('Read only'), field: componentTypes.SWITCH },
  showRefresh: { label: __('Show refresh button'), field: componentTypes.SWITCH },
  sortBy: { label: __('Sort by'), field: componentTypes.SELECT },
  sortOrder: { label: __('Sort order'), field: componentTypes.SELECT },
  showPastDates: { label: __('Show Past Dates'), field: componentTypes.SWITCH },
  singleValue: { label: __('Single value'), field: componentTypes.SWITCH },
  visible: { label: __('Visible'), field: componentTypes.SWITCH },
  valueType: { label: __('Value type'), field: componentTypes.SELECT },
  validation: { label: __('Validation'), field: componentTypes.SWITCH },
  validator: { label: __('Validator'), field: componentTypes.TEXT_FIELD },
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

export const overridableOptions = () => ({
  name: fieldTab.overridableOptions,
  fields: [
    dynamicFields.readOnly,
    dynamicFields.visible,
    dynamicFields.defaultValue,
  ],
});
