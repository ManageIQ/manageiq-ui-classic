import React from 'react';
import { render } from '@testing-library/react';
import TagModifier from '../components/InnerComponents/TagModifier';
import CategoryModifier from '../components/InnerComponents/CategoryModifier';
import ValueModifier from '../components/InnerComponents/ValueModifier';

describe('Tagging modifier', () => {
  const tagCategories = [
    { label: 'Name', id: 1 },
    { label: 'Number', id: 2 },
    { label: 'Animal', id: 3 },
    { label: 'Food', id: 4 },
  ];
  const animalValues = [
    { label: 'Duck', id: 31 },
    { label: 'Cat', id: 32 },
    { label: 'Dog', id: 33 },
  ];
  const selectedTagCategory = { label: 'animal', id: 1 };
  const selectedTagValues = [{ label: 'duck', id: 1 }];
  const onChange = jest.fn();

  it('should match snapshot', () => {
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
});
