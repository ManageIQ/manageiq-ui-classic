import React from 'react';
import { TaggingWithButtonsConnected } from '../containers/tagging';
import TaggingWithButtons from '../components/taggingWithButtons'
import Tagging from '../components/tagging';
import renderer from 'react-test-renderer';
import { shallow, mount } from 'enzyme';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';


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

const assignedTags = [{ tagCategory: { description: 'Name', id: 1 }, tagValues: [{ description: 'Pepa', id: 11 }] }];

const initialState = {tagging: {appState: { tags: tags, assignedTags: assignedTags, selected: { tagCategory: { description: 'Name', id: 1 }, tagValue: {}} }}};
const initialProps = {
  selectedTagCategory: {},
  selectedTagValue: {},
  tags: [],
  assignedTags: [],
  onTagDeleteClick: jest.fn(),
  onTagCategoryChange: jest.fn(),
  onTagValueChange:jest.fn(),
  onTagMultiValueChange: jest.fn(),
  showReset: true,
  cancelButton: {},
  resetButton: {},
  saveButton: {},
};
const mockStore = configureStore();
let store,
  wrapper;

describe('Test connected Tagging component', () => {
  beforeEach(() => {
    store = mockStore(initialState);
    wrapper = mount(<Provider store={store}><TaggingWithButtonsConnected /></Provider>);
  });

  it('+++ render the connected(SMART) component', () => {
    expect(wrapper.find(TaggingWithButtonsConnected).length).toEqual(1);
  });

  it('', () => {
    const onTagMultiValueChange = jest.fn();
    const onTagValueChange = jest.fn();

    const wrapper = shallow(<TaggingWithButtons {...initialProps} multiValue={true} selectedTagCategory={{ description: 'Name', id: 1 }} onTagValueChange={onTagValueChange} onTagMultiValueChange={onTagMultiValueChange}/>);
    wrapper.instance().onTagValueChange({});
    expect(onTagMultiValueChange).toBeCalledWith({"tagCategory": {"description": "Name", "id": 1}, "tagValue": {}});
    wrapper.setProps({multiValue: false});
    wrapper.instance().onTagValueChange({});
    expect(onTagValueChange).toBeCalledWith({"tagCategory": {"description": "Name", "id": 1}, "tagValue": {}});
  })
});
