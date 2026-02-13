import React from 'react';
import PropTypes from 'prop-types';
import {
  FormGroup, TextInput, TextArea, Button, Column, Grid,
} from '@carbon/react';
import { prepareProps } from '@data-driven-forms/carbon-component-mapper';
import { EditOff } from '@carbon/react/icons';

import { useFieldApi, componentTypes } from '@@ddf';

const EditPasswordField = ({ componentClass, ...props }) => {
  const {
    labelText, validateOnMount, isDisabled, editMode, setEditMode, buttonLabel, input, meta, ...rest
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
      <Grid condensed className="miq-pwd-field-grid">
        <Column
          sm={3}
          md={7}
          lg={15}
          className="miq-pwd-field-grid-col"
        >
          {field}
        </Column>
        <Column
          sm={1}
          md={1}
          lg={1}
          className="miq-pwd-field-edit-icon-grid-col"
        >
          <Button
            hasIconOnly
            kind="secondary"
            size="md"
            onClick={setEditMode}
            iconDescription={buttonLabel}
            renderIcon={(props) => <EditOff size={16} {...props} />}
          />
        </Column>
      </Grid>
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
