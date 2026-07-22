import {
  render, screen, fireEvent, waitFor,
} from '@testing-library/react';
import fetchMock from 'fetch-mock';
import DateValueEditor from '../../components/expression-editor/date-value-editor';

// Silence the fire-and-forget /api locale fetch for every test (English default).
beforeEach(() => fetchMock.get('/api?attributes=settings', { settings: { display: { locale: 'en' } } }));
afterEach(() => {
  fetchMock.reset(); fetchMock.restore();
});

// Carbon DatePicker relies on flatpickr which uses DOM APIs; stub it out so
// Jest doesn't crash on missing window.flatpickr.
jest.mock('@carbon/react', () => {
  // eslint-disable-next-line no-undef
  const React = require('react');
  return {
    ...jest.requireActual('@carbon/react'),
    DatePicker: ({ children }) => <div data-testid="date-picker">{children}</div>,
    DatePickerInput: ({ value, placeholder }) => (
      <input
        data-testid="date-picker-input"
        value={value || ''}
        placeholder={placeholder}
        readOnly
      />
    ),
  };
});

const renderEditor = async(props = {}) => {
  const defaults = {
    value: '',
    operator: 'IS',
    dateFormat: 's',
    isDatetime: false,
    disabled: false,
    id: 'test-date',
    handleOnChange: jest.fn(),
    onToggleFormat: jest.fn(),
  };
  const result = render(<DateValueEditor {...defaults} {...props} />);
  // Wait for the async locale fetch (useEffect → API.get) to settle so that
  // setLocaleConfig is called inside act and does not trigger the warning.
  await waitFor(() => fetchMock.called('/api?attributes=settings'));
  return result;
};

describe('DateValueEditor — specific mode (dateFormat "s")', () => {
  it('renders a DatePicker in specific mode', async() => {
    await renderEditor({ dateFormat: 's' });
    expect(screen.getByTestId('date-picker')).toBeInTheDocument();
  });

  it('does NOT render the time select for plain date fields', async() => {
    await renderEditor({ dateFormat: 's', isDatetime: false });
    expect(screen.queryByLabelText(/time/i)).toBeNull();
  });

  it('renders a time select for datetime fields with a non-IS operator', async() => {
    await renderEditor({ dateFormat: 's', isDatetime: true, operator: 'BEFORE' });
    // The time select has labelText "Time" (hidden); id is "<id>-time"
    const select = document.querySelector('select[id="test-date-time"]');
    expect(select).not.toBeNull();
  });

  it('does NOT render the time select for datetime fields when operator is IS', async() => {
    await renderEditor({ dateFormat: 's', isDatetime: true, operator: 'IS' });
    const select = document.querySelector('select[id="test-date-time"]');
    expect(select).toBeNull();
  });

  it('shows yyyy/mm/dd placeholder after Chinese locale is fetched', async() => {
    fetchMock.reset();
    fetchMock.get('/api?attributes=settings', { settings: { display: { locale: 'zh_CN' } } });
    renderEditor({ dateFormat: 's' });
    await waitFor(() => {
      const input = screen.getByTestId('date-picker-input');
      expect(input.placeholder).toBe('yyyy/mm/dd');
    });
  });

  it('shows dd.mm.yyyy placeholder after German locale is fetched', async() => {
    fetchMock.reset();
    fetchMock.get('/api?attributes=settings', { settings: { display: { locale: 'de' } } });
    renderEditor({ dateFormat: 's' });
    await waitFor(() => {
      const input = screen.getByTestId('date-picker-input');
      expect(input.placeholder).toBe('dd.mm.yyyy');
    });
  });
});

describe('DateValueEditor — relative mode (dateFormat "r")', () => {
  it('renders a Select (not DatePicker) in relative mode', async() => {
    await renderEditor({ dateFormat: 'r' });
    expect(screen.queryByTestId('date-picker')).toBeNull();
    // A native <select> element should be present
    const selects = document.querySelectorAll('select');
    expect(selects.length).toBeGreaterThan(0);
  });

  it('pre-selects the existing relative value', async() => {
    await renderEditor({ dateFormat: 'r', value: 'Last Week' });
    const select = document.querySelector('select#test-date');
    expect(select.value).toBe('Last Week');
  });
});

