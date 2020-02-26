import React from 'react';
import TagModifier from '../components/InnerComponents/TagModifier';
import CategoryModifier from '../components/InnerComponents/CategoryModifier';
import ValueModifier from '../components/InnerComponents/ValueModifier';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

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
    const component = shallow(
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
          values={animalValues}
        />
      </TagModifier>
    );
    const tree = toJson(component);
    expect(tree).toMatchSnapshot();
  });
});
