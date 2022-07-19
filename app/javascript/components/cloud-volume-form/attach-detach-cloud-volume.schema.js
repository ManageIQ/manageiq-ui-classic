import { componentTypes } from '@@ddf';

const createSchema = (vmOptions, dynamicFields) => ({
  fields: [
    {
      component: componentTypes.SELECT,
      id: 'vm_id',
      name: 'vm_id',
      label: __('Instance'),
      isRequired: true,
      includeEmpty: true,
      options: vmOptions,
    },
    dynamicFields,
  ],
});

export default createSchema;
