import React from 'react';
import { render } from '@testing-library/react';
import TagView from '../components/InnerComponents/TagView';

describe('Tag view', () => {
  const assignedTags = [
    {
      label: 'Name',
      id: 1,
      values: [{ label: 'Pepa', id: 11 }],
    },
  ];
  const onDelete = jest.fn();

  it('should match snapshot', () => {
    const { container } = render(
      <TagView assignedTags={assignedTags} onTagDeleteClick={onDelete} />
    );
    expect(container).toMatchSnapshot();
  });
});
