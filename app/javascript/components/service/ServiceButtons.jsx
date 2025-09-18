import React, { useContext, useEffect } from 'react';
import { Button } from 'carbon-components-react';
import ServiceContext from './ServiceContext';
import { omitValidation } from './helper';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import { API } from '../../http_api';
import { ServiceType } from './constants';

const ServiceButtons = React.memo(() => {
  const { data, setData } = useContext(ServiceContext);
  const {
    apiAction, apiSubmitEndpoint, openUrl, finishSubmitEndpoint, cancelEndPoint,
  } = data.urls;
  
  const isReconfigure = data.serviceType === ServiceType.reconfigure;
  const successMessage = isReconfigure ? __('Reconfigure Request was Submitted') : __('Order Request was Submitted');

  useEffect(() => {
    if (data.locked) {
      const handleSubmission = async() => {
        const values = omitValidation(data.dialogFields);
        let submitData = { action: 'order', ...values };

        if (apiSubmitEndpoint.includes('/generic_objects/')) {
          submitData = { action: apiAction, parameters: values };
        } else if (apiAction === 'reconfigure') {
          submitData = { action: apiAction, resource: values };
        }

        try {
          const response = await API.post(apiSubmitEndpoint, submitData, { skipErrors: [400] });
          if (openUrl === 'true') {
            const { params } = data;
            const taskResponse = await API.wait_for_task(response)
              .then(() =>
                // eslint-disable-next-line no-undef
                $http.post('open_url_after_dialog', {
                  targetId: params.targetId,
                  realTargetType: params.realTargetType
                }));

            if (taskResponse.data.open_url) {
              window.open(response.data.open_url);
              miqRedirectBack(successMessage, 'success', finishSubmitEndpoint);
            } else {
              add_flash(__('Automate failed to obtain URL.'), 'error');
              miqSparkleOff();
            }
          } else {
            miqRedirectBack(successMessage, 'success', finishSubmitEndpoint);
          }
        } catch (error) {
          console.error('Error submitting form:', error);
          miqSparkleOff();
          add_flash(__('Error submitting request'), 'error');
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
        onClick={() => miqRedirectBack(__('Dialog Cancelled'), 'warning', cancelEndPoint)}
      >
        {__('Cancel')}
      </Button>
    </div>
  );
});

export default ServiceButtons;
