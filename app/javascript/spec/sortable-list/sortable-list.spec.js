import { render } from '@testing-library/react';
import SortableList from '../../components/sortable-list';

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

  it('calls onChange with the new order after ArrowDown key on first item', () => {
    const onChange = jest.fn();
    const { getAllByRole } = render(
      <SortableList
        input={{ value: items, onChange }}
        labelMap={labelMap}
      />
    );
    const listItems = getAllByRole('option');
    listItems[0].dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })
    );
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
    listItems[1].dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true })
    );
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
});
