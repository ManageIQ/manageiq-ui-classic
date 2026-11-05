import { buildInitialValues, buildReportData } from '../../components/report-editor/report-form-values';
import { NOTHING } from '../../components/report-editor/utils';

describe('buildInitialValues', () => {
  it('falls back to the form defaults when the server sends an empty report', () => {
    const values = buildInitialValues({ report: {} });

    expect(values).toMatchObject({
      name: '',
      model: '',
      queue_timeout: '',
      col_order: [],
      col_options: {},
      order: 'Ascending',
      group: 'No',
      hide_details: false,
      row_limit: '',
      pivot_by1: NOTHING,
      pivot_cols: {},
      graph_mode: 'counts',
      graph_count: '10',
      graph_other: true,
      record_filter: null,
      perf_interval: 'daily',
      perf_avgs: 'time_interval',
      perf_end: '0',
      trend_pct1: '100',
      cb_show_typ: 'entity',
      cb_entity_id: 'all',
      cb_groupby: 'date',
      cb_interval: 'daily',
      cb_interval_size: 1,
      cb_end_interval_offset: 1,
      cb_include_metrics: true,
      method_for_allocated_metrics: 'max',
      cumulative_rate_calculation: true,
    });
  });

  it('turns numbers into the strings the text inputs need', () => {
    const values = buildInitialValues({
      report: {
        queue_timeout: 3600, row_limit: 50, graph_count: 5, perf_start: 7, trend_pct2: 80,
      },
    });

    expect(values).toMatchObject({
      queue_timeout: '3600', row_limit: '50', graph_count: '5', perf_start: '7', trend_pct2: '80',
    });
  });

  it('merges headers and formats by position into the per-field column options', () => {
    const values = buildInitialValues({
      report: {
        col_order: ['Vm-name', 'Vm-num_cpu'],
        headers: ['VM Name', ''],
        col_formats: ['', 'general_number_precision_0'],
        col_options: { 'Vm-num_cpu': { header: 'Stored header' } },
      },
    });

    expect(values.col_options).toEqual({
      'Vm-name': { header: 'VM Name', format: '' },
      'Vm-num_cpu': { header: 'Stored header', format: 'general_number_precision_0' },
    });
  });

  it('falls back to the stored header and format when the position has none', () => {
    const values = buildInitialValues({
      report: {
        col_order: ['Vm-name'],
        headers: [],
        col_formats: [],
        col_options: { 'Vm-name': { header: 'Stored header', format: 'stored_format' } },
      },
    });

    expect(values.col_options).toEqual({ 'Vm-name': { header: 'Stored header', format: 'stored_format' } });
  });

  it('keeps graph_other off only when the server says false', () => {
    expect(buildInitialValues({ report: { graph_other: false } }).graph_other).toBe(false);
    expect(buildInitialValues({ report: {} }).graph_other).toBe(true);
  });

  it('reads the performance settings from db_options', () => {
    const values = buildInitialValues({
      report: { db_options: { interval: 'hourly', calc_avgs_by: 'day', end_offset: 2 } },
    });

    expect(values).toMatchObject({ perf_interval: 'hourly', perf_avgs: 'day', perf_end: '2' });
  });

  describe('chargeback options', () => {
    const chargeback = (options) => buildInitialValues({ report: { db_options: { options } } });

    it('detects an owner filter', () => {
      expect(chargeback({ owner: 'admin' })).toMatchObject({ cb_show_typ: 'owner', cb_owner_id: 'admin' });
    });

    it('detects a tenant filter', () => {
      expect(chargeback({ tenant_id: 4 })).toMatchObject({ cb_show_typ: 'tenant', cb_tenant_id: '4' });
    });

    it('detects a tag filter and splits it into category and values', () => {
      expect(chargeback({ tag: ['/managed/environment', 'prod'] })).toMatchObject({
        cb_show_typ: 'tag',
        cb_tag_cat: '/managed/environment',
        cb_tag_value: ['prod'],
      });
    });

    it('keeps tag values that already are a list', () => {
      expect(chargeback({ tag: ['/managed/environment', ['prod', 'dev']] }).cb_tag_value).toEqual(['prod', 'dev']);
    });

    it('has no tag values for a tag filter without any', () => {
      expect(chargeback({ tag: ['/managed/environment'] })).toMatchObject({ cb_tag_cat: '/managed/environment', cb_tag_value: [] });
    });

    it('keeps a group-by tag list as it is', () => {
      expect(chargeback({ groupby_tag: ['/managed/environment', '/managed/department'] }).cb_groupby_tag)
        .toEqual(['/managed/environment', '/managed/department']);
    });

    it('detects an entity filter', () => {
      expect(chargeback({ entity_id: '12', provider_id: 3 })).toMatchObject({
        cb_show_typ: 'entity', cb_entity_id: '12', cb_provider_id: '3',
      });
    });

    it('reads grouping, interval and metric options', () => {
      expect(chargeback({
        groupby: 'tag',
        groupby_tag: '/managed/environment',
        groupby_label: 'Env',
        interval: 'weekly',
        interval_size: 4,
        end_interval_offset: 0,
        tz: 'UTC',
        include_metrics: false,
        method_for_allocated_metrics: 'avg',
        cumulative_rate_calculation: false,
      })).toMatchObject({
        cb_groupby: 'tag',
        cb_groupby_tag: ['/managed/environment'],
        cb_groupby_label: 'Env',
        cb_interval: 'weekly',
        cb_interval_size: 4,
        cb_end_interval_offset: 0,
        tz: 'UTC',
        cb_include_metrics: false,
        method_for_allocated_metrics: 'avg',
        cumulative_rate_calculation: false,
      });
    });
  });
});

