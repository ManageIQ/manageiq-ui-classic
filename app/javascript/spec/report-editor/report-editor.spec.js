import {
  fireEvent, screen, waitFor, within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  PENDING, makeFormData, mockApi, mockRoute, renderEditor, requestedUrls, resetFetchMock, waitForTabs,
} from '../helpers/reportEditor';
import miqRedirectBack from '../../helpers/miq-redirect-back';

describe('ReportEditor component', () => {
  beforeEach(() => {
    miqRedirectBack.mockClear();
    mockApi();
  });

  afterEach(resetFetchMock);

  it('shows a loading spinner while fetching', () => {
    mockRoute('formData', PENDING);
    const { container } = renderEditor();
    expect(container.querySelector('.cds--loading')).toBeInTheDocument();
  });

  it('shows an error notification when the fetch fails', async() => {
    mockRoute('formData', { throws: new Error('Network error') });
    renderEditor();
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
    expect(screen.getByRole('alert')).toHaveTextContent('Failed to load report data');
  });

  it('should render the add form tabs', async() => {
    renderEditor();
    await waitFor(() => {
      expect(screen.getAllByRole('tab')).toHaveLength(6);
    });
    // Only the tab list is snapshotted: the full form embeds a randomly generated expression-editor id.
    expect(screen.getByRole('tablist')).toMatchSnapshot();
  });

  // The field picker's "Change model?" modal has its own (closed) Cancel button; pick the form's.
  const getFormCancelButton = () => screen.getAllByRole('button', { name: 'Cancel' })
    .find((button) => !button.closest('.cds--modal'));

  const getTabNames = () => screen.getAllByRole('tab').map((t) => t.textContent.trim());

  it('renders all 6 tabs for a standard report', async() => {
    renderEditor();
    await waitFor(() => {
      expect(screen.getAllByRole('tab')).toHaveLength(6);
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
    mockRoute('formData', makeFormData({ report_type: 'chargeback' }));
    renderEditor({ recordId: '42' });
    await waitFor(() => {
      expect(screen.getAllByRole('tab')).toHaveLength(3);
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
    mockRoute('formData', makeFormData({ report_type: 'performance' }));
    renderEditor({ recordId: '42' });
    await waitFor(() => {
      expect(screen.getAllByRole('tab')).toHaveLength(6);
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
    mockRoute('formData', makeFormData({ report_type: 'performance' }));
    renderEditor({ recordId: '42' });
    await waitFor(() => {
      expect(screen.getAllByRole('tab')).toHaveLength(6);
    });
    expect(document.getElementById('perf_interval')).toBeInTheDocument();
    expect(document.getElementById('perf_avgs')).toBeInTheDocument();
  });

  it('does NOT render perf_interval or perf_avgs selects for standard reports', async() => {
    renderEditor();
    await waitFor(() => {
      expect(screen.getAllByRole('tab')).toHaveLength(6);
    });
    expect(document.getElementById('perf_interval')).not.toBeInTheDocument();
    expect(document.getElementById('perf_avgs')).not.toBeInTheDocument();
  });

  it('fetches from /new endpoint when recordId is new', async() => {
    renderEditor();
    await waitFor(() => {
      expect(requestedUrls()).toContain('/report/form_data/new');
    });
  });

  it('fetches from /:id endpoint when editing an existing record', async() => {
    renderEditor({ recordId: '99' });
    await waitFor(() => {
      expect(requestedUrls()).toContain('/report/form_data/99');
    });
  });

  it('passes copy_from to the form data request when copying a report', async() => {
    renderEditor({ copyFrom: 7 });
    await waitFor(() => {
      expect(requestedUrls()).toContain('/report/form_data/new?copy_from=7');
    });
  });

  it('ignores copy_from when editing an existing record', async() => {
    renderEditor({ recordId: '99', copyFrom: 7 });
    await waitFor(() => {
      expect(requestedUrls()).toContain('/report/form_data/99');
    });
    expect(requestedUrls()).not.toContainEqual(expect.stringContaining('copy_from'));
  });

  it('renders the Columns tab fields', async() => {
    renderEditor();
    await waitFor(() => {
      expect(screen.getByText('Menu name')).toBeInTheDocument();
    });
    expect(screen.getByText('Title')).toBeInTheDocument();
  });

  it('renders Add and Cancel buttons for a new report', async() => {
    renderEditor();
    await waitForTabs();
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
    expect(getFormCancelButton()).toBeInTheDocument();
  });

  it('renders Save button labelled "Save" when editing', async() => {
    renderEditor({ recordId: '42' });
    await waitFor(() => {
      expect(screen.getByText('Save')).toBeInTheDocument();
    });
  });

  it('disables the Add button when no columns are selected', async() => {
    mockRoute('formData', makeFormData({ report: { col_order: [] } }));
    renderEditor();
    await waitForTabs();
    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled();
  });

  it('enables the Add button when required fields and columns are present', async() => {
    mockRoute('formData', makeFormData({
      report: {
        name: 'Report',
        title: 'Title',
        model: 'Vm',
        col_order: ['Vm-name'],
      },
    }));
    renderEditor();
    await waitForTabs();
    expect(screen.getByRole('button', { name: 'Add' })).not.toBeDisabled();
  });

  it('redirects back with a warning when adding a new report is cancelled', async() => {
    const user = userEvent.setup();
    renderEditor();
    await waitForTabs();

    await user.click(getFormCancelButton());

    expect(miqRedirectBack).toHaveBeenCalledWith(
      'Add of new Report was cancelled by the user',
      'warning',
      '/report/explorer',
    );
  });

  describe('save button', () => {
    const getSaveButton = () => screen.getByRole('button', { name: 'Save' });
    const validReport = makeFormData({
      report: {
        name: 'Report', title: 'Title', model: 'Vm', col_order: ['Vm-name'],
      },
    });

    beforeEach(() => {
      mockRoute('formData', validReport);
    });

    it('is disabled on an unchanged edit form', async() => {
      renderEditor({ recordId: '42' });
      await waitForTabs();

      expect(getSaveButton()).toBeDisabled();
    });

    it('is enabled once the edit form has been changed', async() => {
      renderEditor({ recordId: '42' });
      await waitForTabs();

      fireEvent.change(document.getElementById('name'), { target: { value: 'Changed name' } });

      await waitFor(() => expect(getSaveButton()).toBeEnabled());
    });

    it('is disabled again after the changes are reset', async() => {
      const user = userEvent.setup();
      renderEditor({ recordId: '42' });
      await waitForTabs();
      fireEvent.change(document.getElementById('name'), { target: { value: 'Changed name' } });
      await waitFor(() => expect(getSaveButton()).toBeEnabled());

      await user.click(screen.getByRole('button', { name: 'Reset' }));

      await waitFor(() => expect(getSaveButton()).toBeDisabled());
    });

    it('does not wait for a change when adding a prefilled report', async() => {
      renderEditor();
      await waitForTabs();

      expect(screen.getByRole('button', { name: 'Add' })).toBeEnabled();
    });

    it('does not wait for a change when copying a report', async() => {
      renderEditor({ copyFrom: 7 });
      await waitForTabs();

      expect(screen.getByRole('button', { name: 'Add' })).toBeEnabled();
    });
  });

  describe('reset button', () => {
    const EDIT_ID = '42';
    const getResetButton = () => screen.getByRole('button', { name: 'Reset' });
    const changeName = (value) => fireEvent.change(document.getElementById('name'), { target: { value } });

    it('is not rendered when adding a report', async() => {
      renderEditor();
      await waitForTabs();

      expect(screen.queryByRole('button', { name: 'Reset' })).not.toBeInTheDocument();
    });

    it('is not rendered when copying a report', async() => {
      renderEditor({ copyFrom: 7 });
      await waitForTabs();

      expect(screen.queryByRole('button', { name: 'Reset' })).not.toBeInTheDocument();
    });

    it('renders a Reset button when editing, disabled until the form is changed', async() => {
      renderEditor({ recordId: EDIT_ID });
      await waitForTabs();

      expect(getResetButton()).toBeDisabled();
    });

    it('enables the Reset button once a field is edited', async() => {
      renderEditor({ recordId: EDIT_ID });
      await waitForTabs();

      changeName('Changed name');

      await waitFor(() => expect(getResetButton()).toBeEnabled());
    });

    it('restores the original field values when Reset is clicked', async() => {
      const user = userEvent.setup();
      renderEditor({ recordId: EDIT_ID });
      await waitForTabs();
      const originalName = document.getElementById('name').value;

      changeName('Changed name');
      await waitFor(() => expect(document.getElementById('name')).toHaveValue('Changed name'));
      await user.click(getResetButton());

      await waitFor(() => expect(document.getElementById('name')).toHaveValue(originalName));
      expect(getResetButton()).toBeDisabled();
    });

    it('shows an inline notification when the form is reset, without the global flash', async() => {
      const user = userEvent.setup();
      const addFlash = jest.spyOn(window, 'add_flash');
      renderEditor({ recordId: EDIT_ID });
      await waitForTabs();
      expect(screen.queryByText('All changes have been reset')).not.toBeInTheDocument();

      changeName('Changed name');
      await waitFor(() => expect(getResetButton()).toBeEnabled());
      await user.click(getResetButton());

      expect(await screen.findByText('All changes have been reset')).toBeInTheDocument();
      expect(addFlash).not.toHaveBeenCalled();
      addFlash.mockRestore();
    });

    it('dismisses the reset notification', async() => {
      const user = userEvent.setup();
      renderEditor({ recordId: EDIT_ID });
      await waitForTabs();
      changeName('Changed name');
      await waitFor(() => expect(getResetButton()).toBeEnabled());
      await user.click(getResetButton());
      const notice = (await screen.findByText('All changes have been reset')).closest('[role="status"]');

      await user.click(within(notice).getByRole('button'));

      await waitFor(() => expect(screen.queryByText('All changes have been reset')).not.toBeInTheDocument());
    });

    it('restores the original tab set when a model change is reset', async() => {
      const user = userEvent.setup();
      mockRoute('formData', makeFormData({
        models: [['Virtual Machines', 'Vm'], ['Chargeback for VMs', 'ChargebackVm']],
      }));
      renderEditor({ recordId: EDIT_ID });
      await waitFor(() => expect(screen.getAllByRole('tab')).toHaveLength(6));

      fireEvent.change(document.getElementById('model'), { target: { value: 'ChargebackVm' } });
      await waitFor(() => expect(screen.getAllByRole('tab')).toHaveLength(3));
      await user.click(getResetButton());

      await waitFor(() => expect(screen.getAllByRole('tab')).toHaveLength(6));
      expect(document.getElementById('model')).toHaveValue('Vm');
    });
  });

  describe('switching the model', () => {
    const modelsData = makeFormData({
      models: [
        ['Virtual Machines', 'Vm'],
        ['VM Performance', 'VmPerformance'],
        ['Chargeback for VMs', 'ChargebackVm'],
        ['Metering for VMs', 'MeteringVm'],
      ],
    });
    const chooseModel = (value) => fireEvent.change(document.getElementById('model'), { target: { value } });

    beforeEach(() => {
      mockRoute('formData', modelsData);
    });

    it('drops to the reduced tab set when a chargeback model is chosen', async() => {
      renderEditor();
      await waitFor(() => expect(screen.getAllByRole('tab')).toHaveLength(6));

      chooseModel('ChargebackVm');

      await waitFor(() => expect(screen.getAllByRole('tab')).toHaveLength(3));
      expect(getTabNames()).toEqual(['Columns', 'Filter', 'Preview']);
    });

    it('treats a metering model as a chargeback report', async() => {
      renderEditor();
      await waitFor(() => expect(screen.getAllByRole('tab')).toHaveLength(6));

      chooseModel('MeteringVm');

      await waitFor(() => expect(screen.getAllByRole('tab')).toHaveLength(3));
    });

    it('brings the full tab set back when a standard model is chosen again', async() => {
      renderEditor();
      await waitFor(() => expect(screen.getAllByRole('tab')).toHaveLength(6));
      chooseModel('ChargebackVm');
      await waitFor(() => expect(screen.getAllByRole('tab')).toHaveLength(3));

      chooseModel('Vm');

      await waitFor(() => expect(screen.getAllByRole('tab')).toHaveLength(6));
    });

    it('shows the performance fields when a performance model is chosen', async() => {
      renderEditor();
      await waitFor(() => expect(screen.getAllByRole('tab')).toHaveLength(6));
      expect(document.getElementById('perf_interval')).not.toBeInTheDocument();

      chooseModel('VmPerformance');

      await waitFor(() => expect(document.getElementById('perf_interval')).toBeInTheDocument());
      expect(screen.getAllByRole('tab')).toHaveLength(6);
    });

    it('falls back to the standard tabs when the model is cleared', async() => {
      renderEditor();
      await waitFor(() => expect(screen.getAllByRole('tab')).toHaveLength(6));
      chooseModel('ChargebackVm');
      await waitFor(() => expect(screen.getAllByRole('tab')).toHaveLength(3));

      chooseModel('');

      await waitFor(() => expect(screen.getAllByRole('tab')).toHaveLength(6));
    });
  });

  it('renders from a form data payload that carries nothing but defaults', async() => {
    mockRoute('formData', {});
    renderEditor();
    await waitFor(() => expect(screen.getAllByRole('tab')).toHaveLength(6));

    expect(Array.from(document.getElementById('model').options).map((option) => option.value)).toEqual(['']);
    expect(Array.from(document.getElementById('queue_timeout').options)).toHaveLength(0);
  });

  it('leaves the report name out of the cancel message when it has none', async() => {
    const user = userEvent.setup();
    mockRoute('formData', makeFormData({ report: { name: undefined } }));
    renderEditor({ recordId: '42' });
    await waitForTabs();

    await user.click(getFormCancelButton());

    expect(miqRedirectBack).toHaveBeenCalledWith(
      'Edit of Report "" was cancelled by the user',
      'warning',
      '/report/explorer',
    );
  });

  it('names the report in the cancel message when editing', async() => {
    const user = userEvent.setup();
    mockRoute('formData', makeFormData({ report: { name: 'Quarterly VMs' } }));
    renderEditor({ recordId: '42' });
    await waitForTabs();

    await user.click(getFormCancelButton());

    expect(miqRedirectBack).toHaveBeenCalledWith(
      'Edit of Report "Quarterly VMs" was cancelled by the user',
      'warning',
      '/report/explorer',
    );
  });

  it('shows the unavailable fields warning returned by the server', async() => {
    mockRoute('formData', makeFormData({ unavailable_fields_warning: 'Some fields are no longer available' }));
    renderEditor({ recordId: '42' });
    await waitForTabs();
    expect(screen.getByRole('status')).toHaveTextContent('Some fields are no longer available');
  });
});
