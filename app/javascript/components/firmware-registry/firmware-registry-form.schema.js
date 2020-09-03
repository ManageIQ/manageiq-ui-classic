import { componentTypes, validatorTypes } from '@@ddf';

export default (TYPES) => {
  const fields = [
    {
      component: componentTypes.SUB_FORM,
      title: __('Basic Info'),
      id: 'basic-info',
      name: 'basic-info',
      fields: [
        {
          component: componentTypes.SELECT,
          id: 'type',
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
          id: 'name',
          name: 'name',
          label: __('Name'),
          maxLength: 128,
          validate: [{ type: validatorTypes.REQUIRED }],
        },
        {
          component: componentTypes.TEXT_FIELD,
          id: 'url',
          name: 'url',
          label: __('URL'),
          placeholder: 'https://example.com:1234/images',
          maxLength: 2048,
          validate: [{ type: validatorTypes.REQUIRED }],
        },
        {
          component: componentTypes.TEXT_FIELD,
          id: 'userid',
          name: 'userid',
          label: __('Username'),
          maxLength: 128,
          validate: [{ type: validatorTypes.REQUIRED }],
        },
        {
          component: componentTypes.TEXT_FIELD,
          id: 'password',
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
