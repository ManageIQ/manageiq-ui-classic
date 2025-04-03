import React from 'react';
import PropTypes from 'prop-types';
import { pick } from 'lodash';

import AsyncCredentials from '../async-credentials/async-credentials';

const ValidateSubscription = ({ ...props }) => {
  const asyncValidate = (fields, fieldNames) => new Promise((resolve, reject) => {
    const resource = pick(fields, fieldNames);

    http.post(`/ops/pglogical_validate_subscription`, resource, { skipErrors: [400] }).then((response) => {
      if (response.status === 'success') {
        resolve();
      } else {
        reject(response.message);
      }
    }).catch(() => {
      reject();
    });
  });

  return <AsyncCredentials {...props} asyncValidate={asyncValidate} />;
};

ValidateSubscription.propTypes = {
  ...AsyncCredentials.propTypes,
  asyncValidate: PropTypes.func,
  validation: PropTypes.bool,
};
ValidateSubscription.defaultProps = {
  validation: true,
  ...AsyncCredentials.defaultProps,
};

export default ValidateSubscription;
