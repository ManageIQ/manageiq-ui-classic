/**
 * @param {Boolean} renderEmsChoices
 * @param {Object} emsChoices
 */
function createSchema(renderEmsChoices, emsChoices) {
  let fields = [{
    component: 'text-field',
    name: 'name',
    validate: [{
      type: 'required-validator',
    }],
    label: __('Tenant Name'),
    maxLength: 128,
    validateOnMount: true,
  }];
  if (!renderEmsChoices) {
    fields = [{
      component: 'select-field',
      name: 'ems_id',
      menuPlacement: 'bottom',
      label: __('Cloud Provider/Parent Cloud Tenant'),
      placeholder: `<${__('Choose')}>`,
      validateOnMount: true,
      validate: [{
        type: 'required-validator',
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
