/* eslint-disable camelcase */
import React from 'react';
import MiqFormRenderer from '@@ddf';
import PropTypes from 'prop-types';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import { CloudVolumeActionTypes, formData, handleError } from './helper';

const CloudVolumeActions = ({ recordId, name, type }) => {
  const data = formData(recordId, name, type);
  const isCreateSnapshot = type === CloudVolumeActionTypes.CREATE_SNAPSHOT;

  /** On cancel click event handler */
  const onCancel = () => {
    const { message, url } = data.cancel;
    miqRedirectBack(message, 'success', url);
  };

  /** On submit click event handler */
  const onSubmit = (values) => {
    miqSparkleOn();
    const {
      action, message, postUrl, successUrl,
    } = data.save;
    const formParams = isCreateSnapshot ? values : { action, resources: values };

    API.post(postUrl, formParams).then((response) => {
      const responseData = isCreateSnapshot ? response.results[0] : response;
      const { task_id, success } = responseData;
      if (success) {
        API.wait_for_task(task_id)
          .then(() => miqRedirectBack(message, 'success', successUrl))
          .catch((error) => miqRedirectBack(handleError(error), 'error', successUrl))
          .then(() => API.delete(`/api/tasks/${task_id}`));
      } else {
        Promise.reject(responseData);
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
