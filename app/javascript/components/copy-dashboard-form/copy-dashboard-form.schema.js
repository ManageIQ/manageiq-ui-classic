import { componentTypes, validatorTypes } from '@data-driven-forms/react-form-renderer';

function createSchema(dashboardId, MiqGroups = []) {
  const fields = [
    {
      component: componentTypes.SUB_FORM,
      title: __('Basic Info'),
      fields: [
        {
          component: componentTypes.TEXT_FIELD,
          name: 'name',
          validate: [{
            type: validatorTypes.REQUIRED,
            message: __('Required'),
          }],
          label: __('Name'),
          maxLength: 40,
          autoFocus: true,
          validateOnMount: true,
        },
        {
          component: componentTypes.TEXT_FIELD,
          name: 'description',
          validate: [{
            type: validatorTypes.REQUIRED,
            message: __('Required'),
          }],
          label: __('Description'),
          maxLength: 255,
          autoFocus: true,
          validateOnMount: true,
        },
        {
          component: componentTypes.SELECT_COMPONENT,
          name: 'groups',
          options: MiqGroups,
          // options: MiqGroups.map(([label, value]) => ({
          //   label,
          //   value,
          // })),
          label: __('Select Group'),
          placeholder: __('Nothing selected'),
          multi: true,
          isSearchable: true,
          isClearable: true,
        }
      ]
    }
  ];
  return { fields };
}

export default createSchema;
