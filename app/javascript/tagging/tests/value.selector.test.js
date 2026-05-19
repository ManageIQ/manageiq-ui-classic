import React from 'react';
import { render } from '@testing-library/react';
import ValueSelector from '../components/InnerComponents/ValueSelector';

describe('ValueSelector component', () => {
  const selectedTagCategory = { label: 'Comic Book Characters', id: '1' };
  const tagValues = [
    { label: 'Asterix', id: 1 },
    { label: 'Obelix', id: 2 },
  ];
  const selectedTagValues = [{ label: 'Obelix', id: 2 }];
  const onChange = jest.fn();

  it('should match snapshot', () => {
    const { container } = render(
      <ValueSelector
        selectedTagCategory={selectedTagCategory}
        values={tagValues}
        onTagValueChange={onChange}
        selectedOption={selectedTagValues}
      />
    );
    expect(container).toMatchSnapshot();
  });

  it('should match snapshot without multiple values', () => {
    const { container } = render(
      <ValueSelector
        values={tagValues}
        onTagValueChange={onChange}
        selectedOption={selectedTagValues}
        multiValue={false}
        selectedTagCategory={selectedTagCategory}
      />
    );
    expect(container).toMatchSnapshot();
  });
});
