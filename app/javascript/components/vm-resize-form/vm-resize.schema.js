import { componentTypes, validatorTypes } from '@@ddf';

const createSchema = (dynamicFields) => ({
  fields: [
    dynamicFields
  ]
});

export default createSchema;
