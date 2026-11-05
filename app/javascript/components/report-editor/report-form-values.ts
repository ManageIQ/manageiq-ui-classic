import { rqbToMiq } from '../expression-editor/expression-adapter';
import type {
  ChargebackDbOptions,
  ColOptions,
  FormData,
  ReportFilter,
  ReportFormValues,
  ReportRecord,
} from './report-editor-types';
import { NOTHING } from './utils';

// Core's default for chargeback reports that predate the option
export const DEFAULT_ALLOCATED_METHOD = 'max';

const numberToString = (value: number | string | null | undefined, fallback = ''): string =>
  (value != null ? String(value) : fallback);

// The form keeps numbers as strings (text inputs); the server wants integers or null
const stringToInt = (value: string | number | null | undefined): number | null => {
  if (value === '' || value == null) {
    return null;
  }
  const parsed = parseInt(String(value), 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const asArray = (value: string | string[] | undefined | null): string[] => {
  if (Array.isArray(value)) {
    return value;
  }
  return value ? [value] : [];
};

// Headers and formats are stored per column on the server but edited per field id in the form
const mergeColumnOptions = (report: ReportRecord): ColOptions => {
  const options: ColOptions = { ...(report.col_options || {}) };
  (report.col_order || []).forEach((fieldId, idx) => {
    options[fieldId] = {
      ...(options[fieldId] || {}),
      header: (report.headers || [])[idx] || options[fieldId]?.header || '',
      format: (report.col_formats || [])[idx] || options[fieldId]?.format || '',
    };
  });
  return options;
};

// Which of the mutually exclusive chargeback filters the report was saved with
const chargebackFilterType = (options: ChargebackDbOptions): string => {
  if (options.owner !== undefined) {
    return 'owner';
  }
  if (options.tenant_id !== undefined) {
    return 'tenant';
  }
  if (options.tag !== undefined) {
    return 'tag';
  }
  if (options.entity_id !== undefined) {
    return 'entity';
  }
  return '';
};

// The expression editor works with react-querybuilder trees; the server stores MiqExpression hashes
const toMiqExpression = (filter: ReportFilter | null | undefined): ReportFilter | null => {
  if (!filter) {
    return null;
  }
  return filter.combinator !== undefined ? rqbToMiq(filter) : filter;
};

export const buildInitialValues = (data: FormData): ReportFormValues => {
  const report = data.report || {};
  const dbOptions = report.db_options || {};
  const chargeback = dbOptions.options || {};

  return {
    name: report.name || '',
    title: report.title || '',
    model: report.model || '',
    queue_timeout: numberToString(report.queue_timeout),
    col_order: report.col_order || [],
    col_options: mergeColumnOptions(report),
    pdf_page_size: report.pdf_page_size || '',
    sortby: report.sortby || [],
    order: report.order || 'Ascending',
    group: report.group || 'No',
    hide_details: !!report.hide_details,
    break_format: report.break_format || '',
    row_limit: numberToString(report.row_limit),
    sort1_suffix: report.sort1_suffix || '',
    sort2_suffix: report.sort2_suffix || '',
    pivot_by1: report.pivot_by1 || NOTHING,
    pivot_by2: report.pivot_by2 || NOTHING,
    pivot_by3: report.pivot_by3 || NOTHING,
    pivot_cols: report.pivot_cols || {},
    graph_type: report.graph_type || '',
    graph_mode: report.graph_mode || 'counts',
    graph_column: report.graph_column || '',
    graph_count: numberToString(report.graph_count, '10'),
    graph_other: report.graph_other !== false,
    record_filter: (report.record_filter as ReportFilter) || null,
    display_filter: (report.display_filter as ReportFilter) || null,
    perf_interval: dbOptions.interval || 'daily',
    perf_avgs: dbOptions.calc_avgs_by || 'time_interval',
    perf_end: numberToString(dbOptions.end_offset, '0'),
    perf_start: numberToString(report.perf_start),
    trend_col: report.trend_col || '',
    trend_limit_col: report.trend_limit_col || '',
    trend_limit_val: numberToString(report.trend_limit_val),
    trend_pct1: numberToString(report.trend_pct1, '100'),
    trend_pct2: numberToString(report.trend_pct2),
    trend_pct3: numberToString(report.trend_pct3),
    cb_show_typ: chargebackFilterType(chargeback) || 'entity',
    cb_owner_id: chargeback.owner || '',
    cb_tenant_id: numberToString(chargeback.tenant_id),
    cb_tag_cat: chargeback.tag ? chargeback.tag[0] : '',
    cb_tag_value: asArray(chargeback.tag?.[1]),
    cb_provider_id: numberToString(chargeback.provider_id),
    cb_entity_id: chargeback.entity_id || 'all',
    cb_groupby: chargeback.groupby || 'date',
    cb_groupby_tag: asArray(chargeback.groupby_tag),
    cb_groupby_label: chargeback.groupby_label || '',
    cb_interval: chargeback.interval || 'daily',
    cb_interval_size: chargeback.interval_size ?? 1,
    cb_end_interval_offset: chargeback.end_interval_offset ?? 1,
    tz: report.tz || chargeback.tz || '',
    cb_include_metrics: chargeback.include_metrics !== false,
    method_for_allocated_metrics: chargeback.method_for_allocated_metrics || DEFAULT_ALLOCATED_METHOD,
    cumulative_rate_calculation: chargeback.cumulative_rate_calculation !== false,
  };
};

// The settings posted to save and preview, which share one server-side mapping
export const buildReportData = (values: ReportFormValues) => {
  const colOrder = values.col_order || [];
  const colOptions = values.col_options || {};

  return {
    name: values.name,
    title: values.title,
    model: values.model,
    queue_timeout: stringToInt(values.queue_timeout),
    pdf_page_size: values.pdf_page_size,
    col_order: colOrder,
    headers: colOrder.map((id) => colOptions[id]?.header || ''),
    col_formats: colOrder.map((id) => colOptions[id]?.format || ''),
    col_options: colOptions,
    record_filter: toMiqExpression(values.record_filter),
    display_filter: toMiqExpression(values.display_filter),
    perf_interval: values.perf_interval,
    perf_avgs: values.perf_avgs,
    perf_end: values.perf_end,
    perf_start: values.perf_start,
    trend_col: values.trend_col,
    trend_limit_col: values.trend_limit_col,
    trend_limit_val: values.trend_limit_val,
    trend_pct1: values.trend_pct1,
    trend_pct2: values.trend_pct2,
    trend_pct3: values.trend_pct3,
    cb_show_typ: values.cb_show_typ,
    cb_owner_id: values.cb_owner_id,
    cb_tenant_id: values.cb_tenant_id,
    cb_tag_cat: values.cb_tag_cat,
    cb_tag_value: values.cb_tag_value,
    cb_provider_id: values.cb_provider_id,
    cb_entity_id: values.cb_entity_id,
    cb_groupby: values.cb_groupby,
    cb_groupby_tag: values.cb_groupby_tag,
    cb_groupby_label: values.cb_groupby_label,
    cb_interval: values.cb_interval,
    cb_interval_size: values.cb_interval_size,
    cb_end_interval_offset: values.cb_end_interval_offset,
    tz: values.tz,
    cb_include_metrics: values.cb_include_metrics,
    method_for_allocated_metrics: values.method_for_allocated_metrics,
    cumulative_rate_calculation: values.cumulative_rate_calculation,
    sortby: values.sortby,
    order: values.order,
    group: values.group,
    hide_details: values.hide_details,
    break_format: values.break_format,
    row_limit: stringToInt(values.row_limit),
    sort1_suffix: values.sort1_suffix,
    sort2_suffix: values.sort2_suffix,
    pivot_by1: values.pivot_by1,
    pivot_by2: values.pivot_by2,
    pivot_by3: values.pivot_by3,
    pivot_cols: values.pivot_cols,
    graph_type: values.graph_type,
    graph_mode: values.graph_mode,
    graph_column: values.graph_column,
    graph_count: stringToInt(values.graph_count),
    graph_other: values.graph_other,
  };
};
