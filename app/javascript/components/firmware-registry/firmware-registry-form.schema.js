import { componentTypes, validatorTypes } from '@data-driven-forms/react-form-renderer';

export default (TYPES) => {
  const fields = [
    {
      component: componentTypes.SUB_FORM,
      title: __('Basic Info'),
      name: 'basic-info',
      fields: [
        {
          component: componentTypes.SELECT_COMPONENT,
          name: 'type',
          options: Object.values(TYPES),
          label: __('Registry Type'),
          placeholder: __('Nothing selected'),
          isSearchable: true,
          validate: [{ type: validatorTypes.REQUIRED }],
          validateOnMount: true,
          isDisabled: true,
        },
        {
          component: componentTypes.TEXT_FIELD,
          name: 'name',
          label: __('Name'),
          maxLength: 128,
          validate: [{ type: validatorTypes.REQUIRED }],
        },
        {
          component: componentTypes.TEXT_FIELD,
          name: 'url',
          label: __('URL'),
          placeholder: 'https://example.com:1234/images',
          maxLength: 2048,
          validate: [{ type: validatorTypes.REQUIRED }],
        },
        {
          component: componentTypes.TEXT_FIELD,
          name: 'userid',
          label: __('Username'),
          maxLength: 128,
          validate: [{ type: validatorTypes.REQUIRED }],
        },
        {
          component: componentTypes.TEXT_FIELD,
          name: 'password',
          label: __('Password'),
          maxLength: 128,
          validate: [{ type: validatorTypes.REQUIRED }],
          type: 'password',
        },
      ],
    },
  ];
  return { fields };
};
