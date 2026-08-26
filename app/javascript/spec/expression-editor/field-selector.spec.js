import { render, screen, fireEvent } from '@testing-library/react';
import TwoStepFieldSelector from '../../components/expression-editor/field-selector';

const groups = [
  {
    label: 'Virtual Machine',
    options: [
      { label: 'Name', value: 'Vm-name' },
      { label: 'CPU Count', value: 'Vm-numCPUs' },
    ],
  },
  {
    label: 'Host',
    options: [
      { label: 'Hostname', value: 'Host-name' },
    ],
  },
];

const defaultProps = {
  options: groups,
  value: '',
  handleOnChange: jest.fn(),
  disabled: false,
  title: 'Field',
  path: [0],
  className: '',
  rule: { id: 'r1' },
  context: {},
  fieldData: null,
};

const renderSelector = (props = {}) => render(
  <TwoStepFieldSelector {...defaultProps} {...props} />,
);

describe('TwoStepFieldSelector', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders the group select with a placeholder option', () => {
    renderSelector();
    const groupSelect = document.querySelectorAll('select')[0];
    expect(groupSelect).toBeInTheDocument();
    expect(groupSelect.querySelector('option[value=""]')).not.toBeNull();
  });

  it('lists all non-separator groups in the group select', () => {
    renderSelector();
    const groupSelect = document.querySelectorAll('select')[0];
    const opts = Array.from(groupSelect.querySelectorAll('option')).map((o) => o.value);
    expect(opts).toContain('Virtual Machine');
    expect(opts).toContain('Host');
  });

  it('does not render the field combobox when no group is selected', () => {
    renderSelector({ value: '' });
    expect(document.querySelector('.exp-field-combobox')).toBeNull();
  });

  it('shows the field combobox after selecting a group', () => {
    renderSelector({ value: '' });
    const groupSelect = document.querySelectorAll('select')[0];
    fireEvent.change(groupSelect, { target: { value: 'Virtual Machine' } });
    expect(document.querySelector('.exp-field-combobox')).not.toBeNull();
  });

  it('pre-selects the correct group when value is already set', () => {
    renderSelector({ value: 'Vm-name' });
    const groupSelect = document.querySelectorAll('select')[0];
    expect(groupSelect.value).toBe('Virtual Machine');
  });

  it('calls handleOnChange(undefined) when the group changes', () => {
    const handleOnChange = jest.fn();
    renderSelector({ value: 'Vm-name', handleOnChange });
    const groupSelect = document.querySelectorAll('select')[0];
    fireEvent.change(groupSelect, { target: { value: 'Host' } });
    expect(handleOnChange).toHaveBeenCalledWith(undefined);
  });

  it('does not render field combobox for a group with only one option', () => {
    renderSelector({ value: 'Host-name' });
    expect(document.querySelector('.exp-field-combobox')).toBeNull();
  });

  it('disables the group select when disabled prop is true', () => {
    renderSelector({ disabled: true });
    const groupSelect = document.querySelectorAll('select')[0];
    expect(groupSelect).toBeDisabled();
  });

  it('renders the AliasRow when context.showAlias is true and field is set', () => {
    renderSelector({
      value: 'Vm-name',
      rule: { id: 'r1', alias: '' },
      context: {
        showAlias: true,
        updateRuleAlias: jest.fn(),
      },
      fieldData: { colType: 'string' },
    });
    expect(screen.getAllByLabelText(/alias/i).length).toBeGreaterThan(0);
  });
});
