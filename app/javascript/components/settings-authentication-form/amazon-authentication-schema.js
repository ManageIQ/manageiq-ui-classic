import { componentTypes } from '@@ddf';

const accountSettings = (onFieldChange) => [
  {
    component: componentTypes.SUB_FORM,
    id: 'amazonAuthenticationSettings',
    name: 'amazonAuthenticationSettings',
    className: 'amazonAuthenticationSettingsWrapper',
    title: __('Amazon Primary AWS Account Settings for IAM'),
    fields: [
      {
        component: componentTypes.TEXT_FIELD,
        id: 'amazon_key',
        name: 'amazon_key',
        label: __('Access Key'),
        onKeyUp: (event) => onFieldChange(event.target),
      },
      {
        component: componentTypes.TEXT_FIELD,
        id: 'amazon_secret',
        name: 'amazon_secret',
        label: __('Secret Key'),
        type: 'password',
        onKeyUp: (event) => onFieldChange(event.target),
      },
    ],
  },
];

const roleSettings = () => [
  {
    component: componentTypes.SUB_FORM,
    id: 'amazonRoleSettings',
    name: 'amazonRoleSettings',
    className: 'amazonRoleSettingsWrapper',
    title: __('Role Settings'),
    fields: [
      {
        component: componentTypes.CHECKBOX,
        label: __('Get User Groups from Amazon'),
        name: 'amazon_role',
        id: 'amazon_role',
      },

    ],
  },
];

const validateCredentials = (initialValue) => {
  console.log('initialValue===============', initialValue);
  return ({
    component: 'settings-authentication-provider-validator',
    id: 'settings-authentication-provider-validator',
    name: 'settings-authentication-provider-validator',
    initialValue,
  });
};

const amazonAuthenticationSchema = (type, initialValue, onFieldChange) => [
  {
    component: componentTypes.SUB_FORM,
    id: 'amazonSettings',
    name: 'amazonSettings',
    className: 'amazonSettingsWrapper settingAuthenticationRow',
    condition: {
      when: 'mode',
      is: type,
    },
    fields: [
      accountSettings(onFieldChange),
      roleSettings(),
      validateCredentials(initialValue),
    ],
  },
];

export default amazonAuthenticationSchema;
