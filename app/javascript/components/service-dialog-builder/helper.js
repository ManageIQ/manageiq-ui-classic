import { componentTypes, validatorTypes } from '@@ddf';
// eslint-disable-next-line import/no-cycle
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
} from './dialog-fields-builder';

const dates = [];
const showPastDates = [];
const showPastDatesFieldErrors = [];
const checkBoxes = [];
let hasTime = false;
let stopSubmit = false;
let invalidDateFields = [];

const DIALOG_FIELDS = {
  checkBox: 'DialogFieldCheckBox',
  date: 'DialogFieldDateControl',
  dateTime: 'DialogFieldDateTimeControl',
  dropDown: 'DialogFieldDropDownList',
  radio: 'DialogFieldRadioButton',
  tag: 'DialogFieldTagControl',
  textBox: 'DialogFieldTextBox',
  textArea: 'DialogFieldTextAreaBox',
};

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

const buildComponent = (field, validate, apiAction) => {
  switch (field.type) {
    case DIALOG_FIELDS.textBox:
      return buildTextBox(field, validate, apiAction);
    case DIALOG_FIELDS.textArea:
      return buildTextAreaBox(field, validate, apiAction);
    case DIALOG_FIELDS.checkBox:
      return buildCheckBox(field, validate, apiAction);
    case DIALOG_FIELDS.dropDown:
      return buildDropDownList(field, validate, apiAction);
    case DIALOG_FIELDS.tag:
      return buildTagControl(field, validate, apiAction);
    case DIALOG_FIELDS.date:
    {
      formatDateControl(field);
      return buildDateControl(field, validate, apiAction);
    }
    case DIALOG_FIELDS.dateTime:
    {
      const dateTime = formatTimeControl(field);
      return buildTimeControl(field, validate, dateTime, apiAction);
    }
    case DIALOG_FIELDS.radio:
      return buildRadioButtons(field, validate, apiAction);
    default:
      return {};
  }
};

/** Function to build a field inside a section. */
const sectionField = (group, componentItem, index) => ({
  component: componentTypes.SUB_FORM,
  id: `${group.id.toString()}_row`,
  name: group.label,
  fields: componentItem,
  className: 'order-form-row',
  key: index,
});

/** Function to build the validators of a field. */
const buildValidator = (field) => {
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
};

/** Function to build the form fields. */
export const buildFields = (response, data, setData, initialData) => {
  const dialogTabs = [];
  const responseContent = response.content ? response.content[0].dialog_tabs : response.reconfigure_dialog[0].dialog_tabs;
  const { apiAction } = initialData;

  responseContent.forEach((tab, tabIndex) => {
    const dialogSections = [];
    tab.dialog_groups.forEach((group, groupIndex) => {
      const dialogFields = [];
      group.dialog_fields.forEach((field) => {
        const validate = buildValidator(field);
        const fieldPosition = { tabIndex, groupIndex };
        const fieldData = [
          buildComponent(field, validate, apiAction),
          buildRefreshButton(response, field, initialData, data, setData, fieldPosition),
        ];
        dialogFields.push(fieldData);
      });

      const sectionData = {
        component: componentTypes.SUB_FORM,
        id: group.id,
        name: group.label,
        title: group.label,
        fields: dialogFields.map((item, index) => sectionField(group, item, index)),
      };
      dialogSections.push(sectionData);
    });

    const tabData = {
      name: tab.label,
      title: tab.label,
      fields: dialogSections,
    };
    dialogTabs.push(tabData);
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
export const prepareSubmitData = (submitAction, values, setShowDateError) => {
  let submitData = { action: submitAction, ...values };
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
