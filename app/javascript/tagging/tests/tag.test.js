import React from 'react';
import Tag from '../components/tag';
import renderer from 'react-test-renderer';
import { shallow } from 'enzyme';

const tagCategory = 'animal';
const tagValue = 'duck';
function onDelete(x) {
  return x;
}

describe('Tag Component', () => {
  it('match snapshot', () => {
    const component = renderer.create(<Tag tagCategory={tagCategory} tagValue={tagValue} onTagDeleteClick={onDelete} />);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should call methods', () => {
    const onDelete = jest.fn();
    const wrapper = shallow(<Tag tagCategory={tagCategory} tagValue={tagValue} onTagDeleteClick={onDelete} />);
    wrapper.instance().handleClick('Knedlik');
    expect(onDelete.mock.calls.length).toEqual(1);
  });
});
