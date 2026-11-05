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

const PCT_STEPS = Array.from({ length: 21 }, (_, i) => i * 5);

type LabelValuePair = [string, string];

// Replaces the FieldPicker for trend reports.
// trend_col is a "db-col" field id, e.g. "VmPerformance-cpu_usage_rate_average";
// the server splits it into the trend database and column.
const TrendColumnsTab = (props: UseFieldApiConfig) => {
  useFieldApi(props);
  const formOptions = useFormApi();
  const change: typeof formOptions.change = (field, value) => formOptions.change(field, value);

  const { input: { value: model = '' } } = useFieldApi({ name: 'model' });
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

  // `ignore` drops the response of a superseded request (model or interval changed while it was in flight).
  useEffect(() => {
    if (!model) {
      setFields([]);
      return undefined;
    }
    let ignore = false;
    setFieldsLoading(true);
    http.get<{ fields?: LabelValuePair[] }>(
      `/report/available_fields?model=${encodeURIComponent(model)}&perf_interval=${encodeURIComponent(perfInterval as string)}`
    )
      .then((data) => {
        if (ignore) {
          return;
        }
        const sorted = (data.fields || []).slice().sort((a, b) => a[0].localeCompare(b[0]));
        setFields(sorted);
        setFieldsLoading(false);
      })
      .catch(() => {
        if (ignore) {
          return;
        }
        setFields([]);
        setFieldsLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [model, perfInterval]);

  useEffect(() => {
    if (!trendCol) {
      setLimitCols([]);
      return undefined;
    }
    let ignore = false;
    const interval = (perfInterval as string) || 'daily';
    http.get<{ limit_cols?: LabelValuePair[] }>(
      `/report/trend_limit_cols?trend_col=${encodeURIComponent(trendCol as string)}&perf_interval=${encodeURIComponent(interval)}`
    )
      .then((data) => {
        if (ignore) {
          return;
        }
        const cols = data.limit_cols || [];
        setLimitCols(cols);
        if (cols.length > 0) {
          change('trend_limit_col', cols[0][1]);
          change('trend_limit_val', '');
        }
      })
      .catch(() => {
        if (!ignore) {
          setLimitCols([]);
        }
      });
    return () => {
      ignore = true;
    };
  }, [trendCol, perfInterval]);

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
              change('trend_limit_col', '');
              change('trend_limit_val', '100');
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
