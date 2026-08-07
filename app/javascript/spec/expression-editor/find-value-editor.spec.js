import {
  render, screen, fireEvent, waitFor,
} from '@testing-library/react';
import fetchMock from 'fetch-mock';
import FindValueEditor from '../../components/expression-editor/find-value-editor';

const defaultValue = {
  skey: '=',
  svalue: 'boot',
  check: 'checkall',
  cfield: 'Vm-hardware-disks-size',
  ckey: '=',
  cvalue: '100',
};

const defaultProps = {
  value: defaultValue,
  handleOnChange: jest.fn(),
  field: '__find__:Vm-hardware-disks-filename',
  disabled: false,
  path: [0],
  context: { model: 'Vm' },
};

const renderEditor = (props = {}) => render(
  <FindValueEditor {...defaultProps} {...props} />,
);

const operatorsResponse = {
  operators: ['=', '!=', 'STARTS WITH'],
  col_type: 'string',
};

const checkFieldsResponse = {
  fields: [
    { label: 'Disk Size', name: 'Vm-hardware-disks-size', col_type: 'integer' },
    { label: 'Filename', name: 'Vm-hardware-disks-filename', col_type: 'string' },
  ],
};

beforeEach(() => {
  fetchMock.get(
    /\/expression_editor\/operators/,
    operatorsResponse,
  );
  fetchMock.get(
    /\/expression_editor\/find_check_fields/,
    checkFieldsResponse,
  );
});

afterEach(() => {
  fetchMock.reset();
  fetchMock.restore();
  jest.clearAllMocks();
});

describe('FindValueEditor — structure', () => {
  it('renders the search operator select', async() => {
    renderEditor();
    await waitFor(() => expect(fetchMock.called(/operators/)).toBe(true));
    const selects = document.querySelectorAll('select');
    expect(selects.length).toBeGreaterThanOrEqual(1);
  });

  it('renders the check mode select with checkall/checkany/checkcount options', async() => {
    renderEditor();
    await waitFor(() => expect(fetchMock.called(/operators/)).toBe(true));
    expect(screen.getByDisplayValue('Check All')).toBeInTheDocument();
  });

  it('renders the check field select when mode is not checkcount', async() => {
    renderEditor();
    await waitFor(() => expect(fetchMock.called(/find_check_fields/)).toBe(true));
    const selects = document.querySelectorAll('select');
    const selectValues = Array.from(selects).map((s) => s.id);
    expect(selectValues.some((id) => id.includes('cfield'))).toBe(true);
  });

  it('hides the check field select when check mode is checkcount', async() => {
    renderEditor({ value: { ...defaultValue, check: 'checkcount' } });
    await waitFor(() => expect(fetchMock.called(/operators/)).toBe(true));
    const selects = document.querySelectorAll('select');
    const selectIds = Array.from(selects).map((s) => s.id);
    expect(selectIds.some((id) => id.includes('cfield'))).toBe(false);
  });

  it('hides the search value input when search operator is IS NULL', async() => {
    renderEditor({ value: { ...defaultValue, skey: 'IS NULL', svalue: '' } });
    await waitFor(() => expect(fetchMock.called(/operators/)).toBe(true));
    expect(document.querySelector('input[id$="-svalue"]')).toBeNull();
  });
});

describe('FindValueEditor — interactions', () => {
  it('calls handleOnChange when search operator changes', async() => {
    const handleOnChange = jest.fn();
    renderEditor({ handleOnChange });
    await waitFor(() => expect(fetchMock.called(/operators/)).toBe(true));

    const skeySelect = document.querySelector('select[id$="-skey"]');
    expect(skeySelect).not.toBeNull();
    fireEvent.change(skeySelect, { target: { value: '!=' } });
    expect(handleOnChange).toHaveBeenCalledWith(
      expect.objectContaining({ skey: '!=' }),
    );
  });

  it('calls handleOnChange when check mode changes', async() => {
    const handleOnChange = jest.fn();
    renderEditor({ handleOnChange });
    await waitFor(() => expect(fetchMock.called(/operators/)).toBe(true));

    const checkSelect = document.querySelector('select[id$="-check"]');
    fireEvent.change(checkSelect, { target: { value: 'checkany' } });
    expect(handleOnChange).toHaveBeenCalledWith(
      expect.objectContaining({ check: 'checkany' }),
    );
  });

  it('calls handleOnChange with the new cfield when check field changes', async() => {
    const handleOnChange = jest.fn();
    renderEditor({ handleOnChange });
    await waitFor(() => expect(fetchMock.called(/find_check_fields/)).toBe(true));

    const cfieldSelect = document.querySelector('select[id$="-cfield"]');
    fireEvent.change(cfieldSelect, { target: { value: 'Vm-hardware-disks-filename' } });
    expect(handleOnChange).toHaveBeenCalledWith(
      expect.objectContaining({ cfield: 'Vm-hardware-disks-filename' }),
    );
  });
});

describe('FindValueEditor — fallback on fetch error', () => {
  it('falls back to default string operators when the operators endpoint fails', async() => {
    fetchMock.reset();
    fetchMock.get(/\/expression_editor\/operators/, { throws: new Error('network') });
    fetchMock.get(/\/expression_editor\/find_check_fields/, checkFieldsResponse);

    renderEditor();
    await waitFor(() => expect(fetchMock.called(/operators/)).toBe(true));

    const skeySelect = document.querySelector('select[id$="-skey"]');
    expect(skeySelect).not.toBeNull();
    const options = Array.from(skeySelect.querySelectorAll('option')).map((o) => o.value);
    expect(options).toContain('=');
  });

  it('shows an empty check field list when the check fields endpoint fails', async() => {
    fetchMock.reset();
    fetchMock.get(/\/expression_editor\/operators/, operatorsResponse);
    fetchMock.get(/\/expression_editor\/find_check_fields/, { throws: new Error('network') });

    renderEditor();
    await waitFor(() => expect(fetchMock.called(/find_check_fields/)).toBe(true));

    const cfieldSelect = document.querySelector('select[id$="-cfield"]');
    const fieldOptions = Array.from(cfieldSelect.querySelectorAll('option')).filter(
      (o) => o.value !== '',
    );
    expect(fieldOptions).toHaveLength(0);
  });
});
