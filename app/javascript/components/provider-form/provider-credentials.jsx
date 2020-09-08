import React, { Fragment, useContext } from 'react';
import PropTypes from 'prop-types';

import { useFormApi } from '@@ddf';
import { EditingContext } from './index';

const ProviderCredentials = ({ fields }) => {
  const { providerId } = useContext(EditingContext);
  const formOptions = useFormApi();

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
  fields: PropTypes.array.isRequired,
};

export default ProviderCredentials;
