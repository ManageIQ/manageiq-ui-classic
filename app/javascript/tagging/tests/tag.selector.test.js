import React from 'react';
import { shallow, mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import TagSelector from '../components/tagSelector';


describe('Tagging modifier', () => {
  const tagCategories = [
    { description: 'Name', id: 1 },
    { description: 'Number', id: 2 },
  ];
  const selectedTagValue = { description: 'Homer', id: 1 };
  let onTagCategoryChange;
  beforeEach(() => {
    onTagCategoryChange = jest.fn();
  });

  it('match snapshot', () => {
    const tree = mount(<TagSelector
      tagCategories={tagCategories}
      onTagCategoryChange={onTagCategoryChange}
      selectedOption={selectedTagValue}
    />);
    expect(toJson(tree)).toMatchSnapshot();
  });

  it('should call methods', () => {
    onTagCategoryChange = jest.fn();
    const wrapper = shallow(<TagSelector
      tagCategories={tagCategories}
      onTagCategoryChange={onTagCategoryChange}
      selectedOption={selectedTagValue}
    />);
    wrapper.instance().handleChange({ label: 'Name', value: 1 });
    expect(onTagCategoryChange.mock.calls.length).toEqual(1);
  });
});
