import React from 'react';
import Tagging from '../components/tagging';
import renderer from 'react-test-renderer';
import { shallow } from 'enzyme';

const tags = { animal: ['duck', 'pig'], food: ['steak', 'salad'] };
const setTags = [{ tagCategory: 'animal', tagValue: 'pig' }, { tagCategory: 'food', tagValue: 'steak' }];
const selectedTagCategory = 'animal';
const selectedTagValue = 'pig';
function onChange(x) {
  return x;
}
function onDelete(x) {
  return x;
}


describe('Tagging component without redux mapping', () => {
  it('match snapshot', () => {
    const component = renderer.create(<Tagging
      tags={tags}
      setTags={setTags}
      onTagValueChange={onChange}
      onTagCategoryChange={onChange}
      onTagDeleteClick={onDelete}
      selectedTagCategory={selectedTagCategory}
      selectedTagValue={selectedTagValue}
    />);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should call methods', () => {
    const onTagCategoryChange = jest.fn();
    const onTagValueChange = jest.fn();
    const onTagDeleteClick = jest.fn();
    const wrapper  = shallow(<Tagging
      tags={tags}
      setTags={setTags}
      onTagValueChange={onTagValueChange}
      onTagCategoryChange={onTagCategoryChange}
      onTagDeleteClick={onTagDeleteClick}
      selectedTagCategory={selectedTagCategory}
      selectedTagValue={selectedTagValue}
    />);
    wrapper.instance().onTagCategoryChange('xaxa');
    expect(onTagCategoryChange.mock.calls.length).toEqual(1);
    wrapper.instance().onTagValueChange('wawa');
    expect(onTagCategoryChange.mock.calls.length).toEqual(1);
    wrapper.instance().onTagDeleteClick('wowo');
    expect(onTagCategoryChange.mock.calls.length).toEqual(1);
  })
})
