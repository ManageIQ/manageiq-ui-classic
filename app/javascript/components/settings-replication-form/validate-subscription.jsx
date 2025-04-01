import React from 'react';
import PropTypes from 'prop-types';
import { pick } from 'lodash';

import AsyncCredentials from '../async-credentials/async-credentials';

const ValidateSubscription = ({ ...props }) => {
  const asyncValidate = (fields, fieldNames) => new Promise((resolve, _reject) => {
    const resource = pick(fields, fieldNames);

    http.post(`/ops/pglogical_validate_subscription`, resource, { skipErrors: [400] }).then((_response) => {
      // ToDo:: validation needs to be handled

      // const htmlContent = (response && response.replacePartials && response.replacePartials.flash_msg_div) || '';
      // const doc = new DOMParser().parseFromString(htmlContent, 'text/html');
      // const txt = doc.body.textContent || '';
      // const formattedText = txt.replace(/\s+/g, ' ').trim();
      // reject(__(formattedText));

      resolve();
    }).catch(() => {
      // console.log(error);
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
