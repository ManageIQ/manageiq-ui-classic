import { useState, useEffect } from 'react';
import type { UseFieldApiConfig } from '@data-driven-forms/react-form-renderer';
import {
  Select,
  SelectItem,
  TextInput,
  Loading,
} from '@carbon/react';
import { useFormApi, useFieldApi } from '@@ddf';
import { FormRow, LabeledSection } from '../form-row';

// Percent steps 0, 5, 10 … 100
const PCT_STEPS = Array.from({ length: 21 }, (_, i) => i * 5);

type LabelValuePair = [string, string];

/**
 * TrendColumnsTab — replaces the standard FieldPicker for VimPerformanceTrend reports.
 *
 * Mirrors _form_columns_trend.html.haml:
 *   - Performance Interval (daily/hourly)
 *   - Trending for (single dropdown from react_available_fields)
 *   - Trend Target Limit (Column picker OR Value text input, shown after a trend_col is chosen)
 *   - Trend Target Percents (up to 3 percent selects, shown after a trend_col is chosen)
 *
 * trend_col is stored as "db-col" e.g. "VmPerformance-cpu_usage_rate_average",
 * matching the format the old chosen_trend_col param used.
 */
const TrendColumnsTab = (props: UseFieldApiConfig) => {
  useFieldApi(props); // bind to the DDF field (trend_col)
  const formOptions = useFormApi();

  const { input: { value: modelRaw = '' } } = useFieldApi({ name: 'model' });
  const model: string = (modelRaw as { value?: string })?.value ?? (modelRaw as string);
  const { input: { value: perfInterval = 'daily' } } = useFieldApi({ name: 'perf_interval' });
  const { input: { value: trendCol = '' } } = useFieldApi({ name: 'trend_col' });
  const { input: { value: trendLimitCol = '' } } = useFieldApi({ name: 'trend_limit_col' });
  const { input: { value: trendLimitVal = '' } } = useFieldApi({ name: 'trend_limit_val' });
  const { input: { value: trendPct1 = '100' } } = useFieldApi({ name: 'trend_pct1' });
  const { input: { value: trendPct2 = '' } } = useFieldApi({ name: 'trend_pct2' });
  const { input: { value: trendPct3 = '' } } = useFieldApi({ name: 'trend_pct3' });

  const [fields, setFields] = useState<LabelValuePair[]>([]);
  const [fieldsLoading, setFieldsLoading] = useState(false);
  const [limitCols, setLimitCols] = useState<LabelValuePair[]>([]);

  // Fetch available trend fields whenever model or perf_interval changes
  useEffect(() => {
    if (!model) {
      setFields([]);
      return;
    }
    setFieldsLoading(true);
    http.get<{ fields?: LabelValuePair[] }>(
      `/report/react_available_fields?model=${encodeURIComponent(model)}&perf_interval=${encodeURIComponent(perfInterval as string)}`
    )
      .then((data) => {
        const sorted = (data.fields || []).slice().sort((a, b) => a[0].localeCompare(b[0]));
        setFields(sorted);
        setFieldsLoading(false);
      })
      .catch(() => {
        setFields([]);
        setFieldsLoading(false);
      });
  }, [model, perfInterval]);

  // Fetch limit_cols whenever the chosen trend_col changes
  useEffect(() => {
    if (!trendCol) {
      setLimitCols([]);
      return;
    }
    const interval = (perfInterval as string) || 'daily';
    http.get<{ limit_cols?: LabelValuePair[] }>(
      `/report/react_trend_limit_cols?trend_col=${encodeURIComponent(trendCol as string)}&perf_interval=${encodeURIComponent(interval)}`
    )
      .then((data) => setLimitCols(data.limit_cols || []))
      .catch(() => setLimitCols([]));
  }, [trendCol, perfInterval]);

  const change = (field: string, value: unknown) => formOptions.change(field, value);

  return (
    <div className="report-editor-trend-columns">
      <FormRow label={__('Trending for')}>
        {fieldsLoading ? (
          <Loading small withOverlay={false} description={__('Loading trend fields…')} />
        ) : (
          <Select
            id="trend_col"
            labelText=""
            hideLabel
            value={trendCol as string}
            onChange={(e) => {
              change('trend_col', e.target.value);
              // Reset dependent fields when trend column changes
              change('trend_limit_col', '');
              change('trend_limit_val', '');
              change('trend_pct1', '100');
              change('trend_pct2', '');
              change('trend_pct3', '');
            }}
          >
            <SelectItem value="" text={`<${__('Choose')}>`} />
            {fields.map(([label, val]) => (
              <SelectItem key={val} value={val} text={label} />
            ))}
          </Select>
        )}
      </FormRow>

      {/* Target Limit and Target Percents — only shown once a trend_col is chosen */}
      {trendCol && (
        <>
          <LabeledSection title={__('Trend Target Limit')}>
            {limitCols.length > 0 && (
              <FormRow label={__('Column')}>
                <Select
                  id="trend_limit_col"
                  labelText=""
                  hideLabel
                  value={trendLimitCol as string}
                  onChange={(e) => {
                    change('trend_limit_col', e.target.value);
                    // Choosing a column clears the manual value
                    if (e.target.value) {
                      change('trend_limit_val', '');
                    }
                  }}
                >
                  <SelectItem value="" text={`<${__('None')}>`} />
                  {limitCols.map(([label, val]) => (
                    <SelectItem key={val} value={val} text={label} />
                  ))}
                </Select>
              </FormRow>
            )}

            {/* Value input — shown when no limit column is selected */}
            {!trendLimitCol && (
              <FormRow label={__('Value')}>
                <TextInput
                  id="trend_limit_val"
                  labelText=""
                  hideLabel
                  value={trendLimitVal as string}
                  maxLength={20}
                  onChange={(e) => change('trend_limit_val', e.target.value)}
                />
              </FormRow>
            )}
          </LabeledSection>

          <LabeledSection title={__('Trend Target Percents')}>
            <FormRow label={__('Percent 1')}>
              <Select
                id="trend_pct1"
                labelText=""
                hideLabel
                value={trendPct1 != null ? String(trendPct1) : '100'}
                onChange={(e) => change('trend_pct1', e.target.value)}
              >
                {PCT_STEPS.map((n) => (
                  <SelectItem key={n} value={String(n)} text={String(n)} />
                ))}
              </Select>
            </FormRow>

            <FormRow label={__('Percent 2')}>
              <Select
                id="trend_pct2"
                labelText=""
                hideLabel
                value={trendPct2 != null ? String(trendPct2) : ''}
                onChange={(e) => change('trend_pct2', e.target.value)}
              >
                <SelectItem value="" text={`<${__('None')}>`} />
                {PCT_STEPS.map((n) => (
                  <SelectItem key={n} value={String(n)} text={String(n)} />
                ))}
              </Select>
            </FormRow>

            <FormRow label={__('Percent 3')}>
              <Select
                id="trend_pct3"
                labelText=""
                hideLabel
                value={trendPct3 != null ? String(trendPct3) : ''}
                onChange={(e) => change('trend_pct3', e.target.value)}
              >
                <SelectItem value="" text={`<${__('None')}>`} />
                {PCT_STEPS.map((n) => (
                  <SelectItem key={n} value={String(n)} text={String(n)} />
                ))}
              </Select>
            </FormRow>
          </LabeledSection>
        </>
      )}
    </div>
  );
};

export default TrendColumnsTab;
