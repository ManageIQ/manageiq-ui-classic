import { render, screen, fireEvent } from '@testing-library/react';
import {
  ActionButton,
  CombinatorSelector,
  OperatorSelector,
  NotToggle,
} from '../../components/expression-editor/carbon-controls';

describe('ActionButton', () => {
  it('renders a ghost button with the given label', () => {
    render(<ActionButton label="Add Rule" handleOnClick={jest.fn()} />);
    expect(screen.getByRole('button', { name: /add rule/i })).toBeInTheDocument();
  });

  it('renders a TrashCan icon-only button when label contains "remove"', () => {
    render(<ActionButton label="Remove rule" title="Remove rule" handleOnClick={jest.fn()} />);
    const btn = screen.getByRole('button');
    expect(btn).toBeInTheDocument();
    expect(btn.textContent.trim()).toBe('');
  });

  it('renders a Copy icon-only button when label contains "clone"', () => {
    render(<ActionButton label="Clone rule" title="Clone rule" handleOnClick={jest.fn()} />);
    const btn = screen.getByRole('button');
    expect(btn.textContent.trim()).toBe('');
  });

  it('calls handleOnClick when clicked', () => {
    const onClick = jest.fn();
    render(<ActionButton label="Add Rule" handleOnClick={onClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('disables the button when disabled prop is true', () => {
    render(<ActionButton label="Add Rule" handleOnClick={jest.fn()} disabled />);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});

describe('CombinatorSelector', () => {
  const options = [
    { name: 'and', label: 'AND' },
    { name: 'or', label: 'OR' },
  ];

  it('renders a select with the provided options', () => {
    render(
      <CombinatorSelector
        options={options}
        value="and"
        handleOnChange={jest.fn()}
        path={[]}
      />,
    );
    expect(screen.getByDisplayValue('AND')).toBeInTheDocument();
  });

  it('calls handleOnChange with the new value on change', () => {
    const onChange = jest.fn();
    render(
      <CombinatorSelector
        options={options}
        value="and"
        handleOnChange={onChange}
        path={[]}
      />,
    );
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'or' } });
    expect(onChange).toHaveBeenCalledWith('or');
  });

  it('flattens optgroup-style option arrays', () => {
    const grouped = [{ label: 'Group', options: [{ name: 'and', label: 'AND' }] }];
    render(
      <CombinatorSelector
        options={grouped}
        value="and"
        handleOnChange={jest.fn()}
        path={[]}
      />,
    );
    expect(screen.getByDisplayValue('AND')).toBeInTheDocument();
  });
});

describe('OperatorSelector', () => {
  const options = [
    { name: '=', label: 'equals' },
    { name: '!=', label: 'does not equal' },
  ];

  it('renders null when field is empty', () => {
    const { container } = render(
      <OperatorSelector options={options} value="=" handleOnChange={jest.fn()} field="" />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders a static label when only one operator exists', () => {
    render(
      <OperatorSelector
        options={[{ name: 'CONTAINS', label: 'contains' }]}
        value="CONTAINS"
        handleOnChange={jest.fn()}
        field="__tag__:loc"
        path={[0]}
      />,
    );
    expect(screen.getByText('contains')).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).toBeNull();
  });

  it('renders a select when multiple operators exist', () => {
    render(
      <OperatorSelector
        options={options}
        value="="
        handleOnChange={jest.fn()}
        field="Vm-name"
        path={[0]}
      />,
    );
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('calls handleOnChange with the selected value', () => {
    const onChange = jest.fn();
    render(
      <OperatorSelector
        options={options}
        value="="
        handleOnChange={onChange}
        field="Vm-name"
        path={[0]}
      />,
    );
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '!=' } });
    expect(onChange).toHaveBeenCalledWith('!=');
  });
});

describe('NotToggle', () => {
  it('renders the NOT label', () => {
    render(
      <NotToggle checked={false} handleOnChange={jest.fn()} path={[]} />,
    );
    expect(screen.getByText('NOT')).toBeInTheDocument();
  });

  it('renders a toggle switch', () => {
    render(
      <NotToggle checked={false} handleOnChange={jest.fn()} path={[0]} />,
    );
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  it('uses a custom label when provided', () => {
    render(
      <NotToggle checked={false} handleOnChange={jest.fn()} path={[]} label="Negate" />,
    );
    expect(screen.getByText('Negate')).toBeInTheDocument();
  });
});
