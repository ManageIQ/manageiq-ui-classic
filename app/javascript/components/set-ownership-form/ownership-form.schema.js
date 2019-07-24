import { componentTypes } from '@data-driven-forms/react-form-renderer';

const createSchema = (ownerOptions, groupOptions) => ({
  fields: [{
    component: componentTypes.SELECT_COMPONENT,
    name: 'user',
    id: 'user_name',
    label: __('Select an Owner:'),
    options: ownerOptions.map(([label, value]) => ({
      label,
      value,
    })),
  }, {
    component: componentTypes.SELECT_COMPONENT,
    name: 'group',
    id: 'group_name',
    label: __('Select a Group:'),
    options: groupOptions.map(([label, value]) => ({
      label,
      value,
    })),
  }],
});

export default createSchema;
