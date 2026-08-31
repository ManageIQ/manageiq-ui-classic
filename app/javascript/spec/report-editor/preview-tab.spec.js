import { screen, waitFor, fireEvent } from '@testing-library/react';
import { renderWithRedux } from '../helpers/mountForm';
import ReportEditor from '../../components/report-editor';

// PreviewTab uses useFieldApi / useFormApi so it must be rendered inside MiqFormRenderer.
// We drive it through the full ReportEditor and navigate to the Preview tab.

const makeFormData = (overrides = {}) => ({
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
  models: [['Virtual Machines', 'Vm']],
  queue_timeout_options: [['(Use System Default)', null]],
  pdf_page_sizes: [],
  available_fields: [],
  field_metadata: {},
  ...overrides,
});

const renderAndOpenPreview = async(formData) => {
  renderWithRedux(<ReportEditor recordId="new" />);
  await waitFor(() => expect(screen.getAllByRole('tab').length).toBeGreaterThan(0));
  const previewTab = screen.getAllByRole('tab').find((t) => t.textContent.trim() === 'Preview');
  fireEvent.click(previewTab);
  await waitFor(() => {});
};

describe('PreviewTab (via ReportEditor)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initial state — no columns selected', () => {
    it('shows "Add columns first" hint when no columns are selected', async() => {
      window.http = {
        get: jest.fn(() => Promise.resolve(makeFormData())),
        post: jest.fn(),
      };
      await renderAndOpenPreview(makeFormData());
      // Use the specific preview-tab message to disambiguate from Summary/Styling tabs
      expect(screen.getByText('Add columns on the Columns tab, then click Refresh to preview.')).toBeInTheDocument();
    });

    it('does not show a Refresh button when no columns selected', async() => {
      window.http = {
        get: jest.fn(() => Promise.resolve(makeFormData())),
        post: jest.fn(),
      };
      await renderAndOpenPreview(makeFormData());
      // The Refresh button is always present; the hint text is what gates the empty state
      expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument();
    });
  });

  describe('Refresh button — with columns present', () => {
    const formDataWithCols = makeFormData({
      report: {
        name: 'My Report',
        title: 'My Title',
        model: 'Vm',
        col_order: ['Vm-name'],
        headers: ['Name'],
        col_formats: [''],
        col_options: { 'Vm-name': { header: 'Name', format: '' } },
        queue_timeout: null,
        db_options: {},
      },
      available_fields: [['Name', 'Vm-name']],
    });

    it('shows loading spinner while POST is in flight', async() => {
      let resolvePreview;
      window.http = {
        get: jest.fn(() => Promise.resolve(formDataWithCols)),
        post: jest.fn(() => new Promise((res) => { resolvePreview = res; })),
      };
      const { container } = renderWithRedux(<ReportEditor recordId="new" />);
      await waitFor(() => expect(screen.getAllByRole('tab').length).toBeGreaterThan(0));
      const previewTab = screen.getAllByRole('tab').find((t) => t.textContent.trim() === 'Preview');
      fireEvent.click(previewTab);
      await waitFor(() => {});
      fireEvent.click(screen.getByRole('button', { name: /refresh/i }));
      await waitFor(() => expect(container.querySelector('.cds--loading')).toBeInTheDocument());
      // Resolve so test cleanup doesn't leak
      resolvePreview({ columns: [], rows: [] });
    });

    it('renders a table when preview returns data', async() => {
      window.http = {
        get: jest.fn(() => Promise.resolve(formDataWithCols)),
        post: jest.fn(() =>
          Promise.resolve({
            columns: ['Name', 'Power State'],
            col_keys: ['Vm-name', 'Vm-power_state'],
            rows: [['My VM', 'on'], ['Other VM', 'off']],
          })
        ),
      };
      const { container } = renderWithRedux(<ReportEditor recordId="new" />);
      await waitFor(() => expect(screen.getAllByRole('tab').length).toBeGreaterThan(0));
      const previewTab = screen.getAllByRole('tab').find((t) => t.textContent.trim() === 'Preview');
      fireEvent.click(previewTab);
      await waitFor(() => {});
      fireEvent.click(screen.getByRole('button', { name: /refresh/i }));
      await waitFor(() => expect(screen.getByRole('table')).toBeInTheDocument());
      expect(screen.getByText('My VM')).toBeInTheDocument();
      expect(screen.getByText('Other VM')).toBeInTheDocument();
    });

    it('shows an error notification when the POST fails', async() => {
      window.http = {
        get: jest.fn(() => Promise.resolve(formDataWithCols)),
        post: jest.fn(() => Promise.reject(new Error('Network error'))),
      };
      renderWithRedux(<ReportEditor recordId="new" />);
      await waitFor(() => expect(screen.getAllByRole('tab').length).toBeGreaterThan(0));
      const previewTab = screen.getAllByRole('tab').find((t) => t.textContent.trim() === 'Preview');
      fireEvent.click(previewTab);
      await waitFor(() => {});
      fireEvent.click(screen.getByRole('button', { name: /refresh/i }));
      // The component renders err.message ('Network error') as the notification title
      await waitFor(() => {
        const alerts = screen.getAllByRole('alert');
        const errorAlert = alerts.find((el) => el.textContent.includes('Network error'));
        expect(errorAlert).toBeInTheDocument();
      });
    });

    it('shows "No data returned" when rows are empty', async() => {
      window.http = {
        get: jest.fn(() => Promise.resolve(formDataWithCols)),
        post: jest.fn(() => Promise.resolve({ columns: ['Name'], col_keys: ['Vm-name'], rows: [] })),
      };
      const { container } = renderWithRedux(<ReportEditor recordId="new" />);
      await waitFor(() => expect(screen.getAllByRole('tab').length).toBeGreaterThan(0));
      const previewTab = screen.getAllByRole('tab').find((t) => t.textContent.trim() === 'Preview');
      fireEvent.click(previewTab);
      await waitFor(() => {});
      fireEvent.click(screen.getByRole('button', { name: /refresh/i }));
      await waitFor(() => expect(screen.getByRole('table')).toBeInTheDocument());
      expect(screen.getByText('No data returned for this report.')).toBeInTheDocument();
    });
  });
});
