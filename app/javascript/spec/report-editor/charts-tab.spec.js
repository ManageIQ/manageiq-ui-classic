import { screen, waitFor, fireEvent } from '@testing-library/react';
import { renderWithRedux } from '../helpers/mountForm';
import ReportEditor from '../../components/report-editor';

const makeFormData = (overrides = {}) => ({
  report: {
    name: 'My Report',
    title: 'My Title',
    model: 'Vm',
    col_order: ['Vm-name'],
    headers: ['Name'],
    col_formats: [''],
    col_options: { 'Vm-name': { header: 'Name', format: '' } },
    sortby: ['Vm-name'],
    order: 'Ascending',
    group: 'No',
    hide_details: false,
    row_limit: null,
    graph_type: '',
    graph_mode: 'counts',
    graph_column: '',
    graph_count: 10,
    graph_other: true,
    queue_timeout: null,
    db_options: {},
  },
  report_type: 'standard',
  models: [['Virtual Machines', 'Vm']],
  queue_timeout_options: [['(Use System Default)', null]],
  pdf_page_sizes: [],
  available_fields: [['Name', 'Vm-name']],
  field_metadata: { 'Vm-name': { numeric: false } },
  chart_types: [['Bar', 'Bar'], ['Column', 'Column'], ['Pie', 'Pie']],
  ...overrides,
});

const renderAndOpenTab = async(tabName, formDataFn = makeFormData) => {
  const formData = formDataFn();
  window.http = {
    get: jest.fn(() => Promise.resolve(formData)),
    post: jest.fn(() => Promise.resolve({ success: true })),
  };
  renderWithRedux(<ReportEditor recordId="new" />);
  await waitFor(() => expect(screen.getAllByRole('tab').length).toBeGreaterThan(0));
  const tab = screen.getAllByRole('tab').find((t) => t.textContent.trim() === tabName);
  fireEvent.click(tab);
  await waitFor(() => {});
};

describe('ChartsTab (via ReportEditor)', () => {
  afterEach(() => jest.clearAllMocks());

  it('shows the "sort required" hint when no primary sort is set', async() => {
    await renderAndOpenTab('Charts', () => makeFormData({
      report: {
        ...makeFormData().report,
        sortby: [],
      },
    }));
    expect(screen.getByText(/A sort field is required/)).toBeInTheDocument();
  });

  it('shows chart type tiles when a sort is set', async() => {
    await renderAndOpenTab('Charts');
    expect(screen.getByText('No Chart')).toBeInTheDocument();
    // chart tiles from chart_types fixture
    expect(screen.getByText('Bar')).toBeInTheDocument();
    expect(screen.getByText('Column')).toBeInTheDocument();
  });

  it('renders chart options after clicking a chart type', async() => {
    // Use a chart type that has no preview component to avoid jsdom SVG crash
    await renderAndOpenTab('Charts', () => makeFormData({
      chart_types: [['TestChart', 'TestChart']],
    }));
    const testTile = document.getElementById('chart-tile-TestChart');
    fireEvent.click(testTile);
    await waitFor(() => expect(screen.getByText('Chart mode')).toBeInTheDocument());
    expect(screen.getByText('Top values to show')).toBeInTheDocument();
    expect(screen.getByText("Sum 'Other' values")).toBeInTheDocument();
  });

  it('shows "Values" mode select with Counts and Values options', async() => {
    await renderAndOpenTab('Charts', () => makeFormData({
      chart_types: [['TestChart', 'TestChart']],
    }));
    const testTile = document.getElementById('chart-tile-TestChart');
    fireEvent.click(testTile);
    await waitFor(() => expect(document.getElementById('chart-mode')).toBeInTheDocument());
    const modeSelect = document.getElementById('chart-mode');
    expect(modeSelect.querySelectorAll('option').length).toBeGreaterThanOrEqual(2);
  });

  it('shows Data column select when mode is values', async() => {
    await renderAndOpenTab('Charts', () => makeFormData({
      report: {
        ...makeFormData().report,
        graph_type: 'TestChart',
        graph_mode: 'values',
        group: 'No',
      },
      chart_types: [['TestChart', 'TestChart']],
      field_metadata: { 'Vm-name': { numeric: true } },
    }));
    expect(document.getElementById('chart-column')).toBeInTheDocument();
  });

  it('shows Pie/Donut warning for Pie chart type', async() => {
    // Use a fake chart type that triggers the Pie/Donut path (startsWith Pie/Donut check)
    // The component uses ['Pie','Donut'].includes(graphType)
    await renderAndOpenTab('Charts', () => makeFormData({
      report: {
        ...makeFormData().report,
        graph_type: 'Pie',
      },
      // No Pie entry so no CHART_COMPONENTS preview for Pie renders in this path
      chart_types: [],
    }));
    expect(screen.getByText(/Pie and Donut charts are not recommended/)).toBeInTheDocument();
  });

  it('resets to No Chart when No Chart tile is clicked', async() => {
    await renderAndOpenTab('Charts', () => makeFormData({
      report: {
        ...makeFormData().report,
        graph_type: 'TestChart',
      },
      chart_types: [['TestChart', 'TestChart']],
    }));
    const noChartTile = document.getElementById('chart-tile-none');
    fireEvent.click(noChartTile);
    await waitFor(() => expect(screen.queryByText('Chart mode')).not.toBeInTheDocument());
  });
});
