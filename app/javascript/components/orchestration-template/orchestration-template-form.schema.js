import { componentTypes, validatorTypes } from '@data-driven-forms/react-form-renderer';

const templateTypeOptions = [{
  label: 'Amazon CloudFormation',
  value: 'ManageIQ::Providers::Amazon::CloudManager::OrchestrationTemplate',
}, {
  label: 'OpenStack Heat',
  value: 'ManageIQ::Providers::Openstack::CloudManager::OrchestrationTemplate',
}, {
  label: 'Microsoft Azure',
  value: 'ManageIQ::Providers::Azure::CloudManager::OrchestrationTemplate',
}, {
  label: 'VNF',
  value: 'ManageIQ::Providers::Openstack::CloudManager::VnfdTemplate',
}, {
  label: 'VMWare vApp',
  value: 'ManageIQ::Providers::Vmware::CloudManager::OrchestrationTemplate',
}];

const orchestrationFormSchema = managers => ({
  fields: [{
    component: componentTypes.TEXT_FIELD,
    name: 'name',
    label: __('Name'),
    isRequired: true,
    validate: [{
      type: validatorTypes.REQUIRED,
    }],
  }, {
    component: componentTypes.TEXTAREA,
    name: 'description',
    label: __('Description'),
  }, {
    component: componentTypes.SELECT,
    name: 'type',
    label: __('Template Type'),
    options: templateTypeOptions,
    initialValue: templateTypeOptions[0].value,
  }, {
    condition: {
      when: 'type',
      is: 'ManageIQ::Providers::Openstack::CloudManager::VnfdTemplate',
    },
    name: 'ems_id',
    component: componentTypes.SELECT,
    options: managers.map(([label, value]) => ({ value, label })),
    placeholder: `<${__('Choose')}>`,
    isRequired: true,
    validate: [{
      type: validatorTypes.REQUIRED,
    }],
  }, {
    name: 'draft',
    label: 'Draft',
    component: componentTypes.CHECKBOX,
  }, {
    component: 'hr',
    name: 'form-separator',
  }, {
    component: 'code-editor',
    name: 'add-ot-code-editor',
    modes: ['json', 'yaml'],
  }],
});

export default orchestrationFormSchema;
