import { componentTypes, validatorTypes } from '@@ddf';
import type { MiqFormSchemaType, BaseFieldType } from '../../types/forms';
import type { FormDataWithType } from './report-editor-types';
import { MAX_COLUMNS } from './validation';

const STANDARD_TABS = ['columns', 'styling', 'filter', 'summary', 'charts', 'preview'] as const;
// Trend and chargeback have a reduced tab set.
const REDUCED_TABS = ['columns', 'filter', 'preview'] as const;

type TabName = typeof STANDARD_TABS[number];

type TabField = BaseFieldType & Record<string, unknown>;

const columnsTab = (formData: FormDataWithType): TabField => {
  const isPerformance = formData.report_type === 'performance';
  const isTrend = formData.report_type === 'trend';
  return {
    component: componentTypes.TAB_ITEM,
    name: 'columns-tab',
    title: __('Columns'),
    fields: [
      {
        component: componentTypes.TEXT_FIELD,
        name: 'name',
        id: 'name',
        label: __('Menu name'),
        maxLength: 40,
        validate: [{ type: validatorTypes.REQUIRED }],
        isRequired: true,
      },
      {
        component: componentTypes.TEXT_FIELD,
        name: 'title',
        id: 'title',
        label: __('Title'),
        maxLength: 60,
        validate: [{ type: validatorTypes.REQUIRED }],
        isRequired: true,
      },
      {
        component: componentTypes.SELECT,
        name: 'model',
        id: 'model',
        label: __('Base the report on'),
        placeholder: __('<Choose>'),
        includeEmpty: true,
        options: (formData.models || []).map(([label, value]) => ({ label, value })),
        validate: [{ type: validatorTypes.REQUIRED }],
        isRequired: true,
      },
      ...(isPerformance ? [
        {
          component: componentTypes.SELECT,
          name: 'perf_interval',
          id: 'perf_interval',
          label: __('Performance Interval'),
          options: [
            { label: __('Daily'), value: 'daily' },
            { label: __('Hourly'), value: 'hourly' },
          ],
        },
        {
          component: componentTypes.SELECT,
          name: 'perf_avgs',
          id: 'perf_avgs',
          label: __('Averages Based On'),
          options: [
            { label: __('Performance Interval'), value: 'time_interval' },
            { label: __('Available Active Data'), value: 'active_data' },
          ],
        },
      ] : []),
      ...(isTrend ? [
        {
          component: 'report-trend-columns-tab',
          name: 'trend_col',
          id: 'trend_col',
          validate: [{ type: validatorTypes.REQUIRED }],
          isRequired: true,
        },
      ] : []),
      ...(!isTrend ? [
        {
          component: 'report-field-picker',
          name: 'col_order',
          id: 'col_order',
          validate: [
            { type: validatorTypes.REQUIRED },
            (value: string[] = []) => {
              if (!value || value.length === 0) {
                return __('At least one field must be selected');
              }
              if (value.length > MAX_COLUMNS) {
                return sprintf(__('Maximum %s columns allowed'), MAX_COLUMNS);
              }
              return undefined;
            },
          ],
          isRequired: true,
        },
        {
          component: componentTypes.SELECT,
          name: 'queue_timeout',
          id: 'queue_timeout',
          label: __('Report creation timeout'),
          options: (formData.queue_timeout_options || []).map(([label, value]) => ({
            label,
            value: value === null ? '' : String(value),
          })),
        },
        {
          component: 'report-column-formatting-table',
          name: 'col_options',
          id: 'col_options',
          condition: {
            when: 'col_order',
            isNotEmpty: true,
          },
        },
        ...(formData.pdf_page_sizes && formData.pdf_page_sizes.length > 0 ? [{
          component: componentTypes.SELECT,
          name: 'pdf_page_size',
          id: 'pdf_page_size',
          label: __('PDF page size'),
          options: formData.pdf_page_sizes.map(([label, value]) => ({ label, value })),
          condition: {
            when: 'col_order',
            isNotEmpty: true,
          },
        }] : []),
      ] : []),
    ],
  };
};

const filterTab = (formData: FormDataWithType): TabField => ({
  component: componentTypes.TAB_ITEM,
  name: 'filter-tab',
  title: __('Filter'),
  fields: [
    {
      component: 'report-filter-tab',
      name: 'filter_tab_content',
      id: 'filter_tab_content',
      reportType: formData.report_type || 'standard',
    },
    // Hidden but registered: FilterTab sets these via formOptions.change, and DDF
    // silently drops unregistered values at submit time.
    {
      component: componentTypes.TEXT_FIELD,
      name: 'record_filter',
      hideField: true,
      initialValue: null,
    },
    {
      component: componentTypes.TEXT_FIELD,
      name: 'display_filter',
      hideField: true,
      initialValue: null,
    },
  ],
});

const summaryTab = (): TabField => ({
  component: componentTypes.TAB_ITEM,
  name: 'summary-tab',
  title: __('Summary'),
  fields: [
    {
      component: 'report-summary-tab',
      name: 'summary-tab-content',
      id: 'summary-tab-content',
    },
  ],
});

const chartsTab = (formData: FormDataWithType): TabField => ({
  component: componentTypes.TAB_ITEM,
  name: 'charts-tab',
  title: __('Charts'),
  fields: [
    {
      component: 'report-charts-tab',
      name: 'charts-tab-content',
      id: 'charts-tab-content',
      formData,
    },
  ],
});

const stylingTab = (formData: FormDataWithType): TabField => ({
  component: componentTypes.TAB_ITEM,
  name: 'styling-tab',
  title: __('Styling'),
  fields: [
    {
      component: 'report-styling-tab',
      name: 'styling-tab-content',
      id: 'styling-tab-content',
      formData,
    },
  ],
});

const previewTab = (): TabField => ({
  component: componentTypes.TAB_ITEM,
  name: 'preview-tab',
  title: __('Preview'),
  fields: [
    {
      component: 'report-preview-tab',
      name: 'preview-tab-content',
      id: 'preview-tab-content',
    },
  ],
});

const TAB_BUILDERS: Record<TabName, (formData: FormDataWithType) => TabField> = {
  columns: columnsTab,
  styling: stylingTab,
  filter: filterTab,
  summary: () => summaryTab(),
  charts: chartsTab,
  preview: () => previewTab(),
};

const createSchema = (formData: FormDataWithType): MiqFormSchemaType => {
  const reportType = formData.report_type || 'standard';
  const tabNames: readonly TabName[] = (reportType === 'trend' || reportType === 'chargeback')
    ? REDUCED_TABS
    : STANDARD_TABS;

  return {
    fields: [
      {
        component: componentTypes.TABS,
        name: 'report-editor-tabs',
        fields: tabNames.map((name) => TAB_BUILDERS[name](formData)),
      } as BaseFieldType,
    ],
  };
};

export default createSchema;
