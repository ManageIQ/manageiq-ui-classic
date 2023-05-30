import { componentTypes, validatorTypes } from '@@ddf';

export const createSchema = (data) => {
  const fields = [
    {
      component: componentTypes.SUB_FORM,
      name: 'EvacuateInstance',
      title: __('Evacuate Host'),

      fields: [{
        component: componentTypes.CHECKBOX,
        id: 'auto_select_host',
        name: 'auto_select_host',
        label: __('Auto-select Host?'),
        isDisabled: data.disableSelection,
        validateOnMount: true,
      },
      {
        component: componentTypes.CHECKBOX,
        id: 'on_shared_storage',
        name: 'on_shared_storage',
        label: __('On Shared Storage'),
        validateOnMount: true,
      },
      {
        component: 'password-field',
        id: 'admin_password',
        name: 'admin_password',
        label: __('Admin Password'),
        isRequired: true,
        condition: {
          when: 'on_shared_storage',
          is: false,
        },
        validate: [{ type: validatorTypes.REQUIRED }],
      },
      {
        component: componentTypes.SELECT,
        id: 'destination_host',
        name: 'destination_host',
        isRequired: true,
        placeholder: __('<Choose>'),
        includeEmpty: true,
        options: data.options.hosts,
        labelText: __('Hosts'),
        condition: {
          when: 'auto_select_host',
          is: false,
        },
        validate: [{ type: validatorTypes.REQUIRED }],
      },
      ],
    },
  ];
  return { fields };
};
