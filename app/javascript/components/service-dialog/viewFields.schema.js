import { componentTypes } from '@@ddf';
import { SERVICE_DIALOG_FROM } from '../order-service-form/order-service-constants';

const appendKeyName = (fieldName) => `dialog_${fieldName}`;

/** Schema shared by different fields. */
const sharedSchema = (field) => ({
  id: field.id,
  name: appendKeyName(field.name),
  label: field.label,
  hideField: !field.visible,
  isRequired: field.required,
  description: field.description,
});

/** Function to build a text box. */
export const buildTextBox = ({ field, isReadOnly }) => {
  let component = {};
  if (field.options.protected) {
    component = {
      ...sharedSchema(field),
      component: 'password-field',
      isReadOnly,
      initialValue: field.default_value || '*****',
    };
  } else {
    component = {
      ...sharedSchema(field),
      component: componentTypes.TEXT_FIELD,
      isReadOnly,
      initialValue: field.default_value || '',
    };
  }
  return component;
};

/** Function to build a text area */
export const buildTextAreaBox = ({ field, isReadOnly }) => ({
  ...sharedSchema(field),
  component: componentTypes.TEXTAREA,
  isReadOnly,
  initialValue: field.default_value,
  description: field.description,
});

/** Function to build a check box. */
export const buildCheckBox = ({ field, isReadOnly }) => ({
  ...sharedSchema(field),
  component: componentTypes.CHECKBOX,
  isDisabled: isReadOnly,
  initialValue: field.default_value,
});

/** Function to build a date control field */
export const buildDateControl = ({ field, isReadOnly }) => ({
  component: componentTypes.DATE_PICKER,
  ...sharedSchema(field),
  isReadOnly,
  initialValue: field.default_value,
  variant: 'date-time',
});

/** Function to build a time control field */
export const buildTimeControl = ({ field, isReadOnly, dateTime }) => ([{
  component: componentTypes.DATE_PICKER,
  ...sharedSchema(field),
  isReadOnly,
  initialValue: dateTime.toISOString(),
  variant: 'date-time',
},
{
  component: componentTypes.TIME_PICKER,
  id: `${field.id}-time`,
  name: `dialog_${field.name}-time`,
  isRequired: field.required,
  isReadOnly,
  initialValue: dateTime,
  twelveHoursFormat: true,
  pattern: '(0?[1-9]|1[0-2]):[0-5][0-9]',
}]);

/** Function to build radio buttons fields */
export const buildRadioButtons = ({ field, isReadOnly }) => {
  const options = [];
  field.values.forEach((value) => {
    options.push({ value: value[0], label: value[1] });
  });
  return {
    component: componentTypes.RADIO,
    ...sharedSchema(field),
    isDisabled: isReadOnly,
    initialValue: field.default_value,
    options,
  };
};

/** Function to build a refresh button near to drop down. */
export const buildRefreshButton = (field, tabIndex) => ({
  component: 'refresh-button',
  name: `refresh_${field.name}`,
  data: {
    showRefreshButton: !!(field.dynamic && field.show_refresh_button),
    fieldName: field.name,
    tabIndex,
    disabled: true,
  },
});

const buildOptions = ({ field, isReadOnly, initialValues }) => {
  const placeholder = __('<Choose>');
  let options = [{ label: __('None'), value: -1 }];
  const fieldName = appendKeyName(field.name);
  if (initialValues) {
    const selected = initialValues[fieldName];
    field.default_value = isReadOnly && Array.isArray(selected)
      ? selected.map((item) => item.value).join(', ')
      : selected;
  } else if (field.values && field.values.length > 1) {
    if (Array.isArray(field.values)) {
      const newOptions = field.values.map((item, index) => {
        if (Array.isArray(item)) {
          return ({ label: item[1], value: item[0] || index });
        }
        return ({ label: item.description, value: item.id });
      });
      options = newOptions;
    }
  } else {
    options = [{ label: __('Option 1'), value: 1 }, { label: __('Option 2'), value: 2 }];
  }
  return { options, placeholder, fieldName };
};

/** Function to build a tag control field. */
export const buildTagControl = ({
  field, isReadOnly, initialValues, from,
}) => {
  const { options, placeholder } = buildOptions({ field, isReadOnly, initialValues });
  let isMulti = false;
  if (field.options && field.options.force_multi_value) {
    isMulti = true;
  }

  if (from === SERVICE_DIALOG_FROM.request) { // If the page is from miq_request/show, then display the dialog box as a text field.
    return {
      component: componentTypes.TEXT_FIELD,
      ...sharedSchema(field),
      value: field.default_value,
      isReadOnly,
      initialValue: field.default_value,
    };
  }
  return {
    component: componentTypes.SELECT,
    ...sharedSchema(field),
    labelText: field.label,
    isReadOnly: from === SERVICE_DIALOG_FROM.customization ? true : isReadOnly,
    initialValue: field.default_value,
    options,
    placeholder,
    isSearchable: false,
    simpleValue: true,
    isMulti,
  };
};

/** Function to build a drop down select box. */
export const buildDropDownList = ({
  field, isReadOnly, initialValues, from,
}) => {
  const { options, placeholder } = buildOptions({ field, isReadOnly, initialValues });
  let isMulti = false;
  if (field.options && field.options.force_multi_value) {
    isMulti = true;
  }

  // If the page is from miq_request/show, then display the dialog box as a text field.
  if (from === SERVICE_DIALOG_FROM.request) {
    return {
      component: componentTypes.TEXT_FIELD,
      ...sharedSchema(field),
      isRequired: field.required,
      value: field.default_value,
      isReadOnly,
      initialValue: field.default_value,
    };
  }
  return {
    component: componentTypes.SELECT,
    ...sharedSchema(field),
    isReadOnly: from === SERVICE_DIALOG_FROM.customization ? true : isReadOnly,
    initialValue: field.default_value,
    options,
    placeholder,
    isSearchable: false,
    simpleValue: true,
    isMulti,
  };
};
