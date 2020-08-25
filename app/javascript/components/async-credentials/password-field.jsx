import React, { useState, Fragment } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  FormGroup,
  ControlLabel,
  InputGroup,
  FormControl,
  HelpBlock,
} from 'patternfly-react';
import { componentTypes, useFormApi } from '@@ddf';
import { checkValidState } from './helper';
import RequiredLabel from '../../forms/required-label';

const PasswordField = ({
  cancelEditLabel,
  changeEditLabel,
  helperText,
  edit,
  parent,
  ...rest
}) => {
  const formOptions = useFormApi();
  const [editMode, setEditMode] = useState(!edit);
  const secretField = {
    type: 'password',
    autoComplete: 'new-password',
    validateOnMount: rest.validateOnMount,
    helperText,
    ...rest,
    component: edit ? 'edit-password-field' : componentTypes.TEXT_FIELD,
  };

  return (
    <Fragment>
      {edit && editMode && formOptions.renderForm([{
        ...secretField,
        editMode: !editMode,
        buttonLabel: cancelEditLabel,
        setEditMode: () => {
          formOptions.change(rest.name, undefined);
          if (parent && checkValidState(formOptions, parent)) {
            formOptions.change(parent, formOptions.getFieldState(parent).initial);
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
              autoComplete="new-password"
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
  cancelEditLabel: PropTypes.string,
  changeEditLabel: PropTypes.string,
  helperText: PropTypes.string,
  edit: PropTypes.bool,
  parent: PropTypes.string,
};

PasswordField.defaultProps = {
  cancelEditLabel: __('Cancel'),
  changeEditLabel: __('Change'),
  helperText: undefined,
  edit: false,
  parent: undefined,
};

export default PasswordField;
