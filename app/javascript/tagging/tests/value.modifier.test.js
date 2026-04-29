import React from 'react';
import { render } from '@testing-library/react';
import ValueModifier from '../components/InnerComponents/ValueModifier';

describe('ValueModifier Component', () => {
  const selectedTagCategory = { label: 'Animal', id: '1' };
  const selectedTagValue = [{ label: 'Duck', id: 1 }];
  const onTagValueChange = jest.fn();
  const tagValues = [
    { label: 'Duck', id: 1 },
    { label: 'Cat', id: 2 },
    { label: 'Dog', id: 3 },
  ];

  it('should match snapshot', () => {
    const { container } = render(
      <ValueModifier
        selectedTagCategory={selectedTagCategory}
        onTagValueChange={onTagValueChange}
        selectedTagValues={selectedTagValue}
        multiValue={false}
        values={tagValues}
      />
    );

    expect(container).toMatchSnapshot();
  });
});
