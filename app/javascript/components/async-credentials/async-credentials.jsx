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
    initialValues,
    errorMessage,
  }, setState] = useState(() => ({ lastValid: {}, initialValues: snapshot() }));

  const { input, meta } = useFieldApi({
    initialValue: !!edit,
    name,
    validate: [{ type: validatorTypes.REQUIRED }],
  });

  const validateDependentFields = () => dependencies.every((dependency) => {
    const state = formOptions.getFieldState(dependency);
    return state && state.valid;
  });

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

        <FormSpy subscription={{ values: true }}>
          {() => {
            const depsValid = validateDependentFields();
            const currentValues = snapshot();

            const isDirty = !(isEqual(currentValues, lastValid) || isEqual(currentValues, initialValues));

            formOptions.change(name, !isDirty);

            return (
              <>
                <Button bsSize="small" bsStyle="primary" onClick={onClick} disabled={!(isDirty && depsValid) || validating}>
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
