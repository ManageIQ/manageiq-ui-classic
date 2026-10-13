import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithRedux } from '../helpers/mountForm';
import DynamicField from '../../components/service-dialog-form/dynamic-field';

// Expose the props DynamicField hands to the modal so they can be asserted on.
jest.mock('../../components/service-dialog-form/edit-field-modal', () => ({
  categories, emsWorkflowsEnabled, dialogData, onSave, onClose,
}) => (
  <div data-testid="edit-field-modal">
    <span data-testid="modal-categories">{JSON.stringify(categories)}</span>
    <span data-testid="modal-ems">{String(emsWorkflowsEnabled)}</span>
    <span data-testid="modal-dialog-data">{JSON.stringify(dialogData)}</span>
    <button type="button" onClick={() => onSave({ label: 'Updated' })}>mock-save</button>
    <button type="button" onClick={onClose}>mock-close</button>
  </div>
), { virtual: true });

const onAction = jest.fn();

const makeField = (type, extra = {}) => ({
  name: 'test_field',
  label: 'Test Field',
  type,
  default_value: '',
  options: { protected: false },
  resource_action: { resource_type: 'DialogField', ae_attributes: {} },
  _version: 1,
  ...extra,
});

const render = (field, props = {}) => renderWithRedux(
  <DynamicField
    field={field}
    fieldIndex={2}
    tabIndex={0}
    sectionIndex={3}
    onAction={onAction}
    {...props}
  />
);

describe('DynamicField — TagControl categories fetch', () => {
  beforeEach(() => {
    onAction.mockClear();
    window.API.get = jest.fn();
  });

  it('fetches categories once for a DialogFieldTagControl', async() => {
    window.API.get.mockResolvedValue({ resources: [{ id: '1', name: 'env' }] });
    render(makeField('DialogFieldTagControl', { values: [] }));
    await waitFor(() => expect(window.API.get).toHaveBeenCalledTimes(1));
    expect(window.API.get).toHaveBeenCalledWith(
      '/api/categories?expand=resources&attributes=id,name,description,single_value,children'
    );
  });

  it('does not fetch categories for other field types', () => {
    window.API.get.mockResolvedValue({ resources: [] });
    render(makeField('DialogFieldTextBox'));
    expect(window.API.get).not.toHaveBeenCalled();
  });

  it('passes the fetched categories to the edit modal', async() => {
    const resources = [{ id: '1', name: 'env' }];
    window.API.get.mockResolvedValue({ resources });
    render(makeField('DialogFieldTagControl', { values: [] }));
    await waitFor(() => expect(window.API.get).toHaveBeenCalled());
    fireEvent.click(screen.getByRole('button', { name: /edit field/i }));
    await waitFor(() => expect(screen.getByTestId('modal-categories').textContent).toBe(JSON.stringify(resources)));
  });

  it('falls back to an empty list when the response has no resources', async() => {
    window.API.get.mockResolvedValue({});
    render(makeField('DialogFieldTagControl', { values: [] }));
    await waitFor(() => expect(window.API.get).toHaveBeenCalled());
    fireEvent.click(screen.getByRole('button', { name: /edit field/i }));
    expect(screen.getByTestId('modal-categories').textContent).toBe('[]');
  });

  it('swallows an API failure and still renders the field', async() => {
    window.API.get.mockRejectedValue(new Error('boom'));
    render(makeField('DialogFieldTagControl', { values: [] }));
    await waitFor(() => expect(window.API.get).toHaveBeenCalled());
    expect(document.querySelector('select')).not.toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /edit field/i }));
    expect(screen.getByTestId('modal-categories').textContent).toBe('[]');
  });
});

describe('DynamicField — edit modal lifecycle', () => {
  beforeEach(() => {
    onAction.mockClear();
    window.API.get = jest.fn().mockResolvedValue({ resources: [] });
  });

  it('does not render the modal until Edit is clicked', () => {
    render(makeField('DialogFieldTextBox'));
    expect(screen.queryByTestId('edit-field-modal')).toBeNull();
  });

  it('opens the modal when Edit is clicked', () => {
    render(makeField('DialogFieldTextBox'));
    fireEvent.click(screen.getByRole('button', { name: /edit field/i }));
    expect(screen.getByTestId('edit-field-modal')).toBeInTheDocument();
  });

  it('closes the modal without firing an action on close', () => {
    render(makeField('DialogFieldTextBox'));
    fireEvent.click(screen.getByRole('button', { name: /edit field/i }));
    fireEvent.click(screen.getByText('mock-close'));
    expect(screen.queryByTestId('edit-field-modal')).toBeNull();
    expect(onAction).not.toHaveBeenCalled();
  });

  it('fires field.edit with the field name and values on save, then closes', () => {
    render(makeField('DialogFieldTextBox'));
    fireEvent.click(screen.getByRole('button', { name: /edit field/i }));
    fireEvent.click(screen.getByText('mock-save'));
    expect(onAction).toHaveBeenCalledWith('field.edit', { fieldName: 'test_field', values: { label: 'Updated' } });
    expect(screen.queryByTestId('edit-field-modal')).toBeNull();
  });

  it('forwards emsWorkflowsEnabled and dialogData to the modal', () => {
    render(makeField('DialogFieldTextBox'), { emsWorkflowsEnabled: true, dialogData: { tabs: [] } });
    fireEvent.click(screen.getByRole('button', { name: /edit field/i }));
    expect(screen.getByTestId('modal-ems').textContent).toBe('true');
    expect(screen.getByTestId('modal-dialog-data').textContent).toBe('{"tabs":[]}');
  });

  it('defaults emsWorkflowsEnabled to false', () => {
    render(makeField('DialogFieldTextBox'));
    fireEvent.click(screen.getByRole('button', { name: /edit field/i }));
    expect(screen.getByTestId('modal-ems').textContent).toBe('false');
  });
});

describe('DynamicField — wrapper markup', () => {
  beforeEach(() => {
    window.API.get = jest.fn().mockResolvedValue({ resources: [] });
  });

  it('adds a type-specific modifier class', () => {
    render(makeField('DialogFieldCheckBox'));
    expect(document.querySelector('.dynamic-field--check-box')).not.toBeNull();
  });

  it('passes indices through to the delete action', () => {
    onAction.mockClear();
    render(makeField('DialogFieldTextBox'));
    fireEvent.click(screen.getByRole('button', { name: /remove field/i }));
    expect(onAction).toHaveBeenCalledWith('field.delete', { tabIndex: 0, sectionIndex: 3, fieldIndex: 2 });
  });
});
