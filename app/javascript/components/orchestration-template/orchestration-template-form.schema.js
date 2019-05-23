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

const orchestrationFormSchema = (managers, isEditing = false) => ({
  fields: [{
    component: componentTypes.TEXT_FIELD,
    name: 'name',
    label: __('Name'),
    isRequired: true,
    validateOnMount: true,
    validate: [{
      type: validatorTypes.REQUIRED,
    }],
  }, {
    component: componentTypes.TEXTAREA,
    name: 'description',
    label: __('Description'),
  }, {
    component: componentTypes.SUB_FORM,
    name: 'template-type',
    fields: isEditing ? [] : [
      {
        component: componentTypes.SELECT,
        isDisabled: isEditing,
        name: 'type',
        label: __('Template Type'),
        options: templateTypeOptions,
        initialValue: templateTypeOptions[0].value,
      }],
  }, {
    condition: {
      when: 'type',
      is: 'ManageIQ::Providers::Openstack::CloudManager::VnfdTemplate',
    },
    name: 'ems_id',
    label: __('Provider'),
    component: componentTypes.SELECT,
    options: managers.map(([label, value]) => ({ value: value.toString(), label })),
    placeholder: `<${__('Choose')}>`,
    isRequired: true,
    validateOnMount: true,
    clearOnUnmount: true,
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
    name: 'content',
    label: __('Content'),
    modes: ['yaml', 'json'],
    validateOnMount: true,
    isRequired: true,
    validate: [{
      type: validatorTypes.REQUIRED,
    }],
  }],
});

export default orchestrationFormSchema;
