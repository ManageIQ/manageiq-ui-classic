import { componentTypes, validatorTypes } from '@@ddf';

const dates = [];
const showPastDates = [];
const showPastDatesFieldErrors = [];
const checkBoxes = [];
let hasTime = false;
let stopSubmit = false;
let invalidDateFields = [];
const dynamicFields = [];
const refreshFields = [];

const buildTextBox = (field, validate) => {
  let component = {};
  console.log(field);
  //   if (field.dialog_field_responders.length > 0) {
  //     field.dialog_field_responders.forEach((tempField) => {
  //       console.log(tempField);
  //       dynamicFields.forEach((fieldToRefresh) => {
  //         if (fieldToRefresh.field === tempField) {
  //           console.log(fieldToRefresh);
  //         }
  //       });
  //     });
  //   }

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
    //   resolveProps: (props, { meta, input }, formOptions) => {
    //     console.log(props);
    //     console.log(meta);
    //     console.log(input);
    //     console.log(formOptions);
    //     if (!formOptions.pristine) {
    //       if (field.dialog_field_responders.length > 0) {
    //         field.dialog_field_responders.forEach((tempField) => {
    //           console.log(tempField);
    //           dynamicFields.forEach((fieldToRefresh) => {
    //             if (fieldToRefresh.field === tempField) {
    //               const refreshData = {
    //                 action: 'refresh_dialog_fields',
    //                 resource: {
    //                   dialog_fields: {
    //                     //   credential: null,
    //                     hosts: 'localhost0',
    //                     //   param_provider_id: '38',
    //                     //   param_miq_username: 'admin',
    //                     //   param_miq_password: 'smartvm',
    //                     //   check_box_1: 't',
    //                     //   dropdown_list_1_1: null,
    //                     //   textarea_box_1: '',
    //                     //   date_time_control_1: '2022-10-12T20:50:45.180Z',
    //                     //   date_time_control_2: '2022-10-12T20:50:45.180Z',
    //                     //   date_control_1: '2022-10-12',
    //                     //   date_control_2_1: '2022-09-27',
    //                   },
    //                   fields: ['credential'],
    //                   resource_action_id: '2018',
    //                   target_id: '14',
    //                   target_type: 'service_template',
    //                   real_target_type: 'ServiceTemplate',
    //                 },
    //               };
    //               fieldToRefresh.values = API.post(`/api/service_dialogs/10`, refreshData).then((data) => {
    //                 console.log(data);
    //               });
    //               console.log(fieldToRefresh);
    //             }
    //           });
    //         });
    //       }
    //     }
    //   },
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

const buildDropDownList = (field, validate, dynamicFieldValues, setDynamicFieldValues) => {
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
  if (field.dynamic) {
    // setDynamicFieldValues({ ...dynamicFieldValues, [field.name]: field.default_value });
    // dynamicFields.push({ field: field.name, id: field.id, values: options });
    // console.log(dynamicFields);
    console.log(field);
    console.log(dynamicFieldValues[`${field.name}`]);
    return {
      component: 'dynamic-select',
      id: field.id,
      name: field.name,
      label: field.label,
      description: field.description,
      options,
      initialValue: dynamicFieldValues[field.name],
      hideField: !field.visible,
      required: field.required,
      disabled: field.read_only,
      dynamicFieldValues,
      setDynamicFieldValues,
    };
  }

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

export const buildFields = (data, setState, dynamicFieldValues, setDynamicFieldValues) => {
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
          component = buildDropDownList(field, validate, dynamicFieldValues, setDynamicFieldValues);
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
