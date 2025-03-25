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

    // API.post('/ops/pglogical_validate_subscription', { resource })
    //   .then((response) => {
    //     debugger
    //     console.log('Server Response:', response);
    //     // Do something with the response, like updating the UI or handling data
    //   })
    //   .catch((error) => {
    //     debugger
    //     console.error('Error during API call:', error);
    //     // Handle errors, such as network issues or bad responses
    //   });

    http.post(`/ops/pglogical_validate_subscription`, resource, { skipErrors: [400] }).then(() => {
      debugger
      // const message = __('Order Request was Submitted');
      // miqRedirectBack(message, 'success', '/miq_request/show_list?typ=service/');
    }).catch((err) => {
      debugger
      console.log(err);
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
