import React, { useState, Fragment } from 'react';
import PropTypes from 'prop-types';
import { FormGroup, TextInput, Button } from 'carbon-components-react';
import { Edit16 } from '@carbon/icons-react';

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
    componentClass,
  };

  const newProps = { ...secretField };
  delete newProps.componentClass;
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
          <div className="bx--grid" style={{ paddingLeft: 0, marginLeft: 0 }}>
            <div className="bx--row">
              <div className="bx--col-lg-15 bx--col-md-7 bx--col-sm-3">
                <TextInput
                  labelText=""
                  id={`${rest.name}-password-placeholder`}
                  placeholder="●●●●●●●●"
                  disabled
                  type="password"
                  autoComplete="new-password"
                />
              </div>
              <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1">
                <Button
                  hasIconOnly
                  kind="primary"
                  size="field"
                  onClick={() => setEditMode((editMode) => !editMode)}
                  iconDescription={changeEditLabel}
                  renderIcon={Edit16}
                />
              </div>
            </div>
          </div>
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
