import { render, screen } from '@testing-library/react';
import CategoryModifier from '../../components/tagging-editor/category-modifier';

const tagCategories = [
  { label: 'Name', id: '1' },
  { label: 'Number', id: '2' },
  { label: 'Animal', id: '3' },
];
const selectedTagCategory = { label: 'Name', id: '1' };

describe('CategoryModifier component', () => {
  it('matches snapshot', () => {
    const { container } = render(
      <CategoryModifier
        selectedTagCategory={selectedTagCategory}
        onTagCategoryChange={jest.fn()}
        tagCategories={tagCategories}
      />
    );
    expect(container).toMatchSnapshot();
  });

  it('renders the Category legend', () => {
    render(
      <CategoryModifier
        selectedTagCategory={selectedTagCategory}
        onTagCategoryChange={jest.fn()}
        tagCategories={tagCategories}
      />
    );
    expect(screen.getByText('Category')).toBeInTheDocument();
  });

  it('renders a custom categoryLabel', () => {
    render(
      <CategoryModifier
        selectedTagCategory={selectedTagCategory}
        onTagCategoryChange={jest.fn()}
        tagCategories={tagCategories}
        categoryLabel="Tag Category"
      />
    );
    expect(screen.getByText('Tag Category')).toBeInTheDocument();
  });
});
