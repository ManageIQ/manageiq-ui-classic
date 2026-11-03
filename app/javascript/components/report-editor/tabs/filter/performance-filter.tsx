import { useCallback } from 'react';
import { Select, SelectItem } from '@carbon/react';
import type { RuleGroupType } from 'react-querybuilder';
import { FormRow, LabeledSection } from '../../form-row';
import type { ReportFormValues } from '../../report-editor-types';
import { ExpressionEditor, type FormOptionsApi, type LabelValuePair } from './shared';

// Performance Timeframe options (used by both Trend and Performance).
// Functions, because translations are not available when the module loads.
const perfEndDaily = (): LabelValuePair[] => [
  [__('Today (partial)'), '0'],
  [__('Yesterday'), '1'],
  [__('2 Days Ago'), '2'],
  [__('3 Days Ago'), '3'],
  [__('4 Days Ago'), '4'],
  [__('5 Days Ago'), '5'],
  [__('6 Days Ago'), '6'],
  [__('1 Week Ago'), '7'],
];

const perfEndHourly = (): LabelValuePair[] => [
  [__('Now (partial)'), '0'],
  [__('1 Hour Ago'), '1'],
  [__('2 Hours Ago'), '2'],
  [__('3 Hours Ago'), '3'],
  [__('4 Hours Ago'), '4'],
  [__('6 Hours Ago'), '6'],
  [__('12 Hours Ago'), '12'],
  [__('1 Day Ago'), '24'],
];

const perfStartDaily = (): LabelValuePair[] => [
  [__('1 Day'), (1 * 24 * 3600).toString()],
  [__('2 Days'), (2 * 24 * 3600).toString()],
  [__('3 Days'), (3 * 24 * 3600).toString()],
  [__('4 Days'), (4 * 24 * 3600).toString()],
  [__('5 Days'), (5 * 24 * 3600).toString()],
  [__('6 Days'), (6 * 24 * 3600).toString()],
  [__('1 Week'), (7 * 24 * 3600).toString()],
  [__('2 Weeks'), (14 * 24 * 3600).toString()],
];

const perfStartHourly = (): LabelValuePair[] => [
  [__('1 Hour'), '3600'],
  [__('2 Hours'), '7200'],
  [__('3 Hours'), '10800'],
  [__('4 Hours'), '14400'],
  [__('6 Hours'), '21600'],
  [__('12 Hours'), '43200'],
  [__('1 Day'), '86400'],
  [__('2 Days'), '172800'],
];

// The Performance Timeframe rows (reused by Trend and Performance)
export type PerfTimeframeProps = {
  formValues: ReportFormValues;
  formOptions: FormOptionsApi;
};

const PerformanceTimeframe = ({ formValues, formOptions }: PerfTimeframeProps) => {
  const isHourly = formValues.perf_interval === 'hourly';
  const endOptions = isHourly ? perfEndHourly() : perfEndDaily();
  const startOptions = isHourly ? perfStartHourly() : perfStartDaily();

  return (
    <LabeledSection title={__('Performance Timeframe')}>
      <FormRow label={isHourly ? __('Show hourly data from') : __('Show daily data from')}>
        <div className="report-editor-row__content--flex-center">
          <Select
            id="perf_end"
            labelText=""
            hideLabel
            value={formValues.perf_end || '0'}
            onChange={(e) => formOptions.change('perf_end', e.target.value)}
          >
            {endOptions.map(([label, value]) => (
              <SelectItem key={value} value={value} text={label} />
            ))}
          </Select>
          <span className="report-editor-filter__going-back">{__('going back')}</span>
          <Select
            id="perf_start"
            labelText=""
            hideLabel
            value={formValues.perf_start || startOptions[0][1]}
            onChange={(e) => formOptions.change('perf_start', e.target.value)}
          >
            {startOptions.map(([label, value]) => (
              <SelectItem key={value} value={value} text={label} />
            ))}
          </Select>
        </div>
      </FormRow>
    </LabeledSection>
  );
};

// Trend reports only need the timeframe; there are no expression editors
export const TrendFilter = ({ formValues, formOptions }: PerfTimeframeProps) => (
  <PerformanceTimeframe formValues={formValues} formOptions={formOptions} />
);

// ---------------------------------------------------------------------------
// Performance filter variant — Timeframe + Primary Record Filter
// ---------------------------------------------------------------------------

export const PerformanceFilter = ({ formValues, formOptions }: PerfTimeframeProps) => {
  const handleRecordFilterChange = useCallback((query: RuleGroupType) => {
    formOptions.change('record_filter', query);
  }, [formOptions]);

  const model = typeof formValues.model === 'string'
    ? formValues.model
    : (formValues.model as { value?: string })?.value || '';

  return (
    <>
      <PerformanceTimeframe formValues={formValues} formOptions={formOptions} />

      <LabeledSection
        title={__('Primary (Record) Filter — filters the %{model} table records').replace('%{model}', model)}
      >
        <ExpressionEditor
          model={model}
          value={formValues.record_filter || null}
          onQueryChange={handleRecordFilterChange}
          seedEmpty
        />
      </LabeledSection>
    </>
  );
};
