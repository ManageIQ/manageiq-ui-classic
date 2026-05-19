import React from 'react';
import { render } from '@testing-library/react';
import Tag from '../components/InnerComponents/Tag';

const tagCategory = { label: 'animal', id: 1 };
const tagValue = { label: 'duck', id: 1 };
function onDelete(x) {
  return x;
}

describe('Tag Component', () => {
  it('match snapshot', () => {
    const { container } = render(
      <Tag
        tagCategory={tagCategory}
        tagValue={tagValue}
        onTagDeleteClick={onDelete}
        truncate={jest.fn()}
      />
    );
    expect(container).toMatchSnapshot();
  });
});
