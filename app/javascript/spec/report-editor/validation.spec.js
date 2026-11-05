import { validateReportForm, MAX_COLUMNS } from '../../components/report-editor/validation';
import { NOTHING } from '../../components/report-editor/utils';

describe('validateReportForm', () => {
  const validBase = {
    name: 'Report Name',
    title: 'Report Title',
    model: 'Vm',
    col_order: ['Vm-name'],
  };

  describe('basic fields', () => {
    it('requires name', () => {
      expect(validateReportForm({ ...validBase, name: '' })).toMatchObject({
        name: 'Required',
      });
      expect(validateReportForm({ ...validBase, name: '   ' })).toMatchObject({
        name: 'Required',
      });
    });

    it('enforces name max length', () => {
      const longName = 'a'.repeat(41);
      expect(validateReportForm({ ...validBase, name: longName })).toMatchObject({
        name: expect.stringContaining('40'),
      });
    });

    it('requires title', () => {
      expect(validateReportForm({ ...validBase, title: '' })).toMatchObject({
        title: 'Required',
      });
      expect(validateReportForm({ ...validBase, title: '   ' })).toMatchObject({
        title: 'Required',
      });
    });

    it('enforces title max length', () => {
      const longTitle = 'a'.repeat(61);
      expect(validateReportForm({ ...validBase, title: longTitle })).toMatchObject({
        title: expect.stringContaining('60'),
      });
    });

    it('requires model', () => {
      expect(validateReportForm({ ...validBase, model: '' })).toMatchObject({
        model: 'Required',
      });
    });
  });

  describe('standard and performance columns', () => {
    it('requires at least one column for standard reports', () => {
      expect(validateReportForm({ ...validBase, col_order: [] })).toMatchObject({
        col_order: 'At least one field must be selected',
      });
    });

    it('enforces maximum columns limit', () => {
      const tooManyCols = Array.from({ length: MAX_COLUMNS + 1 }, (_, i) => `col_${i}`);
      expect(validateReportForm({ ...validBase, col_order: tooManyCols })).toMatchObject({
        col_order: expect.stringContaining('100'),
      });
    });

    it('accepts valid column selection', () => {
      expect(validateReportForm(validBase)).toEqual({});
    });
  });

  describe('trend reports', () => {
    const validTrend = {
      name: 'Trend Report',
      title: 'Trend Title',
      model: 'VimPerformanceTrend',
      trend_col: 'VmPerformance-cpu_usage_rate_average',
      trend_limit_col: 'VmPerformance-derived_memory_available',
    };

    it('requires trend_col', () => {
      expect(validateReportForm({ ...validTrend, trend_col: '' })).toMatchObject({
        trend_col: 'Trending for is required',
      });
    });

    it('requires limit column or limit value', () => {
      expect(validateReportForm({ ...validTrend, trend_limit_col: '', trend_limit_val: '' })).toMatchObject({
        trend_limit_val: 'Trend Target Limit must be configured',
      });
    });

    it('requires limit value to be numeric when provided', () => {
      expect(validateReportForm({ ...validTrend, trend_limit_col: '', trend_limit_val: 'abc' })).toMatchObject({
        trend_limit_val: 'Trend Target Limit must be numeric',
      });
    });

    it('accepts numeric limit value', () => {
      expect(validateReportForm({ ...validTrend, trend_limit_col: '', trend_limit_val: '100' })).toEqual({});
    });
  });

  describe('chargeback reports', () => {
    const validChargeback = {
      name: 'CB Report',
      title: 'CB Title',
      model: 'ChargebackVm',
      col_order: ['ChargebackVm-cpu_used_metric'],
      cb_show_typ: 'owner',
      cb_owner_id: 'bob',
    };

    it('requires cb_show_typ', () => {
      expect(validateReportForm({ ...validChargeback, cb_show_typ: '' })).toMatchObject({
        cb_show_typ: 'Show Costs by must be selected',
      });
    });

    it('validates owner selection', () => {
      expect(validateReportForm({ ...validChargeback, cb_show_typ: 'owner', cb_owner_id: '' })).toMatchObject({
        cb_owner_id: 'An Owner must be selected',
      });
    });

    it('validates tenant selection', () => {
      expect(validateReportForm({ ...validChargeback, cb_show_typ: 'tenant', cb_tenant_id: '' })).toMatchObject({
        cb_tenant_id: 'A Tenant Category must be selected',
      });
    });

    it('validates tag selection', () => {
      expect(validateReportForm({
        ...validChargeback,
        cb_show_typ: 'tag',
        cb_tag_cat: '',
        cb_tag_value: [],
      })).toMatchObject({
        cb_tag_cat: 'A Tag Category must be selected',
      });
      expect(validateReportForm({
        ...validChargeback,
        cb_show_typ: 'tag',
        cb_tag_cat: 'env',
        cb_tag_value: [],
      })).toMatchObject({
        cb_tag_value: 'A Tag must be selected',
      });
    });

    it('validates entity selection', () => {
      expect(validateReportForm({
        ...validChargeback,
        cb_show_typ: 'entity',
        cb_provider_id: '',
        cb_entity_id: '',
      })).toMatchObject({
        cb_provider_id: 'A Provider must be selected',
      });
      expect(validateReportForm({
        ...validChargeback,
        cb_show_typ: 'entity',
        cb_provider_id: '1',
        cb_entity_id: '',
      })).toMatchObject({
        cb_entity_id: 'A specific Entity or all must be selected',
      });
    });

    it('validates group by tag', () => {
      expect(validateReportForm({ ...validChargeback, cb_groupby: 'tag', cb_groupby_tag: [] })).toMatchObject({
        cb_groupby_tag: 'A Group by Tag must be selected',
      });
    });

    it('validates group by label', () => {
      expect(validateReportForm({ ...validChargeback, cb_groupby: 'label', cb_groupby_label: '' })).toMatchObject({
        cb_groupby_label: 'A Group by Label must be selected',
      });
    });

    it('rejects label columns when grouping by label', () => {
      expect(validateReportForm({
        ...validChargeback,
        cb_groupby: 'label',
        cb_groupby_label: 'environment',
        col_order: ['ChargebackContainerImage-custom_attributes_name'],
      })).toMatchObject({
        cb_groupby_label: 'Can not add label columns when grouping by label',
      });
    });
  });

  describe('charts validation', () => {
    const validChart = {
      ...validBase,
      graph_type: 'Pie',
      sortby: ['Vm-name'],
      graph_mode: 'counts',
    };

    it('requires a sort field when a chart type is configured', () => {
      expect(validateReportForm({ ...validChart, sortby: [] })).toMatchObject({
        graph_type: 'A sort field is required when a chart type is configured',
      });
      expect(validateReportForm({ ...validChart, sortby: [NOTHING] })).toMatchObject({
        graph_type: 'A sort field is required when a chart type is configured',
      });
    });

    it('requires data column when chart mode is set to values', () => {
      expect(validateReportForm({ ...validChart, graph_mode: 'values', graph_column: '' })).toMatchObject({
        graph_column: 'Data column must be selected when chart mode is set to "Values"',
      });
      expect(validateReportForm({ ...validChart, graph_mode: 'values', graph_column: 'Vm-num_cpu' })).toEqual({});
    });
  });
});
