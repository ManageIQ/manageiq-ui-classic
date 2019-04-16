import React, { useState, Fragment } from 'react';
import PropTypes from 'prop-types';
import { componentTypes } from '@data-driven-forms/react-form-renderer';
import { PasswordContext } from './async-credentials';
import { checkValidState } from './helper';

const SecretSwitchField = ({
  edit,
  formOptions,
  isDisabled,
  FieldProvider, // eslint-disable-line no-unused-vars
  validate,
  cancelEditLabel,
  changeEditLabel,
  ...rest
}) => {
  const [editMode, setEditMode] = useState(!edit);
  const secretField = {
    component: edit ? 'credentials-password-edit' : componentTypes.TEXT_FIELD,
    type: 'password',
    isDisabled,
    validateOnMount: true,
    validate: edit && editMode[validate],
    ...rest,
  };
  return (
    <PasswordContext.Consumer>
      {secretKey => (
        <Fragment>
          {
        edit
          ? formOptions.renderForm([{
            ...secretField,
            editMode: !editMode,
            buttonLabel: !editMode ? changeEditLabel : cancelEditLabel,
            placeholder: !editMode ? '●●●●●●●●' : undefined,
            setEditMode: () => {
              setEditMode(!editMode); // reset edit mode
              formOptions.change(rest.name, undefined); // reset field value in form state
              if (checkValidState(formOptions, secretKey)) {
                formOptions.change(secretKey, formOptions.getFieldState(secretKey).initial);
              }
            },
          }], formOptions)
          : formOptions.renderForm([secretField], formOptions)}
        </Fragment>
      )}
    </PasswordContext.Consumer>
  );
};

SecretSwitchField.propTypes = {
  FieldProvider: PropTypes.func.isRequired,
  edit: PropTypes.bool,
  formOptions: PropTypes.shape({
    renderForm: PropTypes.func.isRequired,
  }).isRequired,
  cancelEditLabel: PropTypes.string,
  changeEditLabel: PropTypes.string,
  isDisabled: PropTypes.bool,
  validate: PropTypes.func,
};

SecretSwitchField.defaultProps = {
  cancelEditLabel: __('Cancel'),
  changeEditLabel: __('Change'),
  isDisabled: false,
  validate: undefined,
  edit: false,
};

export default SecretSwitchField;
