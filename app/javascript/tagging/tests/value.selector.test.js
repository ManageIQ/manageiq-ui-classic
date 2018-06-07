import React from 'react';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import ValueSelector from '../components/valueSelector';

const tagValues = [
  { description: 'Asterix', id: 1 },
  { description: 'Obelix', id: 2 },
];
const selectedTagValue = { description: 'Obelix', id: 2 };
function onChange(x) {
  return x;
}

test('match snapshot', () => {
  const tree = mount(<ValueSelector tagValues={tagValues} onTagValueChange={onChange} selectedOption={selectedTagValue} />);
  expect(toJson(tree)).toMatchSnapshot();
});

test('match snapshot without multiple values', () => {
  const tree = mount(<ValueSelector tagValues={tagValues} onTagValueChange={onChange} selectedOption={selectedTagValue} multiValue={false} />);
  expect(toJson(tree)).toMatchSnapshot();
});
