import React from 'react';
import { shallow, mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { ADD_FLASH_MESSAGE } from '../../redux/action-types';
import TagsAssignment, { TagAssignment as NotConnectedTagAssignment } from '../tagg-assignment';

describe('Tag assignment component', () => {
  const mockStore = configureStore([thunk]);
  let store;
  let filledStore;
  let initialProps;
  beforeEach(() => {
    store = mockStore({
      usersReducer: {
        columns: [],
        selectedUsers: [],
      },
    });
    filledStore = mockStore({
      usersReducer: {
        columns: [{
          property: 'name',
          label: 'Full Name',
        }],
        selectedUsers: [{
          id: '1',
          name: 'foo',
          current_group: { label: 'foo group', value: 1 },
          role: { label: 'foo role', value: 1 },
          tags: [],
        }],
        categories: [{ value: '123', label: 'foo', name: 'foo' }],
      },
    });
    initialProps = {
      categories: [{ value: '1', label: 'First category', name: 'foo' }],
      loadTagCategories: jest.fn(),
      goBack: jest.fn(),
      createFlashMessage: jest.fn(),
      editUserTags: jest.fn(),
      columns: [{ property: 'name', label: 'Full Name' }],
      selectedUsers: [{
        id: '1',
        name: 'foo',
        current_group: { label: 'foo group', value: 1 },
        role: { label: 'foo role', value: 1 },
        tags: [],
      }],
      loadTagsCategories: jest.fn(),
    };
  });

  it('should redirect to root if no users are selected', () => {
    const wrapper = shallow(<TagsAssignment
      store={mockStore({ usersReducer: { columns: [] } })}
    />).dive();
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render spinner', () => {
    const wrapper = shallow(<TagsAssignment store={store} />).dive();
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render tags assignment component', () => {
    const wrapper = shallow(<TagsAssignment store={filledStore} />).dive();
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should create tags payload correctly', () => {
    const editUserTags = jest.fn();
    const wrapper = mount(<NotConnectedTagAssignment
      {...initialProps}
      editUserTags={editUserTags}
    />);
    const selectedTags = { 1: { name: '/x/y/z' }, 2: { name: '/1/2/3' } };
    const initialTags = { 3: { name: '/a/b/c' } };
    const users = [{ id: 1, href: 'foo' }];
    const expectedPayloads = [{
      action: 'unassign_tags',
      resources: [{
        href: 'foo',
        tags: [{
          category: 'b',
          name: 'c',
        }],
      }],
    }, {
      action: 'assign_tags',
      resources: [{
        href: 'foo',
        tags: [{
          category: 'y',
          name: 'z',
        }, {
          category: '2',
          name: '3',
        }],
      }],
    }];
    wrapper.instance().handleSaveTags(selectedTags, initialTags, users);
    expect(editUserTags).toHaveBeenCalledWith(...expectedPayloads);
  });

  it('should dispatch correct actions when edit canceled', () => {
    const wrapper = shallow(<TagsAssignment store={filledStore} />).dive();
    wrapper.instance().handleCancelClicked();
    const expectedActions = [{
      type: ADD_FLASH_MESSAGE,
      flashMessage: expect.objectContaining({
        type: 'info',
        flashId: expect.any(Number),
      }),
    }, {
      type: '@@router/CALL_HISTORY_METHOD',
      payload: expect.objectContaining({
        args: [],
        method: 'goBack',
      }),
    }];
    expect(filledStore.getActions()).toEqual(expectedActions);
  });
});
