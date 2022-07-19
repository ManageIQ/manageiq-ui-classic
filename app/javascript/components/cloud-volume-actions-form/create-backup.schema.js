import { componentTypes, validatorTypes } from '@data-driven-forms/react-form-renderer';

function createBackupSchema() {
  const fields = [{
    component: componentTypes.SUB_FORM,
    title: __('Basic Information'),
    id: 'basic-information',
    name: 'basic-information',
    fields: [
      {
        component: componentTypes.TEXT_FIELD,
        id: 'name',
        name: 'name',
        label: __('Backup Name'),
        maxLength: 50,
        isRequired: true,
        validate: [{ type: validatorTypes.REQUIRED }],
      }],
  },
  {
    component: componentTypes.SUB_FORM,
    title: __('Options'),
    id: 'options',
    name: 'options',
    fields: [
      {
        component: componentTypes.SWITCH,
        id: 'incremental',
        name: 'incremental',
        label: __('Incremental?'),
        maxLength: 50,
      },
      {
        component: componentTypes.SWITCH,
        id: 'force',
        name: 'force',
        label: __('Force?'),
        maxLength: 50,
      }],
  },
  ];
  return { fields };
}

export default createBackupSchema;
