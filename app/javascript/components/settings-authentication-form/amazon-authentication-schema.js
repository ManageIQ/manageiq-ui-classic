import { componentTypes } from '@@ddf';

const accountSettings = () => [
  {
    component: componentTypes.SUB_FORM,
    id: 'amazonAuthenticationSettings',
    name: 'amazonAuthenticationSettings',
    className: 'amazonAuthenticationSettingsWrapper',
    title: __('Amazon Primary AWS Account Settings for IAM'),
    fields: [
      {
        component: componentTypes.TEXT_FIELD,
        id: 'authentication_amazon_key',
        name: 'authentication_amazon_key',
        label: __('Access Key'),
      },
      {
        component: componentTypes.TEXT_FIELD,
        id: 'authentication_amazon_secret',
        name: 'authentication_amazon_secret',
        label: __('Secret Key'),
        type: 'password',
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

const amazonAuthenticationSchema = (type) => [
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
      accountSettings(),
      roleSettings(),
    ],
  },
];

export default amazonAuthenticationSchema;
