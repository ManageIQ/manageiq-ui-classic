import React from 'react';
import TagView from '../components/InnerComponents/TagView';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

const assignedTags = [
  {
    description: 'Name',
    id: 1,
    values: [{ description: 'Pepa', id: 11 }]
  }
];
const onDelete = jest.fn();

describe('Tag view', () => {
  it('match snapshot', () => {
    const component = shallow(
      <TagView assignedTags={assignedTags} onTagDeleteClick={onDelete} />
    );
    const tree = toJson(component);
    expect(tree).toMatchSnapshot();
  });
});
