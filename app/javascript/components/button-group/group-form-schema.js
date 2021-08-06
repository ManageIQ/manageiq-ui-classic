import { componentTypes, validatorTypes } from '@data-driven-forms/react-form-renderer';

const groupFormSchema = (initialValue, buttonIcon, options, url, setState) => ({
  fields: [
    {
      component: componentTypes.SUB_FORM,
      id: 'button_group_form',
      name: 'button_group',
      title: __('Basic Info'),
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
          ],
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
          component: componentTypes.PLAIN_TEXT,
          id: 'button_group_icon',
          name: 'button_group.icon_label',
          label: __('Icon'),
        },
        {
          component: 'font-icon-picker',
          id: 'button_group_button_icon',
          name: 'set_data.button_icon_1',
          label: __('Icon'),
          selected: buttonIcon,
          onChangeURL: url,
          iconChange: (icon) => {
            initialValue.set_data.button_icon = icon;
            setState((state) => ({ 
              ...state,
              initialValue: {...initialValue}, 
              buttonIcon: icon,
            }));
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
        { // for testing form-icon-picker
          component: 'test-component',
          id: 'button_group_test-component',
          name: 'set_data.button_icon',
          label: __('Test component'),
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
          options: options,
        },
      ],
});
    
export default groupFormSchema;