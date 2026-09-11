import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TagCategory from '../../components/tagging-editor/tag-category';

const tagCategory = { label: 'animal', id: '1' };
const tagValues = [
  { label: 'duck', id: '11' },
  { label: 'lion', id: '12' },
];

describe('TagCategory component', () => {
  it('matches snapshot', () => {
    const { container } = render(
      <TagCategory
        tagCategory={tagCategory}
        values={tagValues}
        onTagDeleteClick={jest.fn()}
      />
    );
    expect(container).toMatchSnapshot();
  });

  it('renders the category label', () => {
    render(
      <TagCategory
        tagCategory={tagCategory}
        values={tagValues}
        onTagDeleteClick={jest.fn()}
      />
    );
    expect(screen.getByText('animal')).toBeInTheDocument();
  });

  it('renders all tag values sorted alphabetically', () => {
    render(
      <TagCategory
        tagCategory={tagCategory}
        values={tagValues}
        onTagDeleteClick={jest.fn()}
        showCloseButton={false}
      />
    );
    const items = screen.getAllByRole('listitem');
    // first li is category, then values sorted: duck < lion
    expect(items[1]).toHaveTextContent('duck');
    expect(items[2]).toHaveTextContent('lion');
  });

  it('calls onTagDeleteClick when a close button is clicked', async() => {
    const user = userEvent.setup();
    const onTagDeleteClick = jest.fn();
    render(
      <TagCategory
        tagCategory={tagCategory}
        values={[tagValues[0]]}
        onTagDeleteClick={onTagDeleteClick}
        showCloseButton
      />
    );

    await user.click(screen.getByRole('button'));
    expect(onTagDeleteClick).toHaveBeenCalledWith(tagCategory, tagValues[0]);
  });

  it('uses custom categoryTruncate', () => {
    render(
      <TagCategory
        tagCategory={{ label: 'averylongcategoryname', id: '2' }}
        values={[]}
        onTagDeleteClick={jest.fn()}
        categoryTruncate={(s) => s.substring(0, 5)}
      />
    );
    expect(screen.getByText('avery')).toBeInTheDocument();
  });
});
