import { validatorTypes } from "@@ddf";

function createSchema(maxDescLen) {
  return {
    fields: [{
      component: 'text-field',
      name: 'description',
      maxLength: maxDescLen,
      label: __('Description'),
      validateOnMount: true,
      validate: [{
        type: validatorTypes.REQUIRED,
        message: __('Required'),
      }],
      autoFocus: true,
    }],
  };
}

export default createSchema;
