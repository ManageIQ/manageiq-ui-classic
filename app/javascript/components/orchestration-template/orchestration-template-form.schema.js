import { componentTypes, validatorTypes } from '@@ddf';
import { http } from '../../http_api';

const getManagers = () => http.get('/catalog/ot_orchestration_managers?template_type=ManageIQ::Providers::Openstack::CloudManager::VnfdTemplate')
  .then(managers => managers.map(([label, value]) => ({ value: value.toString(), label })));

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
  label: 'Microsoft AzureStack',
  value: 'ManageIQ::Providers::AzureStack::CloudManager::OrchestrationTemplate',
}, {
  label: 'VNF',
  value: 'ManageIQ::Providers::Openstack::CloudManager::VnfdTemplate',
}, {
  label: 'VMWare vApp',
  value: 'ManageIQ::Providers::Vmware::CloudManager::OrchestrationTemplate',
}];

const validateCopyContent = (value, { name, content }, copy) => {
  if (!copy) {
    return undefined;
  }

  if (value === content) {
    return sprintf(__('Unable to create a new template copy %s: old and new template content have to differ.'), name);
  }

  return undefined;
};

const orchestrationFormSchema = (isEditing = false, isCopying = false, initialValues = {}) => ({
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
    component: componentTypes.SUB_FORM,
    name: 'provider-type',
    fields: isCopying || isEditing ? [] : [{
      condition: {
        when: 'type',
        is: 'ManageIQ::Providers::Openstack::CloudManager::VnfdTemplate',
      },
      name: 'ems_id',
      label: __('Provider'),
      component: componentTypes.SELECT,
      loadOptions: getManagers,
      placeholder: `<${__('Choose')}>`,
      isRequired: true,
      validateOnMount: true,
      clearOnUnmount: true,
      validate: [{
        type: validatorTypes.REQUIRED,
      }],
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
    }, value => validateCopyContent(value, initialValues, isCopying)],
  }],
});

export default orchestrationFormSchema;
