import React from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  ControlLabel,
  FieldLevelHelp,
  FormControl,
  FormGroup,
  HelpBlock,
  InputGroup,
} from 'patternfly-react';

import { useFieldApi } from '@@ddf';
import RequiredLabel from '../../forms/required-label';

const EditPasswordField = ({ ...props }) => {
  const {
    input,
    meta,
    label,
    setEditMode,
    dataType, // eslint-disable-line no-unused-vars
    validateOnMount, // eslint-disable-line no-unused-vars
    editMode,
    isDisabled,
    buttonLabel,
    isRequired,
    helperText,
    ...rest
  } = useFieldApi(props);

  return (
    <FormGroup validationState={meta.error ? 'error' : null}>
      <ControlLabel>
        {isRequired ? <RequiredLabel label={label} /> : label }
        {helperText && <FieldLevelHelp content={helperText} />}
      </ControlLabel>
      <InputGroup>
        <FormControl
          style={{ zIndex: 'initial' }}
          {...input}
          id={`${input.name}-input`}
          autoFocus
          {...rest}
          disabled={editMode || isDisabled}
          type="password"
          autoComplete="new-password"
        />
        <InputGroup.Button>
          <Button type="button" onClick={setEditMode}>{buttonLabel}</Button>
        </InputGroup.Button>
      </InputGroup>
      {meta.error && <HelpBlock>{ meta.error }</HelpBlock>}
    </FormGroup>
  );
};

EditPasswordField.propTypes = {
  label: PropTypes.string.isRequired,
  isDisabled: PropTypes.bool,
  setEditMode: PropTypes.func.isRequired,
  helperText: PropTypes.string,
};

EditPasswordField.defaultProps = {
  isDisabled: false,
  helperText: undefined,
};

export default EditPasswordField;
