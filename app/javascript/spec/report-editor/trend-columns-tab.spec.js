import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  makeFormData, mockApi, mockRoute, renderEditor, requestedUrls, requestsTo, resetFetchMock,
} from '../helpers/reportEditor';

const trendFormData = makeFormData({
  report: {
    name: 'Trend Report',
    title: 'Trend Title',
    model: 'VimPerformanceTrend',
    db_options: { interval: 'daily', rpt_type: 'trend' },
    trend_col: '',
    trend_limit_col: null,
    trend_limit_val: null,
    trend_pct1: 100,
    trend_pct2: null,
    trend_pct3: null,
  },
  report_type: 'trend',
  models: [['VimPerformanceTrend', 'VimPerformanceTrend']],
});

const trendFields = {
  fields: [
    ['Performance - VM : CPU - Usage Rate (%)', 'VmPerformance-cpu_usage_rate_average'],
    ['Performance - VM : Memory - Used (MB)', 'VmPerformance-derived_memory_used'],
  ],
  field_metadata: {},
};

describe('TrendColumnsTab (via ReportEditor)', () => {
  beforeEach(() => {
    mockApi({ formData: trendFormData, availableFields: trendFields });
  });

  afterEach(resetFetchMock);

  it('renders the Trending for select', async() => {
    renderEditor();
    await waitFor(() => {
      expect(document.getElementById('trend_col')).toBeInTheDocument();
    });
  });

  it('fetches available_fields with perf_interval for a trend model', async() => {
    renderEditor();
    await waitFor(() => {
      expect(requestedUrls()).toContainEqual(
        expect.stringMatching(/available_fields\?model=VimPerformanceTrend&perf_interval=daily/)
      );
    });
  });

  it('does NOT render the standard field-picker multi-select for trend reports', async() => {
    renderEditor();
    await waitFor(() => {
      expect(document.getElementById('trend_col')).toBeInTheDocument();
    });
    expect(screen.queryByText('Available fields')).not.toBeInTheDocument();
  });

  it('does NOT show Target Limit or Target Percents before a trend_col is chosen', async() => {
    renderEditor();
    await waitFor(() => {
      expect(document.getElementById('trend_col')).toBeInTheDocument();
    });
    expect(screen.queryByText('Trend Target Limit')).not.toBeInTheDocument();
    expect(screen.queryByText('Trend Target Percents')).not.toBeInTheDocument();
  });

  it('shows Target Limit and Target Percents after a trend_col is pre-loaded', async() => {
    mockApi({
      formData: makeFormData({
        ...trendFormData,
        report: {
          ...trendFormData.report,
          trend_col: 'VmPerformance-cpu_usage_rate_average',
          db_options: {
            interval: 'daily',
            rpt_type: 'trend',
            trend_db: 'VmPerformance',
            trend_col: 'cpu_usage_rate_average',
            target_pcts: [100],
          },
        },
      }),
      availableFields: trendFields,
    });

    renderEditor({ recordId: '42' });
    await waitFor(() => {
      expect(screen.getByText('Trend Target Limit')).toBeInTheDocument();
      expect(screen.getByText('Trend Target Percents')).toBeInTheDocument();
    });
  });

  it('shows the target percents the report was saved with', async() => {
    mockApi({
      formData: makeFormData({
        ...trendFormData,
        report: {
          ...trendFormData.report,
          trend_col: 'VmPerformance-cpu_usage_rate_average',
          trend_pct1: 90,
          trend_pct2: 75,
          trend_pct3: 50,
        },
      }),
      availableFields: trendFields,
    });

    renderEditor({ recordId: '42' });

    await waitFor(() => expect(document.getElementById('trend_pct1')).toHaveValue('90'));
    expect(document.getElementById('trend_pct2')).toHaveValue('75');
    expect(document.getElementById('trend_pct3')).toHaveValue('50');
  });

  it('offers Percent 1 in steps of 5 up to 100, and None for the other two', async() => {
    mockApi({
      formData: makeFormData({
        ...trendFormData,
        report: { ...trendFormData.report, trend_col: 'VmPerformance-cpu_usage_rate_average' },
      }),
      availableFields: trendFields,
    });

    renderEditor({ recordId: '42' });
    await screen.findByText('Trend Target Percents');

    const values = (id) => Array.from(document.getElementById(id).options).map((option) => option.value);
    expect(values('trend_pct1')).toHaveLength(21);
    expect(values('trend_pct1')[0]).toBe('0');
    expect(values('trend_pct1')[20]).toBe('100');
    expect(values('trend_pct2')[0]).toBe('');
    expect(values('trend_pct2')).toHaveLength(22);
    expect(values('trend_pct3')[0]).toBe('');
  });

  describe('choosing a trend column', () => {
    const limitCols = {
      limit_cols: [
        ['Max CPU', 'VmPerformance-max_cpu'],
        ['Max Memory', 'VmPerformance-max_mem'],
      ],
    };
    const cpuField = 'VmPerformance-cpu_usage_rate_average';

    const chooseTrendColumn = async() => {
      renderEditor();
      await waitFor(() => expect(screen.getByRole('option', { name: /CPU - Usage Rate/ })).toBeInTheDocument());
      fireEvent.change(document.getElementById('trend_col'), { target: { value: cpuField } });
    };

    it('shows the target limit and percent sections', async() => {
      await chooseTrendColumn();

      expect(await screen.findByText('Trend Target Limit')).toBeInTheDocument();
      expect(screen.getByText('Trend Target Percents')).toBeInTheDocument();
    });

    it('requests the limit columns for the chosen trend column', async() => {
      await chooseTrendColumn();

      await waitFor(() => expect(requestsTo('/report/trend_limit_cols')).toHaveLength(1));
      const [[url]] = requestsTo('/report/trend_limit_cols');
      expect(url).toContain(`trend_col=${cpuField}`);
      expect(url).toContain('perf_interval=daily');
    });

    it('defaults Percent 1 to 100 and leaves Percent 2 and 3 on None', async() => {
      await chooseTrendColumn();

      await waitFor(() => expect(document.getElementById('trend_pct1')).toHaveValue('100'));
      expect(document.getElementById('trend_pct2')).toHaveValue('');
      expect(document.getElementById('trend_pct3')).toHaveValue('');
    });

    it('lets a fixed limit value be typed when the server has no limit columns', async() => {
      const user = userEvent.setup();
      await chooseTrendColumn();

      await waitFor(() => expect(document.getElementById('trend_limit_val')).toBeInTheDocument());
      const valueInput = document.getElementById('trend_limit_val');
      expect(document.getElementById('trend_limit_col')).not.toBeInTheDocument();
      await user.clear(valueInput);
      await user.type(valueInput, '85');

      expect(document.getElementById('trend_limit_val')).toHaveValue('85');
    });

    it('selects the first limit column and hides the fixed value input', async() => {
      mockApi({ formData: trendFormData, availableFields: trendFields, trendLimitCols: limitCols });
      await chooseTrendColumn();

      await waitFor(() => expect(document.getElementById('trend_limit_col')).toHaveValue('VmPerformance-max_cpu'));
      expect(document.getElementById('trend_limit_val')).not.toBeInTheDocument();
    });

    it('switches to the fixed value input when the limit column is set to None', async() => {
      mockApi({ formData: trendFormData, availableFields: trendFields, trendLimitCols: limitCols });
      await chooseTrendColumn();
      await waitFor(() => expect(document.getElementById('trend_limit_col')).toHaveValue('VmPerformance-max_cpu'));

      fireEvent.change(document.getElementById('trend_limit_col'), { target: { value: '' } });

      await waitFor(() => expect(document.getElementById('trend_limit_val')).toBeInTheDocument());
    });

    it('changes the limit column and keeps the fixed value input hidden', async() => {
      mockApi({ formData: trendFormData, availableFields: trendFields, trendLimitCols: limitCols });
      await chooseTrendColumn();
      await waitFor(() => expect(document.getElementById('trend_limit_col')).toHaveValue('VmPerformance-max_cpu'));

      fireEvent.change(document.getElementById('trend_limit_col'), { target: { value: 'VmPerformance-max_mem' } });

      await waitFor(() => expect(document.getElementById('trend_limit_col')).toHaveValue('VmPerformance-max_mem'));
      expect(document.getElementById('trend_limit_val')).not.toBeInTheDocument();
    });

    it('updates the target percent selects', async() => {
      await chooseTrendColumn();
      await screen.findByText('Trend Target Percents');

      fireEvent.change(document.getElementById('trend_pct1'), { target: { value: '90' } });
      fireEvent.change(document.getElementById('trend_pct2'), { target: { value: '75' } });
      fireEvent.change(document.getElementById('trend_pct3'), { target: { value: '50' } });

      await waitFor(() => expect(document.getElementById('trend_pct1')).toHaveValue('90'));
      expect(document.getElementById('trend_pct2')).toHaveValue('75');
      expect(document.getElementById('trend_pct3')).toHaveValue('50');
    });

    it('hides the target sections again when the trend column is cleared', async() => {
      await chooseTrendColumn();
      await screen.findByText('Trend Target Limit');

      fireEvent.change(document.getElementById('trend_col'), { target: { value: '' } });

      await waitFor(() => expect(screen.queryByText('Trend Target Limit')).not.toBeInTheDocument());
      expect(screen.queryByText('Trend Target Percents')).not.toBeInTheDocument();
    });
  });

  it('lists the trend columns alphabetically by label', async() => {
    renderEditor();
    await waitFor(() => expect(screen.getByRole('option', { name: /CPU - Usage Rate/ })).toBeInTheDocument());

    const labels = Array.from(document.getElementById('trend_col').options).map((option) => option.textContent);
    expect(labels).toEqual([
      '<Choose>',
      'Performance - VM : CPU - Usage Rate (%)',
      'Performance - VM : Memory - Used (MB)',
    ]);
  });

  it('offers only the Choose option when the trend columns cannot be loaded', async() => {
    mockRoute('availableFields', { throws: new Error('Network error') });
    renderEditor();

    await waitFor(() => expect(document.getElementById('trend_col')).toBeInTheDocument());
    expect(Array.from(document.getElementById('trend_col').options).map((option) => option.value)).toEqual(['']);
  });

  it('shows the fixed limit value when the limit columns cannot be loaded', async() => {
    mockRoute('trendLimitCols', { throws: new Error('Network error') });
    renderEditor();
    await waitFor(() => expect(screen.getByRole('option', { name: /CPU - Usage Rate/ })).toBeInTheDocument());

    fireEvent.change(document.getElementById('trend_col'), { target: { value: 'VmPerformance-cpu_usage_rate_average' } });

    await waitFor(() => expect(requestsTo('/report/trend_limit_cols')).toHaveLength(1));
    await waitFor(() => expect(document.getElementById('trend_limit_val')).toBeInTheDocument());
    expect(document.getElementById('trend_limit_col')).not.toBeInTheDocument();
  });

  it('requests no trend columns when the report has no model', async() => {
    mockApi({ formData: makeFormData({ ...trendFormData, report: { ...trendFormData.report, model: '' } }), availableFields: trendFields });
    renderEditor();

    await waitFor(() => expect(document.getElementById('trend_col')).toBeInTheDocument());
    expect(requestedUrls()).not.toContainEqual(expect.stringContaining('available_fields'));
  });
});
