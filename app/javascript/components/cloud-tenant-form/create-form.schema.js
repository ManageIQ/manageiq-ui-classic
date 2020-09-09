import { componentTypes, validatorTypes } from '@@ddf';

/**
 * @param {Boolean} renderEmsChoices
 * @param {Object} emsChoices
 */
function createSchema(renderEmsChoices, emsChoices) {
  let fields = [{
    component: componentTypes.TEXT_FIELD,
    id: 'name',
    name: 'name',
    validate: [{
      type: validatorTypes.REQUIRED,
    }],
    label: __('Tenant Name'),
    maxLength: 128,
    validateOnMount: true,
  }];
  if (!renderEmsChoices) {
    fields = [{
      component: componentTypes.SELECT,
      id: 'ems_id',
      name: 'ems_id',
      menuPlacement: 'bottom',
      label: __('Cloud Provider/Parent Cloud Tenant'),
      placeholder: `<${__('Choose')}>`,
      validateOnMount: true,
      validate: [{
        type: validatorTypes.REQUIRED,
      }],
      options: Object.keys(emsChoices).map(key => ({
        value: emsChoices[key],
        label: key,
      })),
    }, ...fields];
  }
  return { fields };
}

export default createSchema;
