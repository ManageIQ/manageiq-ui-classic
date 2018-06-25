import React from 'react';
import { TaggingConnected } from '../containers/tagging';
import Tagging from '../components/Tagging/Tagging';
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

const initialState = {appState: { tags: tags, assignedTags: assignedTags }};
const mockStore = configureStore();
let store,
  wrapper;

describe('Test connected Tagging component', () => {
  beforeEach(() => {
    store = mockStore(initialState);
    wrapper = shallow(<Provider store={store}><TaggingConnected /></Provider>);
  });

  it('+++ render the connected(SMART) component', () => {
    expect(wrapper.find(TaggingConnected).length).toEqual(1);
  });
});
