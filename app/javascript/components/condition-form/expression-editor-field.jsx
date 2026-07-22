/**
 * ExpressionEditorField — DDF adapter bridging ExpressionEditor with react-final-form.
 *
 * Schema props:
 *   towhatField  {string}  Name of the form field that holds the model/towhat value
 *   onlyTags     {boolean} Restrict to tag fields only
 *   sectionTitle {string}  Heading above the editor ("Scope" or "Expression")
 */
import { useRef, useState, useEffect } from 'react';
import { useFieldApi, FormSpy } from '@@ddf';
import { InlineNotification, FormGroup } from '@carbon/react';
import NotificationMessage from '../notification-message';
import { rqbToMiq } from '../expression-editor/expression-adapter';
import ExpressionEditor from '../expression-editor';
import { http } from '../../http_api';

const PREVIEW_URL = '/condition/expression_preview';

// Inner component receives towhat and formPristine as explicit props so React
// re-renders it whenever FormSpy detects a change in those values.
const ExpressionEditorInner = ({
  input, meta, onlyTags, sectionTitle, isRequired, towhat, formPristine,
}) => {
  const isScope = sectionTitle === __('Scope');

  const seedRef = useRef(input.value || null);
  // mountKey is state so incrementing it forces ExpressionEditor to remount.
  const [mountKey, setMountKey] = useState(0);
  const [expressionText, setExpressionText] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);

  const emptyMessage = isScope
    ? __('No scope defined, the scope of this condition includes all elements.')
    : __('A condition must contain a valid expression.');

  const loadPreviewText = (expression) => {
    if (!expression) {
      setExpressionText('');
      return;
    }

    http.post(PREVIEW_URL, { expression }, { headers: { Accept: 'application/json' } })
      .then((data) => setExpressionText(data.text || ''))
      .catch(() => setExpressionText(''));
  };

  // When towhat changes after mount, clear the expression and reset the editor.
  // Runs as an effect so input.onChange() is never called during render.
  const isMountedRef = useRef(false);
  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }
    seedRef.current = null;
    input.onChange(null);
    setExpressionText('');
    setValidationErrors([]);
    setMountKey((k) => k + 1);
  }, [towhat]);

  // When the form resets (dirty → pristine), remount the editor with the
  // restored initialValues. Skip on initial mount.
  const isPristineEffectMountedRef = useRef(false);
  useEffect(() => {
    if (!isPristineEffectMountedRef.current) {
      isPristineEffectMountedRef.current = true;
      return;
    }
    if (!formPristine) {
      return;
    }
    const resetValue = (input.value && input.value !== '__expression_invalid__') ? input.value : null;
    seedRef.current = resetValue;
    loadPreviewText(resetValue);
    setMountKey((k) => k + 1);
  }, [formPristine]);

  // On initial render, load preview text if an expression is already present.
  useEffect(() => {
    if (input.value && input.value !== '__expression_invalid__' && !expressionText) {
      loadPreviewText(input.value);
    }
  }, []);

  const handleQueryChange = (q, errors = []) => {
    // Mark touched on first interaction so error messages become visible.
    if (!meta.touched) {
      input.onBlur();
    }
    setValidationErrors(errors);
    if (errors.length > 0) {
      input.onChange('__expression_invalid__');
      loadPreviewText(null);
      return;
    }
    const expression = rqbToMiq(q);
    input.onChange(expression);
    loadPreviewText(expression);
  };

  // value is only the initial seed — ExpressionEditor owns its internal query state.
  // Do NOT feed input.value back on every render (would create a reset loop).

  // Show required error for Expression (not Scope), only when there are no
  // in-editor errors, and only after the user has interacted or submitted.
  const showRequiredError = !isScope
    && validationErrors.length === 0
    && !!meta.error
    && (meta.touched || meta.submitFailed);

  return (
    <FormGroup
      legendText=""
      className={showRequiredError ? 'miq-expression-editor-field--invalid' : undefined}
    >
      {sectionTitle && (
        <h3>
          {isRequired && <span className="miq-expression-editor__required" aria-hidden="true">*</span>}
          {sectionTitle}
        </h3>
      )}
      <ExpressionEditor
        key={`${towhat}-${mountKey}`}
        model={towhat}
        value={seedRef.current}
        onlyTags={onlyTags || false}
        onQueryChange={handleQueryChange}
      />
      {validationErrors.length > 0 && (
        <InlineNotification
          kind="error"
          title={__('Expression incomplete')}
          subtitle={validationErrors.join(' ')}
          hideCloseButton
          lowContrast
        />
      )}
      {validationErrors.length === 0 && (
        expressionText
          ? (
            <div className="exp-preview">
              <div className="exp-preview__label">{__('Preview')}</div>
              <div>{expressionText}</div>
            </div>
          )
          : <NotificationMessage type="info" message={emptyMessage} />
      )}
      {showRequiredError && (
        <p className="cds--form-requirement">{meta.error}</p>
      )}
    </FormGroup>
  );
};

// Outer DDF field component. Uses FormSpy to pass towhat and pristine state
// into ExpressionEditorInner so it re-renders on relevant form changes.
const ExpressionEditorField = (props) => {
  const {
    input, meta, towhatField, onlyTags, sectionTitle, isRequired,
  } = useFieldApi(props);

  return (
    <FormSpy subscription={{ values: true, pristine: true }}>
      {({ values, pristine }) => (
        <ExpressionEditorInner
          input={input}
          meta={meta}
          onlyTags={onlyTags}
          sectionTitle={sectionTitle}
          isRequired={isRequired}
          towhat={values[towhatField] || ''}
          formPristine={pristine}
        />
      )}
    </FormSpy>
  );
};

export default ExpressionEditorField;
