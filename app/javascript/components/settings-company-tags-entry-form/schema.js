import { componentTypes, validatorTypes } from '@@ddf';

const createSchema = (newRecord) => ({
  fields: [
    {
      component: componentTypes.SUB_FORM,
      id: 'settings-company-tags-entry-form',
      name: 'settings-company-tags-entry-subform',
      title: newRecord ? __('Add an Entry') : __('Edit this Entry'),
      fields: [
        {
          component: componentTypes.TEXT_FIELD,
          id: 'name',
          name: 'name',
          label: __('Name'),
          maxLength: 50,
          validate: [{ type: validatorTypes.REQUIRED }],
          isRequired: true,
          className: 'settings_category_name',
        },
        {
          component: componentTypes.TEXT_FIELD,
          id: 'description',
          name: 'description',
          label: __('Description'),
          maxLength: 150,
          isRequired: true,
          validate: [{ type: validatorTypes.REQUIRED }],
        },
      ],
    },
  ],
});

export default createSchema;
