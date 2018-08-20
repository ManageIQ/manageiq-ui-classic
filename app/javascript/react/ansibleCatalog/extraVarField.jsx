import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'react-final-form';
import { required } from 'redux-form-validators';

export const ExtraVarField = (props) => {
  const {
    name, isEditing, fieldName, label, value,
  } = props.field;

  return (!isEditing ? <div>{value}</div> : (
    <Field
      name={`${name}.${fieldName}`}
      label=""
      labelColumnSize={0}
      inputColumnSize={12}
      validate={required({ msg: __('Required') })}
      validateOnMount
      placeholder={label}
    >
      {({ input }) => (<input type="hidden" {...input} />)}
    </Field>));
};
ExtraVarField.propTypes = {
  field: PropTypes.shape({
    name: PropTypes.string,
    value: PropTypes.string,
    isEditing: PropTypes.bool,
    fieldName: PropTypes.string,
    label: PropTypes.string,
  }).isRequired,
};

export default ExtraVarField;
