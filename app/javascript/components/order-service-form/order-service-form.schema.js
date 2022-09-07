import { componentTypes, validatorTypes } from '@@ddf';

const createSchema = (fields) => ({
  fields: [
    {
      component: componentTypes.TABS,
      name: 'tabs',
      fields,
    },
    // ...fields,
  ],
});

export default createSchema;
