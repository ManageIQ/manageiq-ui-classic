/* eslint-disable camelcase */
import React from 'react';
import MiqFormRenderer from '@@ddf';
import PropTypes from 'prop-types';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import { formData } from './helper';

const CloudVolumeActions = ({ recordId, name, type }) => {
  const data = formData(recordId, name, type);

  /** On cancel click event handler */
  const onCancel = () => {
    const { message, url } = data.cancel;
    miqRedirectBack(message, 'success', url);
  };

  /** Function to extract the error message. */
  const handleError = (message) => {
    // Cannot be parsed to JSON due to error in message data.
    const cleared = message.replace(/[^a-zA-Z :]/g, '');
    return cleared.substring(
      cleared.indexOf('message:') + 9,
      cleared.lastIndexOf(':cookies')
    );
  };

  /** On submit click event handler */
  const onSubmit = (values) => {
    miqSparkleOn();
    const {
      action, message, postUrl, successUrl,
    } = data.save;

    API.post(postUrl, { action, resources: values }).then((result) => {
      const { task_id, success } = result;
      if (success) {
        API.wait_for_task(task_id)
          .then(() => miqRedirectBack(message, 'success', successUrl))
          .catch((error) => miqRedirectBack(handleError(error.message), 'error', successUrl))
          .then(() => API.delete(`/api/tasks/${task_id}`));
      } else {
        Promise.reject(result);
      }
    });
  };

  return data && data.schema ? (
    <MiqFormRenderer
      schema={data.schema}
      onSubmit={onSubmit}
      onCancel={onCancel}
      buttonsLabels={{
        submitLabel: __('Save'),
      }}
    />
  ) : <></>;
};

CloudVolumeActions.propTypes = {
  recordId: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
};

export default CloudVolumeActions;
