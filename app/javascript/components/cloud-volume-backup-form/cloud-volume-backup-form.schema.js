import { componentTypes, validatorTypes } from '@data-driven-forms/react-form-renderer';

function restoreSchema(options) {
  const fields = [{
    component: componentTypes.SUB_FORM,
    title: __('Basic Information'),
    id: 'basic-information',
    name: 'basic-information',
    fields: [
      {
        component: componentTypes.SELECT,
        id: 'volume_id',
        name: 'volume_id',
        label: __('Volume'),
        placeholder: __('<Choose>'),
        includeEmpty: true,
        options,
        isRequired: true,
        validate: [{ type: validatorTypes.REQUIRED }],
      }],
  }];
  return { fields };
}

export default restoreSchema;
