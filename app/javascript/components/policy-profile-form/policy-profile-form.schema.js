import { componentTypes, validatorTypes } from '@@ddf';

const createSchema = (options) => ({
  fields: [
    {
      component: componentTypes.TEXT_FIELD,
      id: 'description',
      name: 'description',
      label: __('Description'),
      validate: [{ type: validatorTypes.REQUIRED }],
      isRequired: true,
    },
    {
      component: 'dual-list-select',
      id: 'policies',
      name: 'policies',
      label: __('Policy Selection'),
      leftTitle: __('Available Policies'),
      rightTitle: __('Profile Policies'),
      noValueTitle: __('No option selected'),
      noOptionsTitle: __('No available options'),
      filterOptionsTitle: __('Filter options'),
      filterValuesTitle: __('Filter values'),
      allToRight: false,
      moveLeftTitle: __('Remove'),
      moveAllLeftTitle: __('Remove All'),
      moveRightTitle: __('Add'),
      moveAllRightTitle: __('Add All'),
      validate: [{ type: validatorTypes.REQUIRED }],
      isRequired: true,
      size: 8,
      options,
    },
    {
      component: componentTypes.TEXTAREA,
      id: 'set_data.notes',
      name: 'set_data.notes',
      label: __('Notes'),
      maxLength: 512,
    },
  ],
});
export default createSchema;
