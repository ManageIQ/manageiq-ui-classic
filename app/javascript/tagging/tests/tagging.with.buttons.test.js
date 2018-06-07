import React from 'react';
import { shallow } from 'enzyme';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { TaggingWithButtonsConnected } from '../containers/tagging';
import TaggingWithButtons from '../components/taggingWithButtons';


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

const initialState = {
  tagging: {
    appState: { tags, assignedTags, selected: { tagCategory: { description: 'Name', id: 1 }, tagValue: {} } },
  },
};
const initialProps = {
  selectedTagCategory: {},
  selectedTagValue: {},
  tags: [],
  assignedTags: [],
  onTagDeleteClick: jest.fn(),
  onTagCategoryChange: jest.fn(),
  onTagValueChange: jest.fn(),
  onTagMultiValueChange: jest.fn(),
  showReset: true,
  cancelButton: {},
  resetButton: {},
  saveButton: {},
};
const mockStore = configureStore();
let store;
let wrapper;

describe('Test connected Tagging component', () => {
  beforeEach(() => {
    store = mockStore(initialState);
    wrapper = shallow(<Provider store={store}><TaggingWithButtonsConnected /></Provider>);
  });

  it('+++ render the connected(SMART) component', () => {
    expect(wrapper.find(TaggingWithButtonsConnected).length).toEqual(1);
  });

  it('calls right function', () => {
    const onTagCategoryChange = jest.fn();

    wrapper = shallow(<TaggingWithButtons
      {...initialProps}
      multiValuedescription
      selectedTagCategory={{ description: 'Name', id: 1 }}
      onTagCategoryChange={onTagCategoryChange}
    />);
    wrapper.instance().onTagCategoryChange({ description: 'Number', id: 2 });
    expect(onTagCategoryChange).toBeCalledWith({ description: 'Number', id: 2 });
  });
});
