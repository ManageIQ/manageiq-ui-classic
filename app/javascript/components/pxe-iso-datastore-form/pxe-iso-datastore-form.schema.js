import { componentTypes, validatorTypes } from '@@ddf';

const createSchema = (emses) => ({
  fields: [{
    component: componentTypes.SUB_FORM,
    title: __('Basic Information'),
    id: 'basic-information',
    name: 'basic-information',
    fields: [{
      component: componentTypes.SELECT,
      name: 'ems_id',
      id: 'ems_id',
      label: __('Provider'),
      placeholder: __('<Choose>'),
      includeEmpty: true,
      options: emses.map(({ id, name }) => ({ value: `${id} ${name}`, label: name })),
      validate: [{ type: validatorTypes.REQUIRED }],
    }],
  }],
});

export default createSchema;
