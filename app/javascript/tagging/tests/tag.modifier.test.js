import React from 'react';
import TagModifier from '../components/tagModifier';
import renderer from 'react-test-renderer';
import { shallow } from 'enzyme';

const tags = { animal: ['duck', 'pig'], food: ['steak', 'salad'] };
const selectedTagCategory = 'animal';
const selectedTagValue = 'pig';
function onChange(x) {
  return x;
}
describe('Tagging modifier', () => {
  it('match snapshot', () => {
    const component = renderer.create(<TagModifier
      tags={tags}
      onTagValueChange={onChange}
      onTagCategoryChange={onChange}
      selectedTagCategory={selectedTagCategory}
      selectedTagValue={selectedTagValue}
    />);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
