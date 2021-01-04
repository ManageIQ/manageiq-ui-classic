import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { FormSpy } from '@data-driven-forms/react-form-renderer';

import { useFormApi } from '@@ddf';

const SpyField = ({ initialize }) => {
  const formOptions = useFormApi();

  useEffect(() => {
    if (initialize) {
      initialize(formOptions);
    }
  }, []);

  return (
    <FormSpy
      subscription={{ pristine: true, valid: true }}
      onChange={({ pristine, valid }) => {
        ManageIQ.redux.store.dispatch({
          type: 'FormButtons.saveable',
          payload: valid,
        });
        ManageIQ.redux.store.dispatch({
          type: 'FormButtons.pristine',
          payload: pristine,
        });
      }}
    />
  );
};

SpyField.propTypes = {
  initialize: PropTypes.func,
};

SpyField.defaultProps = {
  initialize: undefined,
};

export default SpyField;
