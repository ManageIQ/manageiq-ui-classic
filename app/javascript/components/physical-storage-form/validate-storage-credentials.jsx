import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { pick } from 'lodash';

import AsyncCredentials from '../async-credentials/async-credentials';
import EditingContext from './editing-context';

const ValidateStorageCredentials = ({ ...props }) => {
  const { storageId } = useContext(EditingContext);

  const asyncValidate = (fields, fieldNames) => new Promise((resolve, reject) => {
    const url = storageId ? `/api/physical_storages/${storageId}` : '/api/physical_storages';
    const resource = pick(fields, fieldNames);

    const editErrorMessage = (message) => {
      const prefix1 = "Reason is:";
      const prefix2 = 'management_ip":["';

      if (message.includes(prefix1))
        return message.slice(message.indexOf(prefix1) + prefix1.length, -3);

      if (message.includes(prefix2))
        return message.slice(message.indexOf(prefix2) + prefix2.length, -4);

      return message;
    };

    API.post(url, { action: 'validate', resource }).then(({ results: [result] = [], ...single }) => {
      // eslint-disable-next-line camelcase
      const { task_id, success } = result || single;
      // The request here can either create a background task or fail
      return success ? API.wait_for_task(task_id) : Promise.reject(result);
      // The wait_for_task request can succeed with valid or invalid credentials, but with invalid credentials
      // the status will be Error and the message will describe the error if it is known, or reject it if unknown.
    }).then((result) => (result.status === 'Ok' ? resolve() : reject(__('Validation failed: unknown error'))))
      .catch(({ message }) => reject([__('Validation failed:'), editErrorMessage(message)].join(' ')));
  });

  // The order of props is important here, because they have to be overridden
  return <AsyncCredentials {...props} asyncValidate={asyncValidate} edit={!!storageId} />;
};

ValidateStorageCredentials.propTypes = {
  ...AsyncCredentials.propTypes,
  asyncValidate: PropTypes.func,
  validation: PropTypes.bool,
};
ValidateStorageCredentials.defaultProps = {
  validation: true,
  ...AsyncCredentials.defaultProps,
};

export default ValidateStorageCredentials;
