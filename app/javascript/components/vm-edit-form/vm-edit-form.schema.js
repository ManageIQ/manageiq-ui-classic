import { componentTypes } from '@data-driven-forms/react-form-renderer';

function createSchema(options, optionsDualSelect) {
  const fields = [{
    component: componentTypes.SUB_FORM,
    title: __('Basic Information'),
    fields: [{
      component: componentTypes.TEXT_FIELD,
      name: 'custom_1',
      label: __('Custom Identifier'),
      maxLength: 50,
      autoFocus: true,
    }, {
      component: componentTypes.TEXT_FIELD,
      name: 'description',
      label: __('Description'),
      maxLength: 100,
    }],
  }, {
    component: 'hr',
    name: 'hr',
  },
  {
    component: componentTypes.SUB_FORM,
    title: __('Parent VM Selection'),
    fields: [
      {
        component: componentTypes.SELECT,
        label: __('Parent VM'),
        name: 'parent_vm',
        simpleValue: true,
        placeholder: __('No Parent'),
        isClearable: true,
        validateOnMount: true,
        options,
      },
    ],
  },
  {
    component: 'hr',
    name: 'hr2',
  },
  {
    component: componentTypes.SUB_FORM,
    title: __('Child VM Selection'),
    fields: [
      {
        component: 'dual-list-select',
        leftTitle: __('Available VMs:'),
        rightTitle: __('Child VMs:'),
        leftId: 'available_fields',
        rightId: 'selected_fields',
        allToRight: true,
        moveLeftTitle: __('Move Selected VMs to left'),
        mvoeAllRightTitle: __('Move all VMs to right'),
        moveRightTitle: __('Move Selected VMs to right'),
        size: 8,
        options: optionsDualSelect,
        name: 'service_templates',
      },
    ],
  }];
  return { fields };
}

export default createSchema;
