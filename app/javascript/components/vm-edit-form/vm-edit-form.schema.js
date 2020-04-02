import { componentTypes } from '@data-driven-forms/react-form-renderer';

function createSchema(parentOptions, childOptions, isVm) {
  let counter = 0;
  const fixName = (o) => ({
    name: `name${counter++}`,
    ...o,
  });

  const fields = _.compact([
    {
      component: componentTypes.SUB_FORM,
      title: __('Basic Information'),
      fields: [
        {
          component: componentTypes.TEXT_FIELD,
          name: 'custom_1',
          label: __('Custom Identifier'),
          maxLength: 50,
          autoFocus: true,
        },
        {
          component: componentTypes.TEXTAREA,
          name: 'description',
          label: __('Description'),
          maxLength: 100,
        },
      ],
    },
    isVm && {
      component: 'hr',
    },
    isVm && {
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
          options: parentOptions,
        },
      ],
    },
    isVm && {
      component: 'hr',
    },
    isVm && {
      component: componentTypes.SUB_FORM,
      title: __('Child VM Selection'),
      fields: [
        {
          component: 'dual-list-select',
          leftTitle: __('Child VMs:'),
          rightTitle: __('Available VMs:'),
          moveLeftTitle: __('Move selected VMs to left'),
          moveRightTitle: __('Move selected VMs to right'),
          allToRight: true,
          moveAllRightTitle: __('Move all VMs to right'),
          name: 'child_vms',
          options: childOptions,
          selectedSide: 'left',
        },
      ],
    },
  ]).map(fixName);

  return { fields };
}

export default createSchema;
