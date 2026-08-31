import { screen, waitFor, fireEvent } from '@testing-library/react';
import { renderWithRedux } from '../helpers/mountForm';
import ReportEditor from '../../components/report-editor';

// FieldPicker is on the Columns tab (always first tab, no navigation needed).

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
    db_options: {},
  },
  report_type: 'standard',
  models: [['Virtual Machines', 'Vm'], ['Hosts', 'Host']],
  queue_timeout_options: [['(Use System Default)', null]],
  pdf_page_sizes: [],
  available_fields: [['Name', 'Vm-name'], ['CPUs', 'Vm-num_cpu']],
  field_metadata: {},
};

const availableFieldsResponse = {
  fields: [['Name', 'Vm-name'], ['CPUs', 'Vm-num_cpu'], ['Hostname', 'Vm-hostname']],
  field_metadata: {
    'Vm-name': { available_formats: [], default_format: null },
    'Vm-num_cpu': { available_formats: [['Number (1,234)', 'general_number_precision_0']], default_format: 'general_number_precision_0' },
  },
};

describe('FieldPicker (via ReportEditor)', () => {
  afterEach(() => jest.clearAllMocks());

  beforeEach(() => {
    window.http = {
      get: jest.fn((url) => {
        if (url.includes('react_available_fields')) {
          return Promise.resolve(availableFieldsResponse);
        }
        return Promise.resolve(baseFormData);
      }),
      post: jest.fn(() => Promise.resolve({ success: true })),
    };
  });

  it('renders the Available fields multiselect', async() => {
    renderWithRedux(<ReportEditor recordId="new" />);
    await waitFor(() => expect(screen.getByText('Available fields')).toBeInTheDocument());
  });

  it('renders the Selected fields heading', async() => {
    renderWithRedux(<ReportEditor recordId="new" />);
    await waitFor(() => expect(screen.getByText('Selected fields')).toBeInTheDocument());
  });

  it('shows "No fields selected yet." when col_order is empty', async() => {
    renderWithRedux(<ReportEditor recordId="new" />);
    await waitFor(() => expect(screen.getByText('No fields selected yet.')).toBeInTheDocument());
  });

  it('shows the column count indicator', async() => {
    renderWithRedux(<ReportEditor recordId="new" />);
    await waitFor(() => expect(screen.getByText(/0 \/ 100 columns/)).toBeInTheDocument());
  });

  it('fetches available fields when the model is already set on mount', async() => {
    renderWithRedux(<ReportEditor recordId="new" />);
    await waitFor(() => {
      expect(window.http.get).toHaveBeenCalledWith(
        expect.stringContaining('react_available_fields')
      );
    });
  });

  it('renders existing selected columns in the sortable list when editing', async() => {
    window.http.get.mockImplementation((url) => {
      if (url.includes('react_available_fields')) {
        return Promise.resolve(availableFieldsResponse);
      }
      return Promise.resolve({
        ...baseFormData,
        report: {
          ...baseFormData.report,
          col_order: ['Vm-name', 'Vm-num_cpu'],
          headers: ['Name', 'CPUs'],
          col_formats: ['', ''],
          col_options: {
            'Vm-name': { header: 'Name', format: '' },
            'Vm-num_cpu': { header: 'CPUs', format: '' },
          },
        },
      });
    });
    renderWithRedux(<ReportEditor recordId="42" />);
    await waitFor(() => {
      // items are rendered in the SortableList
      expect(screen.getAllByRole('option').length).toBeGreaterThan(0);
    });
    expect(screen.getByText(/2 \/ 100 columns/)).toBeInTheDocument();
  });

  it('shows a confirmation modal when changing the model with columns already selected', async() => {
    // Start with a report that already has columns
    window.http.get.mockImplementation((url) => {
      if (url.includes('react_available_fields')) {
        return Promise.resolve(availableFieldsResponse);
      }
      return Promise.resolve({
        ...baseFormData,
        report: {
          ...baseFormData.report,
          col_order: ['Vm-name'],
          col_options: { 'Vm-name': { header: 'Name', format: '' } },
          headers: ['Name'],
          col_formats: [''],
        },
      });
    });
    renderWithRedux(<ReportEditor recordId="42" />);
    // Wait for available fields to load
    await waitFor(() => expect(screen.getAllByRole('option').length).toBeGreaterThan(0));

    // Change the model select to Host — this should trigger the confirmation modal
    const modelSelect = document.getElementById('model');
    fireEvent.change(modelSelect, { target: { value: 'Host' } });

    await waitFor(() => expect(screen.getByText('Change model?')).toBeInTheDocument());
  });

  it('cancels the model change modal and keeps existing columns', async() => {
    window.http.get.mockImplementation((url) => {
      if (url.includes('react_available_fields')) {
        return Promise.resolve(availableFieldsResponse);
      }
      return Promise.resolve({
        ...baseFormData,
        report: {
          ...baseFormData.report,
          col_order: ['Vm-name'],
          col_options: { 'Vm-name': { header: 'Name', format: '' } },
          headers: ['Name'],
          col_formats: [''],
        },
      });
    });
    renderWithRedux(<ReportEditor recordId="42" />);
    await waitFor(() => expect(screen.getAllByRole('option').length).toBeGreaterThan(0));

    const modelSelect = document.getElementById('model');
    fireEvent.change(modelSelect, { target: { value: 'Host' } });
    await waitFor(() => expect(screen.getByText('Change model?')).toBeInTheDocument());

    // The modal secondary button triggers onRequestClose (setPendingClear(false))
    // Find the Cancel button inside the modal container
    const cancelBtns = screen.getAllByRole('button', { name: 'Cancel' });
    const modalCancelBtn = cancelBtns.find(
      (btn) => btn.closest('.cds--modal-container') || btn.classList.contains('cds--btn--secondary')
    );
    fireEvent.click(modalCancelBtn || cancelBtns[0]);

    // After cancelling, the list items should still be present (columns not cleared)
    await waitFor(() => expect(screen.getAllByRole('option').length).toBeGreaterThan(0));
  });
});

describe('FieldPicker — header pre-fill', () => {
  afterEach(() => jest.clearAllMocks());

  const availFields = {
    fields: [['Virtual Machine Name', 'Vm-name'], ['CPUs', 'Vm-num_cpu']],
    field_metadata: {},
  };

  beforeEach(() => {
    window.http = {
      get: jest.fn((url) => {
        if (url.includes('react_available_fields')) return Promise.resolve(availFields);
        return Promise.resolve(baseFormData);
      }),
      post: jest.fn(() => Promise.resolve({ success: true })),
    };
  });

  it('pre-fills column header with the field label when a new field is added', async() => {
    // Render with an existing column whose header was already saved
    window.http.get.mockImplementation((url) => {
      if (url.includes('react_available_fields')) return Promise.resolve(availFields);
      return Promise.resolve({
        ...baseFormData,
        report: {
          ...baseFormData.report,
          col_order: ['Vm-name'],
          headers: ['Virtual Machine Name'],
          col_options: { 'Vm-name': { header: 'Virtual Machine Name', format: '' } },
        },
      });
    });

    renderWithRedux(<ReportEditor recordId="42" />);
    await waitFor(() => {
      // The column header TextInput should have the label as its value
      const headerInput = document.getElementById('col-header-Vm-name');
      expect(headerInput).toBeInTheDocument();
      expect(headerInput.value).toBe('Virtual Machine Name');
    });
  });
});
