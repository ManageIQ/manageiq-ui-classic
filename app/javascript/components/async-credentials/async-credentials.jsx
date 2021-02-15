import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { isEqual, flatMap, get, set } from 'lodash';
import { Button, InlineLoading } from 'carbon-components-react';

import { useFormApi, useFieldApi, validatorTypes, FormSpy } from '@@ddf';
import HelperTextBlock from '../../forms/helper-text-block';

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
  isRequired,
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
    initialValue: !!edit || !isRequired, // The field is initially valid in edit mode or if the field is optional
    name,
    validate: [{ type: validatorTypes.REQUIRED }],
  });

  const validateDependentFields = () => {
    const registeredFields = formOptions.getRegisteredFields();

    return dependencies.filter((value) => registeredFields.includes(value)).every((dependency) => {
      const state = formOptions.getFieldState(dependency);
      // The field is valid if its state is not available or its state is set to valid
      return !state || state.valid;
    });
  };

  const onClick = () => {
    const { values } = formOptions.getState();
    setState((state) => ({ ...state, validating: true, errorMessage: undefined }));

    asyncValidate(values, dependencies).then(() => {
      formOptions.change(name, true);
      setState((state) => ({
        ...state,
        validating:
        false,
        lastValid: snapshot(values),
        errorMessage: undefined,
      }));
    }).catch((error) => {
      formOptions.change(name, undefined);
      setState((state) => ({ ...state, validating: false, errorMessage: error }));
    });
  };

  return (
    <>
      {formOptions.renderForm(fields.map((field) => ({
        ...field,
        ...(field.component === 'password-field' ? { parent: name, edit } : undefined),
        isDisabled: field.isDisabled,
      })), formOptions)}
      <>
        <input type="hidden" {...input} />

        <FormSpy subscription={{ values: true, dirtyFields: true }}>
          {({ dirtyFields, values }) => {
            const currentValues = snapshot(values);

            // The field itself is dirty when any of its children is dirty
            const isDirty = Object.keys(dirtyFields).some((field) =>
              dirtyFields[field] && dependencies.includes(field) && !validationDependencies.includes(field));

            // The field itself is valid if there are no modifications since the last validation or the initial values
            const isValid = isEqual(currentValues, lastValid) || !isDirty;
            const dv = validateDependentFields();

            useEffect(() => {
              // The list of registered fields shows up after this render, so the validation has to happen
              // with a delay and has to be pulled back via the state.
              setTimeout(() => setState((state) => ({ ...state, depsValid: dv })));
              formOptions.change(name, isValid);
            }, [isValid, name, dv]);

            return (
              <>
                <Button size="small" kind="tertiary" onClick={onClick} disabled={isValid || !depsValid || validating}>
                  {validating && <InlineLoading /> }
                  {validating ? validationProgressLabel : validateLabel}
                </Button>

                <HelperTextBlock
                  helperText={!meta.error && isEqual(currentValues, lastValid) && validationSuccessLabel}
                  errorText={meta.error && !validating && (errorMessage || validateDefaultError)}
                />
              </>
            );
          }}
        </FormSpy>
      </>
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
