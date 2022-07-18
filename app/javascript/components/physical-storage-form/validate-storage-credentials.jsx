import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { pick } from 'lodash';

import AsyncCredentials from '../async-credentials/async-credentials';
import EditingContext from './editing-context';

const ValidateStorageCredentials = ({ ...props }) => {
  const { storageId } = useContext(EditingContext);

  const validateStorage = (fields, fieldNames) => new Promise((resolve, reject) => {
    const resource = pick(fields, fieldNames);

    API.post('/api/physical_storages', { action: 'validate', resource }).then(({ results: [result] = [], ...single }) => {
      // eslint-disable-next-line camelcase
      const { task_id, success } = result || single;
      // The request here can either create a background task or fail
      return success ? API.wait_for_task(task_id) : Promise.reject(result);
      // The wait_for_task request can succeed with valid or invalid credentials
      // with the message that the task is completed successfully. Based on the
      // task_results we resolve() or reject() with an unknown error.
      // Any known errors are passed to the catch(), which will reject() with a
      // message describing what went wrong.
    }).then((result) => (result.task_results ? resolve() : reject(__('Validation failed: unknown error'))))
      .catch(({ message }) => reject([__('Validation failed:'), message].join(' ')));
  });

  // The order of props is important here, because they have to be overridden
  return <AsyncCredentials {...props} asyncValidate={validateStorage} edit={!!storageId} />;
};

ValidateStorageCredentials.propTypes = {
  ...AsyncCredentials.propTypes,
  validateStorage: PropTypes.func,
  validation: PropTypes.bool,
};
ValidateStorageCredentials.defaultProps = {
  validation: true,
  ...AsyncCredentials.defaultProps,
};

export default ValidateStorageCredentials;
