import { screen, waitFor } from '@testing-library/react';
import { renderWithRedux } from '../helpers/mountForm';
import ReportEditor from '../../components/report-editor';

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
  },
  report_type: 'standard',
  models: [['Virtual Machines', 'Vm'], ['Hosts', 'Host']],
  queue_timeout_options: [['(Use System Default)', null], ['1 Hour', 3600]],
  pdf_page_sizes: [['US Letter', 'US-Letter'], ['A4', 'A4']],
  available_fields: [],
  field_metadata: {},
};

describe('ReportEditor component', () => {
  beforeEach(() => {
    window.http = {
      get: jest.fn(() => Promise.resolve(baseFormData)),
      post: jest.fn(() => Promise.resolve({ success: true, message: 'Report was saved' })),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('shows a loading spinner while fetching', () => {
    // Never resolve so loading state persists
    window.http.get.mockReturnValue(new Promise(() => {}));
    const { container } = renderWithRedux(<ReportEditor recordId="new" />);
    expect(container.querySelector('.cds--loading')).toBeInTheDocument();
  });

  it('shows an error notification when the fetch fails', async() => {
    window.http.get.mockRejectedValue(new Error('Network error'));
    renderWithRedux(<ReportEditor recordId="new" />);
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
    expect(screen.getByRole('alert')).toHaveTextContent('Failed to load report data');
  });

  const getTabNames = () => screen.getAllByRole('tab').map((t) => t.textContent.trim());

  it('renders all 6 tabs for a standard report', async() => {
    renderWithRedux(<ReportEditor recordId="new" />);
    await waitFor(() => {
      expect(screen.getAllByRole('tab').length).toBe(6);
    });
    const tabs = getTabNames();
    expect(tabs).toContain('Columns');
    expect(tabs).toContain('Filter');
    expect(tabs).toContain('Summary');
    expect(tabs).toContain('Charts');
    expect(tabs).toContain('Styling');
    expect(tabs).toContain('Preview');
  });

  it('renders only 3 tabs for a chargeback report', async() => {
    window.http.get.mockResolvedValue({ ...baseFormData, report_type: 'chargeback' });
    renderWithRedux(<ReportEditor recordId="42" />);
    await waitFor(() => {
      expect(screen.getAllByRole('tab').length).toBe(3);
    });
    const tabs = getTabNames();
    expect(tabs).toContain('Columns');
    expect(tabs).toContain('Filter');
    expect(tabs).toContain('Preview');
    expect(tabs).not.toContain('Summary');
    expect(tabs).not.toContain('Charts');
    expect(tabs).not.toContain('Styling');
  });

  it('renders all 6 tabs for a performance report', async() => {
    window.http.get.mockResolvedValue({ ...baseFormData, report_type: 'performance' });
    renderWithRedux(<ReportEditor recordId="42" />);
    await waitFor(() => {
      expect(screen.getAllByRole('tab').length).toBe(6);
    });
    const tabs = getTabNames();
    expect(tabs).toContain('Columns');
    expect(tabs).toContain('Filter');
    expect(tabs).toContain('Summary');
    expect(tabs).toContain('Charts');
    expect(tabs).toContain('Styling');
    expect(tabs).toContain('Preview');
  });

  it('renders the perf_interval and perf_avgs selects on the Columns tab for performance reports', async() => {
    window.http.get.mockResolvedValue({ ...baseFormData, report_type: 'performance' });
    renderWithRedux(<ReportEditor recordId="42" />);
    await waitFor(() => {
      expect(screen.getAllByRole('tab').length).toBe(6);
    });
    expect(document.getElementById('perf_interval')).toBeInTheDocument();
    expect(document.getElementById('perf_avgs')).toBeInTheDocument();
  });

  it('does NOT render perf_interval or perf_avgs selects for standard reports', async() => {
    renderWithRedux(<ReportEditor recordId="new" />);
    await waitFor(() => {
      expect(screen.getAllByRole('tab').length).toBe(6);
    });
    expect(document.getElementById('perf_interval')).not.toBeInTheDocument();
    expect(document.getElementById('perf_avgs')).not.toBeInTheDocument();
  });

  it('fetches from /new endpoint when recordId is new', async() => {
    renderWithRedux(<ReportEditor recordId="new" />);
    await waitFor(() => {
      expect(window.http.get).toHaveBeenCalledWith('/report/react_form_data/new');
    });
  });

  it('fetches from /:id endpoint when editing an existing record', async() => {
    renderWithRedux(<ReportEditor recordId="99" />);
    await waitFor(() => {
      expect(window.http.get).toHaveBeenCalledWith('/report/react_form_data/99');
    });
  });

  it('renders the Columns tab fields', async() => {
    renderWithRedux(<ReportEditor recordId="new" />);
    await waitFor(() => {
      expect(screen.getByText('Menu name')).toBeInTheDocument();
    });
    expect(screen.getByText('Title')).toBeInTheDocument();
  });

  it('renders Save and Cancel buttons', async() => {
    renderWithRedux(<ReportEditor recordId="new" />);
    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: 'Add' }).length).toBeGreaterThan(0);
    });
    expect(screen.getAllByRole('button', { name: 'Cancel' }).length).toBeGreaterThan(0);
  });

  it('renders Save button labelled "Save" when editing', async() => {
    renderWithRedux(<ReportEditor recordId="42" />);
    await waitFor(() => {
      expect(screen.getByText('Save')).toBeInTheDocument();
    });
  });
});
