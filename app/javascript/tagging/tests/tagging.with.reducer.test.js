import React from 'react';
import TaggingConnected from '../containers/tagging';
import Tagging from '../components/tagging';
import renderer from 'react-test-renderer';
import { shallow, mount } from 'enzyme';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';


const tags = { animal: ['duck', 'pig'], food: ['steak', 'salad'] };
const assignedTags = [{ tagCategory: 'animal', tagValue: 'pig' }, { tagCategory: 'food', tagValue: 'steak' }];

const initialState = { tags, selected: { tagCategory: 'animal', tagValue: 'pig' }, assignedTags };
const mockStore = configureStore();
let store,
  wrapper;

describe('Test connected Tagging component', () => {
  beforeEach(() => {
    store = mockStore(initialState);
    wrapper = mount(<Provider store={store}><TaggingConnected /></Provider>);
  });

  it('+++ render the connected(SMART) component', () => {
    expect(wrapper.find(TaggingConnected).length).toEqual(1);
  });

  it('+++ check Prop matches with initialState', () => {
    expect(wrapper.find(Tagging).prop('tags')).toEqual(initialState.tags);
    expect(wrapper.find(Tagging).prop('selectedTagCategory')).toEqual(initialState.selected.tagCategory);
    expect(wrapper.find(Tagging).prop('selectedTagValue')).toEqual(initialState.selected.tagValue);
    expect(wrapper.find(Tagging).prop('assignedTags')).toEqual(initialState.assignedTags);
  });
});
