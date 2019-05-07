import { componentTypes, validatorTypes } from '@data-driven-forms/react-form-renderer';
import get from 'lodash/get';
import { guidRegex } from './validators';

const prefix = 'ManageIQ::Providers::Azure::CloudManager';

const asyncValidate = formValues => new Promise((resolve, reject) => {
  const azureValues = formValues[prefix] || {};

  const values = {
    button: 'validate',
    name: get(formValues, 'name'),
    emstype: 'azure', // get(formValues, 'type'),
    provider_region: get(azureValues, 'region'),
    azure_tenant_id: get(azureValues, 'uid_ems'),
    subscription: get(azureValues, 'subscription'),
    zone: 'default',
    default_url: get(azureValues, 'endpoints[0].url'),
    default_userid: get(azureValues, 'credentials.userid'),
    default_password: get(azureValues, 'credentials.password'),
  };
  // should be replaced by endpoint
  $.post('/ems_cloud', values, (response) => {
    if (response.level === 'error') {
      add_flash(response.message, response.level, response.options);
      return reject(__('Validation Required'));
    }

    return resolve('Valid');
  });
});


export const createAzureEndpointsFields = () => [{
  component: componentTypes.SUB_FORM,
  name: 'azure-endpoints',
  title: __('Credentials'),
  condition: {
    when: 'type',
    is: prefix,
  },
  fields: [{
    component: componentTypes.TEXT_FIELD,
    name: `${prefix}.endpoints[0].url`,
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
      name: `${prefix}.credentials.userid`,
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
      label: __('Client Key'),
      name: `${prefix}.credentials.password`,
      type: 'password',
      validateOnMount: true,
      validate: [{
        type: validatorTypes.REQUIRED,
      }],
    }],
  }],
}];

export const createAzureGeneralFields = providerRegions => [{
  component: componentTypes.SUB_FORM,
  name: `${prefix}-general-fields`,
  condition: {
    when: 'type',
    is: prefix,
  },
  fields: [
    {
      component: componentTypes.SELECT,
      name: `${prefix}.region`,
      label: __('Region'),
      options: providerRegions.map(([label, value]) => ({ value, label })),
      validateOnMount: true,
      validate: [{
        type: validatorTypes.REQUIRED,
      }],
    }, {
      component: componentTypes.TEXT_FIELD,
      name: `${prefix}.uid_ems`,
      label: __('Tenant ID'),
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
      name: `${prefix}.subscription`,
      label: __('Subscription ID'),
      validate: [{
        type: validatorTypes.REQUIRED,
      }, {
        type: validatorTypes.PATTERN_VALIDATOR,
        pattern: guidRegex,
        showPattern: false,
        message: __('Invalid input format, please enter a GUID'),
      }],
    },
  ],
}];
