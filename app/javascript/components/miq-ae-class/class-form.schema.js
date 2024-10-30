import { componentTypes, validatorTypes } from '@@ddf';

const createSchema = (fqname) => ({
  fields: [
    {
      component: componentTypes.PLAIN_TEXT,
      name: 'fqname',
      label: `${__('Fully Qualified Name')}:\t ${fqname}`,
    },
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
      id: 'display_name',
      name: 'display_name',
      label: __('Display Name'),
      maxLength: 128,
    },
    {
      component: componentTypes.TEXT_FIELD,
      id: 'description',
      name: 'description',
      label: __('Description'),
      maxLength: 255,
    },
  ],
});

export default createSchema;
