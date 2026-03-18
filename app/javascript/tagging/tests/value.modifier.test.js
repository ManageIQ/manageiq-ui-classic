import React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import ValueModifier from '../components/InnerComponents/ValueModifier';

const selectedTagCategory = { label: 'Animal', id: '1' };
const selectedTagValue = [{ label: 'Duck', id: 1 }];
const onTagValueChange = jest.fn();
const tagValues = [
  { label: 'Duck', id: 1 },
  { label: 'Cat', id: 2 },
  { label: 'Dog', id: 3 },
];

describe('TagCategory Component', () => {
  it('match snapshot', () => {
    const component = shallow(
      <ValueModifier
        selectedTagCategory={selectedTagCategory}
        onTagValueChange={onTagValueChange}
        selectedTagValues={selectedTagValue}
        multiValue={false}
        values={tagValues}
      />
    );

    const tree = toJson(component);
    expect(tree).toMatchSnapshot();
  });
});
