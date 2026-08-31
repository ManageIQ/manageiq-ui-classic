import {
  useState, useEffect, useRef, useMemo,
} from 'react';
import { Loading, InlineNotification } from '@carbon/react';
import MiqFormRenderer, { FormSpy } from '@@ddf';
import { rqbToMiq } from '../expression-editor/expression-adapter';
import defaultComponentMapper from '../../forms/mappers/componentMapper';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import createSchema from './report-editor.schema';
import FieldPicker from './field-picker';
import ColumnFormattingTable from './column-formatting-table';
import FilterTab from './tabs/filter-tab';
import SummaryTab from './tabs/summary-tab';
import ChartsTab from './tabs/charts-tab';
import StylingTab from './tabs/styling-tab';
import PreviewTab from './tabs/preview-tab';
import TrendColumnsTab from './tabs/trend-columns-tab';
import { FieldMetadataContext } from './field-metadata-context';
import { modelToReportType } from './utils';
import type {
  FormData,
  FieldMetadataContextValue,
  AvailableField,
  FieldMetadata,
  ReportFormValues,
  ReportFilter,
} from './report-editor-types';

const componentMapper = {
  ...defaultComponentMapper,
  'report-field-picker': FieldPicker,
  'report-column-formatting-table': ColumnFormattingTable,
  'report-filter-tab': FilterTab,
  'report-summary-tab': SummaryTab,
  'report-charts-tab': ChartsTab,
  'report-styling-tab': StylingTab,
  'report-preview-tab': PreviewTab,
  'report-trend-columns-tab': TrendColumnsTab,
};

const REDIRECT_URL = '/report/explorer';

type ReportEditorProps = {
  recordId?: string | number;
  copyFrom?: string | number | null;
};

type EditorState = {
  isLoading: boolean;
  formData: FormData | null;
  loadError: string | null;
};

type FieldMetadataState = {
  availableFields: AvailableField[];
  fieldMetadata: FieldMetadata;
};

