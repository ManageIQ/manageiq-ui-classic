import { render, screen, fireEvent } from '@testing-library/react';
import MiqFormRenderer from '@@ddf';
import SortableList from '../../components/sortable-list';
import { renderWithRedux } from '../helpers/mountForm';

describe('SortableList', () => {
  const items = ['field-a', 'field-b', 'field-c'];
  const labelMap = { 'field-a': 'Field A', 'field-b': 'Field B', 'field-c': 'Field C' };

  it('renders label text for each item via labelMap', () => {
    const { getByText } = render(
      <SortableList input={{ value: items, onChange: jest.fn() }} labelMap={labelMap} />
    );
    expect(getByText('Field A')).toBeInTheDocument();
    expect(getByText('Field B')).toBeInTheDocument();
    expect(getByText('Field C')).toBeInTheDocument();
  });

  it('falls back to the raw id when labelMap has no entry', () => {
    const { getByText } = render(
      <SortableList input={{ value: ['unknown-field'], onChange: jest.fn() }} labelMap={{}} />
    );
    expect(getByText('unknown-field')).toBeInTheDocument();
  });

  it('renders a remove button for each item when onRemove is provided', () => {
    const { getAllByRole } = render(
      <SortableList
        input={{ value: items, onChange: jest.fn() }}
        labelMap={labelMap}
        onRemove={jest.fn()}
      />
    );
    const removeButtons = getAllByRole('button');
    expect(removeButtons).toHaveLength(items.length);
  });

  it('does not render remove buttons when onRemove is not provided', () => {
    const { queryAllByRole } = render(
      <SortableList input={{ value: items, onChange: jest.fn() }} labelMap={labelMap} />
    );
    expect(queryAllByRole('button')).toHaveLength(0);
  });

  it('calls onRemove with the correct id when a remove button is clicked', () => {
    const onRemove = jest.fn();
    const { getAllByRole } = render(
      <SortableList
        input={{ value: items, onChange: jest.fn() }}
        labelMap={labelMap}
        onRemove={onRemove}
      />
    );
    getAllByRole('button')[0].click();
    expect(onRemove).toHaveBeenCalledWith('field-a');
  });

  it('renders without an input prop', () => {
    const { container } = render(<SortableList />);
    expect(container.querySelector('.sortable-list')).toBeEmptyDOMElement();
  });

  it('calls onChange with the new order after ArrowDown key on first item', () => {
    const onChange = jest.fn();
    const { getAllByRole } = render(
      <SortableList
        input={{ value: items, onChange }}
        labelMap={labelMap}
      />
    );
    const listItems = getAllByRole('option');
    fireEvent.keyDown(listItems[0], { key: 'ArrowDown' });
    expect(onChange).toHaveBeenCalledWith(['field-b', 'field-a', 'field-c']);
  });

  it('calls onChange with the new order after ArrowUp key on second item', () => {
    const onChange = jest.fn();
    const { getAllByRole } = render(
      <SortableList
        input={{ value: items, onChange }}
        labelMap={labelMap}
      />
    );
    const listItems = getAllByRole('option');
    fireEvent.keyDown(listItems[1], { key: 'ArrowUp' });
    expect(onChange).toHaveBeenCalledWith(['field-b', 'field-a', 'field-c']);
  });

  it('renders the label when the label prop is provided', () => {
    const { getByText } = render(
      <SortableList input={{ value: items, onChange: jest.fn() }} label="My Label" labelMap={labelMap} />
    );
    expect(getByText('My Label')).toBeInTheDocument();
  });

  it('renders helperText when provided', () => {
    const { getByText } = render(
      <SortableList input={{ value: items, onChange: jest.fn() }} helperText="Drag to reorder" labelMap={labelMap} />
    );
    expect(getByText('Drag to reorder')).toBeInTheDocument();
  });

  it('renders an empty list without errors', () => {
    const { container } = render(
      <SortableList input={{ value: [], onChange: jest.fn() }} labelMap={labelMap} />
    );
    expect(container.querySelector('.sortable-list')).toBeEmptyDOMElement();
  });

  it('names the remove button after the label, not the raw id', () => {
    const { getByRole } = render(
      <SortableList
        input={{ value: items, onChange: jest.fn() }}
        labelMap={labelMap}
        onRemove={jest.fn()}
      />
    );
    expect(getByRole('button', { name: 'Remove Field A' })).toBeInTheDocument();
  });

  it('names the remove button after labelKey for object items', () => {
    const objectItems = [{ id: 'a', name: 'alpha', display_name: 'Alpha' }, { id: 'b', name: 'beta', display_name: 'Beta' }];
    const { getByRole } = render(
      <SortableList
        input={{ value: objectItems, onChange: jest.fn() }}
        labelKey="name"
        onRemove={jest.fn()}
      />
    );
    expect(getByRole('button', { name: 'Remove Beta (beta)' })).toBeInTheDocument();
  });
});

// The 'sortable-list' schema component is the SortableListDDF wrapper from the component mapper.
describe('SortableListDDF (via MiqFormRenderer)', () => {
  const schema = {
    fields: [{
      component: 'sortable-list',
      id: 'order',
      name: 'order',
      label: 'Order',
      helperText: 'Drag to reorder',
      labelMap: { 'field-a': 'Field A', 'field-b': 'Field B' },
    }],
  };

  const renderForm = (onSubmit = jest.fn()) => renderWithRedux(
    <MiqFormRenderer
      schema={schema}
      initialValues={{ order: ['field-a', 'field-b'] }}
      onSubmit={onSubmit}
    />
  );

  it('renders the form value as a sortable list with the schema label and helper text', () => {
    renderForm();
    expect(screen.getByText('Order')).toBeInTheDocument();
    expect(screen.getByText('Drag to reorder')).toBeInTheDocument();
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['Field A', 'Field B']);
  });

  it('writes the new order back to the form value', async() => {
    const onSubmit = jest.fn();
    renderForm(onSubmit);
    fireEvent.keyDown(screen.getAllByRole('option')[0], { key: 'ArrowDown' });
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['Field B', 'Field A']);

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    await screen.findAllByRole('option');
    expect(onSubmit).toHaveBeenCalledWith({ order: ['field-b', 'field-a'] }, expect.anything(), expect.anything());
  });
});
