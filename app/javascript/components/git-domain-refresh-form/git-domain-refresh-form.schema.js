import { componentTypes, validatorTypes } from '@@ddf';

const createSchema = (branchNames, tagNames) => ({
  fields: [
    {
      component: componentTypes.SELECT,
      id: 'ref_type',
      name: 'ref_type',
      label: __('Branch/Tag'),
      options: [
        { label: __('Branch'), value: 'branch' },
        { label: __('Tag'), value: 'tag' },
      ],
      validate: [{ type: validatorTypes.REQUIRED }],
      isRequired: true,
    },
    {
      component: componentTypes.SELECT,
      id: 'branch_name',
      name: 'branch_name',
      label: __('Branches'),
      options: branchNames.map((name) => ({ label: name, value: name })),
      condition: {
        when: 'ref_type',
        is: 'branch',
      },
      validate: [{ type: validatorTypes.REQUIRED }],
      isRequired: true,
    },
    {
      component: componentTypes.SELECT,
      id: 'tag_name',
      name: 'tag_name',
      label: __('Tags'),
      options: tagNames.map((name) => ({ label: name, value: name })),
      condition: {
        when: 'ref_type',
        is: 'tag',
      },
      validate: [{ type: validatorTypes.REQUIRED }],
      isRequired: true,
    },
  ],
});

export default createSchema;
