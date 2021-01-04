import { componentTypes, validatorTypes } from '@@ddf';

const createSchema = (maxNameLen, maxDescLen) => ({
  fields: [{
    component: componentTypes.TEXT_FIELD,
    id: 'name',
    name: 'name',
    maxLength: maxNameLen,
    label: __('Name'),
    validate: [{
      type: validatorTypes.REQUIRED,
    }],
  }, {
    component: componentTypes.TEXT_FIELD,
    id: 'description',
    name: 'description',
    maxLength: maxDescLen,
    label: __('Description'),
  }],
});

export default createSchema;
