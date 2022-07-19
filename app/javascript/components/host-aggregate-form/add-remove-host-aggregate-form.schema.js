import { componentTypes } from '@@ddf';

const createSchema = (hostOptions) => ({
  fields: [
    {
      component: componentTypes.SELECT,
      id: 'host_id',
      name: 'host_id',
      label: __('Host'),
      isRequired: true,
      includeEmpty: true,
      options: hostOptions,
    },
  ],
});

export default createSchema;
