import React from 'react';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import CategoryModifier from '../components/categoryModifier';

const selectedTagCategory = { description: 'animal', id: 1 };
const onTagCategoryChange = jest.fn();
const tagCategories = [
  { description: 'Name', id: 1 },
  { description: 'Number', id: 2 },
  { description: 'Animal', id: 3 },
  { description: 'Food', id: 4 },
];

describe('TagCategory Component', () => {
  it('match snapshot', () => {
    const tree = mount(<CategoryModifier
      selectedTagCategory={selectedTagCategory}
      onTagCategoryChange={onTagCategoryChange}
      tagCategories={tagCategories}
    />);
    expect(toJson(tree)).toMatchSnapshot();
  });
});
