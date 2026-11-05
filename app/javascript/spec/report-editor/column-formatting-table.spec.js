import {
  fireEvent, screen, waitFor, within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  makeFormData, mockApi, mockRoute, postedBody, renderEditor, requestsTo, resetFetchMock, waitForTabs,
} from '../helpers/reportEditor';

// ColumnFormattingTable is rendered inside the Columns tab (no tab click needed).
// It appears when col_order is non-empty (schema condition: isNotEmpty).

const baseFormData = makeFormData({
  report: {
    col_order: ['Vm-name', 'Vm-power_state'],
    headers: ['Name', 'Power State'],
    col_formats: ['', ''],
    col_options: {
      'Vm-name': { header: 'Name', format: '' },
      'Vm-power_state': { header: 'Power State', format: '' },
    },
  },
  models: [['Virtual Machines', 'Vm']],
  pdf_page_sizes: [],
  field_metadata: {
    'Vm-name': { available_formats: [], default_format: null },
    'Vm-power_state': { available_formats: [], default_format: null },
  },
});

// FieldPicker fetches available fields from available_fields on mount.
// field_metadata is populated via this fetch and stored in the FieldMetadataContext.
const availFieldsResponse = {
  fields: [['Name', 'Vm-name'], ['Power State', 'Vm-power_state']],
  field_metadata: baseFormData.field_metadata,
};

