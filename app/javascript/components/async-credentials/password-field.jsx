import React, { useState, useContext, Fragment } from 'react';
import { HelpBlock } from 'patternfly-react';
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

const PasswordField = ({
  formOptions,
  isDisabled,
  FieldProvider, // eslint-disable-line no-unused-vars
  validate,
  cancelEditLabel,
  changeEditLabel,
  helperText,
  ...rest
}) => {
  const { name: secretKey, edit } = useContext(PasswordContext);
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
          { helperText && <HelpBlock>{ helperText }</HelpBlock> }
        </FormGroup>
      )}
      {!edit && formOptions.renderForm([secretField], formOptions)}
    </Fragment>
  );
};

PasswordField.propTypes = {
  FieldProvider: PropTypes.func.isRequired,
  formOptions: PropTypes.shape({
    renderForm: PropTypes.func.isRequired,
  }).isRequired,
  cancelEditLabel: PropTypes.string,
  changeEditLabel: PropTypes.string,
  isDisabled: PropTypes.bool,
  validate: PropTypes.func,
  helperText: PropTypes.string,
};

PasswordField.defaultProps = {
  cancelEditLabel: __('Cancel'),
  changeEditLabel: __('Change'),
  isDisabled: false,
  validate: undefined,
  helperText: undefined,
};

export default PasswordField;
