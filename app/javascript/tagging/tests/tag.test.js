import React from 'react';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import Tag from '../components/tag';

const tagCategory = { description: 'animal', id: 1 };
const tagValue = { description: 'duck', id: 1 };
const onDelete = x => x;

describe('Tag Component', () => {
  it('match snapshot', () => {
    const tree = mount(<Tag tagCategory={tagCategory} tagValue={tagValue} onTagDeleteClick={onDelete} />);
    expect(toJson(tree)).toMatchSnapshot();
  });
});
