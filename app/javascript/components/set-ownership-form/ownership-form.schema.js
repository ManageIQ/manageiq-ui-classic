import { componentTypes } from '@data-driven-forms/react-form-renderer';

const createSchema = (ownerOptions, groupOptions) => ({
  fields: [{
    component: componentTypes.SELECT_COMPONENT,
    name: 'user',
    id: 'user_name',
    label: __('Select an Owner:'),
    options: ownerOptions,
  }, {
    component: componentTypes.SELECT_COMPONENT,
    name: 'group',
    id: 'group_name',
    label: __('Select a Group:'),
    options: groupOptions,
  }],
});

export default createSchema;
