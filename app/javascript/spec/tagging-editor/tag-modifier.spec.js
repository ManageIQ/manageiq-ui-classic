import { render, screen } from '@testing-library/react';
import TagModifier from '../../components/tagging-editor/tag-modifier';
import CategoryModifier from '../../components/tagging-editor/category-modifier';
import ValueModifier from '../../components/tagging-editor/value-modifier';

const tagCategories = [
  { label: 'Name', id: '1' },
  { label: 'Number', id: '2' },
];
const animalValues = [
  { label: 'Duck', id: '31' },
  { label: 'Cat', id: '32' },
];
const selectedTagCategory = { label: 'Name', id: '1' };
const selectedTagValues = [{ label: 'Duck', id: '31' }];
const onChange = jest.fn();

describe('TagModifier component', () => {
  it('matches snapshot', () => {
    const { container } = render(
      <TagModifier>
        <CategoryModifier
          selectedTagCategory={selectedTagCategory}
          onTagCategoryChange={onChange}
          tagCategories={tagCategories}
        />
        <ValueModifier
          selectedTagCategory={selectedTagCategory}
          onTagValueChange={onChange}
          selectedTagValues={selectedTagValues}
          multiValue={false}
          values={animalValues}
        />
      </TagModifier>
    );
    expect(container).toMatchSnapshot();
  });

  it('renders the default header text', () => {
    render(
      <TagModifier>
        <CategoryModifier
          selectedTagCategory={selectedTagCategory}
          onTagCategoryChange={onChange}
          tagCategories={tagCategories}
        />
        <ValueModifier
          selectedTagCategory={selectedTagCategory}
          onTagValueChange={onChange}
          selectedTagValues={[]}
          values={animalValues}
        />
      </TagModifier>
    );
    expect(screen.getByText('Add/Modify tag')).toBeInTheDocument();
  });

  it('hides header when hideHeader is true', () => {
    render(
      <TagModifier hideHeader>
        <CategoryModifier
          selectedTagCategory={selectedTagCategory}
          onTagCategoryChange={onChange}
          tagCategories={tagCategories}
        />
        <ValueModifier
          selectedTagCategory={selectedTagCategory}
          onTagValueChange={onChange}
          selectedTagValues={[]}
          values={animalValues}
        />
      </TagModifier>
    );
    expect(screen.queryByText('Add/Modify tag')).not.toBeInTheDocument();
  });

  it('renders a custom header', () => {
    render(
      <TagModifier header="Custom Header">
        <CategoryModifier
          selectedTagCategory={selectedTagCategory}
          onTagCategoryChange={onChange}
          tagCategories={tagCategories}
        />
        <ValueModifier
          selectedTagCategory={selectedTagCategory}
          onTagValueChange={onChange}
          selectedTagValues={[]}
          values={animalValues}
        />
      </TagModifier>
    );
    expect(screen.getByText('Custom Header')).toBeInTheDocument();
  });
});
