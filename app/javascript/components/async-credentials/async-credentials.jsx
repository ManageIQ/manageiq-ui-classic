import { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  isEqual, flatMap, get, set,
} from 'lodash';
import { Button, InlineLoading } from '@carbon/react';

import {
  useFormApi, useFieldApi, validatorTypes, FormSpy,
} from '@@ddf';
import HelperTextBlock from '../../forms/helper-text-block';

const extractNames = (schema) => {
  const childFields = schema.fields ? flatMap(schema.fields, (field) => extractNames(field)) : [];
  return schema.name ? [...childFields, schema.name] : childFields;
};

const AsyncCredentials = ({
  validateLabel = __('Validate'),
  validationProgressLabel = __('Validating'),
  validationSuccessLabel = __('Validation successful'),
  validateDefaultError = __('Validation Required'),
  fields,
  name,
  asyncValidate,
  validationDependencies = [],
  isRequired,
  edit = false,
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
              dirtyFields[field] && dependencies.includes(field));

            // The field itself is valid in these cases:
            // 1. Validation passed and values haven't changed: isEqual(currentValues, lastValid)
            // 2. Edit mode, not dirty, and no validation run yet: (edit && !isDirty && !lastValid)
            const isValidationPassed = lastValid && isEqual(currentValues, lastValid);
            const isEditModeInitial = edit && !isDirty && !lastValid;
            const isValid = isValidationPassed || isEditModeInitial;
            // Field value should be:
            // - true: when validation passed or edit mode initial state (passes REQUIRED validator)
            // - undefined: when validation is required (fails REQUIRED validator, shows "Validation Required")
            const fieldValue = isValid ? true : undefined;
            const dv = validateDependentFields();

            useEffect(() => {
              // The list of registered fields shows up after this render, so the validation has to happen
              // with a delay and has to be pulled back via the state.
              const timeoutId = setTimeout(() => setState((state) => ({ ...state, depsValid: dv })));
              formOptions.change(name, fieldValue);
              
              // Cancel the timeout if component unmounts
              return () => clearTimeout(timeoutId);
            }, [fieldValue, name, dv]);

            return (
              <>
                <Button size="sm" kind="tertiary" onClick={onClick} disabled={isValid || !depsValid || validating} className="miq-validation-button">
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
  fields: PropTypes.arrayOf(PropTypes.any).isRequired,
  isRequired: PropTypes.bool,
  name: PropTypes.string.isRequired,
  validationDependencies: PropTypes.arrayOf(PropTypes.string),
};

export default AsyncCredentials;
