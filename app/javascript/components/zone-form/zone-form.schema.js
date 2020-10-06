import { componentTypes, validatorTypes } from '@@ddf';

const createSchema = edit => ({
  fields: [{
    component: componentTypes.SUB_FORM,
    name: 'zone-information-subform',
    title: __('Zone Information'),
    fields: [{
      component: componentTypes.TEXT_FIELD,
      id: 'name',
      name: 'name',
      label: __('Name'),
      isDisabled: edit,
      maxLength: 50,
      isRequired: true,
      validate: [{ type: validatorTypes.REQUIRED }],
    }, {
      component: componentTypes.TEXT_FIELD,
      id: 'description',
      name: 'description',
      label: __('Description'),
      maxLength: 50,
      isRequired: true,
      validate: [{ type: validatorTypes.REQUIRED }],
    }, {
      component: componentTypes.TEXT_FIELD,
      id: 'settings.proxy_server_ip',
      name: 'settings.proxy_server_ip',
      label: __('SmartProxy Server IP'),
      maxLength: 50,
    },
    ],
  }, {
    component: componentTypes.SUB_FORM,
    name: 'credentials-subform',
    title: __('Credentials - Windows Domain'),
    fields: [{
      component: componentTypes.TEXT_FIELD,
      id: 'authentications.userid',
      name: 'authentications.userid',
      label: __('Username'),
      maxLength: 50,
    }, {
      component: 'password-field',
      edit,
      type: 'password',
      id: 'authentications.password',
      name: 'authentications.password',
      label: __('Password'),
      maxLength: 50,
    },
      // {
      //     component: componentTypes.TEXT_FIELD,
      //     type: 'password',
      //     id: 'verify',
      //     name: 'verify',
      //     label: __('Verify Password'),
      //     maxLength: 50,
      // },
    ],
  }, {
    component: componentTypes.SUB_FORM,
    name: 'settings-subform',
    title: __('Settings'),
    fields: [{
      component: 'select',
      id: 'settings.concurrent_vm_scans',
      name: 'settings.concurrent_vm_scans',
      label: __('Max Active VM Scans'),
      initialValue: 0,
      isRequired: true,
      validate: [{ type: validatorTypes.REQUIRED }],
      options: [
        { label: __('Unlimited'), value: 0 },
        ...Array(4).fill().map((_, i) => ({ label: i + 1, value: i + 1 })),
        ...Array(10).fill().map((_, i) => ({ label: 5 * (i + 1), value: 5 * (i + 1) })),
      ],
    },
    ],
  },
  ],
});

export default createSchema;
