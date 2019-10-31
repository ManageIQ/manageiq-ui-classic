import { componentTypes, validatorTypes } from '@data-driven-forms/react-form-renderer';

const automateClassFormSchema = maxNameLen => ({
  fields: [{
    name: 'name',
    label: __('Name'),
    component: componentTypes.TEXT_FIELD,
    autoFocus: true,
    validate: [{
      type: validatorTypes.MAX_LENGTH,
      threshold: maxNameLen,
    }],
  },
  {
    name: 'display_name',
    label: __('Display Name'),
    component: componentTypes.TEXT_FIELD,
    validate: [{
      type: validatorTypes.MAX_LENGTH,
      threshold: maxNameLen,
    }],
  },
  {
    name: 'description',
    label: __('Description'),
    component: componentTypes.TEXT_FIELD,
    validate: [{
      type: validatorTypes.MAX_LENGTH,
      threshold: maxNameLen,
    }],
  }],
});

export default automateClassFormSchema;
