import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { pick } from 'lodash';

import AsyncCredentials from '../async-credentials/async-credentials';
import { EditingContext } from './index';

const ValidateProviderCredentials = ({ ...props }) => {
  const { providerId } = useContext(EditingContext);

  const asyncValidate = (fields, fieldNames) => new Promise((resolve, reject) => {
    const url = providerId ? `/api/providers/${providerId}` : '/api/providers';
    const resource = pick(fields, fieldNames);

    API.post(url, { action: 'verify_credentials', resource }).then(({ results: [result] = [], ...single }) => {
      const { task_id, success } = result || single;
      // The request here can either create a background task or fail
      return success ? API.wait_for_task(task_id) : Promise.reject(result);
      // The wait_for_task request can succeed with valid or invalid credentials
      // with the message that the task is completed successfully. Based on the
      // task_results we resolve() or reject() with an unknown error.
      // Any known errors are passed to the catch(), which will reject() with a
      // message describing what went wrong.
    }).then(result => (result.task_results ? resolve() : reject(__('Validation failed: unknown error'))))
      .catch(({ message }) => reject([__('Validation failed:'), message].join(' ')));
  });

  // The order of props is important here, because they have to be overridden
  return <AsyncCredentials {...props} asyncValidate={asyncValidate} edit={!!providerId} />;
};

ValidateProviderCredentials.propTypes = {
  ...AsyncCredentials.propTypes,
  asyncValidate: PropTypes.func,
  validation: PropTypes.bool,
};
ValidateProviderCredentials.defaultProps = {
  validation: true,
  ...AsyncCredentials.defaultProps,
};

export default ValidateProviderCredentials;
