import { componentTypes, validatorTypes } from '@@ddf';

const createSchema = (buttonIcon, options, url, setState) => ({
  fields: [
    {
      component: componentTypes.SUB_FORM,
      id: 'name-wrapper',
      name: 'subform-1',
      fields: [
        {
          component: componentTypes.TEXT_FIELD,
          id: 'button_group_name',
          name: 'name',
          label: __('Name'),
          maxLength: 50,
          validate: [{ type: validatorTypes.REQUIRED }],
          isRequired: true,
        },
        {
          component: componentTypes.CHECKBOX,
          id: 'button_group_display',
          label: __('Display on Button'),
          name: 'set_data.display',
        },
      ],
    },
    {
      component: componentTypes.TEXT_FIELD,
      id: 'button_group_desription',
      name: 'description',
      label: __('Description'),
      maxLength: 50,
      validate: [{ type: validatorTypes.REQUIRED }],
      isRequired: true,
    },
    {
      component: 'font-icon-picker-ddf',
      id: 'button_group_button_icon',
      name: 'set_data.button_icon',
      label: __('Icon'),
      selected: buttonIcon,
      onChangeURL: url,
      iconChange: (icon) => {
        setState((state) => ({ ...state, buttonIcon: icon }));
      },
    },
    {
      component: componentTypes.TEXT_FIELD,
      id: 'color-select',
      name: 'set_data.button_color',
      label: __('Icon color'),
      type: 'color',
      className: 'form-control',
    },
    options && {
      component: componentTypes.DUAL_LIST_SELECT,
      id: 'button_group_button_order',
      name: 'set_data.button_order',
      label: __('Assign buttons'),
      leftTitle: __('Unassigned:'),
      rightTitle: __('Selected:'),
      moveLeftTitle: __('Remove'),
      moveAllLeftTitle: __('Remove all'),
      moveRightTitle: __('Add'),
      moveAllRightTitle: __('Add all'),
      noValueTitle: __('No option selected'),
      noOptionsTitle: __('No available options'),
      filterOptionsTitle: __('Filter options'),
      filterValuesTitle: __('Filter values'),
      options,
    },

  ],
});

export default createSchema;
