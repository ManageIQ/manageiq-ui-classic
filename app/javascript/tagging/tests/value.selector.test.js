import React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import ValueSelector from '../components/InnerComponents/ValueSelector';

const selectedTagCategory = { label: 'Comic Book Characters', id: '1' };
const tagValues = [
  { label: 'Asterix', id: 1 },
  { label: 'Obelix', id: 2 }
];
const selectedTagValues = [{ label: 'Obelix', id: 2 }];
function onChange(x) {
  return x;
}

test('match snapshot', () => {
  const component = shallow(
    <ValueSelector
      selectedTagCategory={selectedTagCategory}
      values={tagValues}
      onTagValueChange={onChange}
      selectedOption={selectedTagValues}
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
      selectedOption={selectedTagValues}
      multiValue={false}
      selectedTagCategory={selectedTagCategory}
    />
  );
  const tree = toJson(component);
  expect(tree).toMatchSnapshot();
});