describe('ColumnFormattingTable (via ReportEditor)', () => {
  afterEach(resetFetchMock);

  beforeEach(() => {
    mockApi({ formData: baseFormData, availableFields: availFieldsResponse });
  });

  it('shows the table heading when columns are selected', async() => {
    renderEditor();
    await waitFor(() => expect(screen.getByText('Column headers and formatting')).toBeInTheDocument());
  });

  it('renders a table row for each selected column', async() => {
    renderEditor();
    await waitFor(() => expect(screen.getByText('Column headers and formatting')).toBeInTheDocument());
    // Column cells appear as <td> — use getAllByText since the label may also appear in selects
    expect(screen.getAllByText('Name').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Power State').length).toBeGreaterThan(0);
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
    expect(within(table).getAllByRole('row')).toHaveLength(3);
  });

  it('renders Column name, Header, and Format headers', async() => {
    renderEditor();
    await waitFor(() => expect(screen.getByText('Column headers and formatting')).toBeInTheDocument());
    expect(screen.getByText('Column name')).toBeInTheDocument();
    expect(screen.getByText('Header')).toBeInTheDocument();
    // 'Format' also appears in the PDF page size label but that's not rendered here
    expect(screen.getByText('Format')).toBeInTheDocument();
  });

  it('pre-populates header TextInput with the existing header value', async() => {
    renderEditor();
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
    mockApi({ formData: emptyColsData, availableFields: { fields: [], field_metadata: {} } });
    renderEditor();
    await waitFor(() => expect(screen.getAllByRole('tab').length).toBeGreaterThan(0));
    expect(screen.queryByText('Column headers and formatting')).not.toBeInTheDocument();
  });

  it('does not render a format select when field_metadata has no formats for a column', async() => {
    renderEditor();
    await waitFor(() => expect(screen.getByText('Column headers and formatting')).toBeInTheDocument());
    expect(document.getElementById('col-format-Vm-name')).not.toBeInTheDocument();
    expect(document.getElementById('col-format-Vm-power_state')).not.toBeInTheDocument();
  });

  it('renders a format Select dropdown when field_metadata has formats for a column', async() => {
    mockRoute('availableFields', {
      fields: [['Name', 'Vm-name'], ['Power State', 'Vm-power_state']],
      field_metadata: {
        'Vm-name': {
          available_formats: [['Boolean (True/False)', 'boolean'], ['Suffixed Bytes (B, KB, MB, GB)', 'bytes_human']],
          default_format: 'bytes_human',
        },
        'Vm-power_state': { available_formats: [], default_format: null },
      },
    });

    renderEditor();
    await waitFor(() => expect(screen.getByText('Column headers and formatting')).toBeInTheDocument());
    await waitFor(() => expect(document.getElementById('col-format-Vm-name')).toBeInTheDocument());
    expect(document.getElementById('col-format-Vm-power_state')).not.toBeInTheDocument();
    expect(screen.getByText('<None>')).toBeInTheDocument();
    expect(screen.getByText('<Reset to Default>')).toBeInTheDocument();
    expect(screen.getByText('Boolean (True/False)')).toBeInTheDocument();
    expect(screen.getByText('Suffixed Bytes (B, KB, MB, GB)')).toBeInTheDocument();
  });

  describe('editing', () => {
    const formats = [['Boolean (True/False)', 'boolean'], ['Suffixed Bytes (B, KB, MB, GB)', 'bytes_human']];
    const withFormats = {
      fields: [['Name', 'Vm-name'], ['Power State', 'Vm-power_state']],
      field_metadata: {
        'Vm-name': { available_formats: formats, default_format: 'bytes_human' },
        'Vm-power_state': { available_formats: [], default_format: null },
      },
    };

    it('edits a column header', async() => {
      const user = userEvent.setup();
      renderEditor();
      await waitFor(() => expect(document.getElementById('col-header-Vm-name')).toBeInTheDocument());

      await user.clear(document.getElementById('col-header-Vm-name'));
      await user.type(document.getElementById('col-header-Vm-name'), 'Server');

      expect(document.getElementById('col-header-Vm-name')).toHaveValue('Server');
      expect(document.getElementById('col-header-Vm-power_state')).toHaveValue('Power State');
    });

    it('limits a header to 40 characters', async() => {
      renderEditor();
      await waitFor(() => expect(document.getElementById('col-header-Vm-name')).toHaveAttribute('maxlength', '40'));
    });

    it('lists the none, reset and available formats', async() => {
      mockRoute('availableFields', withFormats);
      renderEditor();
      await waitFor(() => expect(document.getElementById('col-format-Vm-name')).toBeInTheDocument());

      const options = Array.from(document.getElementById('col-format-Vm-name').options).map((option) => option.value);
      expect(options).toEqual(['_none_', '', 'boolean', 'bytes_human']);
    });

    it('changes a column format', async() => {
      mockRoute('availableFields', withFormats);
      renderEditor();
      await waitFor(() => expect(document.getElementById('col-format-Vm-name')).toBeInTheDocument());

      fireEvent.change(document.getElementById('col-format-Vm-name'), { target: { value: 'boolean' } });

      await waitFor(() => expect(document.getElementById('col-format-Vm-name')).toHaveValue('boolean'));
    });

    it('saves the edited header and format with the report', async() => {
      const user = userEvent.setup();
      mockRoute('availableFields', withFormats);
      renderEditor({ recordId: '9' });
      await waitFor(() => expect(document.getElementById('col-format-Vm-name')).toBeInTheDocument());
      await user.clear(document.getElementById('col-header-Vm-name'));
      await user.type(document.getElementById('col-header-Vm-name'), 'Server');
      fireEvent.change(document.getElementById('col-format-Vm-name'), { target: { value: 'bytes_human' } });
      await waitFor(() => expect(document.getElementById('col-format-Vm-name')).toHaveValue('bytes_human'));

      await user.click(screen.getAllByRole('button', { name: 'Save' })[0]);
      await waitFor(() => expect(requestsTo('/report/save/')).toHaveLength(1));

      const { report_data: data } = postedBody('/report/save/');
      expect(data.headers).toEqual(['Server', 'Power State']);
      expect(data.col_formats).toEqual(['bytes_human', '']);
    });

    it('falls back to the column ids as names when the available fields are unknown', async() => {
      mockRoute('availableFields', { fields: [], field_metadata: {} });
      renderEditor();
      await waitForTabs();

      await waitFor(() => expect(within(screen.getByRole('table')).getByText('Vm-name')).toBeInTheDocument());
      expect(within(screen.getByRole('table')).getByText('Vm-power_state')).toBeInTheDocument();
    });
  });
});
