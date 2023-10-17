import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, Loading } from 'carbon-components-react';
import { FormSpy } from '@data-driven-forms/react-form-renderer';

import MiqFormRenderer, { useFormApi } from '@@ddf';
import createSchema from '../service-dialog-builder/service-dialog-builder.schema';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import { buildFields, prepareSubmitData } from '../service-dialog-builder/helper';
import ServiceDialogRefreshButton from '../service-dialog-builder/service-dialog-refresh-button';
import mapper from '../../forms/mappers/componentMapper';
import NotificationMessage from '../notification-message';

const ServiceReconfigureForm = ({ dialogLocals }) => {
  const [data, setData] = useState({
    isLoading: !!dialogLocals,
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

  const componentMapper = {
    ...mapper,
    'refresh-button': ServiceDialogRefreshButton,
  };

  console.log(dialogLocals);

  useEffect(() => {
    if (dialogLocals) {
      miqSparkleOn();
      API.get(`/api/services/${dialogLocals.targetId}?attributes=reconfigure_dialog`).then((response) => {
        buildFields(response, data, setData, dialogLocals);
      }).catch((errorData) => {
        setData({
          ...data,
          notification: { type: 'error', message: errorData.data.error },
        });
      });
      miqSparkleOff();
    }
  }, [dialogLocals]);

  const onSubmit = (values) => {
    const submitData = prepareSubmitData('reconfigure', values, setShowDateError);

    console.log(submitData);

    API.post(`/api/services/${dialogLocals.targetId}`, submitData, { skipErrors: [400] }).then(() => {
      const message = __('Order Request was Submitted');
      miqRedirectBack(message, 'success', '/miq_request/show_list?typ=service/');
    }).catch((err) => {
      console.log(err);
    });
  };

  const onCancel = () => {
    const message = __('Dialog Cancelled');
    miqRedirectBack(message, 'warning', '/service/show_list');
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
            schema={createSchema(data.fields, showDateError)}
            FormTemplate={(props) => <FormTemplate {...props} fields={data.fields} />}
            componentMapper={componentMapper}
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

ServiceReconfigureForm.propTypes = {
  dialogLocals: PropTypes.shape({
    resourceActionId: PropTypes.string,
    targetId: PropTypes.string,
  }),
};
ServiceReconfigureForm.defaultProps = {
  dialogLocals: undefined,
};

export default ServiceReconfigureForm;