describe('buildReportData', () => {
  const values = {
    name: 'Report',
    title: 'Title',
    model: 'Vm',
    queue_timeout: '3600',
    col_order: ['Vm-name', 'Vm-num_cpu'],
    col_options: {
      'Vm-name': { header: 'VM Name', format: '' },
      'Vm-num_cpu': { header: 'CPUs', format: 'general_number_precision_0' },
    },
    row_limit: '50',
    graph_count: '7',
  };

  it('derives the headers and formats arrays in column order', () => {
    const data = buildReportData(values);

    expect(data.headers).toEqual(['VM Name', 'CPUs']);
    expect(data.col_formats).toEqual(['', 'general_number_precision_0']);
    expect(data.col_options).toBe(values.col_options);
  });

  it('turns the numeric text inputs into integers', () => {
    const data = buildReportData(values);

    expect(data.queue_timeout).toBe(3600);
    expect(data.row_limit).toBe(50);
    expect(data.graph_count).toBe(7);
  });

  it('sends null for blank or non-numeric numeric inputs', () => {
    expect(buildReportData({
      ...values, queue_timeout: '', row_limit: null, graph_count: 'abc',
    }))
      .toMatchObject({ queue_timeout: null, row_limit: null, graph_count: null });
  });

  it('uses blank headers and formats for columns without options', () => {
    const data = buildReportData({ col_order: ['Vm-name'], col_options: {} });

    expect(data.headers).toEqual(['']);
    expect(data.col_formats).toEqual(['']);
  });

  it('tolerates a form without columns', () => {
    const data = buildReportData({});

    expect(data.col_order).toEqual([]);
    expect(data.headers).toEqual([]);
    expect(data.col_formats).toEqual([]);
    expect(data.col_options).toEqual({});
  });

  it('converts a react-querybuilder filter into a MiqExpression', () => {
    const rqb = {
      id: '1',
      combinator: 'and',
      not: false,
      rules: [{
        id: '2', field: 'Vm-name', operator: '=', value: 'test',
      }],
    };

    expect(buildReportData({ ...values, record_filter: rqb }).record_filter)
      .toEqual({ '=': { field: 'Vm-name', value: 'test' } });
  });

  it('passes an existing MiqExpression display filter through when a child table column is selected', () => {
    const miq = { '=': { field: 'Vm-name', value: 'test' } };
    const fieldMetadata = { 'Vm-name': { plural: true } };

    expect(buildReportData({ ...values, display_filter: miq }, fieldMetadata).display_filter).toBe(miq);
  });

  it('drops the display filter once no child table column is selected', () => {
    const miq = { '=': { field: 'Vm-name', value: 'test' } };
    const fieldMetadata = { 'Vm-name': { plural: false }, 'Vm-num_cpu': {} };

    expect(buildReportData({ ...values, display_filter: miq }, fieldMetadata).display_filter).toBeNull();
    expect(buildReportData({ ...values, display_filter: miq }, {}).display_filter).toBeNull();
  });

  it('keeps the record filter regardless of child table columns', () => {
    const miq = { '=': { field: 'Vm-name', value: 'test' } };

    expect(buildReportData({ ...values, record_filter: miq }, {}).record_filter).toBe(miq);
  });

  it('sends null when there is no filter', () => {
    const data = buildReportData(values);

    expect(data.record_filter).toBeNull();
    expect(data.display_filter).toBeNull();
  });
});
