import { render, screen } from '@testing-library/react';
import TagView from '../../components/tagging-editor/tag-view';

const assignedTags = [
  {
    label: 'Name',
    id: '1',
    values: [{ label: 'Pepa', id: '11' }],
  },
];

describe('TagView component', () => {
  it('matches snapshot with assigned tags', () => {
    const { container } = render(
      <TagView assignedTags={assignedTags} onTagDeleteClick={jest.fn()} />
    );
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot with no assigned tags', () => {
    const { container } = render(
      <TagView assignedTags={[]} onTagDeleteClick={jest.fn()} />
    );
    expect(container).toMatchSnapshot();
  });

  it('renders the default Assigned tags header', () => {
    render(<TagView assignedTags={assignedTags} onTagDeleteClick={jest.fn()} />);
    expect(screen.getByText('Assigned tags')).toBeInTheDocument();
  });

  it('hides header when hideHeader is true', () => {
    render(
      <TagView
        assignedTags={assignedTags}
        onTagDeleteClick={jest.fn()}
        hideHeader
      />
    );
    expect(screen.queryByText('Assigned tags')).not.toBeInTheDocument();
  });

  it('renders "No Assigned Tags" message when list is empty', () => {
    render(<TagView assignedTags={[]} onTagDeleteClick={jest.fn()} />);
    expect(screen.getByText('No Assigned Tags')).toBeInTheDocument();
  });

  it('renders the assigned tag label', () => {
    render(<TagView assignedTags={assignedTags} onTagDeleteClick={jest.fn()} />);
    expect(screen.getByText('Name')).toBeInTheDocument();
  });

  it('renders assigned tags sorted alphabetically', () => {
    const tags = [
      { label: 'Zebra', id: '2', values: [{ label: 'z', id: '21' }] },
      { label: 'Apple', id: '1', values: [{ label: 'a', id: '11' }] },
    ];
    render(<TagView assignedTags={tags} onTagDeleteClick={jest.fn()} />);
    const categories = screen.getAllByText(/Apple|Zebra/);
    expect(categories[0]).toHaveTextContent('Apple');
    expect(categories[1]).toHaveTextContent('Zebra');
  });
});