const ReportEditor = ({ recordId = 'new', copyFrom = null }: ReportEditorProps) => {
  const [{ isLoading, formData, loadError }, setState] = useState<EditorState>({
    isLoading: true,
    formData: null,
    loadError: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [flashError, setFlashError] = useState<string | null>(null);
  const [reportType, setReportType] = useState('standard');

  const [fieldMetadataState, setFieldMetadataState] = useState<FieldMetadataState>({
    availableFields: [],
    fieldMetadata: {},
  });

  const prevModelRef = useRef<string | null>(null);
  const isNew = !recordId || recordId === 'new';

  useEffect(() => {
    let url = isNew ? '/report/react_form_data/new' : `/report/react_form_data/${recordId}`;
    if (isNew && copyFrom) {
      url += `?copy_from=${encodeURIComponent(String(copyFrom))}`;
    }

    http.get<FormData>(url)
      .then((data) => {
        setState({ isLoading: false, formData: data, loadError: null });
        setReportType(data.report_type || 'standard');
        prevModelRef.current = (data.report || {}).model || '';
        setFieldMetadataState({
          availableFields: data.available_fields || [],
          fieldMetadata: data.field_metadata || {},
        });
      })
      .catch(() => {
        setState({
          isLoading: false,
          formData: null,
          loadError: __('Failed to load report data. Please try again.'),
        });
      });
  }, [recordId]);

  const buildInitialValues = (data: FormData): ReportFormValues => {
    const report = data.report || {};
    const dbOptions = report.db_options || {};
    const cbOpts = dbOptions.options || {};

    const firstSortCol = report.sortby?.[0]?.split('__')?.[0] || '';
    const breakFormat = firstSortCol
      ? (report.col_options || {})[firstSortCol]?.break_format || ''
      : '';

    const prefixedSortby = Array.isArray(report.sortby) ? report.sortby : [];
    const sort1Raw = String(prefixedSortby[0] || '');
    const sort2Raw = String(prefixedSortby[1] || '');
    const sort1Parts = sort1Raw.split('__');
    const sort2Parts = sort2Raw.split('__');

    const rawTagVal = cbOpts.tag ? cbOpts.tag[1] : [];
    let cbTagValue: string[] = [];
    if (Array.isArray(rawTagVal)) {
      cbTagValue = rawTagVal as string[];
    } else if (rawTagVal) {
      cbTagValue = [rawTagVal as string];
    }
    const rawGroupbyTag = cbOpts.groupby_tag || [];
    let cbGroupbyTag: string[] = [];
    if (Array.isArray(rawGroupbyTag)) {
      cbGroupbyTag = rawGroupbyTag as string[];
    } else if (rawGroupbyTag) {
      cbGroupbyTag = [rawGroupbyTag as string];
    }

    return {
      name: report.name || '',
      title: report.title || '',
      model: report.model || '',
      queue_timeout: report.queue_timeout != null ? String(report.queue_timeout) : '',
      col_order: report.col_order || [],
      col_options: (() => {
        const options = { ...(report.col_options || {}) };
        (report.col_order || []).forEach((fieldId, idx) => {
          options[fieldId] = {
            ...(options[fieldId] || {}),
            header: (report.headers || [])[idx] || options[fieldId]?.header || '',
            format: (report.col_formats || [])[idx] || options[fieldId]?.format || '',
          };
        });
        return options;
      })(),
      pdf_page_size: report.pdf_page_size || '',
      sortby: report.sortby || [],
      order: report.order || 'Ascending',
      group: report.group || 'No',
      hide_details: !!report.hide_details,
      break_format: breakFormat,
      row_limit: report.row_limit != null ? String(report.row_limit) : '',
      sort1_suffix: sort1Parts[1] || '',
      sort2_suffix: sort2Parts[1] || '',
      pivot_by1: report.pivot_by1 || '<<<Nothing>>>',
      pivot_by2: report.pivot_by2 || '<<<Nothing>>>',
      pivot_by3: report.pivot_by3 || '<<<Nothing>>>',
      pivot_cols: report.pivot_cols || {},
      graph_type: report.graph_type || '',
      graph_mode: report.graph_mode || 'counts',
      graph_column: report.graph_column || '',
      graph_count: report.graph_count != null ? String(report.graph_count) : '10',
      graph_other: report.graph_other !== false,
      record_filter: (report.record_filter as ReportFilter) || null,
      display_filter: (report.display_filter as ReportFilter) || null,
      perf_interval: dbOptions.interval || 'daily',
      perf_avgs: dbOptions.calc_avgs_by || 'time_interval',
      perf_end: dbOptions.end_offset != null ? String(dbOptions.end_offset) : '0',
      perf_start: dbOptions.start_offset != null ? String(dbOptions.start_offset) : '',
      trend_col: report.trend_col || '',
      trend_limit_col: report.trend_limit_col || '',
      trend_limit_val: report.trend_limit_val != null ? String(report.trend_limit_val) : '',
      trend_pct1: report.trend_pct1 != null ? String(report.trend_pct1) : '100',
      trend_pct2: report.trend_pct2 != null ? String(report.trend_pct2) : '',
      trend_pct3: report.trend_pct3 != null ? String(report.trend_pct3) : '',
      cb_show_typ: (() => {
        if (cbOpts.owner !== undefined) return 'owner';
        if (cbOpts.tenant_id !== undefined) return 'tenant';
        if (cbOpts.tag !== undefined) return 'tag';
        if (cbOpts.entity_id !== undefined) return 'entity';
        return '';
      })(),
      cb_owner_id: cbOpts.owner || '',
      cb_tenant_id: cbOpts.tenant_id != null ? String(cbOpts.tenant_id) : '',
      cb_tag_cat: cbOpts.tag ? cbOpts.tag[0] : '',
      cb_tag_value: cbTagValue,
      cb_provider_id: cbOpts.provider_id != null ? String(cbOpts.provider_id) : '',
      cb_entity_id: cbOpts.entity_id || '',
      cb_groupby: cbOpts.groupby || 'date',
      cb_groupby_tag: cbGroupbyTag,
      cb_groupby_label: cbOpts.groupby_label || '',
      cb_interval: cbOpts.interval || 'daily',
      cb_interval_size: cbOpts.interval_size ?? 1,
      cb_end_interval_offset: cbOpts.end_interval_offset ?? 1,
      tz: report.tz || cbOpts.tz || '',
      cb_include_metrics: cbOpts.include_metrics !== false,
      method_for_allocated_metrics: cbOpts.method_for_allocated_metrics || 'avg',
      cumulative_rate_calculation: cbOpts.cumulative_rate_calculation !== false,
    };
  };

  const initialValues = useMemo<ReportFormValues>(
    () => (formData ? buildInitialValues(formData) : {}),
    [formData],
  );

  const handleFormChange = ({ values }: { values: ReportFormValues }) => {
    const model = (values.model as { value?: string })?.value ?? (values.model as string) ?? '';
    if (model !== prevModelRef.current) {
      prevModelRef.current = model;
      const next = modelToReportType(model || null);
      setReportType((prev) => (prev === next ? prev : next));
    }
  };

  const onSubmit = (values: ReportFormValues) => {
    if (isSubmitting) {
      return;
    }
    setFlashError(null);
    setIsSubmitting(true);

    const colOrder = values.col_order || [];
    const colOptions = values.col_options || {};
    const headers = colOrder.map((id) => colOptions[id]?.header || '');
    const colFormats = colOrder.map((id) => colOptions[id]?.format || '');

    const reportData = {
      name: values.name,
      title: values.title,
      model: values.model,
      queue_timeout: values.queue_timeout ? parseInt(values.queue_timeout, 10) : null,
      pdf_page_size: values.pdf_page_size,
      col_order: colOrder,
      headers,
      col_formats: colFormats,
      col_options: values.col_options || {},
      record_filter: (() => {
        const f = values.record_filter;
        if (!f) return null;
        return (f.combinator !== undefined) ? rqbToMiq(f) : f;
      })(),
      display_filter: (() => {
        const f = values.display_filter;
        if (!f) return null;
        return (f.combinator !== undefined) ? rqbToMiq(f) : f;
      })(),
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
      row_limit: values.row_limit ? parseInt(values.row_limit, 10) : null,
      sort1_suffix: values.sort1_suffix,
      sort2_suffix: values.sort2_suffix,
      pivot_by1: values.pivot_by1,
      pivot_by2: values.pivot_by2,
      pivot_by3: values.pivot_by3,
      pivot_cols: values.pivot_cols,
      graph_type: values.graph_type,
      graph_mode: values.graph_mode,
      graph_column: values.graph_column,
      graph_count: values.graph_count ? parseInt(values.graph_count, 10) : null,
      graph_other: values.graph_other,
    };

    const url = isNew ? '/report/react_save/new' : `/report/react_save/${recordId}`;
    http.post<{ success: boolean; message?: string }>(url, { report_data: reportData })
      .then((response) => {
        if (response.success) {
          const message = response.message || __('Report was saved');
          miqRedirectBack(message, 'success', REDIRECT_URL);
        } else {
          setIsSubmitting(false);
          setFlashError(response.message || __('An error occurred while saving'));
        }
      })
      .catch((error: { data?: { message?: string }; message?: string }) => {
        setIsSubmitting(false);
        setFlashError(error.data?.message || error.message || __('An error occurred while saving'));
      });
  };

  const onCancel = () => {
    const message = isNew
      ? __('Add of new Report was cancelled by the user')
      : __('Edit of Report was cancelled by the user');
    miqRedirectBack(message, 'warning', REDIRECT_URL);
  };

  if (isLoading) {
    return <Loading active withOverlay={false} />;
  }

  if (loadError) {
    return (
      <InlineNotification
        kind="error"
        role="alert"
        title={loadError}
        lowContrast
        hideCloseButton
      />
    );
  }

  const fieldMetadataContextValue: FieldMetadataContextValue = {
    ...fieldMetadataState,
    setFieldData: ({ availableFields, fieldMetadata }: FieldMetadataState) => {
      setFieldMetadataState({ availableFields, fieldMetadata });
    },
  };

  return (
    <FieldMetadataContext.Provider value={fieldMetadataContextValue}>
      <div className="report-editor">
        {formData!.unavailable_fields_warning && (
          <InlineNotification
            kind="warning"
            role="status"
            title={formData!.unavailable_fields_warning}
            lowContrast
            hideCloseButton
          />
        )}
        {flashError && (
          <InlineNotification
            kind="error"
            role="alert"
            title={flashError}
            lowContrast
            onCloseButtonClick={() => setFlashError(null)}
          />
        )}
        <MiqFormRenderer
          componentMapper={componentMapper}
          schema={createSchema({ ...formData!, report_type: reportType as import('./report-editor-types').ReportType })}
          initialValues={initialValues}
          onSubmit={onSubmit}
          onCancel={onCancel}
          disableSubmit={isSubmitting ? ['submitting'] : ['invalid']}
          buttonsLabels={{ submitLabel: isNew ? __('Add') : __('Save') }}
        >
          <FormSpy subscription={{ values: true }} onChange={handleFormChange as Parameters<typeof FormSpy>[0]['onChange']} />
        </MiqFormRenderer>
      </div>
    </FieldMetadataContext.Provider>
  );
};

export default ReportEditor;
