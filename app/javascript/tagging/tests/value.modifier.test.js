import React from 'react';
import ValueModifier from '../components/valueModifier';
import renderer from 'react-test-renderer';
import { shallow } from 'enzyme';

const selectedTagValue = { description: 'Duck', id: 1};
const onTagValueChange = jest.fn();
const tagValues = [
  { description: 'Duck', id: 1 },
  { description: 'Cat', id: 2 },
  { description: 'Dog', id: 3 },
];

describe('TagCategory Component', () => {
  it('match snapshot', () => {
    const component = renderer.create(<ValueModifier
        onTagValueChange={onTagValueChange}
        selectedTagValue={selectedTagValue}
        multiValue={false}
        tagValues={tagValues}
      />);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
