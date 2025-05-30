import React from 'react';
import {
  screen, waitFor, within, fireEvent,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ClassFieldsEditor } from '../../components/data-tables/datastore/schema/class-fields-editor';
import { renderWithRedux } from '../helpers/mountForm';
import '../helpers/miqSparkle';

import miqRedirectBack from '../../helpers/miq-redirect-back';
import miqFlash from '../../helpers/miq-flash';

jest.mock('../../helpers/miq-redirect-back', () => jest.fn());
jest.mock('../../helpers/miq-flash', () => jest.fn());

const AE_TYPE_OPTIONS = [
  ['Attribute', 'attribute', { 'data-icon': 'ff ff-attribute' }],
  ['Method', 'method', { 'data-icon': 'ff ff-ae-method' }],
  ['State', 'state', { 'data-icon': 'ff ff-ae-state' }],
];

const D_TYPE_OPTIONS = [
  ['String', 'string', { 'data-icon': 'ff ff-string' }],
  ['Integer', 'integer', { 'data-icon': 'ff ff-integer' }],
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
    { text: display_name ? `${display_name} (${name})` : name, icon: [] },
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

describe('ClassFieldsEditor', () => {
  let httpPostSpy;

  beforeEach(() => {
    httpPostSpy = jest.spyOn(window.http, 'post').mockResolvedValue({});
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
    httpPostSpy.mockResolvedValue({ status: 200, message: 'Schema for Automate Class "TestClass" was saved' });

    const { container } = renderWithRedux(<ClassFieldsEditor {...defaultProps} />);

    // Two Save buttons exist (outer form + hidden modal); click the enabled outer one
    const saveBtn = within(container).getAllByRole('button', { name: /^save$/i })
      .find((btn) => !btn.disabled);
    await user.click(saveBtn);

    await waitFor(() => {
      expect(httpPostSpy).toHaveBeenCalledWith(
        '/miq_ae_class/update_fields/42?button=save',
        expect.objectContaining({ fields: expect.any(Array), fields_to_delete: expect.any(Array) }),
        { skipErrors: [400] }
      );
    });
    expect(miqRedirectBack).toHaveBeenCalledWith(
      'Schema for Automate Class "TestClass" was saved',
      'success',
      '/miq_ae_class/explorer'
    );
  });

  it('shows an error when save returns a non-200 status', async() => {
    const user = userEvent.setup();
    httpPostSpy.mockResolvedValue({ status: 500, error: 'Something went wrong' });

    const { container } = renderWithRedux(<ClassFieldsEditor {...defaultProps} />);

    const saveBtn = within(container).getAllByRole('button', { name: /^save$/i })
      .find((btn) => !btn.disabled);
    await user.click(saveBtn);

    await waitFor(() => {
      expect(miqFlash).toHaveBeenCalledWith('error', 'Something went wrong');
    });
  });

  it('POSTs to update_fields with button=reset, reloads rows and shows a flash warning', async() => {
    httpPostSpy.mockResolvedValue({
      status: 200,
      message: 'All changes have been reset',
      fields: [{
        id: 1, name: 'field01', aetype: 'attribute', datatype: 'string', substitute: true,
      }],
    });

    const { container } = renderWithRedux(<ClassFieldsEditor {...defaultProps} />);

    const resetBtn = within(container).getAllByRole('button', { name: /^reset$/i })[0];
    fireEvent.click(resetBtn);

    await waitFor(() => {
      expect(httpPostSpy).toHaveBeenCalledWith(
        '/miq_ae_class/update_fields/42?button=reset',
        expect.objectContaining({}),
        { skipErrors: [400] }
      );
    });
    expect(miqFlash).toHaveBeenCalledWith('warning', 'All changes have been reset');
    expect(miqRedirectBack).not.toHaveBeenCalled();
  });

  it('POSTs to update_fields with button=cancel and redirects on success', async() => {
    const user = userEvent.setup();
    httpPostSpy.mockResolvedValue({ status: 200, message: 'Edit of schema for Automate Class "TestClass" was cancelled by the user' });

    const { container } = renderWithRedux(<ClassFieldsEditor {...defaultProps} />);

    await user.click(within(container).getAllByRole('button', { name: /^cancel$/i })[0]);

    await waitFor(() => {
      expect(httpPostSpy).toHaveBeenCalledWith(
        '/miq_ae_class/update_fields/42?button=cancel',
        expect.objectContaining({}),
        { skipErrors: [400] }
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

  it('includes deleted field id in fields_to_delete when saved after a delete', async() => {
    httpPostSpy.mockResolvedValue({ status: 200, message: 'Schema saved' });
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
        { skipErrors: [400] }
      );
    });
  });
});
