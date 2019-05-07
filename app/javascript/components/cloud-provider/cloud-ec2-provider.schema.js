import { componentTypes, validatorTypes } from '@data-driven-forms/react-form-renderer';
import get from 'lodash/get';

const prefix = 'ManageIQ::Providers::Amazon::CloudManager';

const asyncValidate = formValues => new Promise((resolve, reject) => {
  const azureValues = formValues[prefix] || {};

  const values = {
    button: 'validate',
    name: get(formValues, 'name'),
    emstype: 'ec2', // get(formValues, 'type'),
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

export const createEc2EndpointsFields = () => [{
  component: componentTypes.SUB_FORM,
  name: 'ec2-endpoints',
  title: __('Endpoints'),
  condition: {
    when: 'type',
    is: prefix,
  },
  fields: [{
    component: componentTypes.TEXT_FIELD,
    name: `${prefix}.endpoints[0].url`,
    label: __('Endpoint URL'),
    validateOnMount: true,
  }, {
    component: 'validate-credentials',
    name: 'ec2-endpoints-valid',
    asyncValidate,
    fields: [{
      component: componentTypes.TEXT_FIELD,
      label: __('Access Key ID'),
      name: `${prefix}.credentials.userid`,
      validateOnMount: true,
      validate: [{
        type: validatorTypes.REQUIRED,
      }],
    }, {
      component: componentTypes.TEXT_FIELD,
      label: __('Secret Access Key'),
      name: `${prefix}.credentials.password`,
      type: 'password',
      validateOnMount: true,
      validate: [{
        type: validatorTypes.REQUIRED,
      }],
    }],
  }],
}];

export const createEc2GeneralFields = providerRegions => [{
  component: componentTypes.SELECT,
  name: `${prefix}.provider_region`,
  label: __('Region'),
  condition: {
    when: 'type',
    is: prefix,
  },
  options: providerRegions.map(([label, value]) => ({ value, label })),
  validateOnMount: true,
  validate: [{
    type: validatorTypes.REQUIRED,
  }],
}];
