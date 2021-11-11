import React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import TagSelector from '../components/InnerComponents/TagSelector';

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
    const tree = shallow(<TagSelector
      tagCategories={tagCategories}
      onTagCategoryChange={onTagCategoryChange}
      selectedOption={selectedTagValue}
    />);
    expect(toJson(tree)).toMatchSnapshot();
  });

  it('should call methods', () => {
    const wrapper = shallow(
      <TagSelector
        tagCategories={tagCategories}
        onTagCategoryChange={onTagCategoryChange}
        selectedOption={selectedTagValue}
      />
    );
    wrapper.instance().handleChange({ selectedItem: { label: 'Name', value: 1 } });
    expect(onTagCategoryChange.mock.calls).toHaveLength(1);
  });
});
