import { componentTypes, validatorTypes } from '@@ddf';
import { DIALOG_FIELDS, REFERENCE_TYPES } from './order-service-constants';
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

const buildComponent = (data) => {
  const { field } = data;
  switch (field.type) {
    case DIALOG_FIELDS.textBox:
      return buildTextBox(data);
    case DIALOG_FIELDS.textArea:
      return buildTextAreaBox(data);
    case DIALOG_FIELDS.checkBox:
      return buildCheckBox(data);
    case DIALOG_FIELDS.dropDown:
      return buildDropDownList(data);
    case DIALOG_FIELDS.tag:
      return buildTagControl(data);
    case DIALOG_FIELDS.date:
    {
      formatDateControl(field);
      return buildDateControl(data);
    }
    case DIALOG_FIELDS.dateTime:
    {
      const dateTime = formatTimeControl(field);
      return buildTimeControl(data, dateTime);
    }
    case DIALOG_FIELDS.radio:
      return buildRadioButtons(data);
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

export const defaultValue = (value) => {
  if (typeof value === 'string' || value instanceof String) {
    return value || '';
  } if (Array.isArray(value)) {
    return value || [];
  } if (value === null) {
    return value || '';
  }
  return value || '';
};

/** Function to build the form fields. */
export const buildFields = (response, data, setData, orderServiceConfig, responseFrom) => {
  if (response) {
    const newResponse = { ...response };
    const dialogTabs = [];
    response.content[0].dialog_tabs.forEach((tab, tabIndex) => {
      const dialogSections = [];
      tab.dialog_groups.forEach((group, _groupIndex) => {
        const dialogFields = [];
        group.dialog_fields.forEach((field) => {
          const validate = buildValidator(field);
          orderServiceConfig.updateFormReference({
            type: REFERENCE_TYPES.dialogFields,
            payload: { fieldName: field.name, value: defaultValue(field.default_value) },
          });
          orderServiceConfig.updateFormReference({
            type: REFERENCE_TYPES.fieldResponders,
            payload: { fieldName: field.name, responders: defaultValue(field.dialog_field_responders) },
          });
          const fieldData = [
            buildComponent({
              field, validate, orderServiceConfig, responseFrom,
            }),
            buildRefreshButton(field, tabIndex, orderServiceConfig),
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
        onClick: () => orderServiceConfig.updateFormReference({ type: REFERENCE_TYPES.activeTab, payload: tabIndex }),
      };
      dialogTabs.push(tabData);
    });
    setData({
      ...data,
      isLoading: false,
      response: newResponse,
      responseFrom, // useEffect action is declared in 'OrderServiceForm'.
      fields: dialogTabs,
      hasTime,
      showPastDates,
      showPastDatesFieldErrors,
      checkBoxes,
      dates,
    });
  }
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

/** Function to update the response and build the fileds again after field refresh. */
export const updateResponseFieldsData = (response, currentRefreshField, result) => {
  const data = result[currentRefreshField];
  response.content[0].dialog_tabs.map((tab) => tab.dialog_groups.map((group) => group.dialog_fields.map((field) => {
    if (field.name === currentRefreshField) {
      field.data_type = data.data_type;
      field.options = data.options;
      field.read_only = data.read_only;
      field.required = data.required;
      field.visible = data.visible;
      field.values = data.values;
      field.default_value = data.default_value;
      field.validator_rule = data.validator_rule;
      field.validator_type = data.validator_type;
    }
    return field;
  })));
  return { ...response };
};
