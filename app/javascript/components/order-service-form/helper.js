import { componentTypes, validatorTypes } from '@@ddf';

const dates = [];
const showPastDates = [];
const showPastDatesFieldErrors = [];
const checkBoxes = [];
let hasTime = false;
let stopSubmit = false;
let invalidDateFields = [];

const buildTextBox = (field, validate) => {
  let component = {};
  if (field.options.protected) {
    component = {
      component: 'password-field',
      id: field.id,
      name: field.name,
      label: field.label,
      hideField: !field.visible,
      isRequired: field.required,
      isDisabled: field.read_only,
      initialValue: field.default_value,
      description: field.description,
      validate,
    };
  } else {
    component = {
      component: componentTypes.TEXT_FIELD,
      id: field.id,
      name: field.name,
      label: field.label,
      hideField: !field.visible,
      isRequired: field.required,
      isDisabled: field.read_only,
      initialValue: field.default_value,
      description: field.description,
      validate,
    };
  }
  return component;
};

const buildTextAreaBox = (field, validate) => ({
  component: componentTypes.TEXTAREA,
  id: field.id,
  name: field.name,
  label: field.label,
  hideField: !field.visible,
  isRequired: field.required,
  isDisabled: field.read_only,
  initialValue: field.default_value,
  description: field.description,
  validate,
});

const buildCheckBox = (field, validate) => ({
  component: componentTypes.CHECKBOX,
  id: field.id,
  name: field.name,
  label: field.label,
  hideField: !field.visible,
  isRequired: field.required,
  isDisabled: field.read_only,
  initialValue: field.default_value,
  description: field.description,
  validate,
});

const buildDropDownList = (field, validate) => {
  let options = [];
  let placeholder = __('<Choose>');
  field.values.forEach((value) => {
    if (value[0] === null) {
      value[0] = null;
      // eslint-disable-next-line prefer-destructuring
      placeholder = value[1];
    }
    options.push({ value: value[0] !== null ? String(value[0]) : null, label: value[1] });
  });

  let start;
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

  let isMulti = false;
  if (field.options && field.options.force_multi_value) {
    isMulti = true;
  }
  return {
    component: componentTypes.SELECT,
    id: field.id,
    name: field.name,
    label: field.label,
    hideField: !field.visible,
    isRequired: field.required,
    isDisabled: field.read_only,
    initialValue: field.default_value,
    description: field.description,
    validate,
    options,
    placeholder,
    isSearchable: true,
    simpleValue: true,
    isMulti,
    sortItems: (items) => items,
  };
};

const buildTagControl = (field, validate) => {
  const options = [];
  field.values.forEach((value) => {
    if (!value.id) {
      value.id = '-1';
    }
    options.push({ value: value.id, label: value.description });
  });
  return {
    component: componentTypes.SELECT,
    id: field.id,
    name: field.name,
    label: field.label,
    hideField: !field.visible,
    isRequired: field.required,
    isDisabled: field.read_only,
    initialValue: field.default_value,
    description: field.description,
    validate,
    options,
  };
};

const buildDateControl = (field, validate) => {
  dates.push(field.name);
  if (field.default_value === '' || !field.default_value) {
    const today = new Date();
    field.default_value = today.toISOString();
  }
  if (field.options.show_past_dates) {
    showPastDates.push(field.name);
  } else {
    showPastDatesFieldErrors.push({ name: field.name, label: field.label });
  }
  return {
    component: componentTypes.DATE_PICKER,
    id: field.id,
    name: field.name,
    label: field.label,
    isRequired: field.required,
    isDisabled: field.read_only,
    initialValue: field.default_value,
    description: field.description,
    validate,
    variant: 'date-time',
  };
};

const buildTimeControl = (field, validate) => {
  let newDate = '';
  hasTime = true;
  if (field.default_value === '' || !field.default_value) {
    newDate = new Date();
    field.default_value = newDate.toISOString();
  } else {
    newDate = new Date(field.default_value);
  }
  if (field.options.show_past_dates) {
    showPastDates.push(field.name);
  } else {
    showPastDatesFieldErrors.push({ name: field.name, label: field.label });
  }
  return [{
    component: componentTypes.DATE_PICKER,
    id: field.id,
    name: field.name,
    label: field.label,
    isRequired: field.required,
    isDisabled: field.read_only,
    initialValue: newDate.toISOString(),
    description: field.description,
    validate,
    variant: 'date-time',
  },
  {
    component: componentTypes.TIME_PICKER,
    id: `${field.id}-time`,
    name: `${field.name}-time`,
    isRequired: field.required,
    isDisabled: field.read_only,
    initialValue: newDate,
    validate,
    twelveHoursFormat: true,
    pattern: '(0?[1-9]|1[0-2]):[0-5][0-9]',
  }];
};

const buildRadioButtons = (field, validate) => {
  const options = [];
  field.values.forEach((value) => {
    options.push({ value: value[0], label: value[1] });
  });
  return {
    component: componentTypes.RADIO,
    id: field.id,
    name: field.name,
    label: field.label,
    isRequired: field.required,
    isDisabled: field.read_only,
    initialValue: field.default_value,
    description: field.description,
    validate,
    options,
  };
};

