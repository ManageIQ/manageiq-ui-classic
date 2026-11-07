import componentTypes from '@data-driven-forms/react-form-renderer/component-types';
import validatorTypes from '@data-driven-forms/react-form-renderer/validator-types';

const tabSchema = (initialValues = {}) => ({
  fields: [
    {
      component: componentTypes.TEXT_FIELD,
      id: 'label',
      name: 'label',
      label: __('Label'),
      isRequired: true,
      initialValue: initialValues.label || '',
      validate: [{ type: validatorTypes.REQUIRED }],
    },
    {
      component: componentTypes.TEXTAREA,
      id: 'description',
      name: 'description',
      label: __('Description'),
      initialValue: initialValues.description || '',
    },
  ],
});

export default tabSchema;
