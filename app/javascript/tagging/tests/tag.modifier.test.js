import React from 'react';
import TagModifier from '../components/InnerComponents/TagModifier';
import CategoryModifier from '../components/InnerComponents/CategoryModifier';
import ValueModifier from '../components/InnerComponents/ValueModifier';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

const tagCategories = [
  { label: 'Name', id: 1 },
  { label: 'Number', id: 2 },
  { label: 'Animal', id: 3 },
  { label: 'Food', id: 4 },
];
const animalValues = [
  { label: 'Duck', id: 31 },
  { label: 'Cat', id: 32 },
  { label: 'Dog', id: 33 },
];

const selectedTagCategory = { label: 'animal', id: 1 };
const selectedTagValues = [{ label: 'duck', id: 1 }];

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
          selectedTagCategory={selectedTagCategory}
          onTagValueChange={onChange}
          selectedTagValues={selectedTagValues}
          multiValue={false}
          values={animalValues}
        />
      </TagModifier>
    );
    const tree = toJson(component);
    expect(tree).toMatchSnapshot();
  });
});
