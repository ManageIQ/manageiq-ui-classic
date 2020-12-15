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
      allToRight: false,
      moveLeftTitle: __('Move Selected items left'),
      moveRightTitle: __('Move Selected items right'),
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
