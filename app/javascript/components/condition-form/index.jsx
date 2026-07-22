/**
 * ConditionForm — full React form for creating/editing/copying a Condition.
 *
 * Props (serialised from HAML via react_component()):
 *   recordId      {string|null}  Condition DB id; null/absent when adding
 *   isCopy        {boolean}      true when this is a copy operation
 *   towhatOptions {Array}        [[label, value], ...]
 */
import { useState, useEffect } from 'react';
import { Loading } from '@carbon/react';
import MiqFormRenderer from '@@ddf';
import { API } from '../../http_api';
import defaultComponentMapper from '../../forms/mappers/componentMapper';
import createSchema from './condition-form.schema';
import ExpressionEditorField from './expression-editor-field';
import miqRedirectBack from '../../helpers/miq-redirect-back';

const componentMapper = {
  ...defaultComponentMapper,
  'expression-editor': ExpressionEditorField,
};

const EXPRESSION_INVALID = '__expression_invalid__';

const validate = (values) => {
  const errors = {};
  if (!values.towhat) {
    errors.towhat = __('Required');
  }
  // Block submit when expression is missing or has validation errors.
  if (values.towhat && (!values.expression || values.expression === EXPRESSION_INVALID)) {
    errors.expression = __('A valid expression must be present');
  }
  // applies_to_exp (scope) is optional; only block if explicitly marked invalid.
  if (values.applies_to_exp === EXPRESSION_INVALID) {
    errors.applies_to_exp = __('The scope expression is incomplete');
  }
  return errors;
};

const ConditionForm = ({
  recordId,
  isCopy,
  towhatOptions,
}) => {
  const adding = !recordId || isCopy;
  const submitLabel = adding ? __('Add') : __('Save');

  const [isLoading, setIsLoading] = useState(!!recordId);
  const [initialValues, setInitialValues] = useState({});

  useEffect(() => {
    if (!recordId) {
      return;
    }

    API.get(`/api/conditions/${recordId}?attributes=expression,applies_to_exp,towhat,description,notes,read_only`)
      .then((data) => {
        setInitialValues({
          description: data.description,
          towhat: data.towhat,
          notes: data.notes,
          expression: data.expression?.exp     ?? null,
          applies_to_exp: data.applies_to_exp?.exp ?? null,
        });
      })
      .catch((err) => {
        const msg = (err && err.data && err.data.message) ? err.data.message : String(err);
        add_flash(msg, 'error');
      })
      .finally(() => setIsLoading(false));
  }, [recordId]);

  const onSubmit = (values) => {
    const towhat = values.towhat || initialValues.towhat;
    const expression = values.expression === EXPRESSION_INVALID ? null : values.expression;
    const appliesToExp = values.applies_to_exp === EXPRESSION_INVALID ? null : values.applies_to_exp;

    const request = adding
      ? API.post('/api/conditions', {
        description: values.description,
        towhat,
        notes: values.notes,
        expression,
        applies_to_exp: appliesToExp,
      })
      : API.post(`/api/conditions/${recordId}`, {
        action: 'edit',
        resource: {
          description: values.description,
          notes: values.notes,
          expression,
          applies_to_exp: appliesToExp,
        },
      });

    request.then(({ results, ...single }) => {
      const result = results ? results[0] : single;
      const id = result.id || recordId;
      const message = adding
        ? sprintf(__('Condition "%s" was added'), values.description)
        : sprintf(__('Condition "%s" was saved'), values.description);
      const redirectUrl = adding ? '/condition/show_list' : `/condition/show/${id}`;
      miqRedirectBack(message, 'success', redirectUrl);
    }).catch((resp) => {
      const msg = (resp && resp.data && resp.data.message) ? resp.data.message : String(resp);
      add_flash(msg, 'error');
    });
  };

  const onCancel = () => {
    const message = adding
      ? __('Add of new Condition was cancelled by the user')
      : sprintf(__('Edit of Condition "%s" was cancelled by the user'), initialValues.description);
    miqRedirectBack(message, 'warning', '/condition/show_list');
  };

  // When adding/copying, allow submit as soon as required fields are filled.
  // When editing, require a change before enabling Save.
  const disableSubmit = adding ? ['invalid'] : ['pristine', 'invalid'];

  if (isLoading) {
    return <Loading />;
  }

  return (
    <MiqFormRenderer
      componentMapper={componentMapper}
      schema={createSchema(isCopy, initialValues.towhat || '', towhatOptions)}
      initialValues={initialValues}
      validate={validate}
      onSubmit={onSubmit}
      onCancel={onCancel}
      buttonsLabels={{ submitLabel }}
      canReset={!adding}
      disableSubmit={disableSubmit}
    />
  );
};

export default ConditionForm;