describe('DateValueEditor — mode toggle button', () => {
  it('renders a toggle button', async() => {
    await renderEditor({ dateFormat: 's' });
    const btn = document.querySelector('button.exp-date-toggle-btn');
    expect(btn).not.toBeNull();
  });

  it('calls onToggleFormat with "r" when in specific mode and button clicked', async() => {
    const onToggle = jest.fn();
    const onChange = jest.fn();
    await renderEditor({ dateFormat: 's', onToggleFormat: onToggle, handleOnChange: onChange });
    const btn = document.querySelector('button.exp-date-toggle-btn');
    fireEvent.click(btn);
    expect(onToggle).toHaveBeenCalledWith('r');
  });

  it('calls onToggleFormat with "s" when in relative mode and button clicked', async() => {
    const onToggle = jest.fn();
    const onChange = jest.fn();
    await renderEditor({ dateFormat: 'r', onToggleFormat: onToggle, handleOnChange: onChange });
    const btn = document.querySelector('button.exp-date-toggle-btn');
    fireEvent.click(btn);
    expect(onToggle).toHaveBeenCalledWith('s');
  });

  it('seeds value with first relative option on toggle from specific to relative', async() => {
    const onChange = jest.fn();
    await renderEditor({ dateFormat: 's', value: '2024-12-25', handleOnChange: onChange });
    const btn = document.querySelector('button.exp-date-toggle-btn');
    fireEvent.click(btn);
    // For a plain date field (isDatetime:false), first option is "Today".
    expect(onChange).toHaveBeenCalledWith('Today');
  });

  it('seeds value with first datetime relative option (e.g. "This Hour") for datetime fields', async() => {
    const onChange = jest.fn();
    await renderEditor({
      dateFormat: 's', value: '2024-12-25 14:30', isDatetime: true, handleOnChange: onChange,
    });
    const btn = document.querySelector('button.exp-date-toggle-btn');
    fireEvent.click(btn);
    // For a datetime field, the first option is "This Hour".
    expect(onChange).toHaveBeenCalledWith('This Hour');
  });

  it('resets value to "" on toggle from relative back to specific', async() => {
    const onChange = jest.fn();
    await renderEditor({ dateFormat: 'r', value: 'Today', handleOnChange: onChange });
    const btn = document.querySelector('button.exp-date-toggle-btn');
    fireEvent.click(btn);
    expect(onChange).toHaveBeenCalledWith('');
  });
});

describe('DateValueEditor — FROM operator (two controls)', () => {
  it('renders two date controls and a THROUGH label', async() => {
    await renderEditor({ operator: 'FROM', dateFormat: 's', value: ['', ''] });
    const throughEl = screen.getByText('THROUGH');
    expect(throughEl).toBeInTheDocument();
    // Two date pickers
    const pickers = screen.getAllByTestId('date-picker');
    expect(pickers).toHaveLength(2);
  });

  it('seeds FROM value with [firstOption, firstOption] on toggle to relative', async() => {
    const onChange = jest.fn();
    await renderEditor({
      operator: 'FROM',
      dateFormat: 's',
      value: ['2024-12-01', '2024-12-31'],
      handleOnChange: onChange,
    });
    const btn = document.querySelector('button.exp-date-toggle-btn');
    fireEvent.click(btn);
    expect(onChange).toHaveBeenCalledWith(['Today', 'Today']);
  });

  it('resets FROM value to ["",""] on toggle from relative back to specific', async() => {
    const onChange = jest.fn();
    await renderEditor({
      operator: 'FROM',
      dateFormat: 'r',
      value: ['Today', 'Last Week'],
      handleOnChange: onChange,
    });
    const btn = document.querySelector('button.exp-date-toggle-btn');
    fireEvent.click(btn);
    expect(onChange).toHaveBeenCalledWith(['', '']);
  });

  it('calls handleOnChange with array when FROM from value changes', async() => {
    const onChange = jest.fn();
    await renderEditor({
      operator: 'FROM', dateFormat: 'r', value: ['Today', ''], handleOnChange: onChange,
    });
    // Change the relative select for the "through" control
    const selects = document.querySelectorAll('select');
    // selects[0] = from, selects[1] = through
    fireEvent.change(selects[1], { target: { value: 'Last Week' } });
    expect(onChange).toHaveBeenCalledWith(['Today', 'Last Week']);
  });
});
