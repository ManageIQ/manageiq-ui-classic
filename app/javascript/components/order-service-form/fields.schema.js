import { componentTypes } from '@@ddf';
import { REFERENCE_TYPES } from './order-service-constants';

const sharedSchema = (field) => ({
  id: field.id,
  name: field.name,
  label: field.label,
  hideField: !field.visible,
  isRequired: field.required,
  isDisabled: field.read_only,
  description: field.description,
});

/** Function to build a text box. */
export const buildTextBox = ({
  field, validate, orderServiceConfig,
}) => {
  let component = {};

  if (field.options.protected) {
    component = {
      component: 'password-field',
      validate,
      initialValue: field.default_value || '',
      ...sharedSchema(field),
    };
  } else {
    component = {
      component: componentTypes.TEXT_FIELD,
      validate,
      initialValue: field.default_value || '',
      ...sharedSchema(field),
      resolveProps: (props, { input }) => {
        orderServiceConfig.updateFormReference({ type: REFERENCE_TYPES.dialogFields, payload: { fieldName: input.name, value: input.value } });
      },
    };
  }
  return component;
};

/** Function to build a text area */
export const buildTextAreaBox = ({
  field, validate, updateFormReference,
}) => ({
  component: componentTypes.TEXTAREA,
  ...sharedSchema(field),
  initialValue: field.default_value,
  validate,
  resolveProps: (props, { input }) => {
    updateFormReference({ type: REFERENCE_TYPES.dialogFields, payload: { fieldName: input.name, value: input.value } });
  },
});

/** Function to build a check box. */
export const buildCheckBox = ({
  field, validate, updateFormReference,
}) => ({
  component: componentTypes.CHECKBOX,
  ...sharedSchema(field),
  initialValue: field.default_value,
  validate,
  resolveProps: (props, { input }) => {
    updateFormReference({ type: REFERENCE_TYPES.dialogFields, payload: { fieldName: input.name, value: input.value } });
  },
});

/** Function to build a tag control field. */
export const buildTagControl = ({
  field, validate, updateFormReference,
}) => {
  const options = [];
  field.values.forEach((value) => {
    if (!value.id) {
      value.id = '-1';
    }
    options.push({ value: value.id, label: value.description });
  });
  return {
    component: componentTypes.SELECT,
    ...sharedSchema(field),
    initialValue: field.default_value,
    validate,
    options,
    resolveProps: (props, { input }) => {
      updateFormReference({ type: REFERENCE_TYPES.dialogFields, payload: { fieldName: input.name, value: input.value } });
    },
  };
};

/** Function to build a date control field */
export const buildDateControl = ({
  field, validate, updateFormReference,
}) => ({
  component: componentTypes.DATE_PICKER,
  ...sharedSchema(field),
  initialValue: field.default_value,
  validate,
  variant: 'date-time',
  resolveProps: (props, { input }) => {
    updateFormReference({ type: REFERENCE_TYPES.dialogFields, payload: { fieldName: input.name, value: input.value } });
  },
});

/** Function to build a time control field */
export const buildTimeControl = ({
  field, validate, updateFormReference,
}, dateTime) => ([{
  component: componentTypes.DATE_PICKER,
  ...sharedSchema(field),
  initialValue: dateTime.toISOString(),
  validate,
  variant: 'date-time',
  resolveProps: (props, { input }) => {
    updateFormReference({ type: REFERENCE_TYPES.dialogFields, payload: { fieldName: input.name, value: input.value } });
  },
},
{
  component: componentTypes.TIME_PICKER,
  id: `${field.id}-time`,
  name: `${field.name}-time`,
  isRequired: field.required,
  isDisabled: field.read_only,
  initialValue: dateTime,
  validate,
  twelveHoursFormat: true,
  pattern: '(0?[1-9]|1[0-2]):[0-5][0-9]',
  resolveProps: (props, { input }) => {
    updateFormReference({ type: REFERENCE_TYPES.dialogFields, payload: { fieldName: input.name, value: input.value } });
  },
}]);

/** Function to build radio buttons fields */
export const buildRadioButtons = ({
  field, validate, updateFormReference,
}) => {
  const options = [];
  field.values.forEach((value) => {
    options.push({ value: value[0], label: value[1] });
  });
  return {
    component: componentTypes.RADIO,
    ...sharedSchema(field),
    initialValue: field.default_value,
    validate,
    options,
    resolveProps: (props, { input }) => {
      updateFormReference({ type: REFERENCE_TYPES.dialogFields, payload: { fieldName: input.name, value: input.value } });
    },
  };
};

/** Function to build a refresh button near to drop down. */
export const buildRefreshButton = (field, tabIndex, { updateFormReference }) => ({
  component: 'refresh-button',
  name: `refresh_${field.name}`,
  data: {
    showRefreshButton: !!(field.dynamic && field.show_refresh_button),
    fieldName: field.name,
    tabIndex,
    disabled: false,
    updateRefreshInProgress: (status) => updateFormReference({ type: REFERENCE_TYPES.refreshInProgress, payload: status }),
  },
});

const buildOptions = (field) => {
  let options = [];
  let placeholder = __('<Choose>');
  let start;

  field.values.forEach((value) => {
    if (value[0] === null) {
      value[0] = null;
      // eslint-disable-next-line prefer-destructuring
      placeholder = value[1];
    }
    options.push({ value: value[0] !== null ? String(value[0]) : null, label: value[1] });
  });
  if (options[0].value === null) {
    start = options.shift();
  }
  options = options.sort((option1, option2) => {
    if (field.options.sort_by === 'description') {
      if (field.options.sort_order === 'ascending') {
        return option1.label.localeCompare(option2.label);
      }
      return option2.label.localeCompare(option1.label);
    }
    if (field.options.sort_order === 'ascending') {
      return option1.value.localeCompare(option2.value);
    }
    return option2.value.localeCompare(option1.value);
  });
  if (start) {
    options.unshift(start);
  }
  return { options, placeholder };
};

/** Function to build a drop down select box. */
export const buildDropDownList = ({
  field, validate, orderServiceConfig,
}) => {
  const { options, placeholder } = buildOptions(field);

  if (field.options && field.options.force_multi_value) {
    return {
      component: componentTypes.SELECT,
      ...sharedSchema(field),
      id: field.id,
      labelText: field.label,
      validate,
      options,
      placeholder,
      simpleValue: true,
      // isSearchable: true, // Unable to use isSearchable for isMulti items, due to a browser console error.
      isMulti: true,
      onChange: (value) => {
        orderServiceConfig.fieldOnChange(value, field);
      },
    };
  }

  return {
    component: componentTypes.SELECT,
    ...sharedSchema(field),
    labelText: field.label,
    initialValue: field.default_value,
    validate,
    options,
    placeholder,
    isSearchable: true,
    simpleValue: true,
    onChange: (value) => {
      console.log(value, field)
      orderServiceConfig.fieldOnChange(value, field);
    },
  };
};
