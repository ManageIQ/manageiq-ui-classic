import React, { useContext, useEffect } from 'react';
import { Button } from 'carbon-components-react';
import ServiceContext from './ServiceContext';
import { omitValidation } from './helper';
import miqRedirectBack from '../../helpers/miq-redirect-back';

const ServiceButtons = React.memo(() => {
  const { data, setData } = useContext(ServiceContext);
  const {
    apiAction, apiSubmitEndpoint, openUrl, finishSubmitEndpoint,
  } = data.urls;

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
            const taskResponse = await API.wait_for_task(response)
              .then(() =>
                // eslint-disable-next-line no-undef
                $http.post('open_url_after_dialog', { targetId, realTargetType }));

            if (taskResponse.data.open_url) {
              window.open(response.data.open_url);
              miqRedirectBack(__('Order Request was Submitted'), 'success', finishSubmitEndpoint);
            } else {
              add_flash(__('Automate failed to obtain URL.'), 'error');
              miqSparkleOff();
            }
          } else {
            miqRedirectBack(__('Order Request was Submitted'), 'success', finishSubmitEndpoint);
          }
        } catch (_error) {
          // Handle error if needed
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
        onClick={() => miqRedirectBack(__('Dialog Cancelled'), 'warning', '/catalog')}
      >
        {__('Cancel')}
      </Button>
    </div>
  );
});

export default ServiceButtons;
