import React from 'react';
import PropTypes from 'prop-types';

import { useFieldApi } from '@@ddf';

const CheckErrors = ({
  names,
  subscription,
  fieldsState,
  children,
  originalRender,
  valid,
}) => {
  if (!names.length) {
    return (originalRender || children)(valid);
  }
  const [name, ...rest] = names;
  const fieldState = useFieldApi({ name, subscription });

  return (
    <CheckErrors
      names={rest}
      subscription={subscription}
      originalRender={originalRender || children}
      fieldsState={{ ...fieldsState, [name]: fieldState }}
      valid={[...valid, fieldState.meta.valid]}
    />
  );
};

CheckErrors.propTypes = {
  names: PropTypes.arrayOf(PropTypes.string).isRequired,
  subscription: PropTypes.object.isRequired,
  fieldsState: PropTypes.object,
  children: PropTypes.any,
  originalRender: PropTypes.func,
  valid: PropTypes.arrayOf(PropTypes.bool),
};

CheckErrors.defaultProps = {
  fieldsState: {},
  originalRender: undefined,
  valid: [],
};

export default CheckErrors;
