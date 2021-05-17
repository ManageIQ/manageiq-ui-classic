import { componentTypes, validatorTypes } from "@@ddf";

const createSchema = (fields) => ({
  fields: [
    {
      component: componentTypes.TEXT_FIELD,
      id: "name",
      name: "name",
      label: __("Name"),
      maxLength: 128,
      validate: [{ type: validatorTypes.REQUIRED }],
      isRequired: true
    },
    ...fields,
  ],
});

export default createSchema;
