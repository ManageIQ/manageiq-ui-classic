import { componentTypes, validatorTypes } from '@@ddf';

export const createSchema = (data) => {
  const fields = [
    {
      component: componentTypes.SUB_FORM,
      name: 'MigrateInstance',
      title: __('Migrate Instance'),

      fields: [{
        component: componentTypes.CHECKBOX,
        id: 'auto_select_host',
        name: 'auto_select_host',
        label: __('Auto-select Host?'),
        isDisabled: data.disableSelection,
      },
      {
        component: componentTypes.CHECKBOX,
        id: 'block_migration',
        name: 'block_migration',
        label: __('Block Migration'),
        validate: [{ type: validatorTypes.REQUIRED }],
      },
      {
        component: componentTypes.CHECKBOX,
        id: 'disk_over_commit',
        name: 'disk_over_commit',
        label: __('Disk Over Commit'),
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
