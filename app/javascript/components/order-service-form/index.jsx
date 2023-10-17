import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import MiqFormRenderer, { useFormApi } from '@@ddf';
import { Button, Loading } from 'carbon-components-react';
import { FormSpy } from '@data-driven-forms/react-form-renderer';
import createSchema from '../service-dialog-builder/service-dialog-builder.schema';
import { API } from '../../http_api';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import { buildFields, prepareSubmitData } from '../service-dialog-builder/helper';
import ServiceDialogRefreshButton from '../service-dialog-builder/service-dialog-refresh-button';
import mapper from '../../forms/mappers/componentMapper';
import NotificationMessage from '../notification-message';

const OrderServiceForm = ({ initialData }) => {
  const {
    dialogId, resourceActionId, targetId, targetType, apiSubmitEndpoint, apiAction, openUrl, realTargetType, finishSubmitEndpoint,
  } = initialData;

  const [data, setData] = useState({
    isLoading: true,
    fields: [],
    hasTime: false,
    showPastDates: [],
    showPastDatesFieldErrors: [],
    dateErrorFields: [],
    checkBoxes: [],
    dates: [],
    refreshDialogFields: {},
    notification: undefined,
  });
  const [showDateError, setShowDateError] = useState([]);

  useEffect(() => {
    const url = `/api/service_dialogs/${dialogId}?resource_action_id=${resourceActionId}&target_id=${targetId}&target_type=${targetType}`;
    API.get(url, { skipErrors: [500] })
      .then((response) => {
        buildFields(response, data, setData, initialData);
      })
      .catch((errorData) => {
        setData({
          ...data,
          notification: { type: 'error', message: errorData.data.error },
        });
      });
  }, []);

  const onSubmit = (values) => {
    let submitData = prepareSubmitData('order', values, setShowDateError);

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

  const onCancel = () => miqRedirectBack(__('Dialog Cancelled'), 'warning', '/catalog');

  const componentMapper = {
    ...mapper,
    'refresh-button': ServiceDialogRefreshButton,
  };

  return (
    <>
      {
        data.notification && <NotificationMessage type={data.notification.type} message={data.notification.message} />
      }
      {
        data.isLoading && (
          <div className="loadingSpinner">
            <Loading active small withOverlay={false} className="loading" />
          </div>
        )
      }
      {
        !data.isLoading && (
          <MiqFormRenderer
            FormTemplate={(props) => <FormTemplate {...props} fields={data.fields} />}
            componentMapper={componentMapper}
            schema={createSchema(data.fields, showDateError)}
            initialValues={data.initialValues}
            onSubmit={onSubmit}
            onCancel={onCancel}
          />
        )
      }
    </>
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
  const { values, valid } = getState();
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
  initialData: PropTypes.shape({
    apiSubmitEndpoint: PropTypes.string.isRequired,
    apiAction: PropTypes.string.isRequired,
    cancelEndPoint: PropTypes.string.isRequired,
    dialogId: PropTypes.number.isRequired,
    finishSubmitEndpoint: PropTypes.string.isRequired,
    openUrl: PropTypes.bool.isRequired,
    resourceActionId: PropTypes.number.isRequired,
    realTargetType: PropTypes.string.isRequired,
    targetId: PropTypes.number.isRequired,
    targetType: PropTypes.string.isRequired,
  }).isRequired,
};

export default OrderServiceForm;
