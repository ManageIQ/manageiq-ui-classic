import { componentTypes } from '@@ddf';

const dropdownOptions = (items) => items.map((item) => ({ label: item.name, value: item.id }));

export const ansibleFields = (formData, setFormData) => ([
  {
    component: componentTypes.SELECT,
    id: 'manager_id',
    name: 'manager_id',
    label: __('Provider'),
    placeholder: __('<Choose>'),
    includeEmpty: true,
    options: formData.apiResponse && formData.apiResponse.managers ? dropdownOptions(formData.apiResponse.managers) : [],
    onChange: (managerId) => {
      setFormData({
        ...formData,
        // eslint-disable-next-line radix
        manager_id: parseInt(managerId),
      });
    },
  },
  {
    component: componentTypes.SELECT,
    id: 'ansible_template_id',
    name: 'ansible_template_id',
    label: __('Workflow Template'),
    placeholder: __('<Choose>'),
    includeEmpty: true,
    options: (formData.workflowTemplates && formData.workflowTemplates.resources)
      ? dropdownOptions(formData.workflowTemplates.resources)
      : [],
  },
]);

const ansibleFieldsCommon = ({ levels }) => ([
  {
    component: componentTypes.TEXT_FIELD,
    id: 'execution_ttl',
    name: 'execution_ttl',
    label: __('Max TTL(mins)'),
  },
  {
    component: componentTypes.SELECT,
    id: 'log_output',
    name: 'log_output',
    label: __('Logging Output'),
    options: Object.entries(levels.output).map(([id, name]) => ({ label: name, value: id })),
  },
]);

const additionalFields = [
  {
    id: 'host',
    component: componentTypes.RADIO,
    label: __('Hosts'),
    name: 'host',
    options: [
      { value: 'localhost', label: 'Localhost' },
      { value: 'specify', label: 'Specify host values' },
    ],
  },
  {
    component: componentTypes.TEXTAREA,
    name: 'provisioning_inventory',
    label: __('Specify details'),
    condition: {
      and: [{ when: 'host', is: 'specify' }],
    },
  },
];

const builtInFields = [
  {
    component: componentTypes.TEXT_FIELD,
    id: 'cls_method_data',
    name: 'cls_method_data',
    label: __('Builtin name'),
    helperText: 'Optional, if not specified, method name is used',
  },
];

const expressionFields = [
  {
    component: componentTypes.SELECT,
    id: 'cls_exp_object',
    name: 'cls_exp_object',
    label: __('Expression Object'),
    options: [],
  },
  {
    component: componentTypes.TEXTAREA,
    id: 'editexpression',
    name: 'editexpression',
    label: __('Placeholder For Edit Expression'),
  },
  {
    component: componentTypes.TEXTAREA,
    id: 'editselected',
    name: 'editselected',
    label: __('Placeholder For Edit Selected Element'),
  },
];

const playBookFields = [
  {
    component: componentTypes.SELECT,
    id: 'repository',
    name: 'repository',
    label: __('Repository'),
    placeholder: __('<Choose>'),
    options: [],
  },
  {
    component: componentTypes.SELECT,
    id: 'playbook',
    name: 'playbook',
    label: __('PlayBook'),
    condition: {
      when: 'repository',
      isNotEmpty: true,
    },
  },
  {
    component: componentTypes.SELECT,
    id: 'machineCredential',
    name: 'machineCredential',
    label: __('Machine Credential'),
    condition: {
      when: 'repository',
      isNotEmpty: true,
    },
  },
  {
    component: componentTypes.SELECT,
    id: 'vaultCredential',
    name: 'vaultCredential',
    label: __('Vault Credential'),
    condition: {
      when: 'repository',
      isNotEmpty: true,
    },
  },
  {
    component: componentTypes.SELECT,
    id: 'cloudType',
    name: 'cloudType',
    label: __('Cloud Type'),
    condition: {
      when: 'repository',
      isNotEmpty: true,
    },
  },
];

const verbosityField = ({ levels }) => ([
  {
    component: componentTypes.SELECT,
    id: 'verbosity',
    name: 'verbosity',
    label: __('Verbosity'),
    placeholder: __('<Choose>'),
    includeEmpty: true,
    options: Object.entries(levels.verbosity).map(([value, label]) => ({ label, value })),
  },
]);

export const schemaConfig = (formData, setFormData) => ({
  ansibleJobTemplate: [...ansibleFields(formData, setFormData), ...additionalFields, ...(ansibleFieldsCommon(formData))],
  ansibleWorkflowTemplate: [...ansibleFields(formData, setFormData), ...ansibleFieldsCommon(formData)],
  builtIn: [...builtInFields],
  expression: [...expressionFields],
  playbook: [...playBookFields, ...additionalFields, ...ansibleFieldsCommon(formData), ...verbosityField(formData)],
});
