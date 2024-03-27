import { componentTypes } from '@@ddf';

const createSchema = (fields) => ({
  fields: [
    {
      component: componentTypes.TABS,
      name: 'tabs',
      fields,
    },
  ],
});

export default createSchema;
