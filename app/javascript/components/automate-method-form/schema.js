import { componentTypes } from '@@ddf';
import { schemaConfig } from './schema.config';

const commonFields = [
  {
    component: componentTypes.TEXT_FIELD,
    id: 'type',
    name: 'type',
    label: __('Type'),
  },
  {
    component: componentTypes.TEXT_FIELD,
    id: 'fully-qualified-name',
    name: 'fully-qualified-name',
    label: __('Fully Qualified Name'),
    initialValue: '',
  },
  {
    component: componentTypes.TEXT_FIELD,
    id: 'name',
    name: 'name',
    label: __('Name'),
    initialValue: '',
  },
  {
    component: componentTypes.TEXT_FIELD,
    id: 'display_name',
    name: 'display_name',
    label: __('Display Name'),
    initialValue: '',
  },
];

const inputParametersField = [
  {
    component: 'automate-method-input-parameter',
    id: 'inputParameter',
    name: 'inputParameter',
    label: __('Input Parameter'),
  },
];

const codeMirrorField = [
  {
    component: 'automate-method-code-mirror',
    id: 'codeMirror',
    name: 'codeMirror',
    label: __('Data'),
  },
];

const automateFields = (conditionalFields) => [
  ...commonFields,
  ...conditionalFields,
  ...inputParametersField,
];

export const createSchema = (formData, setFormData) => {
  let selectedFields = [];
  const { selectedType } = formData;
  const config = schemaConfig(formData, setFormData);

  switch (selectedType.id) {
    case 'ansible_job_template':
      selectedFields = automateFields(config.ansibleJobTemplate);
      break;
    case 'ansible_workflow_template':
      selectedFields = automateFields(config.ansibleWorkflowTemplate);
      break;
    case 'builtin':
      selectedFields = automateFields(config.builtIn);
      break;
    case 'expression':
      selectedFields = automateFields(config.expression);
      break;
    case 'inline':
      selectedFields = [...commonFields, ...codeMirrorField, ...inputParametersField];
      break;
    case 'playbook':
      selectedFields = automateFields(config.playbook);
      break;
    default:
      selectedFields = [];
  }
  return {
    fields: [
      {
        component: componentTypes.SUB_FORM,
        id: 'name-wrapper',
        name: 'subform-1',
        fields: selectedFields,
      },
    ],
  };
};
