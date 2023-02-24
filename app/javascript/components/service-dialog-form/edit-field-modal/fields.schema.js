import { componentTypes } from '@data-driven-forms/react-form-renderer';

export const textFieldComponent = (field) => ({
  component: componentTypes.TEXT_FIELD,
  label: field.label,
  maxLength: 128,
  id: field.label,
  name: field.label,
});

export const textAreaComponent = (field) => ({
  component: componentTypes.TEXTAREA,
  id: field.label,
  name: field.label,
  label: field.label,
  rows: 10,
});

export const switchComponent = (field) => ({
  component: componentTypes.SWITCH,
  id: field.label,
  name: field.label,
  label: field.label,
  maxLength: 50,
});

const assignProfiles = [
  { label: __('Copy of sample'), value: 'Copy of sample' },
  { label: __('default'), value: 'default' },
  { label: __('host default'), value: 'host default' },
  { label: __('host sample'), value: 'host sample' },
  { label: __('sample'), value: 'sample' },
];

export const selectComponent = (field) => ({
  component: componentTypes.SELECT,
  id: field.label,
  name: field.label,
  label: field.label,
  placeholder: __('<Choose>'),
  includeEmpty: true,
  options: assignProfiles,
});
