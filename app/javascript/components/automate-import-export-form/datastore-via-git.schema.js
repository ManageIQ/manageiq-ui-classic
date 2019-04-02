import { componentTypes, validatorTypes } from '@data-driven-forms/react-form-renderer';

const createSchema = () => ({
  fields: [{
    name: 'git_url',
    label: __('Git URL'),
    component: componentTypes.TEXT_FIELD,
    validateOnMount: true,
    validate: [{
      type: validatorTypes.REQUIRED,
    }, {
      type: validatorTypes.PATTERN_VALIDATOR,
      pattern: '^(http|https)://.*',
      message: __('Please provide a valid git URL'),
    }],
  }, {
    name: 'git_username',
    label: __('Username'),
    component: componentTypes.TEXT_FIELD,
  }, {
    name: 'git_password',
    label: __('Password'),
    component: componentTypes.TEXT_FIELD,
    type: 'password',
  }, {
    component: componentTypes.CHECKBOX,
    name: 'git_verify_ssl',
    label: __('Verify Peer Certificate'),
  }],
});

export default createSchema;
