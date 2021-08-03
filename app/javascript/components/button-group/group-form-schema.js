import { componentTypes, validatorTypes } from '@data-driven-forms/react-form-renderer';

const groupFormSchema = (buttonIcon, unassignedButtons, iconChanged) => ({
    fields: [
        {
            component: componentTypes.SUB_FORM,
            id: 'button_group_form',
            name: 'button_group',
            title: __('Basic Info'),
            fields: [
              {
                component: componentTypes.SUB_FORM,
                id: 'basic_info_text_group',
                name: 'basic_info.text_group',
                
                fields: [
                  {
                  component: componentTypes.TEXT_FIELD,
                  id: 'button_group_name',
                  name: 'name',
                  label: __('Text'),
                  maxLength: 15,
                  validate: [{ type: validatorTypes.REQUIRED }],
                  isRequired: true,
                  },
                  {
                    component: componentTypes.CHECKBOX,
                    id: 'button_group_display',
                    label: __('Display on Button'),
                    name: 'set_data.display',
                  }
                ]
              },  
              {
                component: componentTypes.TEXT_FIELD,
                id: 'button_group_desription',
                name: 'description',
                label: __('Hover Text'),
                maxLength: 30
              },
              {
                component: componentTypes.PLAIN_TEXT,
                id: 'button_group_icon',
                name: 'button_group.icon_label',
                label: __('Icon')
              },
              {
                component: 'font-icon-picker',
                id: 'font-icon-picker',
                name: 'set_data.button_icon',
                label: __('Icon'),
                selected: buttonIcon,
                iconChange: (icon) => iconChanged(icon)
              },
              {
                component: componentTypes.TEXT_FIELD,
                id: 'button_group_button_color',
                name: 'set_data.button_color',
                label: __('Icon color'),
                type: 'color',
                className: 'form-control'
              },
              unassignedButtons && {
                component: componentTypes.DUAL_LIST_SELECT,
                id: 'button_group_button_order',
                name: "set_data.button_order",
                label: __('Assign buttons'),
                leftTitle: __('Unassigned:'),
                rightTitle: __('Selected:'),
                moveLeftTitle: __('Remove'),
                moveAllLeftTitle: __('Remove all'),
                moveRightTitle: __('Add'),
                moveAllRightTitle: __('Add all'),
                options: unassignedButtons
              }
          ]
    }    
  ]
});
    
export default groupFormSchema;