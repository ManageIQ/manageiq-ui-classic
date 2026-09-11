import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRedux } from '../helpers/mountForm';
import ReportEditor from '../../components/report-editor';
import miqRedirectBack from '../../helpers/miq-redirect-back';

// Full form data with all fields populated so onSubmit receives complete values.
// col_order is kept empty to avoid triggering the SortableList drag widget
// (which is tested separately; here we only care about the POST payload shape).
const fullFormData = {
  report: {
    name: 'Full Report',
    title: 'Full Report Title',
    model: 'Vm',
    col_order: [],
    headers: [],
    col_formats: [],
    col_options: {
      name: { header: 'Name', format: '' },
      power_state: { header: 'Power State', format: '' },
    },
    sortby: ['name'],
    order: 'Ascending',
    group: 'No',
    hide_details: false,
    row_limit: 100,
    // graph_type left empty to avoid carbon-charts SVG rendering in jsdom
    graph_type: '',
    graph_mode: 'counts',
    graph_column: '',
    graph_count: 10,
    graph_other: true,
    pdf_page_size: 'US-Letter',
    queue_timeout: 3600,
    db_options: {},
  },
  report_type: 'standard',
  models: [['Virtual Machines', 'Vm']],
  queue_timeout_options: [['1 Hour', 3600]],
  pdf_page_sizes: [['US Letter', 'US-Letter']],
  available_fields: [],
  field_metadata: {},
};

const submitAndCapture = async() => {
  const user = userEvent.setup();
  renderWithRedux(<ReportEditor recordId="new" />);
  await waitFor(() => expect(screen.getAllByRole('tab').length).toBeGreaterThan(0));

  // Find and click the Add/submit button
  const submitButtons = screen.getAllByRole('button', { name: /^Add$/i });
  await user.click(submitButtons[0]);

  await waitFor(() => {
    expect(window.http.post).toHaveBeenCalled();
  });

  const [url, body] = window.http.post.mock.calls[0];
  return { url, reportData: body.report_data };
};

describe('ReportEditor submit integration', () => {
  beforeEach(() => {
    window.http = {
      get: jest.fn(() => Promise.resolve(fullFormData)),
      post: jest.fn(() => Promise.resolve({ success: true, message: 'Report was saved' })),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('complete payload', () => {
    it('sends all required fields in the POST body', async() => {
      const { reportData } = await submitAndCapture();

      // basics
      expect(reportData).toHaveProperty('name');
      expect(reportData).toHaveProperty('title');
      expect(reportData).toHaveProperty('model');
      expect(reportData).toHaveProperty('queue_timeout');
      expect(reportData).toHaveProperty('pdf_page_size');

      // columns
      expect(reportData).toHaveProperty('col_order');
      expect(reportData).toHaveProperty('headers');
      expect(reportData).toHaveProperty('col_formats');
      expect(reportData).toHaveProperty('col_options');

      // filters
      expect(reportData).toHaveProperty('record_filter');
      expect(reportData).toHaveProperty('display_filter');

      // summary / sort
      expect(reportData).toHaveProperty('sortby');
      expect(reportData).toHaveProperty('order');
      expect(reportData).toHaveProperty('group');
      expect(reportData).toHaveProperty('row_limit');

      // charts
      expect(reportData).toHaveProperty('graph_type');
      expect(reportData).toHaveProperty('graph_mode');
      expect(reportData).toHaveProperty('graph_column');
      expect(reportData).toHaveProperty('graph_count');
      expect(reportData).toHaveProperty('graph_other');

      // chargeback fields
      expect(reportData).toHaveProperty('cb_show_typ');
      expect(reportData).toHaveProperty('cb_owner_id');
      expect(reportData).toHaveProperty('cb_groupby');
      expect(reportData).toHaveProperty('cb_interval');

      // consolidation
      expect(reportData).toHaveProperty('pivot_by1');
      expect(reportData).toHaveProperty('pivot_by2');
      expect(reportData).toHaveProperty('pivot_by3');
      expect(reportData).toHaveProperty('pivot_cols');
    });

    it('posts to /report/react_save/new for new records', async() => {
      const { url } = await submitAndCapture();
      expect(url).toBe('/report/react_save/new');
    });

    it('posts to /report/react_save/:id when editing', async() => {
      const user = userEvent.setup();
      renderWithRedux(<ReportEditor recordId="77" />);
      await waitFor(() => expect(screen.getAllByRole('tab').length).toBeGreaterThan(0));

      const submitButtons = screen.getAllByRole('button', { name: /^Save$/i });
      await user.click(submitButtons[0]);

      await waitFor(() => expect(window.http.post).toHaveBeenCalled());
      const [url] = window.http.post.mock.calls[0];
      expect(url).toBe('/report/react_save/77');
    });

    it('parses queue_timeout as an integer', async() => {
      const { reportData } = await submitAndCapture();
      expect(typeof reportData.queue_timeout).toBe('number');
      expect(reportData.queue_timeout).toBe(3600);
    });

    it('includes row_limit key in payload', async() => {
      const { reportData } = await submitAndCapture();
      // row_limit is always included in the payload (may be null if form has no DDF field for it)
      expect(Object.prototype.hasOwnProperty.call(reportData, 'row_limit')).toBe(true);
    });

    it('builds headers array from col_options', async() => {
      const { reportData } = await submitAndCapture();
      // col_order is [] so headers derive to an empty array
      expect(Array.isArray(reportData.headers)).toBe(true);
    });

    it('builds col_formats array from col_options', async() => {
      const { reportData } = await submitAndCapture();
      expect(Array.isArray(reportData.col_formats)).toBe(true);
    });
  });

  describe('loading state', () => {
    it('calls miqRedirectBack on success', async() => {
      await submitAndCapture();
      await waitFor(() => {
        expect(miqRedirectBack).toHaveBeenCalledWith(
          'Report was saved',
          'success',
          '/report/explorer'
        );
      });
    });

    it('shows an InlineNotification on error response', async() => {
      window.http.post.mockResolvedValue({ success: false, message: 'Validation failed' });
      renderWithRedux(<ReportEditor recordId="new" />);
      await waitFor(() => expect(screen.getAllByRole('tab').length).toBeGreaterThan(0));

      const user = userEvent.setup();
      const submitButtons = screen.getAllByRole('button', { name: /^Add$/i });
      await user.click(submitButtons[0]);

      await waitFor(() => {
        expect(screen.getAllByRole('alert').length).toBeGreaterThan(0);
      });
      const alerts = screen.getAllByRole('alert');
      const flashAlert = alerts.find((el) => el.textContent.includes('Validation failed'));
      expect(flashAlert).toBeInTheDocument();
    });

    it('shows an InlineNotification on network error', async() => {
      window.http.post.mockRejectedValue(new Error('Network failure'));
      renderWithRedux(<ReportEditor recordId="new" />);
      await waitFor(() => expect(screen.getAllByRole('tab').length).toBeGreaterThan(0));

      const user = userEvent.setup();
      const submitButtons = screen.getAllByRole('button', { name: /^Add$/i });
      await user.click(submitButtons[0]);

      await waitFor(() => {
        // At least one error alert should appear (the flashError from failed submit)
        const alerts = screen.getAllByRole('alert');
        expect(alerts.length).toBeGreaterThan(0);
      });
    });
  });
});
