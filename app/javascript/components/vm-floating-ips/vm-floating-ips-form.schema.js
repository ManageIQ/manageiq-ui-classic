import { componentTypes, validatorTypes } from '@@ddf';

const createSchema = (ipOptions) => ({
  fields: [
    {
      component: componentTypes.SELECT,
      id: 'floating_ip',
      name: 'floating_ip',
      label: __('Floating IP'),
      validate: [{ type: validatorTypes.REQUIRED }],
      isRequired: true,
      includeEmpty: true,
      options: ipOptions,
    },
  ],
});

export default createSchema;
