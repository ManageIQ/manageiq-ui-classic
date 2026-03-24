import React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import Tagging from '../components/Tagging/Tagging';

const tags = [
  {
    label: 'Name',
    id: 1,
    values: [{ label: 'Pepa', id: 11 }, { label: 'Franta', id: 12 }],
  },
  {
    label: 'Number',
    id: 2,
    values: [{ label: '1', id: 21 }, { label: '2', id: 22 }],
  },
  {
    label: 'Animal',
    id: 3,
    values: [
      { label: 'Duck', id: 31 },
      { label: 'Cat', id: 32 },
      { label: 'Dog', id: 33 },
    ],
  },
  {
    label: 'Food',
    id: 4,
    singleValue: false,
    values: [
      { label: 'Steak', id: 41 },
      { label: 'Duck', id: 42 },
      { label: 'Salad', id: 43 },
    ],
  },
  {
    label: 'Something',
    id: 5,
    singleValue: true,
    values: [
      { label: 'Knedlik', id: 51 },
      {
        label:
          'Daenerys Stormborn of the House Targaryen, First of Her Name,...and Mother of Dragons',
        id: 52,
      },
    ],
  },
];

const selectedTagCategory = { label: 'animal', id: 1 };
const selectedTagCategory1 = { label: 'Food', id: 4 };
const selectedTagCategory2 = { label: 'Something', id: 5 };
const assignedTags = [
  {
    label: 'Name',
    id: 1,
    values: [{ label: 'Pepa', id: 11 }],
  },
];

const onChange = jest.fn();
const onDelete = jest.fn();

describe('Tagging component without redux mapping', () => {
  it('match snapshot', () => {
    const component = shallow(<Tagging
      tags={tags}
      assignedTags={assignedTags}
      onTagValueChange={onChange}
      onSingleTagValueChange={onChange}
      onTagMultiValueChange={onChange}
      onTagCategoryChange={onChange}
      onTagDeleteClick={onDelete}
      selectedTagCategory={selectedTagCategory}
    />);
    const tree = toJson(component);
    expect(tree).toMatchSnapshot();
  });

  it('should call methods', () => {
    const onTagCategoryChange = jest.fn();
    const onTagValueChange = jest.fn();
    const onSingleTagValueChange = jest.fn();
    const onTagDeleteClick = jest.fn();
    const onTagMultiValueChange = jest.fn();
    const wrapper = shallow(<Tagging
      tags={tags}
      assignedTags={assignedTags}
      onTagValueChange={onTagValueChange}
      onSingleTagValueChange={onSingleTagValueChange}
      onTagMultiValueChange={onTagMultiValueChange}
      onTagCategoryChange={onTagCategoryChange}
      onTagDeleteClick={onTagDeleteClick}
      selectedTagCategory={selectedTagCategory}
    />);
    wrapper.instance().onTagCategoryChange('xaxa');
    expect(onTagCategoryChange.mock.calls).toHaveLength(1);
    wrapper.instance().onTagValueChange('wawa');
    expect(onTagCategoryChange.mock.calls).toHaveLength(1);
    wrapper.instance().onTagDeleteClick('wowo');
    expect(onTagCategoryChange.mock.calls).toHaveLength(1);
  });

  it('should call methods - singleValue is false', () => {
    const onTagCategoryChange = jest.fn();
    const onTagValueChange = jest.fn();
    const onSingleTagValueChange = jest.fn();
    const onTagDeleteClick = jest.fn();
    const onTagMultiValueChange = jest.fn();
    const wrapper = shallow(<Tagging
      tags={tags}
      assignedTags={assignedTags}
      onTagValueChange={onTagValueChange}
      onSingleTagValueChange={onSingleTagValueChange}
      onTagMultiValueChange={onTagMultiValueChange}
      onTagCategoryChange={onTagCategoryChange}
      onTagDeleteClick={onTagDeleteClick}
      selectedTagCategory={selectedTagCategory1}
    />);
    const tree = toJson(wrapper);
    expect(tree).toMatchSnapshot();
    expect(wrapper.find('ValueModifier').props().multiValue).toBe(true);
  });

  it('should call methods - singleValue is true', () => {
    const onTagCategoryChange = jest.fn();
    const onTagValueChange = jest.fn();
    const onSingleTagValueChange = jest.fn();
    const onTagDeleteClick = jest.fn();
    const onTagMultiValueChange = jest.fn();
    const wrapper = shallow(<Tagging
      tags={tags}
      assignedTags={assignedTags}
      onTagValueChange={onTagValueChange}
      onSingleTagValueChange={onSingleTagValueChange}
      onTagMultiValueChange={onTagMultiValueChange}
      onTagCategoryChange={onTagCategoryChange}
      onTagDeleteClick={onTagDeleteClick}
      selectedTagCategory={selectedTagCategory2}
    />);
    const tree = toJson(wrapper);
    expect(tree).toMatchSnapshot();
    expect(wrapper.find('ValueModifier').props().multiValue).toBe(false);
  });
});
