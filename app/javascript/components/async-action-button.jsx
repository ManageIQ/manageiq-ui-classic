import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  isEqual, flatMap, get, set,
} from 'lodash';
import { Button, InlineLoading } from 'carbon-components-react';

import {
  useFormApi, useFieldApi, validatorTypes, FormSpy,
} from '@@ddf';
import HelperTextBlock from '../forms/helper-text-block';

const extractNames = (schema) => {
  const childFields = schema.fields ? flatMap(schema.fields, (field) => extractNames(field)) : [];
  return schema.name ? [...childFields, schema.name] : childFields;
};

const AsyncAction = ({
  actionLabel,
  actionProgressLabel,
  actionSuccessLabel,
  actionDefaultError,
  helperText,
  fields,
  name,
  asyncAction,
  actionDependencies,
  isRequired,
  edit,
}) => {
  const formOptions = useFormApi();

  const dependencies = useMemo(() => [...extractNames({ fields }), ...actionDependencies], [fields, actionDependencies]);

  const snapshot = (values = formOptions.getState().values) => dependencies.reduce((obj, key) => set(obj, key, get(values, key)), {});

  const [{
    performing,
    lastState,
    errorMessage,
    successMessage,
    depsValid,
  }, setState] = useState(() => ({}));

  const { input, meta } = useFieldApi({
    initialValue: !!edit || !isRequired, // The field is initially valid in edit mode or if the field is optional
    name,
    validate: [{ type: validatorTypes.REQUIRED }],
  });

  const processDependentFields = () => {
    const registeredFields = formOptions.getRegisteredFields();

    return dependencies.filter((value) => registeredFields.includes(value)).every((dependency) => {
      const state = formOptions.getFieldState(dependency);
      // The field is valid if its state is not available or its state is set to valid
      return !state || state.valid;
    });
  };

  const onClick = () => {
    const { values } = formOptions.getState();
    setState((state) => ({
      ...state, performing: true, errorMessage: undefined, successMessage: undefined,
    }));

    asyncAction(values, dependencies).then((resolvedValue) => {
      formOptions.change(name, true);
      setState((state) => ({
        ...state,
        performing:
        false,
        lastState: snapshot(values),
        errorMessage: undefined,
        successMessage: resolvedValue || actionSuccessLabel,
      }));
    }).catch((error) => {
      formOptions.change(name, undefined);
      setState((state) => ({ ...state, performing: false, errorMessage: error }));
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

            // The field itself is valid if there are no modifications since the last validation or the initial values
            const isValid = isEqual(currentValues, lastState) || !isDirty;
            const dv = processDependentFields();

            useEffect(() => {
              // The list of registered fields shows up after this render, so the validation has to happen
              // with a delay and has to be pulled back via the state.
              setTimeout(() => setState((state) => ({ ...state, depsValid: dv })));
              formOptions.change(name, isValid);
            }, [isValid, name, dv]);

            return (
              <>
                <HelperTextBlock
                  helperText={helperText}
                />
                <Button size="small" kind="tertiary" onClick={onClick} disabled={!depsValid || performing}>
                  {performing && <InlineLoading /> }
                  {performing ? actionProgressLabel : actionLabel}
                </Button>
                <HelperTextBlock
                  warnText={!meta.error && isEqual(currentValues, lastState) && successMessage}
                  errorText={meta.error && !performing && (errorMessage || actionDefaultError)}
                />
              </>
            );
          }}
        </FormSpy>
      </>
    </>
  );
};

AsyncAction.propTypes = {
  actionLabel: PropTypes.string,
  actionProgressLabel: PropTypes.string,
  actionSuccessLabel: PropTypes.string,
  actionDefaultError: PropTypes.string,
  asyncAction: PropTypes.func,
  helperText: PropTypes.string,
  edit: PropTypes.bool,
  fields: PropTypes.arrayOf(PropTypes.any).isRequired,
  isRequired: PropTypes.bool,
  name: PropTypes.string.isRequired,
  actionDependencies: PropTypes.arrayOf(PropTypes.string),
};

AsyncAction.defaultProps = {
  actionLabel: __('Perform Action'),
  actionProgressLabel: __('In Progress'),
  actionSuccessLabel: __('Action successful'),
  actionDefaultError: __('Action Required'),
  asyncAction: undefined,
  helperText: undefined,
  edit: false,
  actionDependencies: [],
  isRequired: undefined,
};

export default AsyncAction;
