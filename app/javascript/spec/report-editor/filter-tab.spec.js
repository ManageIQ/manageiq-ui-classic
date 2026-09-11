import { screen, waitFor, fireEvent } from '@testing-library/react';
import { renderWithRedux } from '../helpers/mountForm';
import ReportEditor from '../../components/report-editor';

// Base form data returned by the mocked http.get call.
const baseFormData = {
  report: {
    name: 'My Report',
    title: 'My Title',
    model: 'Vm',
    col_order: [],
    headers: [],
    col_formats: [],
    col_options: {},
    queue_timeout: null,
    pdf_page_size: 'US-Letter',
    db_options: {},
  },
  report_type: 'standard',
  models: [['Virtual Machines', 'Vm'], ['Hosts', 'Host']],
  queue_timeout_options: [['(Use System Default)', null], ['1 Hour', 3600]],
  pdf_page_sizes: [['US Letter', 'US-Letter'], ['A4', 'A4']],
  available_fields: [],
  field_metadata: {},
};

// Mocked chargeback options returned by react_chargeback_options
const cbOptions = {
  users: { admin: 'Administrator', bob: 'Bob Smith' },
  tenants: { '1': 'My Company', '2': 'Acme Corp' },
  categories: { environment: 'Environment', department: 'Department' },
  container_providers: [['OpenShift', '10']],
  image_labels: ['version', 'release'],
  timezones: [
    ['(GMT+00:00) UTC', 'UTC'],
    ['(GMT-05:00) Eastern Time (US & Canada)', 'Eastern Time (US & Canada)'],
  ],
  cb_model: 'Vm',
};

// Helper to render, wait for load, then click the Filter tab
const renderAndClickFilter = async(formData = baseFormData) => {
  renderWithRedux(<ReportEditor recordId="new" />);
  await waitFor(() => expect(screen.getAllByRole('tab').length).toBeGreaterThan(0));
  const filterTab = screen.getAllByRole('tab').find((t) => t.textContent.trim() === 'Filter');
  fireEvent.click(filterTab);
  // Small tick to let any state updates settle
  await waitFor(() => {});
};

