import React from 'react';
import CategoryModifier from '../components/InnerComponents/CategoryModifier';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

const selectedTagCategory = { description: 'animal', id: 1 };
const onTagCategoryChange = jest.fn();
const tagCategories = [
  { description: 'Name', id: 1 },
  { description: 'Number', id: 2 },
  { description: 'Animal', id: 3 },
  { description: 'Food', id: 4 }
];

describe('TagCategory Component', () => {
  it('match snapshot', () => {
    const component = shallow(
      <CategoryModifier
        selectedTagCategory={selectedTagCategory}
        onTagCategoryChange={onTagCategoryChange}
        tagCategories={tagCategories}
      />
    );

    const tree = toJson(component);
    expect(tree).toMatchSnapshot();
  });
});
