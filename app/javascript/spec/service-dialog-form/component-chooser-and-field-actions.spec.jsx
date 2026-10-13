import { screen, fireEvent } from '@testing-library/react';
import { renderWithRedux } from '../helpers/mountForm';
import DynamicComponentChooser from '../../components/service-dialog-form/dynamic-component-chooser';
import DynamicFieldActions from '../../components/service-dialog-form/dynamic-field-actions';
import { fieldComponents } from '../../components/service-dialog-form/data';

describe('DynamicComponentChooser', () => {
  it('renders a palette item for each of the 8 field types', () => {
    renderWithRedux(<DynamicComponentChooser />);
    fieldComponents.forEach(({ label }) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it('each palette item has draggable=true', () => {
    renderWithRedux(<DynamicComponentChooser />);
    const items = document.querySelectorAll('.dynamic-component-chooser__item');
    expect(items).toHaveLength(fieldComponents.length);
    items.forEach((el) => expect(el.getAttribute('draggable')).toBe('true'));
  });

  it('fires onDragStart with the field type when dragging', () => {
    const onDragStart = jest.fn();
    renderWithRedux(<DynamicComponentChooser onDragStart={onDragStart} />);
    const item = document.querySelectorAll('.dynamic-component-chooser__item')[0];
    // fireEvent.dragStart provides a minimal DataTransfer stub
    fireEvent.dragStart(item, {
      dataTransfer: { setData: jest.fn(), effectAllowed: '' },
    });
    expect(onDragStart).toHaveBeenCalledWith('DialogFieldTextBox');
  });
});

describe('DynamicFieldActions', () => {
  const field = { name: 'my_field', label: 'My Field', type: 'DialogFieldTextBox' };
  const onAction = jest.fn();
  const onEditField = jest.fn();

  beforeEach(() => {
    onAction.mockClear();
    onEditField.mockClear();
  });

  const render = (overrides = {}) =>
    renderWithRedux(
      <DynamicFieldActions
        tabIndex={0}
        sectionIndex={1}
        fieldIndex={2}
        field={field}
        onAction={onAction}
        onEditField={onEditField}
        {...overrides}
      />
    );

  it('calls onEditField when the edit button is clicked', () => {
    render();
    fireEvent.click(screen.getByRole('button', { name: /edit field/i }));
    expect(onEditField).toHaveBeenCalledWith(field);
  });

  it('calls onAction with field.delete and exact indices when remove is clicked', () => {
    render();
    fireEvent.click(screen.getByRole('button', { name: /remove field/i }));
    expect(onAction).toHaveBeenCalledWith('field.delete', { tabIndex: 0, sectionIndex: 1, fieldIndex: 2 });
  });

  it('does not fire onAction when the edit button is clicked', () => {
    render();
    fireEvent.click(screen.getByRole('button', { name: /edit field/i }));
    expect(onAction).not.toHaveBeenCalled();
  });
});
