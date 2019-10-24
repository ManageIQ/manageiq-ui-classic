import { componentTypes } from '@data-driven-forms/react-form-renderer';

const schema = (readonly) => {
  const fields = [{
    component: componentTypes.TEXT_FIELD,
    name: 'name',
    label: __('Name:'),
    isReadOnly: readonly,
  }, {
    component: componentTypes.TEXT_FIELD,
    name: 'description',
    label: __('Description:'),
    isReadOnly: readonly,
  },
  {
    component: componentTypes.SWITCH,
    name: 'enabled',
    label: __('Enabled:'),
  }];

  return { fields };
};

export default schema;
