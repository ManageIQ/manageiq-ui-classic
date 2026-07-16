import { componentTypes } from '@@ddf';

const createSchema = (pxeImageTypes = []) => {
  const imageTypeOptions = [
    { label: `<${__('Unknown')}>`, value: '' },
    ...pxeImageTypes.map((type) => ({
      label: type[0],
      value: type[1],
    })),
  ];

  return {
    fields: [
      {
        component: componentTypes.SUB_FORM,
        title: __('Basic Information'),
        id: 'basic-information',
        name: 'basic-information',
        fields: [
          {
            component: componentTypes.SELECT,
            name: 'img_type',
            id: 'img_type',
            label: __('Type'),
            options: imageTypeOptions,
            includeEmpty: false,
          },
          {
            component: componentTypes.CHECKBOX,
            name: 'default_for_windows',
            id: 'default_for_windows',
            label: __('Windows Boot Environment'),
            helperText: __('* Checking this box will remove this setting from all other PXE Images on this PXE Server'),
          },
        ],
      },
    ],
  };
};

export default createSchema;
