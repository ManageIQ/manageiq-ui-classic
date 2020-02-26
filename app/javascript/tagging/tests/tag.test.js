import React from 'react';
import Tag from '../components/InnerComponents/Tag';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

const tagCategory = { description: 'animal', id: 1 };
const tagValue = { description: 'duck', id: 1 };
function onDelete(x) {
  return x;
}

describe('Tag Component', () => {
  it('match snapshot', () => {
    const component = shallow(
      <Tag
        tagCategory={tagCategory}
        tagValue={tagValue}
        onTagDeleteClick={onDelete}
        truncate={jest.fn()}
      />
    );
    const tree = toJson(component);
    expect(tree).toMatchSnapshot();
  });
});
