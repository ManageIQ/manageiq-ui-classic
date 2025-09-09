import React from 'react';
import PropTypes from 'prop-types';
import { pick } from 'lodash';

import AsyncCredentials from '../async-credentials/async-credentials';

const ValidateSubscription = ({ ...props }) => {
  const asyncValidate = (fields, fieldNames) => new Promise((resolve, reject) => {
    const resource = pick(fields, fieldNames);

    resolve();

    /* API.post('/api/ops/', { action: 'validate', resource }).then((response) => {
      console.log(response);
    }).catch(({ message }) => { console.log(message); return reject([__('Validation failed:'), message].join(' ')); }); */
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
