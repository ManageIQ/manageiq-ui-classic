import React from 'react';
import TagCategory from '../components/InnerComponents/TagCategory';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

const tagCategory = { label: 'animal', id: 1 };
const tagValues = [
  { label: 'duck', id: 1 },
  { label: 'lion', id: 2 }
];
function onDelete(x) {
  return x;
}

describe('TagCategory Component', () => {
  it('match snapshot', () => {
    const component = shallow(
      <TagCategory
        tagCategory={tagCategory}
        values={tagValues}
        onTagDeleteClick={onDelete}
      />
    );
    const tree = toJson(component);
    expect(tree).toMatchSnapshot();
  });
});
