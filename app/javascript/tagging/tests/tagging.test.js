import React from 'react';
import { shallow, mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import Tagging from '../components/tagging';


const tags = [
  { description: 'Name', id: 1, values: [{ description: 'Pepa', id: 11 }, { description: 'Franta', id: 12 }] },
  { description: 'Number', id: 2, values: [{ description: '1', id: 21 }, { description: '2', id: 22 }] },
  { description: 'Animal', id: 3, values: [{ description: 'Duck', id: 31 }, { description: 'Cat', id: 32 }, { description: 'Dog', id: 33 }] },
  { description: 'Food', id: 4, values: [{ description: 'Steak', id: 41 }, { description: 'Duck', id: 42 }, { description: 'Salad', id: 43 }] },
  {
    description: 'Something',
    id: 5,
    values: [{ description: 'Knedlik', id: 51 },
      { description: 'Daenerys Stormborn of the House Targaryen, First of Her Name,...and Mother of Dragons', id: 52 }],
  },
];

const selectedTagCategory = { description: 'animal', id: 1 };
const selectedTagValue = { description: 'duck', id: 1 };
const assignedTags = [{ tagCategory: { description: 'Name', id: 1 }, tagValues: [{ description: 'Pepa', id: 11 }] }];

const onChange = x => x;
const onDelete = x => x;


describe('Tagging component without redux mapping', () => {
  it('match snapshot', () => {
    const tree = mount(<Tagging
      tags={tags}
      assignedTags={assignedTags}
      onTagValueChange={onChange}
      onTagCategoryChange={onChange}
      onTagDeleteClick={onDelete}
      selectedTagCategory={selectedTagCategory}
      selectedTagValue={selectedTagValue}
    />);
    expect(toJson(tree)).toMatchSnapshot();
  });

  it('should call methods', () => {
    const onTagCategoryChange = jest.fn();
    const onTagValueChange = jest.fn();
    const onTagDeleteClick = jest.fn();
    const wrapper = shallow(<Tagging
      tags={tags}
      assignedTags={assignedTags}
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
  });
});
