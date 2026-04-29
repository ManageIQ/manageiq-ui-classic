import React from 'react';
import { render } from '@testing-library/react';
import CategoryModifier from '../components/InnerComponents/CategoryModifier';

describe('Category modifier Component', () => {
  const selectedTagCategory = { label: 'animal', id: 1 };
  const onTagCategoryChange = jest.fn();
  const tagCategories = [
    { label: 'Name', id: 1 },
    { label: 'Number', id: 2 },
    { label: 'Animal', id: 3 },
    { label: 'Food', id: 4 },
  ];

  it('should match snapshot', () => {
    const { container } = render(
      <CategoryModifier
        selectedTagCategory={selectedTagCategory}
        onTagCategoryChange={onTagCategoryChange}
        tagCategories={tagCategories}
      />
    );

    expect(container).toMatchSnapshot();
  });
});
