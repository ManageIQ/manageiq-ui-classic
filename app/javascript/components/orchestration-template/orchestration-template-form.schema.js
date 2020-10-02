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

const setFormat = (values) => {
  return typeof values.content !== 'undefined' && values.content[0] === '{' ? 'json' : 'yaml';
};

const orchestrationFormSchema = (isEditing = false, isCopying = false, initialValues = {}) => ({
  fields: [{
    component: componentTypes.TEXT_FIELD,
    id: 'name',
    name: 'name',
    label: __('Name'),
    isRequired: true,
    validateOnMount: true,
    validate: [{
      type: validatorTypes.REQUIRED,
    }],
  }, {
    component: componentTypes.TEXTAREA,
    id: 'description',
    name: 'description',
    label: __('Description'),
  }, {
    component: componentTypes.SUB_FORM,
    id: 'template-type',
    name: 'template-type',
    fields: isEditing ? [] : [
      {
        component: componentTypes.SELECT,
        isDisabled: isEditing,
        id: 'type',
        name: 'type',
        label: __('Template Type'),
        options: templateTypeOptions,
        initialValue: templateTypeOptions[0].value,
      }],
  }, {
    component: componentTypes.SUB_FORM,
    id: 'provider-type',
    name: 'provider-type',
    fields: isCopying || isEditing ? [] : [{
      condition: {
        when: 'type',
        is: 'ManageIQ::Providers::Openstack::CloudManager::VnfdTemplate',
      },
      id: 'ems_id',
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
    id: 'draft',
    name: 'draft',
    label: __('Draft'),
    component: componentTypes.CHECKBOX,
  }, {
    component: componentTypes.SUB_FORM,
    id: 'code-section',
    name: 'code-section',
    fields: [{
      component: 'code-editor',
      id: 'content',
      name: 'content',
      label: __('Content'),
      mode: setFormat(initialValues),
      modes: ['yaml', 'json'],
      validateOnMount: true,
      helperText: __('Select the format type below to apply syntax highlighting for better readability'),
      isRequired: true,
      validate: [{
        type: validatorTypes.REQUIRED,
      }, value => validateCopyContent(value, initialValues, isCopying)],
    }],
  }],
});

export default orchestrationFormSchema;
