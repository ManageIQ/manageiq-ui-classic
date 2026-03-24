import React from 'react';
import { shallow } from 'enzyme';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { TaggingWithButtonsConnected } from '../containers/tagging';
import TaggingWithButtons from '../components/TaggingWithButtons/TaggingWithButtons'


const tags = [
  { label: 'Name', id: 1, values: [{ label: 'Pepa', id: 11 }, { label: 'Franta', id: 12 }] },
  { label: 'Number', id: 2, values: [{ label: '1', id: 21 }, { label: '2', id: 22 }] },
  { label: 'Animal', id: 3, values: [{ label: 'Duck', id: 31 }, { label: 'Cat', id: 32 }, { label: 'Dog', id: 33 }] },
  { label: 'Food', id: 4, values: [{ label: 'Steak', id: 41 }, { label: 'Duck', id: 42 }, { label: 'Salad', id: 43 }] },
  {
    label: 'Something',
    id: 5,
    values: [{ label: 'Knedlik', id: 51 },
      { label: 'Daenerys Stormborn of the House Targaryen, First of Her Name,...and Mother of Dragons', id: 52 }],
  },
];

const assignedTags = [{ label: 'Name', id: 1, tagValues: [{ label: 'Pepa', id: 11 }] }];

const initialState = {
  tagging: {
    appState: { tags, assignedTags, selected: { tagCategory: { label: 'Name', id: 1 }, tagValue: {} } },
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
      multiValuelabel
      selectedTagCategory={{ label: 'Name', id: 1 }}
      onTagCategoryChange={onTagCategoryChange}
    />);
    wrapper.instance().onTagCategoryChange({ label: 'Number', id: 2 });
    expect(onTagCategoryChange).toBeCalledWith({ label: 'Number', id: 2 });
  });
});
