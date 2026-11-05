import {
  act, screen, waitFor, fireEvent,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  makeFormData, mockApi, mockRoute, postedBody, renderEditor, requestedUrls, requestsTo, resetFetchMock,
} from '../helpers/reportEditor';

// FieldPicker is on the Columns tab (always first tab, no navigation needed).

const baseFormData = makeFormData({
  models: [['Virtual Machines', 'Vm'], ['Hosts', 'Host']],
  pdf_page_sizes: [],
});

const withColumns = (columns) => makeFormData({
  report: {
    col_order: Object.keys(columns),
    headers: Object.values(columns),
    col_formats: Object.keys(columns).map(() => ''),
    col_options: Object.fromEntries(Object.entries(columns).map(([id, header]) => [id, { header, format: '' }])),
  },
  models: [['Virtual Machines', 'Vm'], ['Hosts', 'Host']],
  pdf_page_sizes: [],
});

const availableFieldsResponse = {
  fields: [['Name', 'Vm-name'], ['CPUs', 'Vm-num_cpu'], ['Hostname', 'Vm-hostname']],
  field_metadata: {
    'Vm-name': { available_formats: [], default_format: null },
    'Vm-num_cpu': { available_formats: [['Number (1,234)', 'general_number_precision_0']], default_format: 'general_number_precision_0' },
  },
};

// Buttons of the "Change model?" modal, found by their label.
const getModalButton = (name) => screen.getAllByRole('button', { name })
  .find((button) => button.closest('.cds--modal'));

