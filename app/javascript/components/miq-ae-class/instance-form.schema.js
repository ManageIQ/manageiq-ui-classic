import { componentTypes } from '@@ddf';

export const createFieldEditSchema = (field, isStateClass) => {
  const fields = [
    {
      component: componentTypes.TEXT_FIELD,
      name: 'value',
      label: __('Value'),
      placeholder: field.default_value,
      type: field.datatype === 'password' ? 'password' : 'text',
      initialValue: field.value || '',
    },
  ];

  // Add state-specific fields if this is a state class and field is a state field
  if (isStateClass && field.aetype === 'state') {
    fields.push(
      {
        component: componentTypes.TEXT_FIELD,
        name: 'on_entry',
        label: __('On Entry'),
        placeholder: field.on_entry,
        initialValue: field.value_on_entry || '',
      },
      {
        component: componentTypes.TEXT_FIELD,
        name: 'on_exit',
        label: __('On Exit'),
        placeholder: field.on_exit,
        initialValue: field.value_on_exit || '',
      },
      {
        component: componentTypes.TEXT_FIELD,
        name: 'on_error',
        label: __('On Error'),
        placeholder: field.on_error,
        initialValue: field.value_on_error || '',
      },
      {
        component: componentTypes.TEXT_FIELD,
        name: 'max_retries',
        label: __('Max Retries'),
        placeholder: field.max_retries,
        initialValue: field.value_max_retries || '',
      },
      {
        component: componentTypes.TEXT_FIELD,
        name: 'max_time',
        label: __('Max Time'),
        placeholder: field.max_time,
        initialValue: field.value_max_time || '',
      }
    );
  }

  const canCollect = ['relationship', 'state'].includes(field.aetype);
  fields.push({
    component: componentTypes.TEXT_FIELD,
    name: 'collect',
    label: __('Collect'),
    placeholder: field.collect,
    isDisabled: !canCollect,
    initialValue: field.value_collect || '',
  });

  return {
    fields,
  };
};
