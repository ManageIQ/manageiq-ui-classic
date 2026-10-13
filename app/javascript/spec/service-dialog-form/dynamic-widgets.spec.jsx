/**
 * Canvas widget unit tests.
 * Each widget is display-only in the editor canvas — they render data from
 * `field` prop but do not fire state changes.
 */
import { screen } from '@testing-library/react';
import { renderWithRedux } from '../helpers/mountForm';
import DynamicTextInput from '../../components/service-dialog-form/dynamic-fields/dynamic-text-input';
import DynamicTextArea from '../../components/service-dialog-form/dynamic-fields/dynamic-text-area';
import DynamicCheckBox from '../../components/service-dialog-form/dynamic-fields/dynamic-checkbox';
import DynamicDropdown from '../../components/service-dialog-form/dynamic-fields/dynamic-dropdown';
import DynamicRadioButton from '../../components/service-dialog-form/dynamic-fields/dynamic-radio-button';
import DynamicDatePicker from '../../components/service-dialog-form/dynamic-fields/dynamic-date-picker';
import DynamicTimePicker from '../../components/service-dialog-form/dynamic-fields/dynamic-time-picker';
import DynamicTagControl from '../../components/service-dialog-form/dynamic-fields/dynamic-tag-control';

const baseField = (overrides = {}) => ({
  name: 'test_field',
  label: 'Test Label',
  default_value: '',
  read_only: false,
  options: { protected: false },
  values: [],
  ...overrides,
});

describe('DynamicTextInput', () => {
  it('renders a text input with the field id and label', () => {
    renderWithRedux(<DynamicTextInput field={baseField()} />);
    const input = document.getElementById('field-test_field');
    expect(input).not.toBeNull();
    expect(input.type).toBe('text');
    expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
  });

  it('shows the default_value', () => {
    renderWithRedux(<DynamicTextInput field={baseField({ default_value: 'hello world' })} />);
    expect(screen.getByLabelText('Test Label').value).toBe('hello world');
  });

  it('renders type="password" when options.protected is true', () => {
    renderWithRedux(<DynamicTextInput field={baseField({ options: { protected: true } })} />);
    expect(document.getElementById('field-test_field').type).toBe('password');
  });

  it('renders type="text" when options.protected is false', () => {
    renderWithRedux(<DynamicTextInput field={baseField({ options: { protected: false } })} />);
    expect(document.getElementById('field-test_field').type).toBe('text');
  });

  it('sets readOnly when read_only is true', () => {
    renderWithRedux(<DynamicTextInput field={baseField({ read_only: true })} />);
    expect(document.getElementById('field-test_field').readOnly).toBe(true);
  });

  it('falls back to empty string when default_value is undefined', () => {
    const field = baseField();
    delete field.default_value;
    renderWithRedux(<DynamicTextInput field={field} />);
    expect(document.getElementById('field-test_field').value).toBe('');
  });
});

describe('DynamicTextArea', () => {
  it('renders a textarea with the field id and label', () => {
    renderWithRedux(<DynamicTextArea field={baseField()} />);
    const ta = document.getElementById('field-test_field');
    expect(ta).not.toBeNull();
    expect(ta.tagName).toBe('TEXTAREA');
  });

  it('shows the default_value', () => {
    renderWithRedux(<DynamicTextArea field={baseField({ default_value: 'multiline\ntext' })} />);
    expect(document.getElementById('field-test_field').value).toBe('multiline\ntext');
  });

  it('does NOT render a password-type input (no options.protected support)', () => {
    renderWithRedux(<DynamicTextArea field={baseField({ options: { protected: true } })} />);
    const ta = document.getElementById('field-test_field');
    expect(ta.tagName).toBe('TEXTAREA');
    expect(ta.type).not.toBe('password');
    expect(document.querySelector('input[type="password"]')).toBeNull();
  });
});

describe('DynamicCheckBox', () => {
  it('is checked when default_value is "t"', () => {
    renderWithRedux(<DynamicCheckBox field={baseField({ default_value: 't' })} />);
    expect(document.querySelector('input[type="checkbox"]').checked).toBe(true);
  });

  it('is unchecked when default_value is "f"', () => {
    renderWithRedux(<DynamicCheckBox field={baseField({ default_value: 'f' })} />);
    expect(document.querySelector('input[type="checkbox"]').checked).toBe(false);
  });

  it('is unchecked when default_value is empty string', () => {
    renderWithRedux(<DynamicCheckBox field={baseField({ default_value: '' })} />);
    expect(document.querySelector('input[type="checkbox"]').checked).toBe(false);
  });

  it('renders the label text', () => {
    renderWithRedux(<DynamicCheckBox field={baseField({ default_value: 'f' })} />);
    expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
  });
});

