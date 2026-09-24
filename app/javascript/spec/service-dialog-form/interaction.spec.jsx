import { screen, fireEvent } from '@testing-library/react';
import { renderWithRedux } from '../helpers/mountForm';
import ServiceDialogForm from '../../components/service-dialog-form';

// Renders the full component tree (no DynamicSection mock) to verify
// UI-level rendering and state that does not require a Rails server or DB.

const newAction = { id: '', action: 'new' };
const renderForm = () => renderWithRedux(<ServiceDialogForm dialogAction={newAction} />);

// ── Initial render ────────────────────────────────────────────────────────────

describe('ServiceDialogForm — initial render', () => {
  it('renders at least one tab', () => {
    renderForm();
    expect(screen.getAllByRole('tab').length).toBeGreaterThanOrEqual(1);
  });

  it('renders at least one section', () => {
    renderForm();
    expect(document.querySelectorAll('.dynamic-section').length).toBeGreaterThanOrEqual(1);
  });

  it('renders the field palette', () => {
    renderForm();
    expect(document.querySelector('.dynamic-component-chooser')).not.toBeNull();
  });

  it('renders Add tab button', () => {
    renderForm();
    expect(screen.getByRole('button', { name: /add tab/i })).toBeInTheDocument();
  });

  it('renders Add Section button', () => {
    renderForm();
    expect(screen.getByRole('button', { name: /add section/i })).toBeInTheDocument();
  });
});

// ── Save button disabled state ────────────────────────────────────────────────
//
// isSaveDisabled = !label || no tabs || any tab has no sections || any section has no fields.
// The initial state (label empty, default tab+section present but no fields) should be disabled.

describe('ServiceDialogForm — save guard', () => {
  it('Save is disabled on initial load (no label, no fields)', () => {
    renderForm();
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('Cancel is always enabled on initial load', () => {
    renderForm();
    expect(screen.getByRole('button', { name: 'Cancel' })).not.toBeDisabled();
  });

  it('Save remains disabled after typing a label alone (no fields yet)', () => {
    // isSaveDisabled also requires at least one field per section
    renderForm();
    fireEvent.change(screen.getByLabelText(/label/i), { target: { value: 'My Dialog' } });
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('label input reflects typed value', () => {
    renderForm();
    const input = screen.getByLabelText(/label/i);
    fireEvent.change(input, { target: { value: 'Test Dialog' } });
    expect(input.value).toBe('Test Dialog');
  });

  it('description input reflects typed value', () => {
    renderForm();
    const input = screen.getByLabelText(/description/i);
    fireEvent.change(input, { target: { value: 'Some description' } });
    expect(input.value).toBe('Some description');
  });
});
