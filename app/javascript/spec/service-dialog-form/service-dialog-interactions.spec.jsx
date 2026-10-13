// Interaction tests for ServiceDialogForm using the real component tree.
import {
  screen, fireEvent, waitFor, within,
} from '@testing-library/react';
import fetchMock from 'fetch-mock';
import { renderWithRedux } from '../helpers/mountForm';
import ServiceDialogForm from '../../components/service-dialog-form';

const mockRedirectBack = jest.fn();
jest.mock('../../helpers/miq-redirect-back', () => (...args) => mockRedirectBack(...args));

beforeEach(() => {
  window.miqSparkleOn = jest.fn();
  window.miqSparkleOff = jest.fn();
  mockRedirectBack.mockClear();
  window.API.post = jest.fn();
});

afterEach(() => {
  fetchMock.reset();
  fetchMock.restore();
  window.sessionStorage.clear();
});

const newAction = { id: '', action: 'new' };

// Dialog with one tab, section and field, so Save is enabled
const mockDialog = {
  id: 42,
  label: 'My Dialog',
  description: 'Test dialog',
  content: [{
    dialog_tabs: [{
      id: 1,
      label: 'Tab 1',
      description: '',
      position: 0,
      dialog_groups: [{
        id: 10,
        label: 'Section 1',
        description: '',
        position: 0,
        dialog_fields: [{
          id: 100,
          name: 'field_1',
          label: 'Field One',
          type: 'DialogFieldTextBox',
          default_value: '',
          _version: 1,
          resource_action: { resource_type: 'DialogField', ae_attributes: {} },
        }],
      }],
    }],
  }],
};

const editAction = { id: '42', action: 'edit' };
const copyAction = { id: '42', action: 'copy' };
const dialogApiUrl = '/api/service_dialogs/42?expand=resources&attributes=content,dialog_tabs';

// Scoped to the open modal to avoid matching the dialog-level Label input
const openModal = () => within(screen.getByRole('dialog'));
const fillModalLabelAndSave = async(value) => {
  await waitFor(() => screen.getByRole('dialog'));
  fireEvent.change(openModal().getByLabelText(/label/i), { target: { value } });
  fireEvent.click(openModal().getByRole('button', { name: /^save$/i }));
};

describe('ServiceDialogForm — tab CRUD', () => {
  it('adds a tab when Add Tab modal is submitted', async() => {
    renderWithRedux(<ServiceDialogForm dialogAction={newAction} />);
    fireEvent.click(screen.getByRole('button', { name: /add tab/i }));
    await fillModalLabelAndSave('Brand New Tab');
    await waitFor(() => expect(screen.getByText('Brand New Tab')).toBeInTheDocument());
  });

  it('deletes a tab when Delete is chosen from the options menu', async() => {
    fetchMock.get(dialogApiUrl, mockDialog);
    renderWithRedux(<ServiceDialogForm dialogAction={editAction} />);
    await waitFor(() => screen.getByText('Tab 1'));
    fireEvent.click(screen.getByRole('button', { name: /options/i }));
    fireEvent.click(screen.getByText('Delete'));
    await waitFor(() => expect(screen.queryByText('Tab 1')).toBeNull());
  });

  it('edits a tab label via the overflow Edit menu item', async() => {
    fetchMock.get(dialogApiUrl, mockDialog);
    renderWithRedux(<ServiceDialogForm dialogAction={editAction} />);
    await waitFor(() => screen.getByText('Tab 1'));
    fireEvent.click(screen.getByRole('button', { name: /options/i }));
    fireEvent.click(screen.getByText('Edit'));
    await waitFor(() => expect(openModal().getByText(/edit tab/i)).toBeInTheDocument());
    await fillModalLabelAndSave('Renamed Tab');
    await waitFor(() => expect(screen.getByText('Renamed Tab')).toBeInTheDocument());
  });
});

