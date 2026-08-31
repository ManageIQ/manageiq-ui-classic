/**
 * Shared type definitions for the Report Editor component.
 */

import type { ReactNode } from 'react';
import type { MiqFormSchemaType } from '../../types/forms';

// Re-export for convenience within the module
export type { MiqFormSchemaType };

// ---------------------------------------------------------------------------
// Report type discriminant
// ---------------------------------------------------------------------------

export type ReportType = 'standard' | 'performance' | 'trend' | 'chargeback';

// ---------------------------------------------------------------------------
// Field metadata (from server react_form_data / react_available_fields)
// ---------------------------------------------------------------------------

export type FieldMeta = {
  numeric?: boolean;
  data_type?: string;
  format_sub_type?: string;
  available_formats?: [string, string][];
  break_suffixes?: [string, string][];
  units?: [string, string][];
};

export type FieldMetadata = Record<string, FieldMeta>;

/** [label, fieldId][] */
export type AvailableField = [string, string];

// ---------------------------------------------------------------------------
// FieldMetadataContext value
// ---------------------------------------------------------------------------

export type FieldMetadataContextValue = {
  availableFields: AvailableField[];
  fieldMetadata: FieldMetadata;
  setFieldData: (data: { availableFields: AvailableField[]; fieldMetadata: FieldMetadata }) => void;
};

// ---------------------------------------------------------------------------
// Form values (the DDF form state shape)
// ---------------------------------------------------------------------------

export type StyleRule = {
  class?: string;
  operator?: string;
  value?: string;
  value_suffix?: string;
};

export type ColOption = {
  header?: string;
  format?: string;
  grouping?: string[];
  style?: StyleRule[];
  break_format?: string;
};

export type ColOptions = Record<string, ColOption>;

export type ReportFormValues = {
  name?: string;
  title?: string;
  model?: string | { value: string; label?: string };
  queue_timeout?: string;
  col_order?: string[];
  col_options?: ColOptions;
  pdf_page_size?: string;
  sortby?: string[];
  order?: string;
  group?: string;
  hide_details?: boolean;
  break_format?: string;
  row_limit?: string;
  sort1_suffix?: string;
  sort2_suffix?: string;
  pivot_by1?: string;
  pivot_by2?: string;
  pivot_by3?: string;
  pivot_cols?: Record<string, string[]>;
  graph_type?: string;
  graph_mode?: string;
  graph_column?: string;
  graph_count?: string;
  graph_other?: boolean;
  record_filter?: ReportFilter | null;
  display_filter?: ReportFilter | null;
  perf_interval?: string;
  perf_avgs?: string;
  perf_end?: string;
  perf_start?: string;
  trend_col?: string;
  trend_limit_col?: string;
  trend_limit_val?: string;
  trend_pct1?: string;
  trend_pct2?: string;
  trend_pct3?: string;
  cb_show_typ?: string;
  cb_owner_id?: string;
  cb_tenant_id?: string;
  cb_tag_cat?: string;
  cb_tag_value?: string[];
  cb_provider_id?: string;
  cb_entity_id?: string;
  cb_groupby?: string;
  cb_groupby_tag?: string[];
  cb_groupby_label?: string;
  cb_interval?: string;
  cb_interval_size?: number;
  cb_end_interval_offset?: number;
  tz?: string;
  cb_include_metrics?: boolean;
  method_for_allocated_metrics?: string;
  cumulative_rate_calculation?: boolean;
};

// Loose object that represents either a MiqExpression hash or an RQB query
// (before or after the user edits it).  We can't fully type MiqExpression
// without mirroring the entire expression tree, so `Record<string, unknown>` suffices.
export type ReportFilter = Record<string, unknown>;

// ---------------------------------------------------------------------------
// Server response shapes (react_form_data)
// ---------------------------------------------------------------------------

export type ReportRecord = {
  name?: string;
  title?: string;
  model?: string;
  queue_timeout?: number | null;
  col_order?: string[];
  col_formats?: string[];
  col_options?: ColOptions;
  headers?: string[];
  pdf_page_size?: string;
  sortby?: string[];
  order?: string;
  group?: string;
  hide_details?: boolean;
  row_limit?: number | null;
  graph_type?: string;
  graph_mode?: string;
  graph_column?: string;
  graph_count?: number | null;
  graph_other?: boolean;
  record_filter?: ReportFilter | null;
  display_filter?: ReportFilter | null;
  tz?: string;
  trend_col?: string;
  trend_limit_col?: string;
  trend_limit_val?: number | null;
  trend_pct1?: number | null;
  trend_pct2?: number | null;
  trend_pct3?: number | null;
  pivot_by1?: string;
  pivot_by2?: string;
  pivot_by3?: string;
  pivot_cols?: Record<string, string[]>;
  db_options?: {
    interval?: string;
    calc_avgs_by?: string;
    end_offset?: number;
    start_offset?: number;
    options?: ChargebackDbOptions;
  };
};

export type ChargebackDbOptions = {
  owner?: string;
  tenant_id?: number;
  tag?: [string, string | string[]];
  entity_id?: string;
  provider_id?: number;
  groupby?: string;
  groupby_tag?: string | string[];
  groupby_label?: string;
  interval?: string;
  interval_size?: number;
  end_interval_offset?: number;
  tz?: string;
  include_metrics?: boolean;
  method_for_allocated_metrics?: string;
  cumulative_rate_calculation?: boolean;
};

export type FormData = {
  report?: ReportRecord;
  report_type?: ReportType;
  models?: [string, string][];
  queue_timeout_options?: [string, string | null][];
  pdf_page_sizes?: [string, string][];
  available_fields?: AvailableField[];
  field_metadata?: FieldMetadata;
  chart_types?: [string, string][];
  style_classes?: Record<string, string>;
  unavailable_fields_warning?: string;
};

// ---------------------------------------------------------------------------
// Chargeback options response (react_chargeback_options)
// ---------------------------------------------------------------------------

export type ChargebackOptions = {
  users?: Record<string, string>;
  tenants?: Record<string, string>;
  categories?: Record<string, string>;
  container_providers?: [string, string][];
  image_labels?: string[];
  timezones?: [string, string][];
  cb_model?: string;
  tag_values?: Record<string, [string, string][]>;
};

// ---------------------------------------------------------------------------
// DDF form-options (useFormApi) — subset we actually call
// ---------------------------------------------------------------------------

export type FormOptions = {
  change: (field: string, value: unknown) => void;
  getState: () => { values: ReportFormValues };
};

// ---------------------------------------------------------------------------
// Schema (report-editor.schema)
// ---------------------------------------------------------------------------

export type FormDataWithType = FormData & { report_type?: ReportType };

// ---------------------------------------------------------------------------
// Props shared across sub-components
// ---------------------------------------------------------------------------

export type FormRowProps = {
  label: string;
  children: ReactNode;
};

export type LabeledSectionProps = {
  title?: string;
  children: ReactNode;
};