describe('FilterTab', () => {
  beforeEach(() => {
    window.http = {
      get: jest.fn((url) => {
        if (url.includes('react_chargeback_options')) {
          return Promise.resolve(cbOptions);
        }
        return Promise.resolve(baseFormData);
      }),
      post: jest.fn(() => Promise.resolve({ success: true, message: 'Report was saved' })),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // Standard variant
  // -------------------------------------------------------------------------

  describe('standard report', () => {
    it('shows a prompt when no model is selected', async() => {
      const data = {
        ...baseFormData,
        report: { ...baseFormData.report, model: '' },
      };
      window.http.get.mockResolvedValue(data);
      await renderAndClickFilter(data);
      expect(screen.getByText(/Select a model on the Columns tab/)).toBeInTheDocument();
    });

    it('shows Record Filter heading when model is set', async() => {
      // ExpressionEditor will try to fetch /expression_editor/metadata — mock it
      window.http.get.mockImplementation((url) => {
        if (url.includes('expression_editor/metadata')) {
          return Promise.resolve({ fields: [] });
        }
        return Promise.resolve(baseFormData);
      });
      await renderAndClickFilter();
      await waitFor(() => {
        expect(screen.getByText(/Record Filter/)).toBeInTheDocument();
      });
    });

    it('shows Display Filter section heading', async() => {
      window.http.get.mockImplementation((url) => {
        if (url.includes('expression_editor/metadata')) {
          return Promise.resolve({ fields: [] });
        }
        return Promise.resolve(baseFormData);
      });
      await renderAndClickFilter();
      await waitFor(() => {
        expect(screen.getByText(/Display Filter/)).toBeInTheDocument();
      });
    });

    it('shows a hint when no columns are selected for display filter', async() => {
      window.http.get.mockImplementation((url) => {
        if (url.includes('expression_editor/metadata')) {
          return Promise.resolve({ fields: [] });
        }
        return Promise.resolve(baseFormData);
      });
      await renderAndClickFilter();
      await waitFor(() => {
        expect(screen.getByText(/Add columns first/)).toBeInTheDocument();
      });
    });
  });

  // -------------------------------------------------------------------------
  // Trend variant
  // -------------------------------------------------------------------------

  describe('trend report', () => {
    const trendData = {
      ...baseFormData,
      report_type: 'trend',
      report: {
        ...baseFormData.report,
        model: 'VimPerformanceTrend',
        db_options: { interval: 'daily', end_offset: 0, start_offset: 86400 },
      },
    };

    beforeEach(() => {
      window.http.get.mockResolvedValue(trendData);
    });

    it('shows Performance Timeframe heading for trend reports', async() => {
      await renderAndClickFilter(trendData);
      expect(screen.getByText('Performance Timeframe')).toBeInTheDocument();
    });

    it('renders end and start selects for trend', async() => {
      await renderAndClickFilter(trendData);
      expect(document.getElementById('perf_end')).toBeInTheDocument();
      expect(document.getElementById('perf_start')).toBeInTheDocument();
    });

    it('does NOT show an expression editor for trend', async() => {
      await renderAndClickFilter(trendData);
      expect(screen.queryByText(/Record Filter/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Display Filter/)).not.toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Performance variant
  // -------------------------------------------------------------------------

  describe('performance report', () => {
    const perfData = {
      ...baseFormData,
      report_type: 'performance',
      report: {
        ...baseFormData.report,
        model: 'VmPerformance',
        db_options: { interval: 'daily', end_offset: 0, start_offset: 86400 },
      },
    };

    beforeEach(() => {
      window.http.get.mockImplementation((url) => {
        if (url.includes('expression_editor/metadata')) {
          return Promise.resolve({ fields: [] });
        }
        return Promise.resolve(perfData);
      });
    });

    it('shows Performance Timeframe heading', async() => {
      await renderAndClickFilter(perfData);
      expect(screen.getByText('Performance Timeframe')).toBeInTheDocument();
    });

    it('renders end and start selects', async() => {
      await renderAndClickFilter(perfData);
      expect(document.getElementById('perf_end')).toBeInTheDocument();
      expect(document.getElementById('perf_start')).toBeInTheDocument();
    });

    it('shows "going back" label between selects', async() => {
      await renderAndClickFilter(perfData);
      expect(screen.getByText('going back')).toBeInTheDocument();
    });

    it('shows daily label for daily interval', async() => {
      await renderAndClickFilter(perfData);
      expect(screen.getByText('Show daily data from')).toBeInTheDocument();
    });

    it('shows hourly label for hourly interval', async() => {
      const hourlyData = {
        ...perfData,
        report: { ...perfData.report, db_options: { interval: 'hourly', end_offset: 0, start_offset: 3600 } },
      };
      window.http.get.mockImplementation((url) => {
        if (url.includes('expression_editor/metadata')) return Promise.resolve({ fields: [] });
        return Promise.resolve(hourlyData);
      });
      await renderAndClickFilter(hourlyData);
      expect(screen.getByText('Show hourly data from')).toBeInTheDocument();
    });

    it('shows the Primary (Record) Filter heading', async() => {
      await renderAndClickFilter(perfData);
      await waitFor(() => {
        expect(screen.getByText(/Primary \(Record\) Filter/)).toBeInTheDocument();
      });
    });

    it('renders an ExpressionEditor for the record filter', async() => {
      await renderAndClickFilter(perfData);
      await waitFor(() => {
        // ExpressionEditor renders when model is set; at minimum the section heading appears
        expect(screen.getByText(/Primary \(Record\) Filter/)).toBeInTheDocument();
      });
    });
  });

  // -------------------------------------------------------------------------
  // Chargeback variant
  // -------------------------------------------------------------------------

  describe('chargeback report', () => {
    const cbData = {
      ...baseFormData,
      report_type: 'chargeback',
      report: {
        ...baseFormData.report,
        model: 'ChargebackVm',
        db_options: { options: { interval: 'daily', groupby: 'date', interval_size: 1, end_interval_offset: 1 } },
      },
    };

    beforeEach(() => {
      window.http.get.mockImplementation((url) => {
        if (url.includes('react_chargeback_options')) {
          return Promise.resolve(cbOptions);
        }
        return Promise.resolve(cbData);
      });
    });

    it('calls react_chargeback_options endpoint', async() => {
      await renderAndClickFilter(cbData);
      await waitFor(() => {
        expect(window.http.get).toHaveBeenCalledWith(
          expect.stringContaining('react_chargeback_options')
        );
      });
    });

    it('shows Chargeback Filters heading', async() => {
      await renderAndClickFilter(cbData);
      await waitFor(() => {
        expect(screen.getByText('Chargeback Filters')).toBeInTheDocument();
      });
    });

    it('shows Chargeback Interval heading', async() => {
      await renderAndClickFilter(cbData);
      await waitFor(() => {
        expect(screen.getByText('Chargeback Interval')).toBeInTheDocument();
      });
    });

    it('renders cb_interval select', async() => {
      await renderAndClickFilter(cbData);
      await waitFor(() => {
        expect(document.getElementById('cb_interval')).toBeInTheDocument();
      });
    });

    it('renders cb_show_typ select', async() => {
      await renderAndClickFilter(cbData);
      await waitFor(() => {
        expect(document.getElementById('cb_show_typ')).toBeInTheDocument();
      });
    });

    it('renders cb_groupby select', async() => {
      await renderAndClickFilter(cbData);
      await waitFor(() => {
        expect(document.getElementById('cb_groupby')).toBeInTheDocument();
      });
    });

    it('shows Owner select when cb_show_typ = owner', async() => {
      const ownerData = {
        ...cbData,
        report: {
          ...cbData.report,
          db_options: {
            options: {
              owner: 'admin',
              interval: 'daily',
              groupby: 'date',
              interval_size: 1,
              end_interval_offset: 1,
            },
          },
        },
      };
      window.http.get.mockImplementation((url) => {
        if (url.includes('react_chargeback_options')) return Promise.resolve(cbOptions);
        return Promise.resolve(ownerData);
      });
      await renderAndClickFilter(ownerData);
      await waitFor(() => {
        expect(document.getElementById('cb_owner_id')).toBeInTheDocument();
      });
    });

    it('shows Include C&U Metrics toggle for ChargebackVm', async() => {
      await renderAndClickFilter(cbData);
      await waitFor(() => {
        expect(screen.getByText('Include Capacity & Utilization Metrics')).toBeInTheDocument();
      });
    });

    it('shows Include Cumulative Rate toggle for Chargeback models', async() => {
      await renderAndClickFilter(cbData);
      await waitFor(() => {
        expect(screen.getByText('Include Cumulative Rate Calculation')).toBeInTheDocument();
      });
    });

    it('shows Method for allocated metrics select for ChargebackVm', async() => {
      await renderAndClickFilter(cbData);
      await waitFor(() => {
        expect(screen.getByText('Method for allocated metrics')).toBeInTheDocument();
      });
    });

    it('shows timezone select', async() => {
      await renderAndClickFilter(cbData);
      await waitFor(() => {
        expect(document.getElementById('tz')).toBeInTheDocument();
      });
    });

    it('shows an error notification when options fail to load', async() => {
      window.http.get.mockImplementation((url) => {
        if (url.includes('react_chargeback_options')) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve(cbData);
      });
      await renderAndClickFilter(cbData);
      await waitFor(() => {
        expect(screen.getByText('Failed to load chargeback options.')).toBeInTheDocument();
      });
    });

    it('shows no-model prompt when model is empty', async() => {
      const noModelData = {
        ...cbData,
        report: { ...cbData.report, model: '' },
      };
      window.http.get.mockImplementation((url) => {
        if (url.includes('react_chargeback_options')) return Promise.resolve(cbOptions);
        return Promise.resolve(noModelData);
      });
      await renderAndClickFilter(noModelData);
      await waitFor(() => {
        expect(screen.getByText(/Select a model on the Columns tab/)).toBeInTheDocument();
      });
    });
  });
});
