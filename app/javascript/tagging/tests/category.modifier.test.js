import React from 'react';
import CategoryModifier from '../components/InnerComponents/CategoryModifier';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

const selectedTagCategory = { label: 'animal', id: 1 };
const onTagCategoryChange = jest.fn();
const tagCategories = [
  { label: 'Name', id: 1 },
  { label: 'Number', id: 2 },
  { label: 'Animal', id: 3 },
  { label: 'Food', id: 4 }
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
