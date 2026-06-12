import { componentTypes, validatorTypes } from '@@ddf';

const createSchema = (branchNames = [], tagNames = []) => {
  const branchOptions = branchNames.map((branch) => ({
    label: branch,
    value: branch,
  }));

  const tagOptions = tagNames.map((tag) => ({
    label: tag,
    value: tag,
  }));

  return {
    fields: [
      {
        component: componentTypes.SELECT,
        id: 'ref_type',
        name: 'ref_type',
        label: __('Branch/Tag'),
        initialValue: 'branch',
        options: [
          { label: __('Branch'), value: 'branch' },
          { label: __('Tag'), value: 'tag' },
        ],
        isRequired: true,
        validateOnMount: true,
      },
      {
        component: componentTypes.SELECT,
        id: 'branch_name',
        name: 'branch_name',
        label: __('Branches'),
        options: branchOptions,
        initialValue: branchOptions.length > 0 ? branchOptions[0].value : undefined,
        isRequired: true,
        validateOnMount: true,
        validate: [{ type: validatorTypes.REQUIRED }],
        condition: {
          when: 'ref_type',
          is: 'branch',
        },
      },
      {
        component: componentTypes.SELECT,
        id: 'tag_name',
        name: 'tag_name',
        label: __('Tags'),
        options: tagOptions,
        initialValue: tagOptions.length > 0 ? tagOptions[0].value : undefined,
        isRequired: true,
        validateOnMount: true,
        validate: [{ type: validatorTypes.REQUIRED }],
        condition: {
          when: 'ref_type',
          is: 'tag',
        },
      },
    ],
  };
};

export default createSchema;
