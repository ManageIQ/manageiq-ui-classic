import { componentTypes, validatorTypes } from '@@ddf';

const createSchema = (selectOptions) => ({
  fields: [
    {
      component: componentTypes.TEXT_FIELD,
      id: 'name',
      name: 'name',
      label: __('Name'),
      maxLength: 128,
      validate: [{ type: validatorTypes.REQUIRED }],
      isRequired: true,
    },
    {
      component: componentTypes.TEXT_FIELD,
      id: 'description',
      name: 'description',
      label: __('Description'),
      maxLength: 128,
      validate: [{ type: validatorTypes.REQUIRED }],
      isRequired: true,
    },
    {
      component: componentTypes.SELECT,
      id: 'dialog_type',
      name: 'dialog_type',
      label: __('Dialog Type'),
      maxLength: 128,
      validate: [{ type: validatorTypes.REQUIRED }],
      options: selectOptions.map((option) => ({ label: option[0], value: option[1] })),
    },
    {
      component: componentTypes.SUB_FORM,
      id: 'code-section',
      name: 'code-section',
      fields: [{
        component: 'code-editor',
        id: 'content',
        name: 'content',
        label: __('Content'),
      }],
    },
  ],
});

export default createSchema;
