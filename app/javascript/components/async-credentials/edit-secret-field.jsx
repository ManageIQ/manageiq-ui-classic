import React from 'react';
import PropTypes from 'prop-types';
import {
  FormGroup,
  Col,
  InputGroup,
  FormControl,
  Button,
  HelpBlock,
} from 'patternfly-react';

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
      ...rest
    }) => (
      <FormGroup validationState={meta.error ? 'error' : null}>
        <Col md={2} componentClass="label" className="control-label">
          { label }
        </Col>
        <Col md={10}>
          <InputGroup>
            <FormControl {...input} autoFocus {...rest} disabled={editMode || isDisabled} type="password" />
            <InputGroup.Button>
              <Button type="button" onClick={setEditMode}>{buttonLabel}</Button>
            </InputGroup.Button>
          </InputGroup>
          {meta.error && <HelpBlock>{ meta.error }</HelpBlock>}
        </Col>
      </FormGroup>
    )}
  </FieldProvider>
);

EditSecretField.propTypes = {
  label: PropTypes.string.isRequired,
  isDisabled: PropTypes.bool,
  setEditMode: PropTypes.func.isRequired,
};

EditSecretField.defaultProps = {
  isDisabled: false,
};

export default EditSecretField;
