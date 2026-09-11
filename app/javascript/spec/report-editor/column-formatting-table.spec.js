import { screen, waitFor } from '@testing-library/react';
import { renderWithRedux } from '../helpers/mountForm';
import ReportEditor from '../../components/report-editor';

// ColumnFormattingTable is rendered inside the Columns tab (no tab click needed).
// It appears when col_order is non-empty (schema condition: isNotEmpty).

const baseFormData = {
  report: {
    name: 'My Report',
    title: 'My Title',
    model: 'Vm',
    col_order: ['Vm-name', 'Vm-power_state'],
    headers: ['Name', 'Power State'],
    col_formats: ['', ''],
    col_options: {
      'Vm-name': { header: 'Name', format: '' },
      'Vm-power_state': { header: 'Power State', format: '' },
    },
    queue_timeout: null,
    db_options: {},
  },
  report_type: 'standard',
  models: [['Virtual Machines', 'Vm']],
  queue_timeout_options: [['(Use System Default)', null]],
  pdf_page_sizes: [],
  available_fields: [['Name', 'Vm-name'], ['Power State', 'Vm-power_state']],
  field_metadata: {
    'Vm-name': { available_formats: [], default_format: null },
    'Vm-power_state': { available_formats: [], default_format: null },
  },
};

// FieldPicker fetches available fields from react_available_fields on mount.
// field_metadata is populated via this fetch and stored in the FieldMetadataContext.
const availFieldsResponse = {
  fields: [['Name', 'Vm-name'], ['Power State', 'Vm-power_state']],
  field_metadata: {
    'Vm-name': { available_formats: [], default_format: null },
    'Vm-power_state': { available_formats: [], default_format: null },
  },
};

describe('ColumnFormattingTable (via ReportEditor)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(() => {
    window.http = {
      get: jest.fn((url) => {
        if (url.includes('react_available_fields')) {
          return Promise.resolve(availFieldsResponse);
        }
        return Promise.resolve(baseFormData);
      }),
      post: jest.fn(() => Promise.resolve({ success: true })),
    };
  });

  it('shows the table heading when columns are selected', async() => {
    renderWithRedux(<ReportEditor recordId="new" />);
    await waitFor(() => expect(screen.getByText('Column headers and formatting')).toBeInTheDocument());
  });

  it('renders a table row for each selected column', async() => {
    renderWithRedux(<ReportEditor recordId="new" />);
    await waitFor(() => expect(screen.getByText('Column headers and formatting')).toBeInTheDocument());
    // Column cells appear as <td> — use getAllByText since the label may also appear in selects
    expect(screen.getAllByText('Name').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Power State').length).toBeGreaterThan(0);
    // Confirm they appear as table cells specifically
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
    expect(table.querySelectorAll('tbody tr').length).toBe(2);
  });

  it('renders Column name, Header, and Format headers', async() => {
    renderWithRedux(<ReportEditor recordId="new" />);
    await waitFor(() => expect(screen.getByText('Column headers and formatting')).toBeInTheDocument());
    // The table headers are rendered as text nodes in the document
    expect(screen.getByText('Column name')).toBeInTheDocument();
    expect(screen.getByText('Header')).toBeInTheDocument();
    // 'Format' also appears in the PDF page size label but that's not rendered here
    expect(screen.getByText('Format')).toBeInTheDocument();
  });

  it('pre-populates header TextInput with the existing header value', async() => {
    renderWithRedux(<ReportEditor recordId="new" />);
    await waitFor(() => expect(screen.getByText('Column headers and formatting')).toBeInTheDocument());
    const nameHeaderInput = document.getElementById('col-header-Vm-name');
    expect(nameHeaderInput).toBeInTheDocument();
    expect(nameHeaderInput.value).toBe('Name');
  });

  it('does not show the table when col_order is empty', async() => {
    const emptyColsData = {
      ...baseFormData,
      report: {
        ...baseFormData.report,
        col_order: [],
        headers: [],
        col_formats: [],
        col_options: {},
      },
    };
    window.http.get.mockImplementation((url) => {
      if (url.includes('react_available_fields')) {
        return Promise.resolve({ fields: [], field_metadata: {} });
      }
      return Promise.resolve(emptyColsData);
    });
    renderWithRedux(<ReportEditor recordId="new" />);
    await waitFor(() => expect(screen.getAllByRole('tab').length).toBeGreaterThan(0));
    expect(screen.queryByText('Column headers and formatting')).not.toBeInTheDocument();
  });

  it('does not render a format select when field_metadata has no formats for a column', async() => {
    // When field_metadata has empty available_formats, no Select is rendered for that column
    renderWithRedux(<ReportEditor recordId="new" />);
    await waitFor(() => expect(screen.getByText('Column headers and formatting')).toBeInTheDocument());
    // available_formats is [] so no format select appears
    expect(document.getElementById('col-format-Vm-name')).not.toBeInTheDocument();
    expect(document.getElementById('col-format-Vm-power_state')).not.toBeInTheDocument();
  });

  it('renders a format Select dropdown when field_metadata has formats for a column', async() => {
    // Simulate the async fetch returning formats for one of the fields
    window.http.get.mockImplementation((url) => {
      if (url.includes('react_available_fields')) {
        return Promise.resolve({
          fields: [['Name', 'Vm-name'], ['Power State', 'Vm-power_state']],
          field_metadata: {
            'Vm-name': {
              available_formats: [['Boolean (True/False)', 'boolean'], ['Suffixed Bytes (B, KB, MB, GB)', 'bytes_human']],
              default_format: 'bytes_human',
            },
            'Vm-power_state': { available_formats: [], default_format: null },
          },
        });
      }
      return Promise.resolve(baseFormData);
    });

    renderWithRedux(<ReportEditor recordId="new" />);
    await waitFor(() => expect(screen.getByText('Column headers and formatting')).toBeInTheDocument());
    // After the fetch, a Select dropdown should appear for Vm-name (has formats)
    await waitFor(() => expect(document.getElementById('col-format-Vm-name')).toBeInTheDocument());
    // Vm-power_state has no formats so no Select
    expect(document.getElementById('col-format-Vm-power_state')).not.toBeInTheDocument();
    // The static options <None> and <Reset to Default> should be present
    expect(screen.getByText('<None>')).toBeInTheDocument();
    expect(screen.getByText('<Reset to Default>')).toBeInTheDocument();
    // The format options from the server should appear
    expect(screen.getByText('Boolean (True/False)')).toBeInTheDocument();
    expect(screen.getByText('Suffixed Bytes (B, KB, MB, GB)')).toBeInTheDocument();
  });
});
