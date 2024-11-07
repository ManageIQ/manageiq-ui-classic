import { componentTypes, validatorTypes } from '@@ddf';

const createSchema = (selectOptions, customProps, formData) => ({
  fields: [
    {
      component: componentTypes.PLAIN_TEXT,
      id: 'role-information',
      name: 'role-information',
      label: __('Role Information'),
      className: 'role-information',
    },
    {
      component: componentTypes.TEXT_FIELD,
      id: 'name',
      name: 'name',
      initialValue: formData.initialValues.name || '',
      label: __('Name'),
      className: 'name-label',
      maxLength: 128,
      validate: [{ type: validatorTypes.REQUIRED }],
      isRequired: true,
    },
    {
      component: componentTypes.SELECT,
      id: 'vm_restriction',
      name: 'vm_restriction',
      className: 'access-restriction-orchestration',
      initialValue: formData.initialValues.vms || '',
      label: __('Access Restriction for Orchestration Stacks, Key Pairs, Services, VMs, and Templates'),
      maxLength: 128,
      options: selectOptions.map((option) => ({ label: option[1], value: option[0] })),
    },
    {
      component: componentTypes.SELECT,
      id: 'service_template_restriction',
      name: 'service_template_restriction',
      initialValue: formData.initialValues.service_templates || '',
      className: 'access-restriction-catalog',
      label: __('Access Restriction for Catalog Items'),
      maxLength: 128,
      options: selectOptions.map((option) => ({ label: option[1], value: option[0] })),
    },
    {
      component: 'checkbox-tree',
      name: 'tree_dropdown',
      id: 'tree_dropdown',
      label: __('Product Features (Editing)'),
      className: 'checkbox-tree',
      nodes: formData.nodes,
      checked: formData.checked,
    },
  ],
});

export default createSchema;
