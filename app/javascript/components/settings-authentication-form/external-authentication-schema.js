import { componentTypes } from '@@ddf';

const providerTypes = () => [
  {
    label: 'None',
    value: 'none',
  },
  {
    label: 'Enable SAML',
    value: 'saml',
  },
  {
    label: 'Enable OpenID-Connect',
    value: 'oidc',
  }];

const singleSignOn = () => ({
  component: componentTypes.CHECKBOX,
  label: __('Enable Single Sign-On'),
  name: 'sso_enabled',
  id: 'sso_enabled',
  className: 'externalSettingsWrapper settingAuthenticationRow',
});

const providerType = () => ({
  component: componentTypes.RADIO,
  label: __('Provider Type'),
  name: 'provider_type',
  id: 'providerType',
  options: providerTypes(),

});

const disableLocalLogin = () => ({
  component: componentTypes.CHECKBOX,
  label: __('Disable Local Login'),
  name: 'local_login_disabled',
  id: 'local_login_disabled',
  condition: {
    not: [
      {
        when: 'provider_type',
        is: 'none',
      },
    ],
  },
});

const accountSettings = () => [
  {
    component: componentTypes.SUB_FORM,
    id: 'externalAuthenticationSettings',
    name: 'externalAuthenticationSettings',
    className: 'externalAuthenticationSettingsWrapper',
    title: __('External Authentication (httpd) Settings'),
    fields: [
      singleSignOn(),
      providerType(),
      disableLocalLogin(),
    ],
  },
];

const roleSettings = () => [
  {
    component: componentTypes.SUB_FORM,
    id: 'exxternalRoleSettings',
    name: 'exxternalRoleSettings',
    className: 'externalRoleSettingsWrapper',
    title: __('Role Settings'),
    fields: [
      {
        component: componentTypes.CHECKBOX,
        label: __('Get User Groups from External Authentication (httpd)'),
        name: 'httpd_role',
        id: 'httpd_role',
      },

    ],
  },
];

const externalAuthenticationSchema = (type) => [
  {
    component: componentTypes.SUB_FORM,
    id: 'externalSettings',
    name: 'externalSettings',
    className: 'externalSettingsWrapper settingAuthenticationRow',
    condition: {
      when: 'mode',
      is: type,
    },
    fields: [
      accountSettings(type),
      roleSettings(),
    ],
  },
];

export default externalAuthenticationSchema;
