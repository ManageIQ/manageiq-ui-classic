import { componentTypes, validatorTypes } from '@@ddf';

const createSchema = (buttonIcon, options, url, setState) => ({
  fields: [
    {
      component: componentTypes.TEXT_FIELD,
      id: 'button_group_name',
      name: 'name',
      label: __('Text'),
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
    {
      component: componentTypes.TEXT_FIELD,
      id: 'button_group_desription',
      name: 'description',
      label: __('Hover Text'),
      maxLength: 50,
      validate: [{ type: validatorTypes.REQUIRED }],
      isRequired: true,
    },
    {
      component: 'font-icon-picker-new',
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
      id: 'button_group_button_color',
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
      options,
    },

  ],
});

export default createSchema;