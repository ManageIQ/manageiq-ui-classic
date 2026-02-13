import React, { useState, Fragment } from 'react';
import PropTypes from 'prop-types';
import {
  FormGroup, TextInput, Button, Grid, Column,
} from '@carbon/react';
import { Edit } from '@carbon/react/icons';

import { componentTypes, useFormApi } from '@@ddf';
import { checkValidState } from './helper';

const PasswordField = ({
  cancelEditLabel,
  changeEditLabel,
  helperText,
  edit,
  parent,
  componentClass,
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
    component: edit ? 'edit-password-field' : componentClass,
    ...(edit) && { componentClass },
  };

  const newProps = { ...secretField };
  if (rest.label === undefined) {
    rest.label = '';
  }

  return (
    <>
      {edit && editMode && formOptions.renderForm([{
        ...newProps,
        editMode: !editMode,
        buttonLabel: cancelEditLabel,
        setEditMode: () => {
          formOptions.change(rest.name, undefined);
          if (parent && checkValidState(formOptions, parent)) {
            formOptions.change(parent, formOptions.getFieldState(parent).initial);
          }
          setEditMode((editMode) => !editMode); // reset edit mode
        },
      }], formOptions) }

      {edit && !editMode && (
        <FormGroup legendText={rest.label}>
          <Grid condensed className="miq-pwd-field-grid">
            <Column sm={3} md={7} lg={15} className="miq-pwd-field-grid-col">
              <TextInput
                labelText=""
                id={`${rest.name}-password-placeholder`}
                placeholder="●●●●●●●●"
                disabled
                type="password"
                autoComplete="new-password"
              />
            </Column>
            <Column sm={1} md={1} lg={1} className="miq-pwd-field-edit-icon-grid-col">
              <Button
                hasIconOnly
                kind="primary"
                size="md"
                onClick={() => setEditMode((editMode) => !editMode)}
                iconDescription={changeEditLabel}
                renderIcon={(props) => <Edit size={16} {...props} />}
              />
            </Column>
          </Grid>
        </FormGroup>
      )}

      {!edit && formOptions.renderForm([newProps], formOptions)}
    </>
  );
};

PasswordField.propTypes = {
  cancelEditLabel: PropTypes.string,
  changeEditLabel: PropTypes.string,
  helperText: PropTypes.string,
  edit: PropTypes.bool,
  parent: PropTypes.string,
  componentClass: PropTypes.string,
};

PasswordField.defaultProps = {
  cancelEditLabel: __('Cancel'),
  changeEditLabel: __('Change'),
  helperText: undefined,
  edit: false,
  parent: undefined,
  componentClass: componentTypes.TEXT_FIELD,
};

export default PasswordField;
