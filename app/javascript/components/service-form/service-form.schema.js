import { componentTypes, validatorTypes } from '@@ddf';

function createSchema(maxNameLen, maxDescLen) {
  return {
    fields: [{
      component: componentTypes.TEXT_FIELD,
      id: 'name',
      name: 'name',
      maxLength: maxNameLen,
      label: __('Name'),
      validateOnMount: true,
      autoFocus: true,
      validate: [{
        type: validatorTypes.REQUIRED,
      }],
    }, {
      component: componentTypes.TEXT_FIELD,
      id: 'description',
      name: 'description',
      maxLength: maxDescLen,
      label: __('Description'),
      validateOnMount: true,
      autoFocus: true,
    }],
  };
}

export default createSchema;
