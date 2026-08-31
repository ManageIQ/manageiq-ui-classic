import { screen, waitFor, fireEvent } from '@testing-library/react';
import { renderWithRedux } from '../helpers/mountForm';
import ReportEditor from '../../components/report-editor';

const makeFormData = (overrides = {}) => ({
  report: {
    name: 'My Report',
    title: 'My Title',
    model: 'Vm',
    col_order: ['Vm-name', 'Vm-num_cpu'],
    headers: ['Name', 'CPUs'],
    col_formats: ['', ''],
    col_options: {
      'Vm-name': { header: 'Name', format: '' },
      'Vm-num_cpu': { header: 'CPUs', format: '' },
    },
    sortby: [],
    order: 'Ascending',
    group: 'No',
    hide_details: false,
    row_limit: null,
    queue_timeout: null,
    db_options: {},
  },
  report_type: 'standard',
  models: [['Virtual Machines', 'Vm']],
  queue_timeout_options: [['(Use System Default)', null]],
  pdf_page_sizes: [],
  available_fields: [['Name', 'Vm-name'], ['CPUs', 'Vm-num_cpu']],
  field_metadata: {},
  field_metadata: {
    'Vm-name': { numeric: false, break_suffixes: [], available_formats: [] },
    'Vm-num_cpu': { numeric: true, break_suffixes: [], available_formats: [] },
  },
  ...overrides,
});

const renderAndOpenSummary = async(formDataFn = makeFormData) => {
  const formData = formDataFn();
  window.http = {
    get: jest.fn(() => Promise.resolve(formData)),
    post: jest.fn(() => Promise.resolve({ success: true })),
  };
  renderWithRedux(<ReportEditor recordId="new" />);
  await waitFor(() => expect(screen.getAllByRole('tab').length).toBeGreaterThan(0));
  const summaryTab = screen.getAllByRole('tab').find((t) => t.textContent.trim() === 'Summary');
  fireEvent.click(summaryTab);
  await waitFor(() => {});
};

describe('SummaryTab (via ReportEditor)', () => {
  afterEach(() => jest.clearAllMocks());

  it('shows "Add columns first" prompt when no columns are selected', async() => {
    await renderAndOpenSummary(() => makeFormData({
      report: {
        ...makeFormData().report,
        col_order: [],
        col_options: {},
        headers: [],
        col_formats: [],
      },
      available_fields: [],
    }));
    // Use specific text to disambiguate from the Styling/Preview tab messages
    expect(screen.getByText('Add columns on the Columns tab to configure summary options.')).toBeInTheDocument();
  });

  it('shows Sort Criteria section when columns are present', async() => {
    await renderAndOpenSummary();
    expect(screen.getByText('Sort Criteria')).toBeInTheDocument();
  });

  it('renders a sort-by select with column options', async() => {
    await renderAndOpenSummary();
    expect(document.getElementById('summary-sort-1')).toBeInTheDocument();
  });

  it('shows Sort Order select after selecting a primary sort column', async() => {
    await renderAndOpenSummary();
    // Change the sort-by select to the first real column
    const sortSelect = document.getElementById('summary-sort-1');
    fireEvent.change(sortSelect, { target: { value: 'Vm-name' } });
    await waitFor(() => expect(document.getElementById('summary-order')).toBeInTheDocument());
  });

  it('shows Show Sort Breaks select after selecting a primary sort', async() => {
    await renderAndOpenSummary();
    const sortSelect = document.getElementById('summary-sort-1');
    fireEvent.change(sortSelect, { target: { value: 'Vm-name' } });
    await waitFor(() => expect(document.getElementById('summary-group')).toBeInTheDocument());
  });

  it('shows secondary sort select after selecting a primary sort', async() => {
    await renderAndOpenSummary();
    const sortSelect = document.getElementById('summary-sort-1');
    fireEvent.change(sortSelect, { target: { value: 'Vm-name' } });
    await waitFor(() => expect(document.getElementById('summary-sort-2')).toBeInTheDocument());
  });

  it('shows Number of Rows select (row_limit) when breaks are off', async() => {
    await renderAndOpenSummary();
    const sortSelect = document.getElementById('summary-sort-1');
    fireEvent.change(sortSelect, { target: { value: 'Vm-name' } });
    await waitFor(() => expect(document.getElementById('summary-row-limit')).toBeInTheDocument());
  });

  it('shows Hide Detail Rows toggle when group breaks are on', async() => {
    // Initialise col_options with grouping as arrays to avoid normalizeSelected crash
    await renderAndOpenSummary(() => makeFormData({
      report: {
        ...makeFormData().report,
        sortby: ['Vm-name'],
        group: 'Yes',
        col_options: {
          'Vm-name': { header: 'Name', format: '', grouping: [] },
          'Vm-num_cpu': { header: 'CPUs', format: '', grouping: [] },
        },
      },
    }));
    await waitFor(() => expect(document.getElementById('summary-hide-details')).toBeInTheDocument());
  });

  it('shows Break Calculations table when group is Yes and sort is set', async() => {
    await renderAndOpenSummary(() => makeFormData({
      report: {
        ...makeFormData().report,
        sortby: ['Vm-name'],
        group: 'Yes',
        col_options: {
          'Vm-name': { header: 'Name', format: '', grouping: [] },
          'Vm-num_cpu': { header: 'CPUs', format: '', grouping: [] },
        },
      },
      field_metadata: {
        'Vm-name': { numeric: false },
        'Vm-num_cpu': { numeric: true },
      },
    }));
    await waitFor(() => expect(screen.getByText('Break Calculations')).toBeInTheDocument());
  });

  it('shows Consolidation accordion section', async() => {
    await renderAndOpenSummary();
    expect(screen.getByText('Group Records (Consolidation)')).toBeInTheDocument();
  });

  it('shows pivot column selects inside Consolidation accordion', async() => {
    await renderAndOpenSummary();
    expect(document.getElementById('summary-pivot-1')).toBeInTheDocument();
  });

  it('shows Group by Column 2 after selecting pivot column 1', async() => {
    await renderAndOpenSummary();
    const pivot1 = document.getElementById('summary-pivot-1');
    fireEvent.change(pivot1, { target: { value: 'Vm-name' } });
    await waitFor(() => expect(document.getElementById('summary-pivot-2')).toBeInTheDocument());
  });
});
