import React, { useState, useEffect } from 'react';
// import MiqFormRenderer from '@@ddf';
import PropTypes from 'prop-types';
import MiqFormRenderer, { useFormApi, componentTypes, validatorTypes } from '@@ddf';
// import { componentTypes, validatorTypes } from '@data-driven-forms/react-form-renderer';
import { Button } from 'carbon-components-react';
import { FormSpy } from '@data-driven-forms/react-form-renderer';
import createSchema from './order-service-form.schema';
import { API } from '../../http_api';
import miqRedirectBack from '../../helpers/miq-redirect-back';

const OrderServiceForm = ({
  dialogId, resourceActionId, targetId, targetType, apiSubmitEndpoint, apiAction, openUrl, realTargetType, finishSubmitEndpoint,
}) => {
  const [{
    isLoading, initialValues, fields, hasTime, showPastDates, showPastDatesFieldErrors, dateErrorFields,
  }, setState] = useState({
    // isLoading: !!dialogId,
    isLoading: false,
    fields: [],
    hasTime: false,
    showPastDates: [],
    showPastDatesFieldErrors: [],
    dateErrorFields: [],
  });
  const [showDateError, setShowDateError] = useState([]);

  useEffect(() => {
    API.get(`/api/service_dialogs/${dialogId}?resource_action_id=${resourceActionId}&target_id=${targetId}&target_type=${targetType}`)
      .then((data) => {
        const dialogTabs = [];
        let dialogSubForms = [];
        let dialogFields = [];
        let hasTime = false;
        const showPastDates = [];
        const showPastDatesFieldErrors = [];

        console.log(data);
        data.content[0].dialog_tabs.forEach((tab) => {
          console.log(tab);
          console.log(tab.label);
          tab.dialog_groups.forEach((group) => {
            console.log(group);
            console.log(group.label);
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
              console.log(field);
              console.log(field.type);
              if (field.type === 'DialogFieldTextBox') {
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
              }
              if (field.type === 'DialogFieldTextAreaBox') {
                component = {
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
                };
              }
              if (field.type === 'DialogFieldCheckBox') {
                component = {
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
                };
              }
              if (field.type === 'DialogFieldDropDownList') {
                let options = [];
                let placeholder = __('<Choose>');
                field.values.forEach((value) => {
                  if (value[0] === null) {
                    value[0] = null;
                    // eslint-disable-next-line prefer-destructuring
                    placeholder = value[1];

                    // IF API CAN HANDLE NO VALUE BEING RECIEVED THEN DON'T MAKE THIS FIELD REQUIRED AND DON'T NEED VALUE OF -1, JUST LEAVE NULL
                    // if (!field.required) {
                    //   field.required = true;
                    //   validate.push({ type: validatorTypes.REQUIRED });
                    // }
                  }
                  // if (field.required) {
                  //   options.push({ value: value[0] !== null ? String(value[0]) : null, label: value[1] });
                  // } else {
                  //   options.push({ value: String(value[0]), label: value[1] });
                  // }

                  // TEST IF API WILL ACCEPT NO VALUE FOR A FIELD THEN CAN USE THIS
                  // IF THE API NEEDS A VALUE CAN PUSH FIELD NAME TO ARRAY AND PUSH THIS INTO SUBMIT DATA
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
                component = {
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
              }
              if (field.type === 'DialogFieldTagControl') {
                const options = [];
                field.values.forEach((value) => {
                  if (!value.id) {
                    value.id = '-1';
                  }
                  options.push({ value: value.id, label: value.name });
                });
                component = {
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
              }
              if (field.type === 'DialogFieldDateControl') {
                if (field.default_value === '' || !field.default_value) {
                  const today = new Date();
                  field.default_value = today.toISOString();
                }
                component = {
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
              }
              if (field.type === 'DialogFieldDateTimeControl') {
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
                component = [{
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
                }];
              }
              if (field.type === 'DialogFieldRadioButton') {
                const options = [];
                field.values.forEach((value) => {
                  options.push({ value: value[0], label: value[1] });
                });
                component = {
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
          console.log(dialogTabs);
        });
        setState({
          fields: dialogTabs, isLoading: false, hasTime, showPastDates, showPastDatesFieldErrors,
        });
      });
  }, []);

  const datePassed = (selectedDate) => {
    const retireDate = new Date(selectedDate);
    const today = new Date();

    if (retireDate <= today) {
      return true;
    }
    return false;
  };

  const onSubmit = (values) => {
    let submitData = { action: 'order', ...values };
    let stopSubmit = false;

    if (hasTime) {
      const invalidDateFields = [];
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
                console.log(fieldName);
                // Loop through all fields that don't allow previous dates
                showPastDatesFieldErrors.forEach((dateField) => {
                  // Check if current field is found in the list of fields that don't allow previous dates
                  if (fieldName === dateField.name) {
                    console.log(dateField);
                    // Add field label to list of invalid date fields
                    invalidDateFields.push(dateField.label);
                  }
                  // Set state of invalid date fields once done looping through all fields
                });
              }
            }
          });
          submitData = _.omit(submitData, tempField[0]);
        }
        setShowDateError(invalidDateFields);
      });
    }
    if (!stopSubmit) {
      if (apiSubmitEndpoint.includes('/generic_objects/')) {
        submitData = { action: apiAction, parameters: _.omit(submitData, 'action') };
      } else if (apiAction === 'reconfigure') {
        submitData = { action: apiAction, resource: _.omit(submitData, 'action') };
      }
      return API.post(apiSubmitEndpoint, submitData, { skipErrors: [400] })
        .then((response) => {
          if (openUrl === 'true') {
            return API.wait_for_task(response)
              .then(() =>
              // eslint-disable-next-line no-undef
                $http.post('open_url_after_dialog', { targetId, realTargetType }))
              .then((taskResponse) => {
                if (taskResponse.data.open_url) {
                  window.open(response.data.open_url);
                  miqRedirectBack(__('Order Request was Submitted'), 'success', finishSubmitEndpoint);
                } else {
                  add_flash(__('Automate failed to obtain URL.'), 'error');
                  miqSparkleOff();
                }
              });
          }
          miqRedirectBack(__('Order Request was Submitted'), 'success', finishSubmitEndpoint);
          return null;
        });
    }
  };

  const onCancel = () => {
    const message = __('Dialog Cancelled');
    miqRedirectBack(message, 'warning', '/catalog');
  };

  return !isLoading && (
    <MiqFormRenderer
      FormTemplate={(props) => <FormTemplate {...props} fields={fields} />}
      schema={createSchema(fields, showDateError)}
      initialValues={initialValues}
      onSubmit={onSubmit}
      onCancel={onCancel}
    />
  );
};

const verifyIsDisabled = (valid) => {
  let isDisabled = true;
  if (valid) {
    isDisabled = false;
  }
  return isDisabled;
};

const FormTemplate = ({ formFields }) => {
  const {
    handleSubmit, onCancel, getState,
  } = useFormApi();
  const { valid } = getState();
  return (
    <form id="order-service-form" onSubmit={handleSubmit}>
      {formFields}
      <FormSpy>
        {() => (
          <div className="custom-button-wrapper">
            <Button
              disabled={verifyIsDisabled(valid)}
              kind="primary"
              className="btnRight"
              type="submit"
              id="submit"
              variant="contained"
            >
              {__('Submit')}
            </Button>
            <Button variant="contained" type="button" onClick={onCancel} kind="secondary">
              { __('Cancel')}
            </Button>
          </div>
        )}
      </FormSpy>
    </form>
  );
};

FormTemplate.propTypes = {
  formFields: PropTypes.arrayOf(PropTypes.any).isRequired,
};

OrderServiceForm.propTypes = {
  dialogId: PropTypes.number.isRequired,
  resourceActionId: PropTypes.number.isRequired,
  targetId: PropTypes.number.isRequired,
  targetType: PropTypes.string.isRequired,
  apiSubmitEndpoint: PropTypes.string.isRequired,
  openUrl: PropTypes.bool.isRequired,
};

OrderServiceForm.defaultProps = {
  // dialogId: undefined,
};

export default OrderServiceForm;
