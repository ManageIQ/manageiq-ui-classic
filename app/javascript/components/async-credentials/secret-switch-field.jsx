import React, { useState, Fragment } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  FormGroup,
  ControlLabel,
  InputGroup,
  FormControl,
} from 'patternfly-react';
import { componentTypes } from '@data-driven-forms/react-form-renderer';
import { PasswordContext } from './async-credentials';
import { checkValidState } from './helper';
import RequiredLabel from '../../forms/required-label';

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
    validateOnMount: rest.validateOnMount,
    validate: [validate],
    ...rest,
  };
  return (
    <PasswordContext.Consumer>
      {secretKey => (
        <Fragment>
          {edit && editMode && formOptions.renderForm([{
            ...secretField,
            editMode: !editMode,
            buttonLabel: cancelEditLabel,
            setEditMode: () => {
              formOptions.change(rest.name, undefined);
              if (checkValidState(formOptions, secretKey)) {
                formOptions.change(secretKey, formOptions.getFieldState(secretKey).initial);
              }
              setEditMode(editMode => !editMode); // reset edit mode
            },
          }], formOptions) }
          {edit && !editMode && (
            <FormGroup>
              <ControlLabel>
                {rest.isRequired ? <RequiredLabel label={rest.label} /> : rest.label }
              </ControlLabel>
              <InputGroup>
                <FormControl
                  id={`${rest.name}-password-placeholder`}
                  autoFocus
                  placeholder="●●●●●●●●"
                  disabled
                  type="password"
                />
                <InputGroup.Button>
                  <Button type="button" onClick={() => setEditMode(editMode => !editMode)}>{changeEditLabel}</Button>
                </InputGroup.Button>
              </InputGroup>
            </FormGroup>
          )}
          {!edit && formOptions.renderForm([secretField], formOptions)}
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
