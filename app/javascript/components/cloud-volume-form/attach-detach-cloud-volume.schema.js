import { componentTypes } from '@@ddf';

const createSchema = (dropdrownOptions, dropdownLabel, dynamicFields) => ({
  fields: [
    {
      component: componentTypes.SELECT,
      id: 'dropdown_id',
      name: 'dropdown_id',
      label: __(dropdownLabel), // Label value will be "Instance" or "Volume"
      isRequired: true,
      includeEmpty: true,
      options: dropdrownOptions,
    },
    dynamicFields,
  ],
});

export default createSchema;
