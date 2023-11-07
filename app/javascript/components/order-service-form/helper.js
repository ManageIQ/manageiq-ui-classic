import { componentTypes, validatorTypes } from '@@ddf';
import {
  buildTextBox,
  buildTextAreaBox,
  buildCheckBox,
  buildDropDownList,
  buildTagControl,
  buildDateControl,
  buildTimeControl,
  buildRadioButtons,
  buildRefreshButton,
} from './fields.schema';

const dates = [];
const showPastDates = [];
const showPastDatesFieldErrors = [];
const checkBoxes = [];
let hasTime = false;
let stopSubmit = false;
let invalidDateFields = [];

const formatDateControl = (field) => {
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
};

const formatTimeControl = (field) => {
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
  return newDate;
};

/** Function to build the form fields. */
export const buildFields = (response, data, setData, initialData) => {
  const dialogTabs = [];
  let dialogSubForms = [];
  let dialogFields = [];

  response.content[0].dialog_tabs.forEach((tab, tabIndex) => {
    tab.dialog_groups.forEach((group, groupIndex) => {
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
          component = buildTextBox(field, validate, setData);
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
          formatDateControl(field);
          component = buildDateControl(field, validate);
        }
        if (field.type === 'DialogFieldDateTimeControl') {
          const dateTime = formatTimeControl(field);
          component = buildTimeControl(field, validate, dateTime);
        }
        if (field.type === 'DialogFieldRadioButton') {
          component = buildRadioButtons(field, validate);
        }
        const rowItems = [component];
        const fieldPosition = { tabIndex, groupIndex };
        const refreshButton = buildRefreshButton(response, field, initialData, data, setData, fieldPosition);
        rowItems.push(refreshButton);
        dialogFields.push(rowItems);

        // For each field get: type, required, read_only, label, name, default_value, description (tooltip)
      });

      const formRow = (componentItem, index) => ({
        component: componentTypes.SUB_FORM,
        id: `${group.id.toString()}_row`,
        name: group.label,
        fields: componentItem,
        className: 'order-form-row',
        key: index,
      });

      const subForm = {
        component: componentTypes.SUB_FORM,
        id: group.id,
        name: group.label,
        title: group.label,
        fields: dialogFields.map((item, index) => formRow(item, index)),
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
  setData({
    ...data,
    fields: dialogTabs,
    isLoading: false,
    hasTime,
    showPastDates,
    showPastDatesFieldErrors,
    checkBoxes,
    dates,
  });
};

/** Function to reformat the dates. */
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

/** Function to handle the time picker format on submit. */
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
            });
          }
        }
      });
      tempSubmitData = _.omit(submitData, tempField[0]);
    }
  });
  return tempSubmitData;
};

/** Function to handle the date picker format on submit. */
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
          });
        }
      }
    });
  });
};

/** Function to handle the checkbox data format on submit. */
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

/** Function to handle the form data on form submit. */
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
