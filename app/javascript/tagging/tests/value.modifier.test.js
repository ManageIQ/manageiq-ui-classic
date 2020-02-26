import React from 'react';
import ValueModifier from '../components/InnerComponents/ValueModifier';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

const selectedTagValue = [{ description: 'Duck', id: 1 }];
const onTagValueChange = jest.fn();
const tagValues = [
  { description: 'Duck', id: 1 },
  { description: 'Cat', id: 2 },
  { description: 'Dog', id: 3 }
];

describe('TagCategory Component', () => {
  it('match snapshot', () => {
    const component = shallow(
      <ValueModifier
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
