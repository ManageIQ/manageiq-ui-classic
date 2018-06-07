import React from 'react';
import toJson from 'enzyme-to-json';
import { mount } from 'enzyme';
import TagCategory from '../components/tagCategory';

const tagCategory = { description: 'animal', id: 1 };
const tagValues = [{ description: 'duck', id: 1 }, { description: 'lion', id: 2 }];
function onDelete(x) {
  return x;
}

describe('TagCategory Component', () => {
  it('match snapshot', () => {
    const tree = mount(<TagCategory tagCategory={tagCategory} tagValues={tagValues} onTagDeleteClick={onDelete} />);
    expect(toJson(tree)).toMatchSnapshot();
  });
});
