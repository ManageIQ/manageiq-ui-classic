import React from 'react';
import TagModifier from '../components/tagModifier';
import ValueModifier from '../components/valueModifier';
import CategoryModifier from '../components/categoryModifier';
import renderer from 'react-test-renderer';
import { shallow } from 'enzyme';

const tagCategories = [
  { description: 'Name', id: 1 },
  { description: 'Number', id: 2 },
  { description: 'Animal', id: 3 },
  { description: 'Food', id: 4 }
];
const animalValues = [
  { description: 'Duck', id: 31 },
  { description: 'Cat', id: 32 },
  { description: 'Dog', id: 33 }
];

const selectedTagCategory = { description: 'animal', id: 1 };
const selectedTagValue = { description: 'duck', id: 1 };

function onChange(x) {
  return x;
}

describe('Tagging modifier', () => {
  it('match snapshot', () => {
    const component = renderer.create(
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
      </TagModifier>
    );
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
