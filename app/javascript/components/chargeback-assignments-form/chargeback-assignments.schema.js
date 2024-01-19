import { componentTypes } from '@@ddf';

const tagFields = [
  {
    component: componentTypes.TEXT_FIELD,
    id: 'description',
    name: 'description',
    label: __('Description'),
    maxLength: 60,
  },
];

const labelFields = [
  {
    component: componentTypes.TEXT_FIELD,
    id: 'description',
    name: 'description',
    label: __('Description'),
    maxLength: 60,
  },
];

// Create custom component for tenant
const tenantFields = [
  {
    component: componentTypes.TEXT_FIELD,
    id: 'description',
    name: 'description',
    label: __('Description'),
    maxLength: 60,
  },
];

const createSchema = (assignmentOptions) => ({
  fields: [
    {
      component: componentTypes.SELECT,
      id: 'cbshow_typ',
      name: 'cbshow_typ',
      label: __('Assign To'),
      options: assignmentOptions,
    },
    {
      component: componentTypes.SUB_FORM,
      id: 'tag-fields',
      name: 'tag-fields',
      condition: {
        or: [
          {
            when: 'cbshow_typ',
            is: 'vm-tags',
          },
          {
            when: 'cbshow_typ',
            is: 'configured_system-tags',
          },
          {
            when: 'cbshow_typ',
            is: 'container_image-tags',
          },
        ],
      },
      fields: tagFields,
    },
    {
      component: componentTypes.SUB_FORM,
      id: 'label-fields',
      name: 'label-fields',
      condition: {
        when: 'cbshow_typ',
        is: 'container_image-labels',
      },
      fields: labelFields,
    },
    {
      component: componentTypes.SUB_FORM,
      id: 'tenant-fields',
      name: 'tenant-fields',
      condition: {
        when: 'cbshow_typ',
        is: 'tenant',
      },
      fields: tenantFields,
    },
  ],
});

export default createSchema;
