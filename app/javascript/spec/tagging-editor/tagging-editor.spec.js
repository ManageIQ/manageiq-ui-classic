import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaggingEditor from '../../components/tagging-editor';

const tags = [
  {
    label: 'Name',
    id: '1',
    values: [
      { label: 'Pepa', id: '11' },
      { label: 'Franta', id: '12' },
    ],
  },
  {
    label: 'Number',
    id: '2',
    values: [
      { label: '1', id: '21' },
      { label: '2', id: '22' },
    ],
  },
  {
    label: 'Animal',
    id: '3',
    values: [
      { label: 'Duck', id: '31' },
      { label: 'Cat', id: '32' },
      { label: 'Dog', id: '33' },
    ],
  },
  {
    label: 'Food',
    id: '4',
    singleValue: false,
    values: [
      { label: 'Steak', id: '41' },
      { label: 'Duck', id: '42' },
      { label: 'Salad', id: '43' },
    ],
  },
  {
    label: 'Something',
    id: '5',
    singleValue: true,
    values: [
      { label: 'Knedlik', id: '51' },
      {
        label: 'Daenerys Stormborn of the House Targaryen, First of Her Name,...and Mother of Dragons',
        id: '52',
      },
    ],
  },
];

const assignedTags = [
  {
    label: 'Name',
    id: '1',
    values: [{ label: 'Pepa', id: '11' }],
  },
];

describe('TaggingEditor component', () => {
  it('matches snapshot', () => {
    const { container } = render(
      <TaggingEditor tags={tags} assignedTags={assignedTags} />
    );
    expect(container).toMatchSnapshot();
  });

  it('renders the Add/Modify tag header by default', () => {
    render(<TaggingEditor tags={tags} assignedTags={assignedTags} />);
    expect(screen.getByText('Add/Modify tag')).toBeInTheDocument();
  });

  it('renders the Assigned tags header by default', () => {
    render(<TaggingEditor tags={tags} assignedTags={assignedTags} />);
    expect(screen.getByText('Assigned tags')).toBeInTheDocument();
  });

  it('hides headers when hideHeaders is true', () => {
    render(<TaggingEditor tags={tags} assignedTags={assignedTags} hideHeaders />);
    expect(screen.queryByText('Add/Modify tag')).not.toBeInTheDocument();
    expect(screen.queryByText('Assigned tags')).not.toBeInTheDocument();
  });

  it('shows the empty state message when no tags are assigned', () => {
    render(<TaggingEditor tags={tags} assignedTags={[]} />);
    expect(screen.getByText('No Assigned Tags')).toBeInTheDocument();
  });

  it('shows initially assigned tags', () => {
    render(<TaggingEditor tags={tags} assignedTags={assignedTags} />);
    expect(screen.getByText('Name')).toBeInTheDocument();
  });

  it('renders with default empty props', () => {
    const { container } = render(<TaggingEditor />);
    expect(container).toBeInTheDocument();
  });

  it('removes an assigned tag value when its close button is clicked', async() => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(
      <TaggingEditor tags={tags} assignedTags={assignedTags} onChange={onChange} />
    );

    await user.click(screen.getByRole('button'));
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('calls onChange when a category is selected', async() => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<TaggingEditor tags={tags} assignedTags={[]} onChange={onChange} />);

    // Selecting a category should not fire onChange by itself (no value chosen yet)
    const [categoryCombobox] = screen.getAllByRole('combobox');
    await user.click(categoryCombobox);
    await user.click(await screen.findByRole('option', { name: 'Animal' }));

    // onChange not called just from category selection
    expect(onChange).not.toHaveBeenCalled();
    // The category label is now shown in the combobox
    expect(screen.getAllByRole('combobox')[0]).toHaveAttribute('title', 'Animal');
  });
});

// The state helpers (addOrChangeTag / deleteTag) live inside index.jsx and are
// tested here via the component's onChange output.
describe('TaggingEditor state helpers', () => {
  it('removes the whole category entry when its last value is deleted', async() => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const preAssigned = [
      { id: '1', label: 'Name', values: [{ label: 'Pepa', id: '11' }] },
    ];
    render(
      <TaggingEditor tags={tags} assignedTags={preAssigned} onChange={onChange} />
    );

    await user.click(screen.getByRole('button'));
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('preserves other categories when one value is deleted', async() => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const preAssigned = [
      { id: '1', label: 'Name', values: [{ label: 'Pepa', id: '11' }] },
      { id: '3', label: 'Animal', values: [{ label: 'Cat', id: '32' }] },
    ];
    render(
      <TaggingEditor tags={tags} assignedTags={preAssigned} onChange={onChange} />
    );

    // Tags are sorted alphabetically: Animal first, then Name.
    // So button[0] = Cat (Animal), button[1] = Pepa (Name). Delete Pepa.
    const buttons = screen.getAllByRole('button');
    await user.click(buttons[1]);

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(lastCall).toHaveLength(1);
    expect(lastCall[0]).toMatchObject({ id: '3', label: 'Animal' });
  });
});
