import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TagSelector from '../components/InnerComponents/TagSelector';

describe('Tagging selector', () => {
  const tagCategories = [
    { label: 'Name', id: 1 },
    { label: 'Number', id: 2 },
  ];
  const selectedTagValue = { label: 'Homer', id: 1 };
  const onTagCategoryChange = jest.fn();

  it('should match snapshot', () => {
    const { container } = render(
      <TagSelector
        tagCategories={tagCategories}
        onTagCategoryChange={onTagCategoryChange}
        selectedOption={selectedTagValue}
      />
    );
    expect(container).toMatchSnapshot();
  });

  it('should call onChange when selection changes', async() => {
    const user = userEvent.setup();
    render(
      <TagSelector
        tagCategories={tagCategories}
        onTagCategoryChange={onTagCategoryChange}
        selectedOption={selectedTagValue}
      />
    );

    // Find and interact with the dropdown
    const dropdown = screen.getByRole('combobox');
    await user.click(dropdown);

    // Select the "Number" option (different from currently selected "Name")
    const options = screen.getAllByRole('option');
    const numberOption = options.find(
      (option) => option.textContent === 'Number'
    );
    await user.click(numberOption);

    expect(onTagCategoryChange).toHaveBeenCalledTimes(1);
  });
});
