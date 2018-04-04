import React from 'react';
import TagSelector from '../components/tagSelector';
import renderer from 'react-test-renderer';
import { shallow } from 'enzyme';

const tagCategories = [
  { description: 'Name', id: 1 },
  { description: 'Number', id: 2 },
];
const selectedTagValue = { description: 'Homer', id: 1};
const onTagCategoryChange = jest.fn();

describe('Tagging modifier', () => {
  it('match snapshot', () => {
    const component = renderer.create(<TagSelector tagCategories={tagCategories} onTagCategoryChange={onTagCategoryChange} selectedOption={selectedTagValue} />);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should call methods', () => {
    const onTagCategoryChange = jest.fn();
    const wrapper = shallow(<TagSelector tagCategories={tagCategories} onTagCategoryChange={onTagCategoryChange} selectedOption={selectedTagValue} />);
    wrapper.instance().handleChange('Knedlik');
    expect(onTagCategoryChange.mock.calls.length).toEqual(1);
  });
});
