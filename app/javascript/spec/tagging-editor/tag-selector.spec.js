import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TagSelector from '../../components/tagging-editor/tag-selector';

const tagCategories = [
  { label: 'Name', id: '1' },
  { label: 'Number', id: '2' },
];
const selectedTagCategory = { label: 'Name', id: '1' };

describe('TagSelector component', () => {
  it('matches snapshot', () => {
    const { container } = render(
      <TagSelector
        tagCategories={tagCategories}
        onTagCategoryChange={jest.fn()}
        selectedOption={selectedTagCategory}
      />
    );
    expect(container).toMatchSnapshot();
  });

  it('calls onTagCategoryChange when a category is selected', async() => {
    const user = userEvent.setup();
    const onTagCategoryChange = jest.fn();
    render(
      <TagSelector
        tagCategories={tagCategories}
        onTagCategoryChange={onTagCategoryChange}
        selectedOption={selectedTagCategory}
      />
    );

    await user.click(screen.getByRole('combobox'));
    const options = screen.getAllByRole('option');
    const numberOption = options.find((o) => o.textContent === 'Number');
    await user.click(numberOption);

    expect(onTagCategoryChange).toHaveBeenCalledTimes(1);
    expect(onTagCategoryChange).toHaveBeenCalledWith({ id: '2', label: 'Number' });
  });

  it('renders with an empty selected option', () => {
    render(
      <TagSelector
        tagCategories={tagCategories}
        onTagCategoryChange={jest.fn()}
        selectedOption={{}}
      />
    );
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('is disabled when isDisabled is true', () => {
    render(
      <TagSelector
        tagCategories={tagCategories}
        onTagCategoryChange={jest.fn()}
        selectedOption={selectedTagCategory}
        isDisabled
      />
    );
    expect(screen.getByRole('combobox')).toBeDisabled();
  });
});
