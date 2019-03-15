import { componentTypes, validatorTypes } from '@data-driven-forms/react-form-renderer';
import { asyncValidate, guidRegex } from './validators';

export const createAzureEndpointsFields = () => [{
  component: componentTypes.SUB_FORM,
  name: 'azure-endpoints',
  title: __('Credentials'),
  condition: {
    when: 'type',
    is: 'ManageIQ::Providers::Azure::CloudManager',
  },
  fields: [{
    component: componentTypes.TEXT_FIELD,
    name: 'azure_url',
    label: __('Endpoint URL'),
    validateOnMount: true,
    validate: [{
      type: validatorTypes.REQUIRED, // switch for URL validation
    }],
  }, {
    component: 'validate-credentials',
    name: 'azure-endpoints-valid',
    asyncValidate,
    fields: [{
      component: componentTypes.TEXT_FIELD,
      label: __('Client ID'),
      name: 'azure_userid',
      validateOnMount: true,
      validate: [{
        type: validatorTypes.REQUIRED,
      }],
    }, {
      component: componentTypes.TEXT_FIELD,
      label: __('Client Key'),
      name: 'azure_password',
      type: 'password',
      validateOnMount: true,
      validate: [{
        type: validatorTypes.REQUIRED,
      }],
    }],
  }],
}];

export const createAzureGeneralFields = providerRegions => [{
  component: componentTypes.SELECT,
  name: 'azure_provider_region',
  label: __('Region'),
  condition: {
    when: 'type',
    is: 'ManageIQ::Providers::Azure::CloudManager',
  },
  options: providerRegions.map(([label, value]) => ({ value, label })),
  validateOnMount: true,
  validate: [{
    type: validatorTypes.REQUIRED,
  }],
}, {
  component: componentTypes.TEXT_FIELD,
  name: 'ems_tenant_id',
  label: __('Tenant ID'),
  condition: {
    when: 'type',
    is: 'ManageIQ::Providers::Azure::CloudManager',
  },
  validateOnMount: true,
  validate: [{
    type: validatorTypes.REQUIRED,
  }, {
    type: validatorTypes.PATTERN_VALIDATOR,
    pattern: guidRegex,
    showPattern: false,
    message: __('Invalid input format, please enter a GUID'),
  }],
}, {
  component: componentTypes.TEXT_FIELD,
  name: 'subscription',
  label: __('Subscription ID'),
  condition: {
    when: 'type',
    is: 'ManageIQ::Providers::Azure::CloudManager',
  },
}];
