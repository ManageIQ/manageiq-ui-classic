import { useState, useCallback, useRef } from 'react';
import type { RuleGroupType } from 'react-querybuilder';
import { rqbToMiq } from '../../../expression-editor/expression-adapter';
import { miqExpressionToHuman } from '../../../expression-editor/expression-human';
import { LabeledSection } from '../../form-row';
import type { ReportFormValues } from '../../report-editor-types';
import { ExpressionEditor, type FormOptionsApi } from './shared';

type StandardFilterProps = {
  formValues: ReportFormValues;
  formOptions: FormOptionsApi;
};

const StandardFilter = ({ formValues, formOptions }: StandardFilterProps) => {
  const hasColumns = (formValues.col_order || []).length > 0;

  // Preview state — same pattern as ExpressionEditorField in condition-form.
  // *Ref naming: ExpressionEditor passes tagValuesCache as a { current: Map } ref object
  // so that tag lookups always read the latest values without re-firing the callback.
  // We store the ref object itself, then read .current when we need the Map.
  const recordLabelMapRef = useRef<Map<string, string>>(new Map());
  const recordTagCacheRefObj = useRef<{ current: Map<string, unknown> } | null>(null);
  const displayLabelMapRef = useRef<Map<string, string>>(new Map());
  const displayTagCacheRefObj = useRef<{ current: Map<string, unknown> } | null>(null);
  const [recordPreview, setRecordPreview] = useState('');
  const [displayPreview, setDisplayPreview] = useState('');

  const handleRecordContextReady = useCallback((labelMap: Map<string, string>, tagValuesCache: { current: Map<string, unknown> } | null) => {
    recordLabelMapRef.current = labelMap;
    recordTagCacheRefObj.current = tagValuesCache; // store the ref object
    // Seed the preview from the initial value (a MiqExpression hash when editing
    // an existing report that already has a filter).
    const initial = (formOptions.getState().values as ReportFormValues).record_filter;
    if (initial && (initial as Record<string, unknown>).combinator === undefined) {
      // It's a MiqExpression hash (not yet touched by the user) — render it directly.
      const tagMap = tagValuesCache ? tagValuesCache.current : new Map();
      setRecordPreview(miqExpressionToHuman(initial, labelMap, tagMap));
    }
  }, [formOptions]);

  const handleDisplayContextReady = useCallback((labelMap: Map<string, string>, tagValuesCache: { current: Map<string, unknown> } | null) => {
    displayLabelMapRef.current = labelMap;
    displayTagCacheRefObj.current = tagValuesCache; // store the ref object
    const initial = (formOptions.getState().values as ReportFormValues).display_filter;
    if (initial && (initial as Record<string, unknown>).combinator === undefined) {
      const tagMap = tagValuesCache ? tagValuesCache.current : new Map();
      setDisplayPreview(miqExpressionToHuman(initial, displayLabelMapRef.current, tagMap));
    }
  }, [formOptions]);

  const handleRecordFilterChange = useCallback((query: RuleGroupType) => {
    formOptions.change('record_filter', query);
    const miq = rqbToMiq(query);
    const tagMap = recordTagCacheRefObj.current ? recordTagCacheRefObj.current.current : new Map();
    setRecordPreview(miq ? miqExpressionToHuman(miq, recordLabelMapRef.current, tagMap) : '');
  }, [formOptions]);

  const handleDisplayFilterChange = useCallback((query: RuleGroupType) => {
    formOptions.change('display_filter', query);
    const miq = rqbToMiq(query);
    const tagMap = displayTagCacheRefObj.current ? displayTagCacheRefObj.current.current : new Map();
    setDisplayPreview(miq ? miqExpressionToHuman(miq, displayLabelMapRef.current, tagMap) : '');
  }, [formOptions]);

  const model = typeof formValues.model === 'string'
    ? formValues.model
    : (formValues.model as { value?: string })?.value || '';

  if (!model) {
    return (
      <p className="report-editor-filter__text-muted">
        {__('Select a model on the Columns tab to configure filters.')}
      </p>
    );
  }

  return (
    <>
      <LabeledSection
        title={__('Record Filter — filters the %{model} table records').replace('%{model}', model)}
      >
        <ExpressionEditor
          model={model}
          value={formValues.record_filter || null}
          onQueryChange={handleRecordFilterChange}
          onContextReady={handleRecordContextReady}
          seedEmpty
        />
        {recordPreview && (
          <div className="exp-preview">
            <div className="exp-preview__label">{__('Preview')}</div>
            <div>{recordPreview}</div>
          </div>
        )}
      </LabeledSection>

      <LabeledSection title={__('Display Filter — filters rows based on child table fields')}>
        {hasColumns ? (
          <>
            <ExpressionEditor
              model={model}
              value={formValues.display_filter || null}
              onQueryChange={handleDisplayFilterChange}
              onContextReady={handleDisplayContextReady}
              seedEmpty={false}
            />
            {displayPreview && (
              <div className="exp-preview">
                <div className="exp-preview__label">{__('Preview')}</div>
                <div>{displayPreview}</div>
              </div>
            )}
          </>
        ) : (
          <p className="report-editor-filter__text-muted">
            {__('Add columns first to enable the display filter.')}
          </p>
        )}
      </LabeledSection>
    </>
  );
};

export default StandardFilter;