describe('ServiceDialogForm — section CRUD', () => {
  it('adds a section when Add Section modal is submitted', async() => {
    renderWithRedux(<ServiceDialogForm dialogAction={newAction} />);
    fireEvent.click(screen.getByRole('button', { name: /add section/i }));
    await fillModalLabelAndSave('Extra Section');
    await waitFor(() => expect(screen.getByText('Extra Section')).toBeInTheDocument());
  });

  it('deletes a section when Section Delete is chosen', async() => {
    fetchMock.get(dialogApiUrl, mockDialog);
    renderWithRedux(<ServiceDialogForm dialogAction={editAction} />);
    await waitFor(() => screen.getByText('Section 1'));
    fireEvent.click(screen.getByRole('button', { name: /delete section/i }));
    await waitFor(() => expect(screen.queryByText('Section 1')).toBeNull());
  });

  it('cancels the section modal without adding a section', async() => {
    renderWithRedux(<ServiceDialogForm dialogAction={newAction} />);
    const beforeSections = document.querySelectorAll('.dynamic-section').length;
    fireEvent.click(screen.getByRole('button', { name: /add section/i }));
    await waitFor(() => screen.getByRole('dialog'));
    fireEvent.click(openModal().getByRole('button', { name: /cancel/i }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(document.querySelectorAll('.dynamic-section')).toHaveLength(beforeSections);
  });
});

describe('ServiceDialogForm — draft recovery', () => {
  it('shows the recovery modal when a draft exists', async() => {
    window.sessionStorage.setItem('service_dialog-new', JSON.stringify({ label: 'Draft', description: '', dialog_tabs: [] }));
    renderWithRedux(<ServiceDialogForm dialogAction={newAction} />);
    await waitFor(() => expect(screen.getByText('Restore previous changes?')).toBeInTheDocument());
  });

  it('restores the draft on Restore and hides the modal', async() => {
    const draft = {
      label: 'Restored Label',
      description: '',
      dialog_tabs: [{
        label: 'Draft Tab', description: '', position: 0, dialog_groups: [],
      }],
    };
    window.sessionStorage.setItem('service_dialog-new', JSON.stringify(draft));
    renderWithRedux(<ServiceDialogForm dialogAction={newAction} />);
    await waitFor(() => screen.getByText('Restore previous changes?'));
    fireEvent.click(screen.getByRole('button', { name: /restore/i }));
    await waitFor(() => {
      expect(screen.queryByText('Restore previous changes?')).toBeNull();
      expect(screen.getByDisplayValue('Restored Label')).toBeInTheDocument();
    });
  });

  it('discards the draft on Discard and keeps the clean state', async() => {
    window.sessionStorage.setItem('service_dialog-new', JSON.stringify({ label: 'Junk', description: '', dialog_tabs: [] }));
    renderWithRedux(<ServiceDialogForm dialogAction={newAction} />);
    await waitFor(() => screen.getByText('Restore previous changes?'));
    fireEvent.click(screen.getByRole('button', { name: /discard/i }));
    await waitFor(() => expect(screen.queryByText('Restore previous changes?')).toBeNull());
    expect(screen.getByLabelText(/label/i).value).toBe('');
    expect(window.sessionStorage.getItem('service_dialog-new')).toBeNull();
  });

  it('dismisses the draft modal via the close (X) button', async() => {
    window.sessionStorage.setItem('service_dialog-new', JSON.stringify({ label: 'X Draft', description: '', dialog_tabs: [] }));
    renderWithRedux(<ServiceDialogForm dialogAction={newAction} />);
    await waitFor(() => screen.getByText('Restore previous changes?'));
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    await waitFor(() => expect(screen.queryByText('Restore previous changes?')).toBeNull());
  });

  it('does not show the recovery modal when no draft is stored', () => {
    renderWithRedux(<ServiceDialogForm dialogAction={newAction} />);
    expect(screen.queryByText('Restore previous changes?')).toBeNull();
  });
});

describe('ServiceDialogForm — handleSubmit', () => {
  it('POSTs to /api/service_dialogs with action:create and a success message for a new dialog', async() => {
    // Restoring a draft is the quickest way to get a saveable new dialog
    const draft = {
      label: 'Brand New',
      description: 'd',
      dialog_tabs: [{
        label: 'T',
        description: '',
        position: 0,
        dialog_groups: [{
          label: 'S',
          description: '',
          position: 0,
          dialog_fields: [{
            name: 'f1',
            label: 'F1',
            type: 'DialogFieldTextBox',
            _version: 1,
            resource_action: { resource_type: 'DialogField', ae_attributes: {} },
          }],
        }],
      }],
    };
    window.sessionStorage.setItem('service_dialog-new', JSON.stringify(draft));
    window.API.post = jest.fn().mockResolvedValue({});
    renderWithRedux(<ServiceDialogForm dialogAction={newAction} />);
    await waitFor(() => screen.getByText('Restore previous changes?'));
    fireEvent.click(screen.getByRole('button', { name: /restore/i }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Save' })).not.toBeDisabled());
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(window.API.post).toHaveBeenCalled());
    const [url, payload] = window.API.post.mock.calls[0];
    expect(url).toBe('/api/service_dialogs');
    expect(payload.action).toBe('create');
    expect(payload.resource.label).toBe('Brand New');
    expect(payload.resource.buttons).toBe('submit,cancel');
    expect(payload.resource.dialog_tabs[0].dialog_groups[0].dialog_fields[0].name).toBe('f1');
    await waitFor(() => expect(mockRedirectBack).toHaveBeenCalled());
    expect(mockRedirectBack.mock.calls[0][0]).toMatch(/"Brand New" was added/);
    expect(window.miqSparkleOn).toHaveBeenCalled();
  });

  it('POSTs to the correct edit URL with action:edit for an edit', async() => {
    fetchMock.get(dialogApiUrl, mockDialog);
    window.API.post = jest.fn().mockResolvedValue({});
    renderWithRedux(<ServiceDialogForm dialogAction={editAction} />);
    await waitFor(() => screen.getByDisplayValue('My Dialog'));
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(window.API.post).toHaveBeenCalled());
    const [url, payload] = window.API.post.mock.calls[0];
    expect(url).toBe('/api/service_dialogs/42');
    expect(payload.action).toBe('edit');
    expect(payload.resource.content.dialog_tabs[0].id).toBe(1);
  });

  it('POSTs to /api/service_dialogs with action:create for a copy', async() => {
    fetchMock.get(dialogApiUrl, mockDialog);
    window.API.post = jest.fn().mockResolvedValue({});
    renderWithRedux(<ServiceDialogForm dialogAction={copyAction} />);
    await waitFor(() => screen.getByDisplayValue(/copy of my dialog/i));
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(window.API.post).toHaveBeenCalled());
    const [url, payload] = window.API.post.mock.calls[0];
    expect(url).toBe('/api/service_dialogs');
    expect(payload.action).toBe('create');
    // Copy strips database ids
    expect(payload.resource.dialog_tabs[0].id).toBeUndefined();
    expect(payload.resource.dialog_tabs[0].dialog_groups[0].dialog_fields[0].id).toBeUndefined();
  });

  it('calls miqRedirectBack with a success message on successful save', async() => {
    fetchMock.get(dialogApiUrl, mockDialog);
    window.API.post = jest.fn().mockResolvedValue({});
    renderWithRedux(<ServiceDialogForm dialogAction={editAction} />);
    await waitFor(() => screen.getByDisplayValue('My Dialog'));
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(mockRedirectBack).toHaveBeenCalled());
    const [msg, type, path] = mockRedirectBack.mock.calls[0];
    expect(msg).toBe('Service Dialog "My Dialog" was saved');
    expect(type).toBe('success');
    expect(path).toBe('/miq_ae_customization/explorer');
  });

  it('calls miqSparkleOff on API failure', async() => {
    fetchMock.get(dialogApiUrl, mockDialog);
    window.API.post = jest.fn().mockRejectedValue(new Error('500'));
    renderWithRedux(<ServiceDialogForm dialogAction={editAction} />);
    await waitFor(() => screen.getByDisplayValue('My Dialog'));
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(window.miqSparkleOff).toHaveBeenCalled());
    expect(mockRedirectBack).not.toHaveBeenCalled();
  });
});

