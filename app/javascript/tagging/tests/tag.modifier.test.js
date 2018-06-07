import React from 'react';
import toJson from 'enzyme-to-json';
import { mount } from 'enzyme';
import TagModifier from '../components/tagModifier';
import ValueModifier from '../components/valueModifier';
import CategoryModifier from '../components/categoryModifier';

const tagCategories = [
  { description: 'Name', id: 1 },
  { description: 'Number', id: 2 },
  { description: 'Animal', id: 3 },
  { description: 'Food', id: 4 },
];
const animalValues = [
  { description: 'Duck', id: 31 },
  { description: 'Cat', id: 32 },
  { description: 'Dog', id: 33 },
];

const selectedTagCategory = { description: 'animal', id: 1 };
const selectedTagValue = { description: 'duck', id: 1 };

const onChange = x => x;

describe('Tagging modifier', () => {
  it('match snapshot', () => {
    const tree = mount(
      <TagModifier>
        <CategoryModifier
          selectedTagCategory={selectedTagCategory}
          onTagCategoryChange={onChange}
          tagCategories={tagCategories}
        />
        <ValueModifier
          onTagValueChange={onChange}
          selectedTagValue={selectedTagValue}
          multiValue={false}
          tagValues={animalValues}
        />
      </TagModifier>);
    expect(toJson(tree)).toMatchSnapshot();
  });
});
