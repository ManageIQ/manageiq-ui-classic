import { componentTypes, validatorTypes } from '@@ddf';
import { getTimeOptions, secretKeyPlaceholder } from './helper';

const createSchema = (editMode, setState) => {
  const amazonEdit = true;
  console.log(editMode);
  const fields = [
    {
      component: componentTypes.SUB_FORM,
      id: 'session_timeout',
      name: 'session_timeout',
      title: __('Session Timeout'),
      fields: [
        {
          component: componentTypes.SELECT,
          id: 'session_timeout_hours',
          name: 'session_timeout_hours',
          label: __('Hours'),
          options: getTimeOptions(24, 1),
        },
        {
          component: componentTypes.SELECT,
          id: 'session_timeout_mins',
          name: 'session_timeout_mins',
          label: __('Minutes'),
          options: getTimeOptions(12, 5),
        },
      ],
    },
    {
      component: componentTypes.SELECT,
      id: 'mode',
      name: 'mode',
      label: __('Mode'),
      options: [
        { value: 'database', label: __('Database') },
        { value: 'amazon', label: __('Amazon') },
        { value: 'httpd', label: __('External (httpd)') },
      ],
    },
    {
      component: componentTypes.SUB_FORM,
      id: 'amazon_subform',
      name: 'amazon_subform',
      title: __('Amazon Primary AWS Account Settings for IAM'),
      condition: {
        when: 'mode',
        is: 'amazon',
      },
      fields: [
        {
          component: 'validate-provider-credentials',
          id: 'authentications.default.valid',
          name: 'authentications.default.valid',
          skipSubmit: true,
          isRequired: true,
          validationDependencies: [],
          fields: [
            {
              component: componentTypes.TEXT_FIELD,
              id: 'amazon_key',
              name: 'amazon_key',
              validate: [{ type: validatorTypes.REQUIRED }],
              isRequired: true,
              label: __('Access Key'),
              maxLength: 50,
            },
            ...(amazonEdit ? [
              ...(editMode ? [
                {
                  component: 'edit-password-field',
                  id: 'amazon_secret',
                  name: 'amazon_secret',
                  editMode: true,
                  disabled: false,
                  setEditMode: () => {
                    setState((state) => ({
                      ...state,
                      editMode: false,
                    }));
                  },
                  label: __('Secret Key'),
                  maxLength: 50,
                  type: 'password',
                  placeholder: secretKeyPlaceholder(),
                  buttonLabel: editMode ? __('Cancel') : __('Change'),
                }]
                : [{
                  component: 'edit-password-field',
                  id: 'amazon_secret',
                  name: 'amazon_secret',
                  editMode: false,
                  disabled: true,
                  setEditMode: () => {
                    setState((state) => ({
                      ...state,
                      editMode: true,
                    }));
                  },
                  label: __('Secret Key'),
                  maxLength: 50,
                  type: 'password',
                  placeholder: secretKeyPlaceholder(),
                  buttonLabel: editMode ? __('Cancel') : __('Change'),
                }])] : [{
              component: 'password-field',
              id: 'amazon_secret',
              name: 'amazon_secret',
              maxLength: 50,
              type: 'password',
              placeholder: amazonEdit ? secretKeyPlaceholder() : '',
            }]),
          ],
        },
      ],
    },
    {
      component: componentTypes.SUB_FORM,
      id: 'amazon_role_subform',
      name: 'amazon_role_subform',
      title: __('Role Settings'),
      condition: {
        when: 'mode',
        is: 'amazon',
      },
      fields: [
        {
          component: componentTypes.CHECKBOX,
          id: 'amazon_role',
          name: 'amazon_role',
          label: __('Get User Groups from Amazon'),
        },
      ],
    },
    {
      component: componentTypes.SUB_FORM,
      id: 'httpd_subform',
      name: 'httpd_subform',
      title: __('External Authentication (httpd) Settings'),
      condition: {
        when: 'mode',
        is: 'httpd',
      },
      fields: [
        {
          component: componentTypes.CHECKBOX,
          id: 'sso_enabled',
          name: 'sso_enabled',
          label: __('Enable Single Sign-On'),
        },
        {
          component: componentTypes.RADIO,
          id: 'provider_type',
          name: 'provider_type',
          label: __('Provider Type'),
          options: [
            { value: 'none', label: 'None' },
            { value: 'saml', label: 'Enable SAML' },
            { value: 'oidc', label: ' Enable OpenID-Connect' },
          ],
        },
        {
          component: componentTypes.CHECKBOX,
          id: 'local_login_disabled',
          name: 'local_login_disabled',
          label: __('Disable Local Login'),
          condition: {
            or: [
              {
                when: 'provider_type',
                is: 'saml',
              },
              {
                when: 'provider_type',
                is: 'oidc',
              },
            ],
          },
        },
      ],
    },
    {
      component: componentTypes.SUB_FORM,
      id: 'httpd_role_subform',
      name: 'httpd_role_subform',
      title: __('External Authentication (httpd) Settings'),
      condition: {
        when: 'mode',
        is: 'httpd',
      },
      fields: [
        {
          component: componentTypes.CHECKBOX,
          id: 'httpd_role',
          name: 'httpd_role',
          label: __('Get User Groups from External Authentication (httpd)'),
        },
      ],
    },
  ];

  return { fields };
};

export default createSchema;
