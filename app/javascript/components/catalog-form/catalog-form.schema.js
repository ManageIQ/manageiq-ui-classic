import { componentTypes, validatorTypes } from '@data-driven-forms/react-form-renderer';

function createSchema(options) {
  const fields = [{
    component: componentTypes.SUB_FORM,
    title: __('Basic Info'),
    fields: [{
      component: componentTypes.TEXT_FIELD,
      name: 'name',
      validate: [{
        type: validatorTypes.REQUIRED,
        message: __("Name can't be blank"),
      }],
      label: __('Name'),
      maxLength: 40,
      autoFocus: true,
      validateOnMount: true,
    }, {
      component: componentTypes.TEXT_FIELD,
      name: 'description',
      label: __('Description'),
      maxLength: 60,
    }],
  }, {
    component: 'hr',
    name: 'hr',
  }, {
    component: componentTypes.SUB_FORM,
    title: __('Assign Catalog Items'),
    fields: [
      {
        component: 'dual-list-select',
        leftTitle: __('Unassigned:'),
        rightTitle: __('Selected:'),
        leftId: 'available_fields',
        rightId: 'selected_fields',
        allToRight: false,
        moveLeftTitle: __('Move Selected buttons left'),
        moveRightTitle: __('Move Selected buttons right'),
        size: 8,
        assignFieldProvider: true,
        options,
        name: 'service_templates',
      },
    ],
  }];
  return { fields };
}

export default createSchema;
