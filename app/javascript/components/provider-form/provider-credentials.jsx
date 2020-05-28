import React, { Fragment, useContext } from 'react';
import PropTypes from 'prop-types';

import { EditingContext } from './index';

const ProviderCredentials = ({ formOptions, fields }) => {
  const { providerId } = useContext(EditingContext);

  // Pass down the required `edit` to the password component (if it exists)
  return (
    <Fragment>
      {
        formOptions.renderForm(fields.map(field => ({
          ...field,
          ...(field.component === 'password-field' ? { edit: !!providerId } : undefined),
        })), formOptions)
      }
    </Fragment>
  );
};

ProviderCredentials.propTypes = {
  formOptions: PropTypes.any.isRequired,
  fields: PropTypes.array.isRequired,
};

export default ProviderCredentials;
