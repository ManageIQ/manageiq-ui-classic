import React, { Fragment, useContext } from 'react';
import PropTypes from 'prop-types';

import { useFormApi } from '@@ddf';
import EditingContext from './editing-context';

const ProviderCredentials = ({ fields }) => {
  const { providerId } = useContext(EditingContext);
  const formOptions = useFormApi();

  // Pass down the required `edit` to the password component (if it exists)
  return (
    <>
      {
        formOptions.renderForm(fields.map((field) => ({
          ...field,
          ...(field.component === 'password-field' ? { edit: !!providerId } : undefined),
        })), formOptions)
      }
    </>
  );
};

ProviderCredentials.propTypes = {
  fields: PropTypes.arrayOf(PropTypes.any).isRequired,
};

export default ProviderCredentials;
