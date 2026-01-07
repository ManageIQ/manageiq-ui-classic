import React from 'react';
import PropTypes from 'prop-types';
import {
  FormGroup, TextInput, TextArea, Button,
} from 'carbon-components-react';
import { prepareProps } from '@data-driven-forms/carbon-component-mapper';
import { EditOff16 } from '@carbon/icons-react';

import { useFieldApi, componentTypes } from '@@ddf';

const EditPasswordField = ({ componentClass, ...props }) => {
  const {
    labelText, validateOnMount, isDisabled, editMode, setEditMode, buttonLabel, input, meta, icon, kind, ...rest
  } = useFieldApi(prepareProps(props));

  const invalid = (meta.touched || validateOnMount) && meta.error;
  const warn = (meta.touched || validateOnMount) && meta.warning;

  const field = componentClass === componentTypes.TEXT_FIELD ? (
    <TextInput
      {...input}
      key={input.name}
      labelText=""
      invalid={Boolean(invalid)}
      invalidText={invalid || ''}
      warn={Boolean(warn)}
      warnText={warn || ''}
      style={{ zIndex: 'initial' }}
      id={`${input.name}-input`}
      autoFocus
      disabled={editMode || isDisabled}
      type="password"
      autoComplete="new-password"
      {...rest}
    />
  ) : (
    <TextArea
      {...input}
      key={input.name}
      labelText=""
      invalid={Boolean(invalid)}
      invalidText={invalid || ''}
      style={{ zIndex: 'initial' }}
      id={`${input.name}-input`}
      autoFocus
      disabled={editMode || isDisabled}
      type="password"
      autoComplete="new-password"
      {...rest}
    />
  );

  return (
    <FormGroup legendText={labelText}>
      <div className="bx--grid" style={{ paddingLeft: 0, marginLeft: 0 }}>
        <div className="bx--row">
          <div className="bx--col-lg-15 bx--col-md-7 bx--col-sm-3">
            { field }
          </div>
          <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1">
            <Button
              hasIconOnly
              kind={kind || 'secondary'}
              size="field"
              onClick={setEditMode}
              iconDescription={buttonLabel}
              renderIcon={icon || EditOff16}
            />
          </div>
        </div>
      </div>
    </FormGroup>
  );
};

EditPasswordField.propTypes = {
  label: PropTypes.string.isRequired,
  isDisabled: PropTypes.bool,
  setEditMode: PropTypes.func.isRequired,
  helperText: PropTypes.string,
  componentClass: PropTypes.string,
};

EditPasswordField.defaultProps = {
  isDisabled: false,
  helperText: undefined,
  componentClass: componentTypes.TEXT_FIELD,
};

export default EditPasswordField;
