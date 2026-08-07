import { useRef, useState, useEffect } from 'react';
import { useFieldApi, FormSpy } from '@@ddf';
import { InlineNotification, FormGroup } from '@carbon/react';
import { rqbToMiq } from '../expression-editor/expression-adapter';
import { miqExpressionToHuman } from '../expression-editor/expression-human';
import ExpressionEditor from '../expression-editor';

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

  // Refs populated by ExpressionEditor via onContextReady once fields load.
  const labelMapRef = useRef(new Map());
  const tagValuesCacheRef = useRef(null);

  const emptyMessage = isScope
    ? __('No scope defined, the scope of this condition includes all elements.')
    : __('A condition must contain a valid expression.');

  const updatePreviewText = (expression) => {
    const tagMap = tagValuesCacheRef.current ? tagValuesCacheRef.current.current : new Map();
    const text = expression
      ? miqExpressionToHuman(expression, labelMapRef.current, tagMap)
      : '';
    setExpressionText(text);
  };

  const handleContextReady = (labelMap, tagValuesCache) => {
    labelMapRef.current = labelMap;
    // tagValuesCache is the useRef object from ExpressionEditor; store it so
    // updatePreviewText can reach the live Map via .current.
    tagValuesCacheRef.current = tagValuesCache;
    // Re-render preview if an expression is already present.
    const currentValue = seedRef.current;
    if (currentValue && currentValue !== '__expression_invalid__') {
      updatePreviewText(currentValue);
    }
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
    updatePreviewText(resetValue);
    setMountKey((k) => k + 1);
  }, [formPristine]);

  const handleQueryChange = (q, errors = []) => {
    setValidationErrors(errors);
    if (errors.length > 0) {
      // Only mark touched and update the form value if something actually changed.
      if (input.value !== '__expression_invalid__') {
        if (!meta.touched) {
          input.onBlur();
        }
        input.onChange('__expression_invalid__');
      }
      updatePreviewText(null);
      return;
    }
    const expression = rqbToMiq(q);
    updatePreviewText(expression);
    // Only call input.onChange when the serialised expression actually changed,
    const serialised = JSON.stringify(expression);
    const current = JSON.stringify(input.value ?? null);
    if (serialised === current) {
      return;
    }
    // Mark touched on first real interaction so error messages become visible.
    if (!meta.touched) {
      input.onBlur();
    }
    input.onChange(expression);
  };

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
        onContextReady={handleContextReady}
        seedEmpty={!isScope}
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
          : (
            <InlineNotification
              kind="info"
              title={emptyMessage}
              hideCloseButton
              lowContrast
            />
          )
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
