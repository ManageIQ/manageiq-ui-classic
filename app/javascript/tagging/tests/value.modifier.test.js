import React from 'react';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import ValueModifier from '../components/valueModifier';

const selectedTagValue = { description: 'Duck', id: 1 };
const onTagValueChange = jest.fn();
const tagValues = [
  { description: 'Duck', id: 1 },
  { description: 'Cat', id: 2 },
  { description: 'Dog', id: 3 },
];

describe('TagCategory Component', () => {
  it('match snapshot', () => {
    const tree = mount(<ValueModifier
      onTagValueChange={onTagValueChange}
      selectedTagValue={selectedTagValue}
      multiValue={false}
      tagValues={tagValues}
    />);

    expect(toJson(tree)).toMatchSnapshot();
  });
});
