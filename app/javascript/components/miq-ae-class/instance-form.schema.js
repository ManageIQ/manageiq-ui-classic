import { componentTypes, validatorTypes } from '@@ddf';

// Create schema for editing a single field in a modal
export const createFieldEditSchema = (field, isStateClass) => {
  const fields = [
    {
      component: componentTypes.TEXT_FIELD,
      name: 'value',
      label: __('Value'),
      placeholder: field.default_value,
      // helperText: `${field.name} (${field.aetype})`,
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

  // Add collect field - enabled only for relationship or state fields
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

const createSchema = (fields, isStateClass, namespacePath) => {
  const fieldRows = fields.map((field, index) => {
    const baseFields = [
      {
        component: componentTypes.TEXT_FIELD,
        name: `ae_values[${index}].value`,
        label: field.display_name || field.name,
        placeholder: field.default_value,
        helperText: `${field.name} (${field.aetype})`,
        type: field.datatype === 'password' ? 'password' : 'text',
      },
    ];

    // Add state-specific fields if this is a state class
    // They will be disabled for non-state fields
    if (isStateClass) {
      const isStateField = field.aetype === 'state';
      baseFields.push(
        {
          component: componentTypes.TEXT_FIELD,
          name: `ae_values[${index}].on_entry`,
          label: __('On Entry'),
          placeholder: field.on_entry,
          isDisabled: !isStateField,
        },
        {
          component: componentTypes.TEXT_FIELD,
          name: `ae_values[${index}].on_exit`,
          label: __('On Exit'),
          placeholder: field.on_exit,
          isDisabled: !isStateField,
        },
        {
          component: componentTypes.TEXT_FIELD,
          name: `ae_values[${index}].on_error`,
          label: __('On Error'),
          placeholder: field.on_error,
          isDisabled: !isStateField,
        },
        {
          component: componentTypes.TEXT_FIELD,
          name: `ae_values[${index}].max_retries`,
          label: __('Max Retries'),
          placeholder: field.max_retries,
          isDisabled: !isStateField,
        },
        {
          component: componentTypes.TEXT_FIELD,
          name: `ae_values[${index}].max_time`,
          label: __('Max Time'),
          placeholder: field.max_time,
          isDisabled: !isStateField,
        }
      );
    }

    // Add collect field - disabled unless field type is relationship or state
    const canCollect = ['relationship', 'state'].includes(field.aetype);
    baseFields.push({
      component: componentTypes.TEXT_FIELD,
      name: `ae_values[${index}].collect`,
      label: __('Collect'),
      placeholder: field.collect,
      isDisabled: !canCollect,
    });

    return baseFields;
  }).flat();

  return {
    fields: [
      {
        component: componentTypes.SUB_FORM,
        name: 'main_info',
        title: __('Main Info'),
        fields: [
          {
            component: componentTypes.TEXT_FIELD,
            name: 'namespace_path',
            label: __('Fully Qualified Name'),
            isReadOnly: true,
            initialValue: namespacePath,
          },
          {
            component: componentTypes.TEXT_FIELD,
            name: 'name',
            label: __('Name'),
            maxLength: 255,
            isRequired: true,
            validate: [
              { type: validatorTypes.REQUIRED },
              {
                type: validatorTypes.PATTERN,
                pattern: /^[a-zA-Z0-9_.-]*$/,
                message: __('Name may contain only alphanumeric and _ . - characters'),
              },
            ],
          },
          {
            component: componentTypes.TEXT_FIELD,
            name: 'display_name',
            label: __('Display Name'),
            maxLength: 255,
          },
          {
            component: componentTypes.TEXT_FIELD,
            name: 'description',
            label: __('Description'),
            maxLength: 255,
          },
        ],
      },
      {
        component: componentTypes.SUB_FORM,
        name: 'fields_section',
        title: __('Fields'),
        fields: fieldRows,
      },
    ],
  };
};

export default createSchema;