describe('FieldPicker (via ReportEditor)', () => {
  afterEach(resetFetchMock);

  beforeEach(() => {
    mockApi({ formData: baseFormData, availableFields: availableFieldsResponse });
  });

  it('renders the Available fields multiselect', async() => {
    renderEditor();
    await waitFor(() => expect(screen.getByText('Available fields')).toBeInTheDocument());
  });

  it('renders the Selected fields heading', async() => {
    renderEditor();
    await waitFor(() => expect(screen.getByText('Selected fields')).toBeInTheDocument());
  });

  it('shows "No fields selected yet." when col_order is empty', async() => {
    renderEditor();
    await waitFor(() => expect(screen.getByText('No fields selected yet.')).toBeInTheDocument());
  });

  it('shows the column count indicator', async() => {
    renderEditor();
    await waitFor(() => expect(screen.getByText(/0 \/ 100 columns/)).toBeInTheDocument());
  });

  it('fetches available fields when the model is already set on mount', async() => {
    renderEditor();
    await waitFor(() => {
      expect(requestedUrls()).toContainEqual(expect.stringContaining('available_fields?model=Vm'));
    });
  });

  it('renders existing selected columns in the sortable list when editing', async() => {
    mockApi({
      formData: withColumns({ 'Vm-name': 'Name', 'Vm-num_cpu': 'CPUs' }),
      availableFields: availableFieldsResponse,
    });
    renderEditor({ recordId: '42' });
    await waitFor(() => {
      expect(screen.getAllByRole('option').length).toBeGreaterThan(0);
    });
    expect(screen.getByText(/2 \/ 100 columns/)).toBeInTheDocument();
  });

  it('shows a confirmation modal when changing the model with columns already selected', async() => {
    mockApi({
      formData: withColumns({ 'Vm-name': 'Name' }),
      availableFields: availableFieldsResponse,
    });
    renderEditor({ recordId: '42' });
    await waitFor(() => expect(screen.getAllByRole('option').length).toBeGreaterThan(0));

    // Change the model select to Host — this should trigger the confirmation modal
    const modelSelect = document.getElementById('model');
    fireEvent.change(modelSelect, { target: { value: 'Host' } });

    await waitFor(() => expect(screen.getByText('Change model?')).toBeInTheDocument());
  });

  it('cancels the model change modal and keeps existing columns', async() => {
    mockApi({
      formData: withColumns({ 'Vm-name': 'Name' }),
      availableFields: availableFieldsResponse,
    });
    renderEditor({ recordId: '42' });
    await waitFor(() => expect(screen.getAllByRole('option').length).toBeGreaterThan(0));

    const modelSelect = document.getElementById('model');
    fireEvent.change(modelSelect, { target: { value: 'Host' } });
    await waitFor(() => expect(screen.getByText('Change model?')).toBeInTheDocument());

    // The modal's secondary button triggers onRequestClose (setPendingClear(false))
    const modalCancelBtn = getModalButton('Cancel');
    expect(modalCancelBtn).toBeDefined();
    fireEvent.click(modalCancelBtn);

    await waitFor(() => expect(modalCancelBtn.closest('.cds--modal')).not.toHaveClass('is-visible'));
    expect(screen.getByText(/1 \/ 100 columns/)).toBeInTheDocument();
    expect(requestedUrls()).not.toContainEqual(expect.stringContaining('available_fields?model=Host'));
  });

  it('clears the columns and loads the new model fields when the model change is confirmed', async() => {
    mockApi({
      formData: withColumns({ 'Vm-name': 'Name' }),
      availableFields: availableFieldsResponse,
    });
    renderEditor({ recordId: '42' });
    await waitFor(() => expect(screen.getByText(/1 \/ 100 columns/)).toBeInTheDocument());

    fireEvent.change(document.getElementById('model'), { target: { value: 'Host' } });
    await waitFor(() => expect(screen.getByText('Change model?')).toBeInTheDocument());

    fireEvent.click(getModalButton('Continue'));

    await waitFor(() => expect(screen.getByText('No fields selected yet.')).toBeInTheDocument());
    expect(screen.getByText(/0 \/ 100 columns/)).toBeInTheDocument();
    expect(requestedUrls()).toContainEqual(expect.stringContaining('available_fields?model=Host'));
  });

  describe('Reset after changing the model', () => {
    const modalIsOpen = () => getModalButton('Continue').closest('.cds--modal').classList.contains('is-visible');

    beforeEach(() => {
      mockApi({
        formData: withColumns({ 'Vm-name': 'Name' }),
        availableFields: availableFieldsResponse,
      });
    });

    it('restores the model and columns in one click after the model change was confirmed', async() => {
      const user = userEvent.setup();
      renderEditor({ recordId: '42' });
      await waitFor(() => expect(screen.getByText(/1 \/ 100 columns/)).toBeInTheDocument());
      fireEvent.change(document.getElementById('model'), { target: { value: 'Host' } });
      await waitFor(() => expect(modalIsOpen()).toBe(true));
      fireEvent.click(getModalButton('Continue'));
      await waitFor(() => expect(screen.getByText(/0 \/ 100 columns/)).toBeInTheDocument());

      await user.click(screen.getByRole('button', { name: 'Reset' }));

      await waitFor(() => expect(screen.getByText(/1 \/ 100 columns/)).toBeInTheDocument());
      expect(document.getElementById('model')).toHaveValue('Vm');
      expect(modalIsOpen()).toBe(false);
    });

    it('does not ask for confirmation when Reset puts the original model back', async() => {
      const user = userEvent.setup();
      renderEditor({ recordId: '42' });
      await waitFor(() => expect(screen.getByText(/1 \/ 100 columns/)).toBeInTheDocument());
      fireEvent.change(document.getElementById('model'), { target: { value: 'Host' } });
      await waitFor(() => expect(modalIsOpen()).toBe(true));
      fireEvent.click(getModalButton('Cancel'));
      await waitFor(() => expect(modalIsOpen()).toBe(false));

      await user.click(screen.getByRole('button', { name: 'Reset' }));

      await waitFor(() => expect(document.getElementById('model')).toHaveValue('Vm'));
      expect(modalIsOpen()).toBe(false);
      expect(screen.getByText(/1 \/ 100 columns/)).toBeInTheDocument();
    });
  });

  it('changes the model without asking when no columns are selected', async() => {
    renderEditor();
    await waitFor(() => expect(screen.getByText('Available fields')).toBeInTheDocument());

    fireEvent.change(document.getElementById('model'), { target: { value: 'Host' } });

    await waitFor(() => {
      expect(requestedUrls()).toContainEqual(expect.stringContaining('available_fields?model=Host'));
    });
    expect(screen.getByText('Change model?').closest('.cds--modal')).not.toHaveClass('is-visible');
  });

  it('reorders the selected columns from the keyboard', async() => {
    mockApi({
      formData: withColumns({ 'Vm-name': 'Name', 'Vm-num_cpu': 'CPUs' }),
      availableFields: availableFieldsResponse,
    });
    renderEditor({ recordId: '42' });
    await waitFor(() => expect(screen.getByText(/2 \/ 100 columns/)).toBeInTheDocument());
    const selectedOrder = () => screen.getAllByRole('option')
      .filter((option) => option.classList.contains('sortable-list-item'))
      .map((option) => option.querySelector('.sortable-list-item__text').textContent);
    expect(selectedOrder()).toEqual(['Name', 'CPUs']);

    fireEvent.keyDown(screen.getByRole('option', { name: /^Name\./ }), { key: 'ArrowDown' });

    await waitFor(() => expect(selectedOrder()).toEqual(['CPUs', 'Name']));
    await waitFor(() => expect(document.getElementById('col-header-Vm-num_cpu')).toBeInTheDocument());
    const headerIds = Array.from(document.querySelectorAll('[id^="col-header-"]')).map((el) => el.id);
    expect(headerIds).toEqual(['col-header-Vm-num_cpu', 'col-header-Vm-name']);
  });

  it('posts the columns in the reordered sequence', async() => {
    const user = userEvent.setup();
    mockApi({
      formData: withColumns({ 'Vm-name': 'Name', 'Vm-num_cpu': 'CPUs' }),
      availableFields: availableFieldsResponse,
    });
    renderEditor({ recordId: '42' });
    await waitFor(() => expect(screen.getByText(/2 \/ 100 columns/)).toBeInTheDocument());

    fireEvent.keyDown(screen.getByRole('option', { name: /^CPUs\./ }), { key: 'ArrowUp' });
    await waitFor(() => expect(document.querySelector('[id^="col-header-"]').id).toBe('col-header-Vm-num_cpu'));
    await user.click(screen.getAllByRole('button', { name: 'Save' })[0]);
    await waitFor(() => expect(requestsTo('/report/save/')).toHaveLength(1));

    expect(postedBody('/report/save/').report_data).toMatchObject({
      col_order: ['Vm-num_cpu', 'Vm-name'],
      headers: ['CPUs', 'Name'],
    });
  });

  it('removes a column from the selection and the count', async() => {
    mockApi({
      formData: withColumns({ 'Vm-name': 'Name', 'Vm-num_cpu': 'CPUs' }),
      availableFields: availableFieldsResponse,
    });
    renderEditor({ recordId: '42' });
    await waitFor(() => expect(screen.getByText(/2 \/ 100 columns/)).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'Remove Name' }));

    await waitFor(() => expect(screen.getByText(/1 \/ 100 columns/)).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: 'Remove Name' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove CPUs' })).toBeInTheDocument();
  });

  it('adds a field chosen in the Available fields list, using its label as the header', async() => {
    const user = userEvent.setup();
    renderEditor();
    await waitFor(() => expect(screen.getByRole('combobox', { name: /Available fields/ })).toBeEnabled());

    await user.click(screen.getByRole('combobox', { name: /Available fields/ }));
    await user.click(await screen.findByRole('option', { name: 'CPUs' }));

    await waitFor(() => expect(screen.getByText(/1 \/ 100 columns/)).toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Remove CPUs' })).toBeInTheDocument();
    await waitFor(() => expect(document.getElementById('col-header-Vm-num_cpu')).toHaveValue('CPUs'));
  });

  it('keeps the form usable when the available fields request fails', async() => {
    mockRoute('availableFields', { throws: new Error('Network error') });
    renderEditor();

    await waitFor(() => expect(screen.getByText('Available fields')).toBeInTheDocument());
    expect(screen.queryByText('Loading available fields…')).not.toBeInTheDocument();
    expect(screen.getByText('No fields selected yet.')).toBeInTheDocument();
  });

  it('ignores a slow response for a previous model that arrives after the current one', async() => {
    const user = userEvent.setup();
    const hostResponse = { fields: [['Host Name', 'Host-name']], field_metadata: {} };
    let resolveVmResponse;
    const slowVmResponse = new Promise((resolve) => {
      resolveVmResponse = () => resolve(availableFieldsResponse);
    });
    mockRoute('availableFields', (url) => (url.includes('model=Vm') ? slowVmResponse : hostResponse));

    renderEditor();
    await waitFor(() => expect(requestedUrls()).toContainEqual(expect.stringContaining('available_fields?model=Vm')));

    // Switch to Host while the Vm request is still pending
    fireEvent.change(document.getElementById('model'), { target: { value: 'Host' } });
    await waitFor(() => expect(screen.getByRole('combobox', { name: /Available fields/ })).toBeEnabled());

    // The Vm response finally arrives and must not replace the Host fields
    await act(async() => resolveVmResponse());

    await user.click(screen.getByRole('combobox', { name: /Available fields/ }));
    expect(await screen.findByRole('option', { name: 'Host Name' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'CPUs' })).not.toBeInTheDocument();
  });

  it('warns when the selection approaches the column limit', async() => {
    const columns = Object.fromEntries(Array.from({ length: 81 }, (_, i) => [`Vm-c${i}`, `Column ${i}`]));
    mockApi({ formData: withColumns(columns), availableFields: availableFieldsResponse });
    renderEditor({ recordId: '42' });

    await waitFor(() => expect(screen.getByText('Approaching column limit')).toBeInTheDocument());
    expect(screen.getByText(/81 \/ 100 columns/)).toBeInTheDocument();
  });

  it('shows an error when the selection exceeds the column limit', async() => {
    const columns = Object.fromEntries(Array.from({ length: 101 }, (_, i) => [`Vm-c${i}`, `Column ${i}`]));
    mockApi({ formData: withColumns(columns), availableFields: availableFieldsResponse });
    renderEditor({ recordId: '42' });

    await waitFor(() => expect(screen.getByText('Column limit exceeded')).toBeInTheDocument());
  });
});

describe('FieldPicker — header pre-fill', () => {
  afterEach(resetFetchMock);

  it('pre-fills column header with the field label when a new field is added', async() => {
    mockApi({
      formData: withColumns({ 'Vm-name': 'Virtual Machine Name' }),
      availableFields: {
        fields: [['Virtual Machine Name', 'Vm-name'], ['CPUs', 'Vm-num_cpu']],
        field_metadata: {},
      },
    });

    renderEditor({ recordId: '42' });
    await waitFor(() => {
      const headerInput = document.getElementById('col-header-Vm-name');
      expect(headerInput).toBeInTheDocument();
      expect(headerInput.value).toBe('Virtual Machine Name');
    });
  });
});
