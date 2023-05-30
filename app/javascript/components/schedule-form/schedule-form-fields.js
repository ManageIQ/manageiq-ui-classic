import { componentTypes, validatorTypes } from '@@ddf';
import {
  actionChange, runOptionChange, runOptions, subActionChange, objectTypeChange, restructureOptions,
} from './helper';

export const attributeValueLimit = 5;

export const nameField = () => ({
  component: componentTypes.TEXT_FIELD,
  name: 'name',
  label: __('Name'),
  maxLength: 50,
  isRequired: true,
  validate: [{ type: validatorTypes.REQUIRED }],
  autoFocus: true,
});

export const descriptionField = () => ({
  component: componentTypes.TEXT_FIELD,
  name: 'description',
  label: __('Description'),
  isRequired: true,
  maxLength: 100,
  validate: [{ type: validatorTypes.REQUIRED }],
});

export const activeField = () => ({
  component: componentTypes.CHECKBOX,
  name: 'enabled',
  label: __('Active'),
});

export const actionField = (actionOptions, filterOptions, setData, data) => ({
  component: componentTypes.SELECT,
  id: 'action',
  name: 'action_typ',
  label: __('Action'),
  initialValue: 'vm',
  onChange: (value) => actionChange(value, filterOptions, setData, data),
  isRequired: true,
  options: restructureOptions(actionOptions),
});

export const filterField = (setData, data) => ({
  component: componentTypes.SELECT,
  id: 'filter_type',
  name: 'filter_typ',
  label: __('Filter'),
  onChange: (value) => subActionChange(value, setData, data),
  hideField: data.displayFields.filterType,
  options: data.options.subAction,
  isRequired: true,
});

export const targetField = (data) => ({
  component: componentTypes.SELECT,
  id: 'filter_value',
  name: 'filter_value',
  label: __('Filter Item'),
  hideField: data.displayFields.target,
  options: data.options.target,
  initializeOnMount: true,
  initialValue: data.filterValue,
});

export const zoneField = (data) => ({
  component: componentTypes.SELECT,
  id: 'zone',
  name: 'zone_id',
  label: __('Zone'),
  placeholder: __('<Choose>'),
  includeEmpty: true,
  hideField: data.displayFields.automationFields,
  options: data.options.zone,
  isRequired: true,
  validate: [{ type: 'customRequired', hideField: data.displayFields.automationFields }],
});

export const plainField = (name, text, data) => ({
  component: 'plain-text',
  name,
  label: text,
  element: 'h3',
  hideField: data.displayFields.automationFields,
});

export const systemField = (data) => ({
  component: componentTypes.SELECT,
  id: 'system',
  name: 'instance_name',
  label: __('System/Process'),
  hideField: data.displayFields.automationFields,
  options: data.options.request,
  placeholder: __('<Choose>'),
  includeEmpty: true,
  isRequired: true,
  validate: [{ type: 'customRequired', hideField: data.displayFields.automationFields }],
});

export const objectMessageField = (data) => ({
  component: componentTypes.TEXT_FIELD,
  id: 'message',
  name: 'object_message',
  label: __('Message'),
  hideField: data.displayFields.automationFields,
  isRequired: true,
  validate: [{ type: 'customRequired', hideField: data.displayFields.automationFields }],
});

export const objectRequestField = (data) => ({
  component: componentTypes.TEXT_FIELD,
  id: 'request',
  name: 'object_request',
  label: __('Request'),
  hideField: data.displayFields.automationFields,
  isRequired: true,
  validate: [{ type: 'customRequired', hideField: data.displayFields.automationFields }],
});

export const objectTypeField = (setData, data) => ({
  component: componentTypes.SELECT,
  id: 'object_type',
  name: 'target_class',
  onChange: (value) => objectTypeChange(value, setData, data),
  hideField: data.displayFields.automationFields,
  placeholder: __('<Choose>'),
  includeEmpty: true,
  options: data.options.objectType,
  isRequired: true,
  labelText: __('Type'),
  isSearchable: true,
  isClearable: true,
  simpleValue: true,
  validate: [{ type: 'customRequired', hideField: data.displayFields.automationFields }],
});

