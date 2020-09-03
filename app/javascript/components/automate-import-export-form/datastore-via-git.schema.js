import { componentTypes, validatorTypes } from '@@ddf';

const createSchema = () => ({
  fields: [{
    id: 'git_url',
    name: 'git_url',
    label: __('Git URL'),
    component: componentTypes.TEXT_FIELD,
    validateOnMount: true,
    validate: [{
      type: validatorTypes.REQUIRED,
    }, {
      type: validatorTypes.PATTERN,
      pattern: '^(http|https)://.*',
      message: __('Please provide a valid git URL'),
    }],
  }, {
    id: 'git_username',
    name: 'git_username',
    label: __('Username'),
    component: componentTypes.TEXT_FIELD,
  }, {
    id: 'git_password',
    name: 'git_password',
    label: __('Password'),
    component: componentTypes.TEXT_FIELD,
    type: 'password',
  }, {
    component: componentTypes.CHECKBOX,
    id: 'git_verify_ssl',
    name: 'git_verify_ssl',
    label: __('Verify Peer Certificate'),
  }],
});

export default createSchema;
