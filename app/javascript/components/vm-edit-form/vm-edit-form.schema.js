import { componentTypes } from '@@ddf';

function createSchema(emsId, parentOptions) {
  const fields = [
    {
      component: componentTypes.SUB_FORM,
      name: 'BasicInformation',
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
    {
      component: componentTypes.SUB_FORM,
      name: 'ParentVmSelection',
      title: __('Parent VM Selection'),
      fields: [
        {
          component: componentTypes.SELECT,
          label: __('Parent VM'),
          name: 'parent_vm',
          id: 'parent_vm',
          placeholder: __('No Parent'),
          includeEmpty: true,
          validateOnMount: true,
          options: parentOptions,
        },
      ],
    },
    {
      component: componentTypes.SUB_FORM,
      name: 'ChildVMSelection',
      fields: [
        {
          component: 'dual-list-select',
          id: 'child_vms',
          name: 'child_vms',
          key: `alerts-${emsId}`,
          label: __('Child VM Selection'),
          rightTitle: __('Child VMs:'),
          leftTitle: __('Available VMs:'),
          allToRight: true,
          moveLeftTitle: __('Move selected VMs to left'),
          moveRightTitle: __('Move selected VMs to right'),
          moveAllRightTitle: __('Move all VMs to right'),
          moveAllLeftTitle: __('Remove All'),
          noValueTitle: __('No option selected'),
          noOptionsTitle: __('No available options'),
          filterOptionsTitle: __('Filter options'),
          filterValuesTitle: __('Filter values'),
          AddButtonProps: {
            id: 'addButtonProps',
            className: 'addButtonProps',
            size: 'small',
            iconDescription: "Add Selected",
          },
          AddAllButtonProps: {
            size: 'small',
            iconDescription: "Add All",
          },
          RemoveButtonProps: {
            id: 'removeButtonProps',
            className: 'removeButtonProps',
            size: 'small',
            iconDescription: "Remove Selected",
          },
          RemoveAllButtonProps: {
            size: 'small',
            iconDescription: "Remove All",
          },
          options: parentOptions,
        },
      ],
    },
  ];
  return { fields };
}

export default createSchema;
