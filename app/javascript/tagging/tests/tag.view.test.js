import React from 'react';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import TagView from '../components/tagView';

const assignedTags = [{ tagCategory: { description: 'Name', id: 1 }, tagValues: [{ description: 'Pepa', id: 11 }] }];
const onDelete = x => x;

describe('Tag view', () => {
  it('match snapshot', () => {
    const tree = mount(<TagView assignedTags={assignedTags} onTagDeleteClick={onDelete} />);
    expect(toJson(tree)).toMatchSnapshot();
  });
});