export const buildFields = (data, setState) => {
  const dialogTabs = [];
  let dialogSubForms = [];
  let dialogFields = [];

  data.content[0].dialog_tabs.forEach((tab) => {
    tab.dialog_groups.forEach((group) => {
      group.dialog_fields.forEach((field) => {
        const validate = [];
        if (field.validator_rule) {
          if (field.validator_message) {
            validate.push({
              type: validatorTypes.PATTERN,
              pattern: field.validator_rule,
              message: field.validator_message,
            });
          } else {
            validate.push({
              type: validatorTypes.PATTERN,
              pattern: field.validator_rule,
            });
          }
        }
        if (field.required) {
          validate.push({
            type: validatorTypes.REQUIRED,
          });
        }
        let component = {};
        if (field.type === 'DialogFieldTextBox') {
          component = buildTextBox(field, validate);
        }
        if (field.type === 'DialogFieldTextAreaBox') {
          component = buildTextAreaBox(field, validate);
        }
        if (field.type === 'DialogFieldCheckBox') {
          component = buildCheckBox(field, validate);
          checkBoxes.push(field.name);
        }
        if (field.type === 'DialogFieldDropDownList') {
          component = buildDropDownList(field, validate);
        }
        if (field.type === 'DialogFieldTagControl') {
          component = buildTagControl(field, validate);
        }
        if (field.type === 'DialogFieldDateControl') {
          component = buildDateControl(field, validate);
        }
        if (field.type === 'DialogFieldDateTimeControl') {
          component = buildTimeControl(field, validate);
        }
        if (field.type === 'DialogFieldRadioButton') {
          component = buildRadioButtons(field, validate);
        }
        dialogFields.push(component);
        // For each field get: type, required, read_only, label, name, default_value, description (tooltip)
      });
      const subForm = {
        component: componentTypes.SUB_FORM,
        id: group.id,
        name: group.label,
        title: group.label,
        fields: dialogFields,
      };
      dialogSubForms.push(subForm);
      dialogFields = [];
    });
    const tabComponent = {
      name: tab.label,
      title: tab.label,
      fields: dialogSubForms,
    };
    dialogTabs.push(tabComponent);
    dialogSubForms = [];
  });
  setState({
    fields: dialogTabs,
    isLoading: false,
    hasTime,
    showPastDates,
    showPastDatesFieldErrors,
    checkBoxes,
    dates,
  });
};

const datePassed = (selectedDate) => {
  const userDate = new Date(selectedDate);
  const today = new Date();

  if (userDate.getDate() === today.getDate() && userDate.getMonth() === today.getMonth() && userDate.getFullYear() === today.getFullYear()) {
    return false;
  }

  if (userDate < today) {
    return true;
  }
  return false;
};

const handleTimePickerSubmit = (submitData) => {
  let tempSubmitData;
  // Loop through fields to check for time fields
  Object.entries(submitData).forEach((tempField) => {
    let fieldName = `${tempField[0]}`;
    let fieldValue = '';
    if (fieldName.includes('-time')) {
      fieldName = fieldName.substring(0, fieldName.length - 5);
      // eslint-disable-next-line prefer-destructuring
      fieldValue = tempField[1];
      // If time field found loop through fields again to find corresponding date field
      Object.entries(submitData).forEach((field) => {
        if (field[0] === fieldName) {
          const timeValue = new Date(fieldValue);
          const dateValue = new Date(field[1]);
          const newDate = new Date(dateValue.setHours(timeValue.getHours(), timeValue.getMinutes()));
          submitData[field[0]] = newDate.toISOString(); // Set new date and time

          // Check for fields that don't allow previous dates
          if (!showPastDates.includes(fieldName) && datePassed(newDate)) {
            stopSubmit = true;
            // Loop through all fields that don't allow previous dates
            showPastDatesFieldErrors.forEach((dateField) => {
              // Check if current field is found in the list of fields that don't allow previous dates
              if (fieldName === dateField.name) {
                // Add field label to list of invalid date fields
                invalidDateFields.push(dateField.label);
              }
              // Set state of invalid date fields once done looping through all fields
            });
          }
        }
      });
      tempSubmitData = _.omit(submitData, tempField[0]);
    }
  });
  return tempSubmitData;
};

const handleDatePickerSubmit = (submitData) => {
  Object.entries(submitData).forEach((field) => {
    const fieldName = field[0];
    const fieldValue = field[1];
    dates.forEach((date) => {
      if (date === fieldName) {
        if (Array.isArray(fieldValue)) {
          // eslint-disable-next-line prefer-destructuring
          submitData[fieldName] = fieldValue[0];
        } else {
          submitData[fieldName] = fieldValue;
        }
        const dateValue = new Date(submitData[fieldName]);
        submitData[fieldValue] = dateValue.toISOString(); // Set new date and time

        if (!showPastDates.includes(fieldName) && datePassed(dateValue)) {
          stopSubmit = true;
          // Loop through all fields that don't allow previous dates
          showPastDatesFieldErrors.forEach((dateField) => {
            // Check if current field is found in the list of fields that don't allow previous dates
            if (fieldName === dateField.name) {
              // Add field label to list of invalid date fields
              invalidDateFields.push(dateField.label);
            }
            // Set state of invalid date fields once done looping through all fields
          });
        }
      }
    });
  });
};

const handleCheckboxSubmit = (submitData) => {
  Object.entries(submitData).forEach((field) => {
    const fieldName = field[0];
    const fieldValue = field[1];
    checkBoxes.forEach((checkbox) => {
      if (checkbox === fieldName) {
        if (fieldValue) {
          submitData[fieldName] = 't';
        } else {
          submitData[fieldName] = 'f';
        }
      }
    });
  });
};

export const prepareSubmitData = (values, setShowDateError) => {
  let submitData = { action: 'order', ...values };
  stopSubmit = false;
  invalidDateFields = [];

  if (hasTime) {
    submitData = handleTimePickerSubmit(submitData);
  }

  if (dates.length > 0) {
    handleDatePickerSubmit(submitData);
  }

  setShowDateError(invalidDateFields);

  if (checkBoxes.length > 0) {
    handleCheckboxSubmit(submitData);
  }

  if (stopSubmit) {
    return false;
  }
  return submitData;
};
