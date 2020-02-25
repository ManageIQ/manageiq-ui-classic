import { pick } from 'lodash';
import React from 'react';
import AsyncCredentials from './async-credentials';

const AsyncProviderCredentials = ({ ...props }) => {
  const asyncValidate = (fields, fieldNames) => new Promise((resolve, reject) => {
    const resource = pick(fields, fieldNames);
    API.post('/api/providers', { action: 'verify_credentials', resource }).then(({ results: [result] }) => {
      const { task_id, success } = result;
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

  return <AsyncCredentials asyncValidate={asyncValidate} {...props} />;
};

AsyncProviderCredentials.propTypes = AsyncCredentials.propTypes;
AsyncProviderCredentials.defaultProps = AsyncCredentials.defaultProps;

export default AsyncProviderCredentials;
