import React from 'react';
import PropTypes from 'prop-types';

const CheckErrors = ({
  names,
  subscription,
  fieldsState,
  children,
  originalRender,
  FieldProvider,
  valid,
}) => {
  if (!names.length) {
    return (originalRender || children)(valid);
  }
  const [name, ...rest] = names;
  return (
    <FieldProvider name={name} subscription={subscription}>
      {fieldState => (
        <CheckErrors
          names={rest}
          subscription={subscription}
          originalRender={originalRender || children}
          fieldsState={{ ...fieldsState, [name]: fieldState }}
          FieldProvider={FieldProvider}
          valid={[...valid, fieldState.meta.valid]}
        />
      )}
    </FieldProvider>
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
