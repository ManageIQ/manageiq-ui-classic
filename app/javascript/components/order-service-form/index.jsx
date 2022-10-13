import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import MiqFormRenderer, { useFormApi } from '@@ddf';
import { Button } from 'carbon-components-react';
import { FormSpy } from '@data-driven-forms/react-form-renderer';
import createSchema from './order-service-form.schema';
import { API } from '../../http_api';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import { buildFields, prepareSubmitData } from './helper';

const OrderServiceForm = ({
  dialogId, resourceActionId, targetId, targetType, apiSubmitEndpoint, apiAction, openUrl, realTargetType, finishSubmitEndpoint,
}) => {
  const [{
    // eslint-disable-next-line no-unused-vars
    isLoading, initialValues, fields, hasTime, showPastDates, showPastDatesFieldErrors, dateErrorFields, checkBoxes, dates,
  }, setState] = useState({
    isLoading: true,
    fields: [],
    hasTime: false,
    showPastDates: [],
    showPastDatesFieldErrors: [],
    dateErrorFields: [],
    checkBoxes: [],
    dates: [],
  });
  const [showDateError, setShowDateError] = useState([]);
  // const [dynamicFieldValues, setDynamicFieldValues] = useState({});

  // console.log(dialogId);
  // console.log(resourceActionId);
  // console.log(targetId);
  // console.log(targetType);
  // console.log(apiSubmitEndpoint);
  // console.log(apiAction);
  // console.log(openUrl);
  // console.log(realTargetType);
  // console.log(finishSubmitEndpoint);

  useEffect(() => {
    API.get(`/api/service_dialogs/${dialogId}?resource_action_id=${resourceActionId}&target_id=${targetId}&target_type=${targetType}`)
      .then((data) => {
        buildFields(data, setState);
        console.log(data);
      });
  }, []);

  const onSubmit = (values) => {
    let submitData = { action: 'order', ...values };

    submitData = prepareSubmitData(values, setShowDateError);

    if (submitData !== false) {
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
    return null;
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
  apiAction: PropTypes.string.isRequired,
  openUrl: PropTypes.bool.isRequired,
  realTargetType: PropTypes.string.isRequired,
  finishSubmitEndpoint: PropTypes.string.isRequired,
};

export default OrderServiceForm;
