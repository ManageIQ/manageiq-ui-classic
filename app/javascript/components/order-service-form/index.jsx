import React, { useState, useEffect } from 'react';
// import MiqFormRenderer from '@@ddf';
import PropTypes from 'prop-types';
import MiqFormRenderer, { componentTypes, validatorTypes } from '@@ddf';
// import { componentTypes, validatorTypes } from '@data-driven-forms/react-form-renderer';
import createSchema from './order-service-form.schema';
import { API } from '../../http_api';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import { onClickToExplorer } from '../breadcrumbs/on-click-functions';

const OrderServiceForm = ({
  dialogId, resourceActionId, targetId, targetType,
}) => {
  const [{ isLoading, initialValues, fields }, setState] = useState({
    // isLoading: !!dialogId,
    isLoading: false,
    fields: [],
  });

  useEffect(() => {
    API.get(`/api/service_dialogs/${dialogId}?resource_action_id=${resourceActionId}&target_id=${targetId}&target_type=${targetType}`)
      .then((data) => {
        const dialogTabs = [];
        let dialogSubForms = [];
        let dialogFields = [];
        console.log(data);
        data.content[0].dialog_tabs.forEach((tab) => {
          console.log(tab);
          console.log(tab.label);
          tab.dialog_groups.forEach((group) => {
            console.log(group);
            console.log(group.label);
            group.dialog_fields.forEach((field) => {
              console.log(field);
              const validate = [];
              if (field.validator_rule) {
                // Check what validator_type is
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
                  component: componentTypes.TEXT_AREA,
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
                const options = [];
                let placeholder = __('<Choose>');
                field.values.forEach((option) => {
                  if (option[0] === null) {
                    option[0] = '-1';
                    // eslint-disable-next-line prefer-destructuring
                    placeholder = option[1];

                    // IF API CAN HANDLE NO VALUE BEING RECIEVED THEN DON'T MAKE THIS FIELD REQUIRED AND DON'T NEED VALUE OF -1, JUST LEAVE NULL
                    if (!field.required) {
                      field.required = true;
                      validate.push({ type: validatorTypes.REQUIRED });
                    }
                  }
                  options.push({ value: option[0], label: option[1] });
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
                  placeholder,
                  isSearchable: true,
                  simpleValue: true,
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
        setState({ fields: dialogTabs, isLoading: false });
      });
  }, []);

  const onSubmit = (values) => {
    console.log(values);
  };

  const onCancel = () => {
    const message = __('Dialog Cancelled');
    miqRedirectBack(message, 'warning', '/catalog');
  };

  return !isLoading && (
    <MiqFormRenderer
      schema={createSchema(fields)}
      initialValues={initialValues}
      onSubmit={onSubmit}
      onCancel={onCancel}
    />
  );
};

OrderServiceForm.propTypes = {
  dialogId: PropTypes.number.isRequired,
};

OrderServiceForm.defaultProps = {
  // dialogId: undefined,
};

export default OrderServiceForm;
