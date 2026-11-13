import React, { useContext, useEffect } from 'react';
import { Button } from '@carbon/react';
import ServiceContext from './ServiceContext';
import { omitValidation } from './helper';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import { API, http } from '../../http_api';
import { ServiceType } from './constants';

/** Function to extract the error messages from a failed API response.
 * The API returns messages in the form 'Bad request - Error one,Error two'. */
export const submitErrorMessages = (error) => {
  const message = error && error.data && error.data.error && error.data.error.message;
  if (typeof message !== 'string' || message.length === 0) {
    return [__('Error submitting request')];
  }
  const detail = message.includes(' - ') ? message.split(' - ').slice(1).join(' - ') : message;
  const messages = detail.split(',').map((item) => item.trim()).filter(Boolean);
  return messages.length > 0 ? messages : [__('Error submitting request')];
};

const ServiceButtons = () => {
  const { data, setData } = useContext(ServiceContext);
  const setError = (messages) => setData((prev) => ({ ...prev, submitError: [].concat(messages), locked: false }));
  const {
    apiAction, apiSubmitEndpoint, openUrl, finishSubmitEndpoint, cancelEndPoint,
  } = data.urls;

  const isReconfigure = data.serviceType === ServiceType.reconfigure;
  const submitFlashLevel = isReconfigure ? 'info' : 'success';

  useEffect(() => {
    if (data.locked) {
      const handleSubmission = async() => {
        const values = omitValidation(data.dialogFields);
        let submitData = { action: apiAction, ...values };

        if (apiSubmitEndpoint.includes('/generic_objects/')) {
          submitData = { action: apiAction, parameters: values };
        } else if (apiAction === 'reconfigure') {
          submitData = { action: apiAction, resource: values };
        }

        try {
          const response = await API.post(apiSubmitEndpoint, submitData, { skipErrors: [400] });
          if (openUrl === 'true') {
            const { params } = data;
            let urlResponse;
            try {
              await API.wait_for_task(response.task_id);
              urlResponse = await http.post('open_url_after_dialog', {
                targetId: params.targetId,
                realTargetType: params.realTargetType,
              });
            } catch {
              throw { data: { error: { message: `- ${__('Automate failed to obtain URL.')}` } } }; // eslint-disable-line no-throw-literal
            }

            if (urlResponse.open_url) {
              window.open(urlResponse.open_url);
              miqRedirectBack(__('Order Request was Submitted'), submitFlashLevel, finishSubmitEndpoint);
            } else {
              miqSparkleOff();
              setError(__('Automate failed to obtain URL.'));
            }
          } else {
            miqRedirectBack(__('Order Request was Submitted'), submitFlashLevel, finishSubmitEndpoint);
          }
        } catch (error) {
          miqSparkleOff();
          setError(submitErrorMessages(error));
        }
      };

      handleSubmission();
    }
  }, [data.locked]);

  const formValid = data.dialogFields ? Object.values(data.dialogFields).every((field) => field.valid) : false;

  const submitForm = () => {
    miqSparkleOn();
    setData({
      ...data,
      locked: true,
    });
  };

  return (
    <div className="service-action-buttons">
      <Button
        disabled={!formValid || data.locked}
        onClick={submitForm}
      >
        {
          data.locked ? __('Submitting...') : __('Submit')
        }
      </Button>

      <Button
        kind="secondary"
        disabled={data.locked || data.fieldsToRefresh.length > 0}
        onClick={() => miqRedirectBack(__('Dialog Cancelled'), 'info', cancelEndPoint)}
      >
        {__('Cancel')}
      </Button>
    </div>
  );
};

export default ServiceButtons;
