import { screen, fireEvent } from '@testing-library/react';
import { renderWithRedux } from '../helpers/mountForm';
import DynamicField from '../../components/service-dialog-form/dynamic-field';

// Mock EditFieldModal — not yet implemented (Sub-Task 4)
jest.mock('../../components/service-dialog-form/edit-field-modal', () => () => <div data-testid="edit-field-modal" />, { virtual: true });

const onAction = jest.fn();

const makeField = (type, extra = {}) => ({
  name: 'test_field',
  label: 'Test Field',
  type,
  default_value: '',
  dynamic: false,
  read_only: false,
  required: false,
  visible: true,
  options: { protected: false },
  resource_action: { resource_type: 'DialogField', ae_attributes: {} },
  _version: 1,
  ...extra,
});

const render = (field) =>
  renderWithRedux(
    <DynamicField
      field={field}
      fieldIndex={0}
      tabIndex={0}
      sectionIndex={0}
      onAction={onAction}
    />
  );

describe('DynamicField — type routing', () => {
  beforeEach(() => onAction.mockClear());

  it('routes DialogFieldTextBox to a text input widget', () => {
    render(makeField('DialogFieldTextBox'));
    expect(document.querySelector('input[type="text"]')).not.toBeNull();
  });

  it('routes DialogFieldTextAreaBox to a textarea widget', () => {
    render(makeField('DialogFieldTextAreaBox'));
    expect(document.querySelector('textarea')).not.toBeNull();
  });

  it('routes DialogFieldCheckBox to a checkbox widget', () => {
    render(makeField('DialogFieldCheckBox'));
    expect(document.querySelector('input[type="checkbox"]')).not.toBeNull();
  });

  it('routes DialogFieldDropDownList to a dropdown widget', () => {
    render(makeField('DialogFieldDropDownList', {
      values: [['1', 'One'], ['2', 'Two']],
      options: { force_multi_value: false },
    }));
    // Carbon Dropdown renders a button as its trigger
    expect(document.querySelector('.cds--dropdown')).not.toBeNull();
  });

  it('routes DialogFieldRadioButton to a radio button group', () => {
    render(makeField('DialogFieldRadioButton', {
      values: [['1', 'One'], ['2', 'Two']],
    }));
    expect(document.querySelector('input[type="radio"]')).not.toBeNull();
  });

  it('routes DialogFieldDateControl to a date picker', () => {
    render(makeField('DialogFieldDateControl'));
    expect(document.querySelector('.cds--date-picker')).not.toBeNull();
  });

  it('routes DialogFieldDateTimeControl to a date+time picker', () => {
    render(makeField('DialogFieldDateTimeControl'));
    expect(document.querySelector('.cds--date-picker')).not.toBeNull();
    expect(document.querySelector('.cds--time-picker')).not.toBeNull();
  });

  it('routes DialogFieldTagControl to a select widget', () => {
    render(makeField('DialogFieldTagControl', { values: [] }));
    expect(document.querySelector('select')).not.toBeNull();
  });

  it('falls back to text input for unknown type', () => {
    render(makeField('DialogFieldUnknown'));
    expect(document.querySelector('input[type="text"]')).not.toBeNull();
  });
});

describe('DynamicField — actions', () => {
  it('fires field.delete when Remove button is clicked', () => {
    render(makeField('DialogFieldTextBox'));
    const removeBtn = screen.getByRole('button', { name: /remove field/i });
    fireEvent.click(removeBtn);
    expect(onAction).toHaveBeenCalledWith(
      'field.delete',
      { tabIndex: 0, sectionIndex: 0, fieldIndex: 0 }
    );
  });
});

describe('DynamicField — checkbox default_value encoding', () => {
  it('renders checked when default_value is "t"', () => {
    render(makeField('DialogFieldCheckBox', { default_value: 't' }));
    expect(document.querySelector('input[type="checkbox"]').checked).toBe(true);
  });

  it('renders unchecked when default_value is "f"', () => {
    render(makeField('DialogFieldCheckBox', { default_value: 'f' }));
    expect(document.querySelector('input[type="checkbox"]').checked).toBe(false);
  });
});

describe('DynamicField — dropdown MultiSelect initial selection', () => {
  it('renders MultiSelect when force_multi_value is true', () => {
    render(makeField('DialogFieldDropDownList', {
      values: [['1', 'One'], ['2', 'Two']],
      options: { force_multi_value: true },
      default_value: ['1'],
    }));
    expect(document.querySelector('.cds--multi-select')).not.toBeNull();
  });
});
