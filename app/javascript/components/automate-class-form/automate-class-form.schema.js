import { componentTypes, validatorTypes } from '@data-driven-forms/react-form-renderer';

const automateClassFormSchema = () => ({
  fields: [{
    name: 'git_url',
    label: __('Git URL'),
    component: componentTypes.TEXT_FIELD,
  }],
});

export default automateClassFormSchema;
