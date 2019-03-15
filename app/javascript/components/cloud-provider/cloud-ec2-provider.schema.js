import { componentTypes, validatorTypes } from '@data-driven-forms/react-form-renderer';
import { asyncValidate } from './validators';

export const createEc2EndpointsFields = () => [{
  component: componentTypes.SUB_FORM,
  name: 'ec2-endpoints',
  title: __('Endpoints'),
  condition: {
    when: 'type',
    is: 'ManageIQ::Providers::Amazon::CloudManager',
  },
  fields: [{
    component: componentTypes.TEXT_FIELD,
    name: 'ec2_url',
    label: __('Endpoint URL'),
    validateOnMount: true,
    validate: [{
      type: validatorTypes.REQUIRED, // switch for URL validation
    }],
  }, {
    component: 'validate-credentials',
    name: 'ec2-endpoints-valid',
    asyncValidate,
    fields: [{
      component: componentTypes.TEXT_FIELD,
      label: __('Access Key ID'),
      name: 'ec2_userid',
      validateOnMount: true,
      validate: [{
        type: validatorTypes.REQUIRED,
      }],
    }, {
      component: componentTypes.TEXT_FIELD,
      label: __('Secret Access Key'),
      name: 'ec2_password',
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
  name: 'ec2_provider_region',
  label: __('Region'),
  condition: {
    when: 'type',
    is: 'ManageIQ::Providers::Amazon::CloudManager',
  },
  options: providerRegions.map(([label, value]) => ({ value, label })),
  validateOnMount: true,
  validate: [{
    type: validatorTypes.REQUIRED,
  }],
}];
