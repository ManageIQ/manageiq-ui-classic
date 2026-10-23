import {
  screen, waitFor, within, fireEvent,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ClassFieldsEditor } from '../../components/data-tables/datastore/schema/class-fields-editor';
import { renderWithRedux } from '../helpers/mountForm';
import '../helpers/miqSparkle';

import miqRedirectBack from '../../helpers/miq-redirect-back';

jest.mock('../../helpers/miq-redirect-back', () => jest.fn());

const AE_TYPE_OPTIONS = [
  ['Attribute', 'attribute', { 'data-icon': 'carbon--Grid' }],
  ['Method', 'method', { 'data-icon': 'carbon--Function_2' }],
  ['State', 'state', { 'data-icon': 'carbon--Renew' }],
];

const D_TYPE_OPTIONS = [
  ['String', 'string', { 'data-icon': 'carbon--StringText' }],
  ['Integer', 'integer', { 'data-icon': 'carbon--StringInteger' }],
];

const defaultProps = {
  aeClassId: 42,
  initialData: [],
  aeTypeOptions: AE_TYPE_OPTIONS,
  dTypeOptions: D_TYPE_OPTIONS,
};

const makeInitialRow = ({
  // eslint-disable-next-line camelcase
  id = 1, name = 'my_field', display_name = 'My Field',
  aetype = 'attribute', datatype = 'string', substitute = true,
} = {}) => ({
  id: String(id),
  field_id: id,
  clickable: false,
  aetype,
  datatype,
  // eslint-disable-next-line camelcase
  display_name,
  substitute,
  cells: [
    // eslint-disable-next-line camelcase
    { text: display_name ? `${display_name} (${name})` : name, icon: ['carbon--Grid', 'carbon--StringText', 'carbon--CheckmarkOutline'] },
    { text: '' }, // description
    { text: '' }, // default_value
    { text: '' }, // collect
    { text: 'create' }, // message
    { text: '' }, // on_entry
    { text: '' }, // on_exit
    { text: '' }, // on_error
    { text: '' }, // max_retries
    { text: '' }, // max_time
  ],
});

// Adds a field through the modal, which makes the schema form dirty (enables Save and Reset).
const addField = async(user, name) => {
  const modal = () => document.querySelector('.cds--modal-container');
  await user.click(screen.getByText('Add a Field'));
  await user.type(modal().querySelector('input[id="name"]'), name);
  await user.click(modal().querySelector('#aetype button.cds--list-box__field'));
  await user.click(within(modal().querySelector('#aetype')).getByText('Attribute'));
  await user.click(within(modal()).getByRole('button', { name: /^save$/i }));
  await waitFor(() => expect(screen.getByText(name)).toBeInTheDocument());
};

