import React from 'react';
import TagView from '../components/tagView';
import renderer from 'react-test-renderer';
import { shallow } from 'enzyme';

const setTags = [{ tagCategory: 'animal', tagValue: 'pig' }, { tagCategory: 'planet', tagValue: 'Earth' }];
function onDelete(x) {
  return x;
}
describe('Tag view', () => {
  it('match snapshot', () => {
    const component = renderer.create(<TagView setTags={setTags} onTagDeleteClick={onDelete} />);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