export const objectItemField = (data) => ({
  component: componentTypes.SELECT,
  id: 'object_item',
  name: 'target_id',
  hideField: data.displayFields.objectItem,
  options: data.options.objectItem,
  placeholder: __('<Choose>'),
  includeEmpty: true,
  isRequired: true,
  labelText: __('Object'),
  isSearchable: true,
  isClearable: true,
  simpleValue: true,
  validate: [{ type: 'customRequired', hideField: data.displayFields.objectItem }],
});

const attributeValueField = (count) => ({
  component: componentTypes.SUB_FORM,
  id: `attribute-value-field-${count}`,
  name: `attribute-value-field-${count}`,
  className: 'attribute-value-field-row',
  fields: [
    {
      id: `attribute-value-count-${count}`,
      component: componentTypes.PLAIN_TEXT,
      name: `attribute-value-count-${count}`,
      label: count.toString(),
      className: 'attribute-value-row-count',
    },
    {
      component: componentTypes.TEXT_FIELD,
      id: `attribute_${count}`,
      name: `attribute_${count}`,
      label: __(' '),
      className: 'attribute-value-row-attribute',
    },
    {
      component: componentTypes.TEXT_FIELD,
      id: `value_${count}`,
      name: `value_${count}`,
      label: __(' '),
      className: 'attribute-value-row-value',
    },
  ],
}
);

export const attributeValueFields = (data, limit) => ({
  component: componentTypes.SUB_FORM,
  id: `attribute-value-fields`,
  name: `attribute-value-fields`,
  className: 'attribute-value-fields-subform',
  title: __('Attribute/Value Pairs'),
  condition: {
    when: 'action_typ',
    is: 'automation_request',
  },
  fields: [[...Array(limit)].map((_item, i) => attributeValueField(i + 1)),
    {
      component: componentTypes.TEXT_FIELD,
      id: `starting_object`,
      name: `starting_object`,
      label: __(' '),
      value: 'SYSTEM/PROCESS',
      hideField: true,
    },
  ],
});

export const runField = (setData, data) => ({
  component: componentTypes.SELECT,
  id: 'run',
  name: 'timer_typ',
  label: __('Run'),
  initialValue: 'Once',
  isRequired: true,
  onChange: (value) => runOptionChange(value, setData, data),
  options: runOptions(),
});

export const timerValueField = (data) => ({
  component: componentTypes.SELECT,
  id: 'timer_value',
  name: 'timer_value',
  label: __('Every'),
  hideField: data.displayFields.everyTime,
  options: data.options.everyTime,
  isRequired: true,
  initializeOnMount: true,
  initialValue: data.timerInit,
});

export const timezoneField = (data) => ({
  component: componentTypes.SELECT,
  id: 'time_zone',
  name: 'time_zone',
  isRequired: true,
  placeholder: __('<Choose>'),
  includeEmpty: true,
  options: data.options.timezone,
  labelText: __('Time Zone'),
  isSearchable: true,
  isClearable: true,
  simpleValue: true,
  validate: [{ type: validatorTypes.REQUIRED }],
});

export const startDateField = () => ({
  component: componentTypes.DATE_PICKER,
  name: 'start_date',
  label: __('Starting Date'),
  datePickerType: 'single',
  isRequired: true,
  validate: [{ type: validatorTypes.REQUIRED }],
});

export const startTimeField = () => ({
  component: componentTypes.TIME_PICKER,
  id: 'start_time',
  name: 'start_hour',
  label: __('Starting Time'),
  isRequired: true,
  validate: [{ type: validatorTypes.REQUIRED }],
});

export const scheduleFormFields = (actionOptions, filterOptions, setData, data) => ([
  nameField(),
  descriptionField(),
  activeField(),
  actionField(actionOptions, filterOptions, setData, data),
  filterField(setData, data),
  targetField(data),
  zoneField(data),
  plainField('object_details', __('Object Details'), data),
  systemField(data),
  objectMessageField(data),
  objectRequestField(data),
  plainField('object_attributes', __('Object'), data),
  objectTypeField(setData, data),
  objectItemField(data),
  attributeValueFields(data, attributeValueLimit),
  runField(setData, data),
  timerValueField(data),
  timezoneField(data),
  startDateField(),
  startTimeField(data),
]);