describe('ClassFieldsEditor', () => {
  let httpPostSpy;

  beforeEach(() => {
    httpPostSpy = jest.spyOn(window.http, 'post').mockResolvedValue({});
    window.add_flash = jest.fn();
  });

  afterEach(() => {
    httpPostSpy.mockRestore();
    jest.clearAllMocks();
  });

  it('opens the modal when "Add a Field" is clicked and closes it on Cancel', async() => {
    const user = userEvent.setup();
    renderWithRedux(<ClassFieldsEditor {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: /add a field/i }));

    const dialog = screen.getByRole('dialog');
    expect(dialog.closest('.cds--modal')).toHaveClass('is-visible');
    expect(screen.getByText('Add New Field')).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: /^cancel$/i }));
    await waitFor(() => {
      expect(dialog.closest('.cds--modal')).not.toHaveClass('is-visible');
    });
  });

  it('POSTs to update_fields with button=save and redirects on success', async() => {
    const user = userEvent.setup();
    httpPostSpy.mockResolvedValue({ message: 'Schema for Automate Class "TestClass" was saved' });

    const { container } = renderWithRedux(<ClassFieldsEditor {...defaultProps} />);
    await addField(user, 'new_field');

    // Two Save buttons exist (outer form + hidden modal); click the enabled outer one
    const saveBtn = within(container).getAllByRole('button', { name: /^save$/i })
      .find((btn) => !btn.disabled);
    await user.click(saveBtn);

    await waitFor(() => {
      expect(httpPostSpy).toHaveBeenCalledWith(
        '/miq_ae_class/update_fields/42?button=save',
        expect.objectContaining({ fields: expect.any(Array), fields_to_delete: expect.any(Array) }),
        { skipErrors: [422] }
      );
    });
    expect(miqRedirectBack).toHaveBeenCalledWith(
      'Schema for Automate Class "TestClass" was saved',
      'success',
      '/miq_ae_class/explorer'
    );
  });

  it('shows the server error and does not redirect when save is rejected with 422', async() => {
    const user = userEvent.setup();
    httpPostSpy.mockRejectedValue({ status: 422, data: { error: 'Something went wrong' } });

    const { container } = renderWithRedux(<ClassFieldsEditor {...defaultProps} />);
    await addField(user, 'new_field');

    const saveBtn = within(container).getAllByRole('button', { name: /^save$/i })
      .find((btn) => !btn.disabled);
    await user.click(saveBtn);

    expect(await screen.findByText('Something went wrong')).toBeInTheDocument();
    expect(miqRedirectBack).not.toHaveBeenCalled();
  });

  it('POSTs to update_fields with button=reset, reloads rows and shows a flash warning', async() => {
    const user = userEvent.setup();
    httpPostSpy.mockResolvedValue({
      message: 'All changes have been reset',
      fields: [{
        id: 1, name: 'field01', aetype: 'attribute', datatype: 'string', substitute: true,
      }],
    });

    const { container } = renderWithRedux(<ClassFieldsEditor {...defaultProps} />);
    await addField(user, 'new_field');

    const resetBtn = within(container).getAllByRole('button', { name: /^reset$/i })[0];
    fireEvent.click(resetBtn);

    await waitFor(() => {
      expect(httpPostSpy).toHaveBeenCalledWith(
        '/miq_ae_class/update_fields/42?button=reset',
        expect.objectContaining({}),
        { skipErrors: [422] }
      );
    });
    await waitFor(() => expect(window.add_flash).toHaveBeenCalledWith('All changes have been reset', 'warning'));
    expect(miqRedirectBack).not.toHaveBeenCalled();
  });

  it('POSTs to update_fields with button=cancel and redirects on success', async() => {
    const user = userEvent.setup();
    httpPostSpy.mockResolvedValue({ message: 'Edit of schema for Automate Class "TestClass" was cancelled by the user' });

    const { container } = renderWithRedux(<ClassFieldsEditor {...defaultProps} />);

    await user.click(within(container).getAllByRole('button', { name: /^cancel$/i })[0]);

    await waitFor(() => {
      expect(httpPostSpy).toHaveBeenCalledWith(
        '/miq_ae_class/update_fields/42?button=cancel',
        expect.objectContaining({}),
        { skipErrors: [422] }
      );
    });
    expect(miqRedirectBack).toHaveBeenCalledWith(
      expect.stringContaining('cancelled'),
      'success',
      '/miq_ae_class/explorer'
    );
  });

  it('removes a row from the table when Delete is clicked — no HTTP call', async() => {
    const propsWithRow = {
      ...defaultProps,
      initialData: [makeInitialRow({ id: 99, name: 'to_delete', display_name: 'To Delete' })],
    };

    const { container } = renderWithRedux(<ClassFieldsEditor {...propsWithRow} />);

    expect(screen.getByText('To Delete (to_delete)')).toBeInTheDocument();

    const deleteBtn = container.querySelector('button.miq-data-table-button.cds--btn--danger');
    expect(deleteBtn).not.toBeNull();
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(screen.queryByText('To Delete (to_delete)')).not.toBeInTheDocument();
    });

    expect(httpPostSpy).not.toHaveBeenCalled();
  });

  it('does not send the masked password value when an untouched password field is saved', async() => {
    const user = userEvent.setup();
    httpPostSpy.mockResolvedValue({ message: 'Schema saved' });
    const row = makeInitialRow({ id: 7, name: 'secret', display_name: 'Secret' });
    row.datatype = 'password';
    row.cells[2] = { text: '********' }; // server renders stored passwords masked

    const { container } = renderWithRedux(<ClassFieldsEditor {...defaultProps} initialData={[row]} />);
    await addField(user, 'other_field');

    const saveBtn = within(container).getAllByRole('button', { name: /^save$/i })
      .find((btn) => !btn.disabled);
    fireEvent.click(saveBtn);

    await waitFor(() => expect(httpPostSpy).toHaveBeenCalled());
    const [, payload] = httpPostSpy.mock.calls[0];
    expect(payload.fields[0].datatype).toBe('password');
    expect(payload.fields[0].default_value).toBeUndefined();
    expect(JSON.stringify(payload)).not.toContain('********');
  });

  it('switches the default value input to a password input when the data type changes to Password', async() => {
    const user = userEvent.setup();
    const props = {
      ...defaultProps,
      dTypeOptions: [...D_TYPE_OPTIONS, ['Password', 'password', { 'data-icon': 'carbon--Password' }]],
    };
    renderWithRedux(<ClassFieldsEditor {...props} />);

    await user.click(screen.getByText('Add a Field'));
    const modal = () => document.querySelector('.cds--modal-container');
    const inputs = () => modal().querySelectorAll('input[id="default_value"]');
    const selectDataType = async(label) => {
      await user.click(modal().querySelector('#datatype button.cds--list-box__field'));
      await user.click(within(modal().querySelector('#datatype')).getByText(label));
    };

    // Fill another field first so the form is already modified when the data type changes.
    await user.type(modal().querySelector('input[id="name"]'), 'secret_field');
    expect(inputs()).toHaveLength(1);
    expect(inputs()[0]).toHaveAttribute('type', 'text');

    await selectDataType('Password');
    await waitFor(() => expect(inputs()[0]).toHaveAttribute('type', 'password'));
    expect(inputs()).toHaveLength(1);

    await selectDataType('String');
    await waitFor(() => expect(inputs()[0]).toHaveAttribute('type', 'text'));
    expect(inputs()).toHaveLength(1);
  });

  describe('modal form', () => {
    const modal = () => document.querySelector('.cds--modal-container');
    const modalInput = (id, type = 'text') => modal().querySelector(`input[id="${id}"][type="${type}"]`);
    const modalButton = (name) => within(modal()).getByRole('button', { name });
    const choose = async(user, id, label) => {
      await user.click(modal().querySelector(`#${id} button.cds--list-box__field`));
      await user.click(within(modal().querySelector(`#${id}`)).getByText(label));
    };
    const openUpdate = async(user, container) => {
      const row = within(container).getByText('My Field (my_field)').closest('tr');
      await user.click(within(row).getByRole('button', { name: /^update$/i }));
    };

    it('marks the required Name and Type labels with an asterisk, but not Data Type', async() => {
      const user = userEvent.setup();
      renderWithRedux(<ClassFieldsEditor {...defaultProps} />);

      await user.click(screen.getByText('Add a Field'));

      const labelText = (id) => (
        modal().querySelector(`#${id}`).closest('.cds--form-item, .cds--dropdown__wrapper').querySelector('label').textContent
      );
      expect(labelText('name')).toMatch(/^\*/);
      expect(labelText('aetype')).toMatch(/^\*/);
      expect(labelText('datatype')).not.toMatch(/\*/);
    });

    it('keeps Save disabled until name and type are filled in, then adds the row', async() => {
      const user = userEvent.setup();
      renderWithRedux(<ClassFieldsEditor {...defaultProps} />);

      await user.click(screen.getByText('Add a Field'));
      expect(modalButton(/^save$/i)).toBeDisabled();

      await user.type(modalInput('name'), 'test_field');
      expect(modalButton(/^save$/i)).toBeDisabled();

      await choose(user, 'aetype', 'Attribute');
      await waitFor(() => expect(modalButton(/^save$/i)).toBeEnabled());

      await user.clear(modalInput('name'));
      await waitFor(() => expect(modalButton(/^save$/i)).toBeDisabled());

      await user.type(modalInput('name'), 'test_field');
      await user.click(modalButton(/^save$/i));

      await waitFor(() => expect(screen.getByText('test_field')).toBeInTheDocument());
      expect(httpPostSpy).not.toHaveBeenCalled();
    });

    it('adds a row showing display name and sends every modal value in the save payload', async() => {
      const user = userEvent.setup();
      httpPostSpy.mockResolvedValue({ message: 'Schema saved' });
      const { container } = renderWithRedux(<ClassFieldsEditor {...defaultProps} />);

      await user.click(screen.getByText('Add a Field'));
      await user.type(modalInput('name'), 'test_field');
      await choose(user, 'aetype', 'Method');
      await choose(user, 'datatype', 'String');
      await user.type(modalInput('default_value'), 'default_val');
      await user.type(modalInput('display_name'), 'Complete Field');
      await user.type(modalInput('description'), 'Test description');
      await user.click(modalInput('substitute', 'checkbox'));
      await user.type(modalInput('collect'), 'collect_value');
      await user.clear(modalInput('message'));
      await user.type(modalInput('message'), 'custom_message');
      await user.type(modalInput('on_entry'), 'on_entry_method');
      await user.type(modalInput('on_exit'), 'on_exit_method');
      await user.type(modalInput('on_error'), 'on_error_method');
      await user.type(modalInput('max_retries'), '3');
      await user.type(modalInput('max_time'), '60');
      await user.click(modalButton(/^save$/i));

      await waitFor(() => expect(screen.getByText('Complete Field (test_field)')).toBeInTheDocument());

      const saveBtn = within(container).getAllByRole('button', { name: /^save$/i }).find((btn) => !btn.disabled);
      await user.click(saveBtn);

      await waitFor(() => expect(httpPostSpy).toHaveBeenCalled());
      const [, payload] = httpPostSpy.mock.calls[0];
      expect(payload.fields).toEqual([{
        id: null,
        name: 'test_field',
        aetype: 'method',
        datatype: 'string',
        default_value: 'default_val',
        display_name: 'Complete Field',
        description: 'Test description',
        substitute: false,
        collect: 'collect_value',
        message: 'custom_message',
        on_entry: 'on_entry_method',
        on_exit: 'on_exit_method',
        on_error: 'on_error_method',
        max_retries: '3',
        max_time: '60',
        priority: 1,
      }]);
    });

    it('does not add a row when the add modal is cancelled', async() => {
      const user = userEvent.setup();
      renderWithRedux(<ClassFieldsEditor {...defaultProps} />);

      await user.click(screen.getByText('Add a Field'));
      await user.type(modalInput('name'), 'test_field');
      await user.click(modalButton(/^cancel$/i));

      expect(screen.queryByText('test_field')).not.toBeInTheDocument();
    });

    it('clears the add modal and shows a flash message when Reset is clicked', async() => {
      const user = userEvent.setup();
      renderWithRedux(<ClassFieldsEditor {...defaultProps} />);

      await user.click(screen.getByText('Add a Field'));
      await user.type(modalInput('name'), 'reset_test');
      await user.type(modalInput('display_name'), 'Reset Test');
      await user.click(modalButton(/^reset$/i));

      await waitFor(() => expect(modalInput('name')).toHaveValue(''));
      expect(modalInput('display_name')).toHaveValue('');
      expect(within(modal()).getByText('All changes have been reset')).toBeInTheDocument();
    });

    it('prefills the edit modal from the row and updates the row on Save', async() => {
      const user = userEvent.setup();
      const row = makeInitialRow();
      row.cells[1] = { text: 'Original description' };
      const { container } = renderWithRedux(<ClassFieldsEditor {...defaultProps} initialData={[row]} />);

      await openUpdate(user, container);

      expect(screen.getByText('Edit Field')).toBeInTheDocument();
      expect(modalInput('name')).toHaveValue('my_field');
      expect(modalInput('display_name')).toHaveValue('My Field');
      expect(modalInput('description')).toHaveValue('Original description');
      expect(modalInput('substitute', 'checkbox')).toBeChecked();

      await user.clear(modalInput('display_name'));
      await user.type(modalInput('display_name'), 'Updated Field');
      await user.click(modalButton(/^save$/i));

      await waitFor(() => expect(screen.getByText('Updated Field (my_field)')).toBeInTheDocument());
      expect(screen.queryByText('My Field (my_field)')).not.toBeInTheDocument();
    });

    it('keeps the original row when the edit modal is cancelled', async() => {
      const user = userEvent.setup();
      const { container } = renderWithRedux(<ClassFieldsEditor {...defaultProps} initialData={[makeInitialRow()]} />);

      await openUpdate(user, container);
      await user.clear(modalInput('display_name'));
      await user.type(modalInput('display_name'), 'Should Not Save');
      await user.click(modalButton(/^cancel$/i));

      expect(screen.getByText('My Field (my_field)')).toBeInTheDocument();
      expect(screen.queryByText(/Should Not Save/)).not.toBeInTheDocument();
    });

    it('restores the original values when Reset is clicked in the edit modal', async() => {
      const user = userEvent.setup();
      const row = makeInitialRow();
      row.cells[1] = { text: 'Original description' };
      const { container } = renderWithRedux(<ClassFieldsEditor {...defaultProps} initialData={[row]} />);

      await openUpdate(user, container);
      await user.clear(modalInput('display_name'));
      await user.type(modalInput('display_name'), 'Modified');
      await user.clear(modalInput('description'));
      await user.type(modalInput('description'), 'Modified desc');
      await user.click(modalButton(/^reset$/i));

      await waitFor(() => expect(modalInput('display_name')).toHaveValue('My Field'));
      expect(modalInput('description')).toHaveValue('Original description');
    });

    it('sends substitute=false for an edited field instead of dropping it', async() => {
      const user = userEvent.setup();
      httpPostSpy.mockResolvedValue({ message: 'Schema saved' });
      const { container } = renderWithRedux(<ClassFieldsEditor {...defaultProps} initialData={[makeInitialRow({ id: 5 })]} />);

      await openUpdate(user, container);
      await user.click(modalInput('substitute', 'checkbox'));
      await user.click(modalButton(/^save$/i));

      await waitFor(() => expect(screen.getByText('My Field (my_field)')).toBeInTheDocument());
      const saveBtn = within(container).getAllByRole('button', { name: /^save$/i }).find((btn) => !btn.disabled);
      await user.click(saveBtn);

      await waitFor(() => expect(httpPostSpy).toHaveBeenCalled());
      const [, payload] = httpPostSpy.mock.calls[0];
      expect(payload.fields[0]).toEqual(expect.objectContaining({ id: 5, substitute: false }));
    });

    it('sends a typed password and keeps the mask for an untouched one when the row is re-saved', async() => {
      const user = userEvent.setup();
      httpPostSpy.mockResolvedValue({ message: 'Schema saved' });
      const row = makeInitialRow({
        id: 7, name: 'secret', display_name: 'Secret', datatype: 'password',
      });
      row.cells[0].icon = ['carbon--Grid', 'carbon--Password', 'carbon--CheckmarkOutline'];
      row.cells[2] = { text: '********' };
      const props = {
        ...defaultProps,
        dTypeOptions: [...D_TYPE_OPTIONS, ['Password', 'password', { 'data-icon': 'carbon--Password' }]],
        initialData: [row],
      };
      const { container } = renderWithRedux(<ClassFieldsEditor {...props} />);

      // Edit another attribute, leaving the password untouched: the mask must not be sent.
      const updateRow = within(container).getByText('Secret (secret)').closest('tr');
      await user.click(within(updateRow).getByRole('button', { name: /^update$/i }));
      // The stored password is never prefilled: the input is empty and shows the mask as a placeholder.
      expect(modalInput('default_value', 'password')).toHaveValue('');
      expect(modalInput('default_value', 'password')).toHaveAttribute('placeholder', '********');
      await user.type(modalInput('description'), 'changed');
      await user.click(modalButton(/^save$/i));
      await waitFor(() => expect(screen.getByText('Secret (secret)')).toBeInTheDocument());
      expect(screen.getByText('********')).toBeInTheDocument();

      const saveBtn = () => within(container).getAllByRole('button', { name: /^save$/i }).find((btn) => !btn.disabled);
      await user.click(saveBtn());
      await waitFor(() => expect(httpPostSpy).toHaveBeenCalledTimes(1));
      expect(httpPostSpy.mock.calls[0][1].fields[0].default_value).toBeUndefined();

      // Now type a new password: that value, and only that value, is sent.
      await user.click(within(container).getByText('Secret (secret)').closest('tr').querySelector('button.cds--btn--tertiary'));
      await user.type(modalInput('default_value', 'password'), 'n3w-pass');
      await user.click(modalButton(/^save$/i));
      await waitFor(() => expect(screen.getByText('********')).toBeInTheDocument());
      expect(screen.queryByText('n3w-pass')).not.toBeInTheDocument();

      await user.click(saveBtn());
      await waitFor(() => expect(httpPostSpy).toHaveBeenCalledTimes(2));
      expect(httpPostSpy.mock.calls[1][1].fields[0].default_value).toBe('n3w-pass');
    });
  });

  describe('Save and Reset buttons', () => {
    const modal = () => document.querySelector('.cds--modal-container');
    const pageButton = (container, name) => (
      within(container).getAllByRole('button', { name }).find((btn) => !modal() || !modal().contains(btn))
    );

    it('starts with Save and Reset disabled and Cancel enabled', () => {
      const { container } = renderWithRedux(<ClassFieldsEditor {...defaultProps} initialData={[makeInitialRow()]} />);

      expect(pageButton(container, /^save$/i)).toBeDisabled();
      expect(pageButton(container, /^reset$/i)).toBeDisabled();
      expect(pageButton(container, /^cancel$/i)).toBeEnabled();
    });

    it('starts with Save and Reset disabled when the class has no fields yet', () => {
      const { container } = renderWithRedux(<ClassFieldsEditor {...defaultProps} initialData={[]} />);

      expect(pageButton(container, /^save$/i)).toBeDisabled();
      expect(pageButton(container, /^reset$/i)).toBeDisabled();
    });

    it('enables Save and Reset after a field is added', async() => {
      const user = userEvent.setup();
      const { container } = renderWithRedux(<ClassFieldsEditor {...defaultProps} initialData={[makeInitialRow()]} />);

      await addField(user, 'another_field');

      await waitFor(() => expect(pageButton(container, /^save$/i)).toBeEnabled());
      expect(pageButton(container, /^reset$/i)).toBeEnabled();
    });

    it('enables Save and Reset after a field is deleted', async() => {
      const user = userEvent.setup();
      const { container } = renderWithRedux(<ClassFieldsEditor {...defaultProps} initialData={[makeInitialRow()]} />);

      const row = within(container).getByText('My Field (my_field)').closest('tr');
      await user.click(within(row).getByRole('button', { name: /^delete$/i }));

      await waitFor(() => expect(pageButton(container, /^save$/i)).toBeEnabled());
      expect(pageButton(container, /^reset$/i)).toBeEnabled();
    });

    it('disables Save and Reset again once Reset has restored the saved fields', async() => {
      const user = userEvent.setup();
      httpPostSpy.mockResolvedValue({
        message: 'All changes have been reset',
        fields: [{
          id: 1, name: 'my_field', display_name: 'My Field', aetype: 'attribute', datatype: 'string', substitute: true,
        }],
      });
      const { container } = renderWithRedux(<ClassFieldsEditor {...defaultProps} initialData={[makeInitialRow()]} />);

      await addField(user, 'another_field');
      await waitFor(() => expect(pageButton(container, /^reset$/i)).toBeEnabled());
      await user.click(pageButton(container, /^reset$/i));

      await waitFor(() => expect(screen.queryByText('another_field')).not.toBeInTheDocument());
      await waitFor(() => expect(pageButton(container, /^save$/i)).toBeDisabled());
      expect(pageButton(container, /^reset$/i)).toBeDisabled();
    });
  });

  describe('row identity', () => {
    const modal = () => document.querySelector('.cds--modal-container');
    const rowFor = (container, text) => within(container).getByText(text).closest('tr');
    const clickInRow = (user, container, text, buttonName) => (
      user.click(within(rowFor(container, text)).getByRole('button', { name: buttonName }))
    );

    it('deletes only the chosen row when new rows are added after a delete', async() => {
      const user = userEvent.setup();
      const { container } = renderWithRedux(<ClassFieldsEditor {...defaultProps} />);

      await addField(user, 'aaa');
      await addField(user, 'bbb');
      await clickInRow(user, container, 'aaa', /^delete$/i);
      await addField(user, 'ccc'); // used to get the same id as 'bbb'

      await clickInRow(user, container, 'ccc', /^delete$/i);

      await waitFor(() => expect(screen.queryByText('ccc')).not.toBeInTheDocument());
      expect(screen.getByText('bbb')).toBeInTheDocument();
    });

    it('does not mix up a new row with a saved row whose id equals the row count', async() => {
      const user = userEvent.setup();
      // DB ids 1 and 2: the next new row used to get the id "2" as well.
      const initialData = [
        makeInitialRow({ id: 1, name: 'one', display_name: 'One' }),
        makeInitialRow({ id: 2, name: 'two', display_name: 'Two' }),
      ];
      const { container } = renderWithRedux(<ClassFieldsEditor {...defaultProps} initialData={initialData} />);

      await addField(user, 'ccc');
      await clickInRow(user, container, 'ccc', /^delete$/i);

      await waitFor(() => expect(screen.queryByText('ccc')).not.toBeInTheDocument());
      expect(screen.getByText('One (one)')).toBeInTheDocument();
      expect(screen.getByText('Two (two)')).toBeInTheDocument();
    });

    it('keeps the edited row in place and only updates that row', async() => {
      const user = userEvent.setup();
      const { container } = renderWithRedux(<ClassFieldsEditor {...defaultProps} />);

      await addField(user, 'aaa');
      await addField(user, 'bbb');
      await clickInRow(user, container, 'aaa', /^update$/i);
      await user.clear(modal().querySelector('input[id="name"]'));
      await user.type(modal().querySelector('input[id="name"]'), 'aaa2');
      await user.click(within(modal()).getByRole('button', { name: /^save$/i }));

      await waitFor(() => expect(screen.getByText('aaa2')).toBeInTheDocument());
      expect(screen.queryByText('aaa')).not.toBeInTheDocument();
      expect(screen.getByText('bbb')).toBeInTheDocument();
    });
  });

  it('includes deleted field id in fields_to_delete when saved after a delete', async() => {
    httpPostSpy.mockResolvedValue({ message: 'Schema saved' });
    const propsWithRow = {
      ...defaultProps,
      initialData: [makeInitialRow({ id: 99, name: 'to_delete', display_name: 'To Delete' })],
    };

    const { container } = renderWithRedux(<ClassFieldsEditor {...propsWithRow} />);

    const deleteBtn = container.querySelector('button.miq-data-table-button.cds--btn--danger');
    expect(deleteBtn).not.toBeNull();
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(screen.queryByText('To Delete (to_delete)')).not.toBeInTheDocument();
    });

    const saveBtn = within(container).getAllByRole('button', { name: /^save$/i })
      .find((btn) => !btn.disabled);
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(httpPostSpy).toHaveBeenCalledWith(
        '/miq_ae_class/update_fields/42?button=save',
        expect.objectContaining({ fields: [], fields_to_delete: [99] }),
        { skipErrors: [422] }
      );
    });
  });
});
