import React from 'react';
import PropTypes from 'prop-types';
import {
  FormGroup,
  ControlLabel,
  InputGroup,
  FormControl,
  Button,
  HelpBlock,
} from 'patternfly-react';

import RequiredLabel from '../../forms/required-label';

const EditSecretField = ({ FieldProvider, ...props }) => (
  <FieldProvider {...props}>
    {({
      input,
      meta,
      label,
      setEditMode,
      dataType, // eslint-disable-line no-unused-vars
      validateOnMount, // eslint-disable-line no-unused-vars
      formOptions, // eslint-disable-line no-unused-vars
      editMode,
      isDisabled,
      buttonLabel,
      isRequired,
      helperText,
      ...rest
    }) => (
      <FormGroup validationState={meta.error ? 'error' : null}>
        <ControlLabel>
          {isRequired ? <RequiredLabel label={label} /> : label }
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
          />
          <InputGroup.Button>
            <Button type="button" onClick={setEditMode}>{buttonLabel}</Button>
          </InputGroup.Button>
        </InputGroup>
        {(meta.error || helperText) && <HelpBlock>{ meta.error || helperText }</HelpBlock>}
      </FormGroup>
    )}
  </FieldProvider>
);

EditSecretField.propTypes = {
  label: PropTypes.string.isRequired,
  isDisabled: PropTypes.bool,
  setEditMode: PropTypes.func.isRequired,
  helperText: PropTypes.string,
};

EditSecretField.defaultProps = {
  isDisabled: false,
  helperText: undefined,
};

export default EditSecretField;
