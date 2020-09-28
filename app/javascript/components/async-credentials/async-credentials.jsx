import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { isEqual, flatMap, get, set } from 'lodash';
import { useFormApi, useFieldApi, validatorTypes, FormSpy } from '@@ddf';
import { Button, FormGroup, HelpBlock } from 'patternfly-react';
import ButtonSpinner from '../../forms/button-spinner';

const extractNames = (schema) => {
  const childFields = schema.fields ? flatMap(schema.fields, field => extractNames(field)) : [];
  return schema.name ? [...childFields, schema.name] : childFields;
};

const AsyncCredentials = ({
  validateLabel,
  validationProgressLabel,
  validationSuccessLabel,
  validateDefaultError,
  fields,
  name,
  asyncValidate,
  validationDependencies,
  edit,
}) => {
  const formOptions = useFormApi();

  const dependencies = useMemo(() => [...extractNames({ fields }), ...validationDependencies], [fields, validationDependencies]);

  const snapshot = (values = formOptions.getState().values) => dependencies.reduce((obj, key) => set(obj, key, get(values, key)), {});

  const [{
    validating,
    lastValid,
    errorMessage,
    depsValid,
  }, setState] = useState(() => ({}));

  const { input, meta } = useFieldApi({
    initialValue: !!edit,
    name,
    validate: [{ type: validatorTypes.REQUIRED }],
  });

  const validateDependentFields = () => {
    const registeredFields = formOptions.getRegisteredFields();

    return dependencies.filter(value => registeredFields.includes(value)).every((dependency) => {
      const state = formOptions.getFieldState(dependency);
      // The field is valid if its state is not available or its state is set to valid
      return !state || state.valid;
    });
  };

  const onClick = () => {
    const { values } = formOptions.getState();
    setState(state => ({ ...state, validating: true, errorMessage: undefined }));

    asyncValidate(values, dependencies).then(() => {
      formOptions.change(name, true);
      setState(state => ({
        ...state,
        validating:
        false,
        lastValid: snapshot(values),
        errorMessage: undefined,
      }));
    }).catch((error) => {
      formOptions.change(name, undefined);
      setState(state => ({ ...state, validating: false, errorMessage: error }));
    });
  };

  return (
    <>
      {formOptions.renderForm(fields.map(field => ({
        ...field,
        ...(field.component === 'password-field' ? { parent: name, edit } : undefined),
        isDisabled: field.isDisabled,
      })), formOptions)}
      <FormGroup validationState={meta.error ? 'error' : null}>
        <input type="hidden" {...input} />

        <FormSpy subscription={{ values: true, dirtyFields: true }}>
          {({ dirtyFields, values }) => {
            // The list of registered fields shows up after this render, so the validation has to happen
            // with a delay and has to be pulled back via the state.
            setTimeout(() => setState(state => ({ ...state, depsValid: validateDependentFields() })));

            const currentValues = snapshot(values);

            // The field itself is dirty when any of its children is dirty
            const isDirty = Object.keys(dirtyFields).some(field =>
              dirtyFields[field] && dependencies.includes(field) && !validationDependencies.includes(field));

            // The field itself is valid if there are no modifications since the last validation or the initial values
            const isValid = isEqual(currentValues, lastValid) || !isDirty;
            formOptions.change(name, isValid);

            return (
              <>
                <Button bsSize="small" bsStyle="primary" onClick={onClick} disabled={isValid || !depsValid || validating}>
                  {validating ? validationProgressLabel : validateLabel}
                  {validating && <ButtonSpinner /> }
                </Button>
                { !meta.error && isEqual(currentValues, lastValid) && <HelpBlock>{ validationSuccessLabel }</HelpBlock> }
                { meta.error && !validating && <HelpBlock>{ errorMessage || validateDefaultError }</HelpBlock> }
              </>
            );
          }}
        </FormSpy>
      </FormGroup>
    </>
  );
};

AsyncCredentials.propTypes = {
  validateLabel: PropTypes.string,
  validationProgressLabel: PropTypes.string,
  validationSuccessLabel: PropTypes.string,
  validateDefaultError: PropTypes.string,
  asyncValidate: PropTypes.func.isRequired,
  edit: PropTypes.bool,
  validationDependencies: PropTypes.arrayOf(PropTypes.string),
};

AsyncCredentials.defaultProps = {
  validateLabel: __('Validate'),
  validationProgressLabel: __('Validating'),
  validationSuccessLabel: __('Validation successful'),
  validateDefaultError: __('Validation Required'),
  edit: false,
  validationDependencies: [],
};

export default AsyncCredentials;
