import React from 'react';
import { render } from '@testing-library/react';
import TagCategory from '../components/InnerComponents/TagCategory';

describe('TagCategory Component', () => {
  const tagCategory = { label: 'animal', id: 1 };
  const tagValues = [
    { label: 'duck', id: 1 },
    { label: 'lion', id: 2 },
  ];
  const onDelete = jest.fn();

  it('should match snapshot', () => {
    const { container } = render(
      <TagCategory
        tagCategory={tagCategory}
        values={tagValues}
        onTagDeleteClick={onDelete}
      />
    );
    expect(container).toMatchSnapshot();
  });
});
