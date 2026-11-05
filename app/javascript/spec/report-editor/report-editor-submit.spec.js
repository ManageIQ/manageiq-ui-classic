import {
  fireEvent, screen, waitFor, within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  PENDING, makeFormData, mockApi, mockRoute, postedBody, renderEditor, requestsTo, resetFetchMock, waitForTabs,
} from '../helpers/reportEditor';
import miqRedirectBack from '../../helpers/miq-redirect-back';

// Full form data with all fields populated so onSubmit receives complete values.
const fullFormData = makeFormData({
  report: {
    name: 'Full Report',
    title: 'Full Report Title',
    col_order: ['Vm-name', 'Vm-num_cpu'],
    headers: ['VM Name', 'CPUs'],
    col_formats: ['', 'general_number_precision_0'],
    col_options: {
      'Vm-name': { header: 'VM Name', format: '' },
      'Vm-num_cpu': { header: 'CPUs', format: 'general_number_precision_0' },
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
    queue_timeout: 3600,
  },
  models: [['Virtual Machines', 'Vm']],
  queue_timeout_options: [['1 Hour', 3600]],
  pdf_page_sizes: [['US Letter', 'US-Letter']],
});

const submitAndCapture = async() => {
  const user = userEvent.setup();
  renderEditor();
  await waitForTabs();

  const submitButtons = screen.getAllByRole('button', { name: /^Add$/i });
  await user.click(submitButtons[0]);

  await waitFor(() => expect(requestsTo('/report/save/')).toHaveLength(1));

  const [[url]] = requestsTo('/report/save/');
  return { url, reportData: postedBody('/report/save/').report_data };
};

describe('ReportEditor submit integration', () => {
  beforeEach(() => {
    miqRedirectBack.mockClear();
    mockApi({ formData: fullFormData });
  });

  afterEach(resetFetchMock);

  describe('complete payload', () => {
    it('sends all required fields in the POST body', async() => {
      const { reportData } = await submitAndCapture();

      expect(reportData).toHaveProperty('name');
      expect(reportData).toHaveProperty('title');
      expect(reportData).toHaveProperty('model');
      expect(reportData).toHaveProperty('queue_timeout');

      expect(reportData).toHaveProperty('col_order');
      expect(reportData).toHaveProperty('headers');
      expect(reportData).toHaveProperty('col_formats');
      expect(reportData).toHaveProperty('col_options');

      expect(reportData).toHaveProperty('record_filter');
      expect(reportData).toHaveProperty('display_filter');

      expect(reportData).toHaveProperty('sortby');
      expect(reportData).toHaveProperty('order');
      expect(reportData).toHaveProperty('group');
      expect(reportData).toHaveProperty('row_limit');

      expect(reportData).toHaveProperty('graph_type');
      expect(reportData).toHaveProperty('graph_mode');
      expect(reportData).toHaveProperty('graph_column');
      expect(reportData).toHaveProperty('graph_count');
      expect(reportData).toHaveProperty('graph_other');

      expect(reportData).toHaveProperty('cb_show_typ');
      expect(reportData).toHaveProperty('cb_owner_id');
      expect(reportData).toHaveProperty('cb_groupby');
      expect(reportData).toHaveProperty('cb_interval');

      expect(reportData).toHaveProperty('pivot_by1');
      expect(reportData).toHaveProperty('pivot_by2');
      expect(reportData).toHaveProperty('pivot_by3');
    });

    it('sends no consolidation calculations when none are chosen', async() => {
      const { reportData } = await submitAndCapture();
      expect(reportData.pivot_cols).toEqual({});
    });

    it('posts to /report/save/new for new records', async() => {
      const { url } = await submitAndCapture();
      expect(url).toBe('/report/save/new');
    });

    it('posts to /report/save/:id when editing', async() => {
      const user = userEvent.setup();
      renderEditor({ recordId: '77' });
      await waitForTabs();
      fireEvent.change(document.getElementById('name'), { target: { value: 'Renamed' } });
      await waitFor(() => expect(screen.getAllByRole('button', { name: /^Save$/i })[0]).toBeEnabled());

      const submitButtons = screen.getAllByRole('button', { name: /^Save$/i });
      await user.click(submitButtons[0]);

      await waitFor(() => expect(requestsTo('/report/save/')).toHaveLength(1));
      expect(requestsTo('/report/save/')[0][0]).toBe('/report/save/77');
    });

    it('parses queue_timeout and row_limit as integers', async() => {
      const { reportData } = await submitAndCapture();
      expect(reportData.queue_timeout).toBe(3600);
      expect(reportData.row_limit).toBe(100);
    });

    it('sends the selected columns with headers and formats in column order', async() => {
      const { reportData } = await submitAndCapture();
      expect(reportData.col_order).toEqual(['Vm-name', 'Vm-num_cpu']);
      expect(reportData.headers).toEqual(['VM Name', 'CPUs']);
      expect(reportData.col_formats).toEqual(['', 'general_number_precision_0']);
    });

    it('sends the report identity and sort settings from the form data', async() => {
      const { reportData } = await submitAndCapture();
      expect(reportData).toMatchObject({
        name: 'Full Report',
        title: 'Full Report Title',
        model: 'Vm',
        sortby: ['name'],
        order: 'Ascending',
        group: 'No',
      });
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
      mockRoute('save', { success: false, message: 'Validation failed' });
      renderEditor();
      await waitForTabs();

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
      mockRoute('save', { throws: new Error('Network failure') });
      renderEditor();
      await waitForTabs();

      const user = userEvent.setup();
      const submitButtons = screen.getAllByRole('button', { name: /^Add$/i });
      await user.click(submitButtons[0]);

      await waitFor(() => {
        const alerts = screen.getAllByRole('alert');
        expect(alerts.find((el) => el.textContent.includes('Network failure'))).toBeInTheDocument();
      });
    });

    it('uses the server message from a rejected save', async() => {
      mockRoute('save', { status: 422, body: { success: false, message: 'Name has already been taken' } });
      renderEditor();
      await waitForTabs();

      await userEvent.setup().click(screen.getAllByRole('button', { name: /^Add$/i })[0]);

      await waitFor(() => {
        expect(screen.getAllByRole('alert').find((el) => el.textContent.includes('Name has already been taken'))).toBeInTheDocument();
      });
    });

    it('falls back to a generic message when the save fails without one', async() => {
      mockRoute('save', { success: false });
      renderEditor();
      await waitForTabs();

      await userEvent.setup().click(screen.getAllByRole('button', { name: /^Add$/i })[0]);

      await waitFor(() => {
        expect(screen.getAllByRole('alert').find((el) => el.textContent.includes('An error occurred while saving'))).toBeInTheDocument();
      });
    });

    it('uses the default success message when the server sends none', async() => {
      mockRoute('save', { success: true });
      renderEditor();
      await waitForTabs();

      await userEvent.setup().click(screen.getAllByRole('button', { name: /^Add$/i })[0]);

      await waitFor(() => expect(miqRedirectBack).toHaveBeenCalledWith('Report was saved', 'success', '/report/explorer'));
    });

    it('uses the server success message when there is one', async() => {
      mockRoute('save', { success: true, message: 'Report "Full Report" was added' });
      renderEditor();
      await waitForTabs();

      await userEvent.setup().click(screen.getAllByRole('button', { name: /^Add$/i })[0]);

      await waitFor(() => expect(miqRedirectBack).toHaveBeenCalledWith(
        'Report "Full Report" was added',
        'success',
        '/report/explorer',
      ));
    });

    it('falls back to a generic message when a rejected save carries no message', async() => {
      mockRoute('save', { status: 500, body: {} });
      renderEditor();
      await waitForTabs();

      await userEvent.setup().click(screen.getAllByRole('button', { name: /^Add$/i })[0]);

      await waitFor(() => {
        expect(screen.getAllByRole('alert').find((el) => el.textContent.includes('An error occurred while saving'))).toBeInTheDocument();
      });
      expect(miqRedirectBack).not.toHaveBeenCalled();
    });

    it('lets the form be submitted again after a failed save', async() => {
      mockRoute('save', { success: false, message: 'Validation failed' });
      renderEditor();
      await waitForTabs();
      const user = userEvent.setup();

      await user.click(screen.getAllByRole('button', { name: /^Add$/i })[0]);
      await waitFor(() => expect(screen.getByText('Validation failed')).toBeInTheDocument());

      expect(screen.getAllByRole('button', { name: /^Add$/i })[0]).toBeEnabled();
    });

    it('dismisses the error notification', async() => {
      mockRoute('save', { success: false, message: 'Validation failed' });
      renderEditor();
      const user = userEvent.setup();
      await waitForTabs();
      await user.click(screen.getAllByRole('button', { name: /^Add$/i })[0]);
      const alert = await waitFor(() => {
        const found = screen.getAllByRole('alert').find((el) => el.textContent.includes('Validation failed'));
        expect(found).toBeInTheDocument();
        return found;
      });

      await user.click(within(alert).getByRole('button'));

      await waitFor(() => expect(screen.queryByText('Validation failed')).not.toBeInTheDocument());
    });

    it('clears the previous error when the form is submitted again', async() => {
      mockRoute('save', { success: false, message: 'Validation failed' });
      renderEditor();
      const user = userEvent.setup();
      await waitForTabs();
      await user.click(screen.getAllByRole('button', { name: /^Add$/i })[0]);
      await waitFor(() => expect(screen.getByText('Validation failed')).toBeInTheDocument());

      mockRoute('save', { success: true, message: 'Report was saved' });
      await user.click(screen.getAllByRole('button', { name: /^Add$/i })[0]);

      await waitFor(() => expect(miqRedirectBack).toHaveBeenCalledWith('Report was saved', 'success', '/report/explorer'));
      expect(screen.queryByText('Validation failed')).not.toBeInTheDocument();
    });

    it('does not post again while a save is in progress', async() => {
      mockRoute('save', PENDING);
      renderEditor();
      const user = userEvent.setup();
      await waitForTabs();

      await user.click(screen.getAllByRole('button', { name: /^Add$/i })[0]);
      await waitFor(() => expect(requestsTo('/report/save/')).toHaveLength(1));
      await user.click(screen.getAllByRole('button', { name: /^Add$/i })[0]);

      expect(requestsTo('/report/save/')).toHaveLength(1);
    });
  });
});