describe('DynamicDropdown — single-select', () => {
  const field = baseField({
    values: [['1', 'One'], ['2', 'Two'], ['3', 'Three']],
    default_value: '2',
    options: { force_multi_value: false },
  });

  it('renders a Carbon Dropdown', () => {
    renderWithRedux(<DynamicDropdown field={field} />);
    expect(document.querySelector('.cds--dropdown')).not.toBeNull();
  });

  it('shows the title text (label)', () => {
    renderWithRedux(<DynamicDropdown field={field} />);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });
});

describe('DynamicDropdown — multiselect', () => {
  const field = baseField({
    values: [['1', 'One'], ['2', 'Two']],
    default_value: ['1'],
    options: { force_multi_value: true },
  });

  it('renders a MultiSelect', () => {
    renderWithRedux(<DynamicDropdown field={field} />);
    expect(document.querySelector('.cds--multi-select')).not.toBeNull();
  });
});

describe('DynamicRadioButton', () => {
  const field = baseField({
    values: [['a', 'Option A'], ['b', 'Option B']],
    default_value: 'a',
  });

  it('renders radio buttons', () => {
    renderWithRedux(<DynamicRadioButton field={field} />);
    expect(document.querySelectorAll('input[type="radio"]')).toHaveLength(2);
  });

  it('renders the legend text', () => {
    renderWithRedux(<DynamicRadioButton field={field} />);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('renders each option\'s label', () => {
    renderWithRedux(<DynamicRadioButton field={field} />);
    expect(screen.getByLabelText('Option A')).toBeInTheDocument();
    expect(screen.getByLabelText('Option B')).toBeInTheDocument();
  });

  it('renders without crashing when values is empty', () => {
    renderWithRedux(<DynamicRadioButton field={baseField({ values: [], default_value: '' })} />);
    expect(document.querySelectorAll('input[type="radio"]')).toHaveLength(0);
  });
});

describe('DynamicDatePicker', () => {
  it('renders a Carbon DatePicker', () => {
    renderWithRedux(<DynamicDatePicker field={baseField()} />);
    expect(document.querySelector('.cds--date-picker')).not.toBeNull();
  });

  it('renders with the field label', () => {
    renderWithRedux(<DynamicDatePicker field={baseField()} />);
    expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
  });
});

describe('DynamicTimePicker', () => {
  it('renders a DatePicker plus a time TextInput', () => {
    renderWithRedux(<DynamicTimePicker field={baseField()} />);
    expect(document.querySelector('.cds--date-picker')).not.toBeNull();
    expect(document.querySelector('.cds--text-input')).not.toBeNull();
  });

  it('shows the time portion in the TextInput when default_value has a time', () => {
    renderWithRedux(<DynamicTimePicker field={baseField({ default_value: '2025-03-09 14:30' })} />);
    expect(document.getElementById('field-test_field-time').value).toBe('14:30');
  });

  it('shows an empty time string when default_value has no time', () => {
    renderWithRedux(<DynamicTimePicker field={baseField({ default_value: '2025-03-09' })} />);
    expect(document.getElementById('field-test_field-time').value).toBe('');
  });

  it('renders with the field label on the date picker', () => {
    renderWithRedux(<DynamicTimePicker field={baseField({ default_value: '' })} />);
    expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
  });

  it('renders a "Time" label for the time input', () => {
    renderWithRedux(<DynamicTimePicker field={baseField({ default_value: '' })} />);
    expect(screen.getByLabelText('Time')).toBeInTheDocument();
  });
});

describe('DynamicTagControl', () => {
  it('renders a select element', () => {
    renderWithRedux(<DynamicTagControl field={baseField({ values: [] })} />);
    expect(document.querySelector('select')).not.toBeNull();
  });

  it('renders a "Choose a tag..." placeholder option', () => {
    renderWithRedux(<DynamicTagControl field={baseField({ values: [] })} />);
    expect(screen.getByText('Choose a tag...')).toBeInTheDocument();
  });

  it('renders one SelectItem per value entry', () => {
    const field = baseField({ values: [['cat', 'Cats'], ['dog', 'Dogs']] });
    renderWithRedux(<DynamicTagControl field={field} />);
    expect(screen.getByText('Cats')).toBeInTheDocument();
    expect(screen.getByText('Dogs')).toBeInTheDocument();
  });

  it('handles values in object format {value, description}', () => {
    const field = baseField({ values: [{ value: 'x', description: 'Ex' }] });
    renderWithRedux(<DynamicTagControl field={field} />);
    expect(screen.getByText('Ex')).toBeInTheDocument();
  });

  it('renders the label text', () => {
    renderWithRedux(<DynamicTagControl field={baseField({ values: [] })} />);
    expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
  });
});
