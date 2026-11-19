import { screen, fireEvent } from '@testing-library/react';
import { renderWithRedux } from '../helpers/mountForm';
import TabOptionsMenu from '../../components/service-dialog-form/tab-options-menu';
import EditTabModal from '../../components/service-dialog-form/edit-tab-modal';
import EditSectionModal from '../../components/service-dialog-form/edit-section-modal';

describe('EditTabModal', () => {
  const onSave = jest.fn();
  const onClose = jest.fn();

  beforeEach(() => {
    onSave.mockClear();
    onClose.mockClear();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = renderWithRedux(
      <EditTabModal isOpen={false} tab={{ label: 'X' }} onSave={onSave} onClose={onClose} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders the modal with heading "Add Tab" when no tab label is given', () => {
    renderWithRedux(
      <EditTabModal isOpen tab={undefined} onSave={onSave} onClose={onClose} />
    );
    expect(screen.getByText('Add Tab')).toBeInTheDocument();
  });

  it('renders the modal with the tab label in the heading when editing', () => {
    renderWithRedux(
      <EditTabModal isOpen tab={{ label: 'My Tab', description: '' }} onSave={onSave} onClose={onClose} />
    );
    expect(screen.getByText(/Edit Tab "My Tab"/)).toBeInTheDocument();
  });

  it('renders a label input and a description textarea', () => {
    renderWithRedux(
      <EditTabModal isOpen tab={{ label: 'T', description: '' }} onSave={onSave} onClose={onClose} />
    );
    expect(screen.getByLabelText(/label/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
  });

  it('calls onClose when the modal X is clicked', () => {
    renderWithRedux(
      <EditTabModal isOpen tab={{ label: 'T', description: '' }} onSave={onSave} onClose={onClose} />
    );
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('EditSectionModal', () => {
  const onSave = jest.fn();
  const onClose = jest.fn();

  beforeEach(() => {
    onSave.mockClear();
    onClose.mockClear();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = renderWithRedux(
      <EditSectionModal isOpen={false} section={{ label: 'X' }} onSave={onSave} onClose={onClose} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders the modal with heading "Add Section" when no section label is given', () => {
    renderWithRedux(
      <EditSectionModal isOpen section={undefined} onSave={onSave} onClose={onClose} />
    );
    expect(screen.getByText('Add Section')).toBeInTheDocument();
  });

  it('renders with the section label in the heading when editing', () => {
    renderWithRedux(
      <EditSectionModal isOpen section={{ label: 'My Section', description: '' }} onSave={onSave} onClose={onClose} />
    );
    expect(screen.getByText(/Edit Section "My Section"/)).toBeInTheDocument();
  });

  it('calls onClose when the close button is clicked', () => {
    renderWithRedux(
      <EditSectionModal isOpen section={{ label: 'S', description: '' }} onSave={onSave} onClose={onClose} />
    );
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('TabOptionsMenu', () => {
  const onEdit = jest.fn();
  const onDelete = jest.fn();

  beforeEach(() => {
    onEdit.mockClear();
    onDelete.mockClear();
  });

  it('renders an overflow menu trigger', () => {
    renderWithRedux(<TabOptionsMenu onEdit={onEdit} onDelete={onDelete} />);
    expect(document.querySelector('.cds--overflow-menu')).not.toBeNull();
  });

  it('calls onEdit when the Edit menu item is clicked', () => {
    renderWithRedux(<TabOptionsMenu onEdit={onEdit} onDelete={onDelete} />);
    // Open the overflow menu first
    fireEvent.click(document.querySelector('.cds--overflow-menu'));
    fireEvent.click(screen.getByText('Edit'));
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it('calls onDelete when the Delete menu item is clicked', () => {
    renderWithRedux(<TabOptionsMenu onEdit={onEdit} onDelete={onDelete} />);
    fireEvent.click(document.querySelector('.cds--overflow-menu'));
    fireEvent.click(screen.getByText('Delete'));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