describe('ServiceDialogForm — handleCancel', () => {
  it('calls miqRedirectBack with a warning message on Cancel (new)', () => {
    renderWithRedux(<ServiceDialogForm dialogAction={newAction} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(mockRedirectBack).toHaveBeenCalledWith(
      expect.stringMatching(/cancelled/i),
      'warning',
      '/miq_ae_customization/explorer'
    );
  });

  it('includes the dialog label in the cancel message for edit', async() => {
    fetchMock.get(dialogApiUrl, mockDialog);
    renderWithRedux(<ServiceDialogForm dialogAction={editAction} />);
    await waitFor(() => screen.getByDisplayValue('My Dialog'));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(mockRedirectBack.mock.calls[0][0]).toMatch(/my dialog/i);
  });

  it('clears the draft on Cancel', () => {
    window.sessionStorage.setItem('service_dialog-new', '{"label":"leftovers"}');
    renderWithRedux(<ServiceDialogForm dialogAction={newAction} />);
    if (screen.queryByText('Restore previous changes?')) {
      fireEvent.click(screen.getByRole('button', { name: /discard/i }));
    }
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(window.sessionStorage.getItem('service_dialog-new')).toBeNull();
  });
});

describe('ServiceDialogForm — selected-tab adjustment on delete', () => {
  it('renders no tabs and does not crash when the only tab is deleted', async() => {
    renderWithRedux(<ServiceDialogForm dialogAction={newAction} />);
    fireEvent.click(screen.getByRole('button', { name: /options/i }));
    fireEvent.click(screen.getByText('Delete'));
    await waitFor(() => expect(screen.queryAllByRole('tab')).toHaveLength(0));
  });
});

describe('ServiceDialogForm — selected tab after delete', () => {
  it('keeps a valid tab selected after deleting the currently selected last tab', async() => {
    renderWithRedux(<ServiceDialogForm dialogAction={newAction} />);
    fireEvent.click(screen.getByRole('button', { name: /add tab/i }));
    await fillModalLabelAndSave('Tab Two');
    await waitFor(() => screen.getByText('Tab Two'));
    await waitFor(() => expect(screen.getByRole('tab', { name: /Tab Two/ })).toHaveAttribute('aria-selected', 'true'));
    const menus = screen.getAllByRole('button', { name: /options/i });
    fireEvent.click(menus[menus.length - 1]);
    fireEvent.click(screen.getByText('Delete'));
    await waitFor(() => expect(screen.queryByText('Tab Two')).toBeNull());
    const remaining = screen.getAllByRole('tab');
    expect(remaining).toHaveLength(1);
    expect(remaining[0]).toHaveAttribute('aria-selected', 'true');
  });
});

describe('ServiceDialogForm — edit/copy loading', () => {
  it('falls back to an empty dialog on API error', async() => {
    fetchMock.get(dialogApiUrl, 500);
    renderWithRedux(<ServiceDialogForm dialogAction={editAction} />);
    await waitFor(() => expect(document.querySelector('.cds--loading')).toBeNull());
    expect(screen.getByLabelText(/label/i)).toBeInTheDocument();
  });

  it('renders loaded fields after an edit dialog loads', async() => {
    fetchMock.get(dialogApiUrl, mockDialog);
    renderWithRedux(<ServiceDialogForm dialogAction={editAction} />);
    await waitFor(() => screen.getByDisplayValue('My Dialog'));
    expect(screen.getByText('Field One')).toBeInTheDocument();
  });
});

describe('ServiceDialogForm — save-enable gate', () => {
  it('enables Save only when a label is set and the dialog has a tab > section > field', async() => {
    fetchMock.get(dialogApiUrl, mockDialog);
    renderWithRedux(<ServiceDialogForm dialogAction={editAction} />);
    await waitFor(() => screen.getByDisplayValue('My Dialog'));
    expect(screen.getByRole('button', { name: 'Save' })).not.toBeDisabled();
  });

  it('disables Save after clearing the dialog label', async() => {
    fetchMock.get(dialogApiUrl, mockDialog);
    renderWithRedux(<ServiceDialogForm dialogAction={editAction} />);
    await waitFor(() => screen.getByDisplayValue('My Dialog'));
    fireEvent.change(screen.getByLabelText(/label/i), { target: { value: '' } });
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });
});

describe('ServiceDialogForm — tab drag-and-drop', () => {
  const addTab = async(label) => {
    fireEvent.click(screen.getByRole('button', { name: /add tab/i }));
    await fillModalLabelAndSave(label);
    await waitFor(() => screen.getByText(label));
  };
  const tabLabels = () => screen.getAllByRole('tab').map((t) => t.textContent);

  it('reorders tabs when one is dropped on another', async() => {
    renderWithRedux(<ServiceDialogForm dialogAction={newAction} />);
    await addTab('Tab Two');
    expect(tabLabels()[0]).toMatch(/New Tab/);
    const tabs = screen.getAllByRole('tab');
    const dataTransfer = { setData: jest.fn(), getData: jest.fn().mockReturnValue(''), effectAllowed: '' };
    fireEvent.dragStart(tabs[0], { dataTransfer });
    fireEvent.drop(tabs[1], { dataTransfer });
    await waitFor(() => expect(tabLabels()[0]).toMatch(/Tab Two/));
    expect(tabLabels()[1]).toMatch(/New Tab/);
  });

  it('ignores drops carrying text/plain (palette drags)', async() => {
    renderWithRedux(<ServiceDialogForm dialogAction={newAction} />);
    await addTab('Tab Two');
    const tabs = screen.getAllByRole('tab');
    const dataTransfer = { setData: jest.fn(), getData: jest.fn().mockReturnValue('DialogFieldTextBox'), effectAllowed: '' };
    fireEvent.dragStart(tabs[0], { dataTransfer });
    fireEvent.drop(tabs[1], { dataTransfer });
    expect(tabLabels()[0]).toMatch(/New Tab/);
  });

  it('does not reorder when dropped on itself', async() => {
    renderWithRedux(<ServiceDialogForm dialogAction={newAction} />);
    await addTab('Tab Two');
    const tabs = screen.getAllByRole('tab');
    const dataTransfer = { setData: jest.fn(), getData: jest.fn().mockReturnValue(''), effectAllowed: '' };
    fireEvent.dragStart(tabs[0], { dataTransfer });
    fireEvent.drop(tabs[0], { dataTransfer });
    expect(tabLabels()[0]).toMatch(/New Tab/);
  });

  it('refuses to start a drag while a modal is visible', async() => {
    renderWithRedux(<ServiceDialogForm dialogAction={newAction} />);
    await addTab('Tab Two');
    const tabs = screen.getAllByRole('tab');
    const modal = document.createElement('div');
    modal.className = 'cds--modal is-visible';
    document.body.appendChild(modal);
    const dataTransfer = { setData: jest.fn(), effectAllowed: '' };
    fireEvent.dragStart(tabs[0], { dataTransfer });
    expect(dataTransfer.setData).not.toHaveBeenCalled();
    document.body.removeChild(modal);
  });
});
