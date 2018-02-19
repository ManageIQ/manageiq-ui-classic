import React from 'react';
import ValueSelector from '../components/valueSelector';
import { handleChange } from '../components/valueSelector';
import renderer from 'react-test-renderer';
import { shallow } from 'enzyme';

const tagValues = ['hello', 'this', 'is', 'Sparta!'];
const selectedTagValue = 'hello';
function onChange(x) {
  return x;
}

test('Some dummy test', () => {
  const component = renderer.create(<ValueSelector tagValues={tagValues} onTagValueChange={onChange} selectedOption={selectedTagValue} />);
  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});
