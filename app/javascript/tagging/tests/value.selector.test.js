import React from 'react';
import ValueSelector from '../components/InnerComponents/ValueSelector';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

const tagValues = [
  { description: 'Asterix', id: 1 },
  { description: 'Obelix', id: 2 }
];
const selectedTagValue = { description: 'Obelix', id: 2 };
function onChange(x) {
  return x;
}

test('match snapshot', () => {
  const component = shallow(
    <ValueSelector
      values={tagValues}
      onTagValueChange={onChange}
      selectedOption={selectedTagValue}
    />
  );
  const tree = toJson(component);
  expect(tree).toMatchSnapshot();
});

test('match snapshot without multiple values', () => {
  const component = shallow(
    <ValueSelector
      values={tagValues}
      onTagValueChange={onChange}
      selectedOption={selectedTagValue}
      multiValue={false}
    />
  );
  const tree = toJson(component);
  expect(tree).toMatchSnapshot();
});
