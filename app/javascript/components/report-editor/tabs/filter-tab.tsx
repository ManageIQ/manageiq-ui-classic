import { useFormApi, useFieldApi } from '@@ddf';
import type { UseFieldApiConfig } from '@data-driven-forms/react-form-renderer';
import type { ReportFormValues, ReportType } from '../report-editor-types';
import StandardFilter from './filter/standard-filter';
import { PerformanceFilter, TrendFilter } from './filter/performance-filter';
import ChargebackFilter from './filter/chargeback-filter';

type FilterTabProps = {
  reportType?: ReportType;
  input?: Record<string, unknown>;
};

// Dispatches to the filter variant of the current report type.
const FilterTab = ({ reportType, input }: FilterTabProps) => {
  useFieldApi((input || { name: 'filter_tab_content' }) as UseFieldApiConfig);
  const formOptions = useFormApi();
  // Subscribed so FilterTab and its sub-components re-render when any change.
  const { input: { value: model = '' } } = useFieldApi({ name: 'model' });
  const { input: { value: colOrder = [] } } = useFieldApi({ name: 'col_order' });
  useFieldApi({ name: 'perf_interval' });
  useFieldApi({ name: 'perf_end' });
  useFieldApi({ name: 'perf_start' });
  useFieldApi({ name: 'cb_show_typ' });
  useFieldApi({ name: 'cb_owner_id' });
  useFieldApi({ name: 'cb_tenant_id' });
  useFieldApi({ name: 'cb_tag_cat' });
  useFieldApi({ name: 'cb_tag_value' });
  useFieldApi({ name: 'cb_provider_id' });
  useFieldApi({ name: 'cb_entity_id' });
  useFieldApi({ name: 'cb_groupby' });
  useFieldApi({ name: 'cb_groupby_tag' });
  useFieldApi({ name: 'cb_groupby_label' });
  useFieldApi({ name: 'cb_interval' });
  useFieldApi({ name: 'cb_interval_size' });
  useFieldApi({ name: 'cb_end_interval_offset' });
  useFieldApi({ name: 'tz' });
  useFieldApi({ name: 'cb_include_metrics' });
  useFieldApi({ name: 'method_for_allocated_metrics' });
  useFieldApi({ name: 'cumulative_rate_calculation' });

  const formValues: ReportFormValues = {
    ...formOptions.getState().values as ReportFormValues,
    model,
    col_order: colOrder as string[],
  };

  switch (reportType) {
    case 'trend':
      return <TrendFilter formValues={formValues} formOptions={formOptions} />;
    case 'performance':
      return <PerformanceFilter formValues={formValues} formOptions={formOptions} />;
    case 'chargeback':
      return model
        ? <ChargebackFilter formValues={formValues} formOptions={formOptions} model={model} />
        : <p className="report-editor-filter__text-muted">{__('Select a model on the Columns tab to configure chargeback filters.')}</p>;
    case 'standard':
    default:
      return <StandardFilter formValues={formValues} formOptions={formOptions} />;
  }
};

export default FilterTab;
