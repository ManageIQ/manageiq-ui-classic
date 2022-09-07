import React, { useState, useEffect } from 'react';
// import MiqFormRenderer from '@@ddf';
import PropTypes from 'prop-types';
import MiqFormRenderer, { componentTypes, validatorTypes } from '@@ddf';
import createSchema from './order-service-form.schema';
import { API } from '../../http_api';
import miqRedirectBack from '../../helpers/miq-redirect-back';

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
              let component = {
                component: componentTypes.TEXT_FIELD,
                id: field.name,
                name: field.name,
                label: __(field.label),
                maxLength: 50,
                validate: [{ type: validatorTypes.REQUIRED }],
                isRequired: field.required,
                isDisabled: field.read_only,
                initialValue: field.default_value,
                description: __(field.description),
              };
              if (field.type === 'DialogFieldTextAreaBox') {
                component = {
                  component: componentTypes.TEXT_FIELD,
                  id: 'button_group_name',
                  name: 'name',
                  label: __('Name'),
                  maxLength: 50,
                  validate: [{ type: validatorTypes.REQUIRED }],
                  isRequired: true,
                };
              }
              dialogFields.push(component);
              // For each field get: type, required, read_only, label, name, default_value, description (tooltip)
            });
            const subForm = {
              component: componentTypes.SUB_FORM,
              id: group.label,
              name: group.label,
              label: group.label,
              fields: dialogFields,
            };
            dialogSubForms.push(subForm);
            dialogFields = [];
          });
          const tabComponent = {
            component: componentTypes.TABS,
            name: tab.label,
            fields: dialogSubForms,
          };
          dialogTabs.push(tabComponent);
          dialogTabs.push(tabComponent);
          dialogSubForms = [];
          console.log(dialogTabs);
        });
        setState({ fields: dialogTabs, isLoading: false });
      });
  }, []);

  const onSubmit = (values) => {
  };

  const onCancel = () => {
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
  dialogId: PropTypes.string.isRequired,
};

OrderServiceForm.defaultProps = {
  // dialogId: undefined,
};

export default OrderServiceForm;
