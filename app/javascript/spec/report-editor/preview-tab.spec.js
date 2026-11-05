import { screen, waitFor, fireEvent } from '@testing-library/react';
import {
  PENDING, makeFormData, mockRoute, postedBody, renderAndOpenTab, requestsTo, resetFetchMock,
} from '../helpers/reportEditor';

// PreviewTab uses useFieldApi / useFormApi so it must be rendered inside MiqFormRenderer.
// We drive it through the full ReportEditor and navigate to the Preview tab.

const openPreview = (formData = makeFormData()) => renderAndOpenTab('Preview', { formData });

const clickRefresh = () => fireEvent.click(screen.getByRole('button', { name: /refresh/i }));

describe('PreviewTab (via ReportEditor)', () => {
  afterEach(resetFetchMock);

  describe('initial state — no columns selected', () => {
    it('shows "Add columns first" hint when no columns are selected', async() => {
      await openPreview();
      // Use the specific preview-tab message to disambiguate from Summary/Styling tabs
      expect(screen.getByText('Add columns on the Columns tab, then click Refresh to preview.')).toBeInTheDocument();
    });

    it('still shows a Refresh button when no columns are selected', async() => {
      await openPreview();
      // The Refresh button is always present; the hint text is what gates the empty state
      expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument();
    });

    it('does not request a preview until Refresh is clicked', async() => {
      await openPreview();
      expect(requestsTo('/report/preview')).toHaveLength(0);
    });

    it('does not request a preview when Refresh is clicked without columns', async() => {
      await openPreview();

      clickRefresh();

      expect(requestsTo('/report/preview')).toHaveLength(0);
      expect(screen.getByText('Add columns on the Columns tab, then click Refresh to preview.')).toBeInTheDocument();
    });
  });

  describe('Refresh button — with columns present', () => {
    const formDataWithCols = makeFormData({
      report: {
        col_order: ['Vm-name'],
        headers: ['Name'],
        col_formats: [''],
        col_options: { 'Vm-name': { header: 'Name', format: '' } },
      },
    });

    const openPreviewWithCols = (preview) => renderAndOpenTab('Preview', { formData: formDataWithCols, preview });

    it('shows loading spinner while POST is in flight', async() => {
      const { container } = await openPreviewWithCols(PENDING);
      clickRefresh();
      await waitFor(() => expect(container.querySelector('.cds--loading')).toBeInTheDocument());
    });

    it('posts the current report settings', async() => {
      await openPreviewWithCols({ columns: [], rows: [] });
      clickRefresh();
      await waitFor(() => expect(requestsTo('/report/preview')).toHaveLength(1));
      const { report_data: reportData } = postedBody('/report/preview');
      expect(reportData).toMatchObject({ model: 'Vm', col_order: ['Vm-name'], headers: ['Name'] });
    });

    it('renders a table when preview returns data', async() => {
      await openPreviewWithCols({
        columns: ['Name', 'Power State'],
        col_keys: ['Vm-name', 'Vm-power_state'],
        rows: [['My VM', 'on'], ['Other VM', 'off']],
      });
      clickRefresh();
      await waitFor(() => expect(screen.getByRole('table')).toBeInTheDocument());
      expect(screen.getByText('My VM')).toBeInTheDocument();
      expect(screen.getByText('Other VM')).toBeInTheDocument();
    });

    it('shows an error notification when the POST fails', async() => {
      await openPreviewWithCols({ throws: new Error('Network error') });
      clickRefresh();
      await waitFor(() => {
        const alerts = screen.getAllByRole('alert');
        expect(alerts.find((el) => el.textContent.includes('Network error'))).toBeInTheDocument();
      });
    });

    it('shows the server message when the preview is rejected', async() => {
      await openPreviewWithCols({ status: 422, body: { success: false, message: 'Failed to generate the report preview' } });
      clickRefresh();
      await waitFor(() => {
        const alerts = screen.getAllByRole('alert');
        expect(alerts.find((el) => el.textContent.includes('Failed to generate the report preview'))).toBeInTheDocument();
      });
    });

    it('shows "No data returned" when rows are empty', async() => {
      await openPreviewWithCols({ columns: ['Name'], col_keys: ['Vm-name'], rows: [] });
      clickRefresh();
      await waitFor(() => expect(screen.getByRole('table')).toBeInTheDocument());
      expect(screen.getByText('No data returned for this report.')).toBeInTheDocument();
    });

    it('shows the hint to click Refresh before any preview was requested', async() => {
      await openPreviewWithCols({ columns: [], rows: [] });
      expect(screen.getByText('Click Refresh to preview the current report configuration.')).toBeInTheDocument();
    });

    it('renders the column headers of the preview', async() => {
      await openPreviewWithCols({
        columns: ['Name', 'Power State'],
        col_keys: ['Vm-name', 'Vm-power_state'],
        rows: [['My VM', 'on']],
      });
      clickRefresh();
      await waitFor(() => expect(screen.getByRole('table')).toBeInTheDocument());

      expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Power State' })).toBeInTheDocument();
    });

    it('renders rows that come as objects keyed by column', async() => {
      await openPreviewWithCols({
        columns: ['Name', 'Power State'],
        col_keys: ['Vm-name', 'Vm-power_state'],
        rows: [{ 'Vm-name': 'My VM', 'Vm-power_state': 'on' }],
      });
      clickRefresh();
      await waitFor(() => expect(screen.getByRole('table')).toBeInTheDocument());

      expect(screen.getByText('My VM')).toBeInTheDocument();
      expect(screen.getByText('on')).toBeInTheDocument();
    });

    it('uses the column titles as keys when the server sends no col_keys', async() => {
      await openPreviewWithCols({ columns: ['Name'], rows: [{ Name: 'Keyed by title' }] });
      clickRefresh();

      expect(await screen.findByText('Keyed by title')).toBeInTheDocument();
    });

    it('leaves a cell blank when a row has no value for a column', async() => {
      await openPreviewWithCols({
        columns: ['Name', 'Power State'],
        col_keys: ['Vm-name', 'Vm-power_state'],
        rows: [['Only a name']],
      });
      clickRefresh();

      expect(await screen.findByText('Only a name')).toBeInTheDocument();
      expect(screen.getAllByRole('row')).toHaveLength(2);
    });

    it('says no data was returned when the server returns no columns', async() => {
      await openPreviewWithCols({ columns: [], rows: [] });
      clickRefresh();

      expect(await screen.findByText('No data returned for this report.')).toBeInTheDocument();
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });

    it('clears an earlier error when Refresh is clicked again', async() => {
      await openPreviewWithCols({ status: 422, body: { success: false, message: 'Preview failed' } });
      clickRefresh();
      await waitFor(() => expect(screen.getAllByRole('alert').find((el) => el.textContent.includes('Preview failed'))).toBeInTheDocument());

      mockRoute('preview', { columns: ['Name'], col_keys: ['Vm-name'], rows: [['Recovered']] });
      clickRefresh();

      expect(await screen.findByText('Recovered')).toBeInTheDocument();
      expect(screen.queryByText('Preview failed')).not.toBeInTheDocument();
      expect(requestsTo('/report/preview')).toHaveLength(2);
    });

    describe('queued preview', () => {
      const resultRows = {
        complete: true,
        columns: ['Name'],
        col_keys: ['Vm-name'],
        rows: [['Queued VM']],
      };

      const openQueuedPreview = (previewResult) => renderAndOpenTab('Preview', {
        formData: formDataWithCols,
        preview: { task_id: 7 },
        previewResult,
      });

      it('polls the task and renders the table once it is complete', async() => {
        await openQueuedPreview(resultRows);
        clickRefresh();

        expect(await screen.findByText('Queued VM')).toBeInTheDocument();
        expect(requestsTo('/report/preview_result?task_id=7')).toHaveLength(1);
      });

      it('keeps polling while the report is being generated', async() => {
        const { container } = await openQueuedPreview({ complete: false });
        clickRefresh();
        await waitFor(() => expect(requestsTo('/report/preview_result')).toHaveLength(1));
        expect(container.querySelector('.cds--loading')).toBeInTheDocument();

        mockRoute('previewResult', resultRows);

        expect(await screen.findByText('Queued VM', {}, { timeout: 3000 })).toBeInTheDocument();
        expect(requestsTo('/report/preview_result').length).toBeGreaterThanOrEqual(2);
      });

      it('shows the server message when the queued report failed', async() => {
        await openQueuedPreview({ status: 422, body: { success: false, message: 'Failed to generate the report preview' } });
        clickRefresh();

        await waitFor(() => {
          const alerts = screen.getAllByRole('alert');
          expect(alerts.find((el) => el.textContent.includes('Failed to generate the report preview'))).toBeInTheDocument();
        });
      });

      it('stops polling when the editor is unmounted', async() => {
        const { unmount } = await openQueuedPreview({ complete: false });
        clickRefresh();
        await waitFor(() => expect(requestsTo('/report/preview_result')).toHaveLength(1));

        unmount();
        // Longer than the 1s poll interval, so a leftover timer would have fired a second request.
        await new Promise((resolve) => setTimeout(resolve, 1500));

        expect(requestsTo('/report/preview_result')).toHaveLength(1);
      });
    });

    it('falls back to a generic message when the failure has none', async() => {
      await openPreviewWithCols({ status: 500, body: {} });
      clickRefresh();

      await waitFor(() => {
        const alerts = screen.getAllByRole('alert');
        expect(alerts.find((el) => el.textContent.includes('Failed to load preview data.'))).toBeInTheDocument();
      });
    });
  });
});
