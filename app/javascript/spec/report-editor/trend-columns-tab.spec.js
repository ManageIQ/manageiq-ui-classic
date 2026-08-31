import { screen, waitFor } from '@testing-library/react';
import { renderWithRedux } from '../helpers/mountForm';
import ReportEditor from '../../components/report-editor';

const trendFormData = {
  report: {
    name: 'Trend Report',
    title: 'Trend Title',
    model: 'VimPerformanceTrend',
    col_order: [],
    headers: [],
    col_formats: [],
    col_options: {},
    queue_timeout: null,
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
  queue_timeout_options: [['(Use System Default)', null]],
  pdf_page_sizes: [],
  available_fields: [],
  field_metadata: {},
};

const trendFields = {
  fields: [
    ['Performance - VM : CPU - Usage Rate (%)', 'VmPerformance-cpu_usage_rate_average'],
    ['Performance - VM : Memory - Used (MB)', 'VmPerformance-derived_memory_used'],
  ],
  field_metadata: {},
};

describe('TrendColumnsTab (via ReportEditor)', () => {
  beforeEach(() => {
    window.http = {
      get: jest.fn((url) => {
        if (url.includes('react_available_fields')) return Promise.resolve(trendFields);
        if (url.includes('react_trend_limit_cols')) return Promise.resolve({ limit_cols: [] });
        return Promise.resolve(trendFormData);
      }),
      post: jest.fn(() => Promise.resolve({ success: true })),
    };
  });

  afterEach(() => jest.clearAllMocks());

  it('renders the Trending for select', async() => {
    renderWithRedux(<ReportEditor recordId="new" />);
    await waitFor(() => {
      expect(document.getElementById('trend_col')).toBeInTheDocument();
    });
  });

  it('fetches react_available_fields with perf_interval for a trend model', async() => {
    renderWithRedux(<ReportEditor recordId="new" />);
    await waitFor(() => {
      expect(window.http.get).toHaveBeenCalledWith(
        expect.stringContaining('react_available_fields')
      );
      expect(window.http.get).toHaveBeenCalledWith(
        expect.stringContaining('perf_interval=daily')
      );
    });
  });

  it('does NOT render the standard field-picker multi-select for trend reports', async() => {
    renderWithRedux(<ReportEditor recordId="new" />);
    await waitFor(() => {
      expect(document.getElementById('trend_col')).toBeInTheDocument();
    });
    expect(screen.queryByText('Available fields')).not.toBeInTheDocument();
  });

  it('does NOT show Target Limit or Target Percents before a trend_col is chosen', async() => {
    renderWithRedux(<ReportEditor recordId="new" />);
    await waitFor(() => {
      expect(document.getElementById('trend_col')).toBeInTheDocument();
    });
    expect(screen.queryByText('Trend Target Limit')).not.toBeInTheDocument();
    expect(screen.queryByText('Trend Target Percents')).not.toBeInTheDocument();
  });

  it('shows Target Limit and Target Percents after a trend_col is pre-loaded', async() => {
    window.http.get.mockImplementation((url) => {
      if (url.includes('react_available_fields')) return Promise.resolve(trendFields);
      if (url.includes('react_trend_limit_cols')) return Promise.resolve({ limit_cols: [] });
      return Promise.resolve({
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
      });
    });

    renderWithRedux(<ReportEditor recordId="42" />);
    await waitFor(() => {
      expect(screen.getByText('Trend Target Limit')).toBeInTheDocument();
      expect(screen.getByText('Trend Target Percents')).toBeInTheDocument();
    });
  });
});
