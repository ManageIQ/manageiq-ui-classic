import React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { ADD_FLASH_MESSAGE } from '../../redux/action-types';
import UserAdd from '../user-add';

describe('User add component', () => {
  const mockStore = configureStore([thunk]);
  let store;
  let filledStore;
  let initialProps;
  beforeEach(() => {
    store = mockStore({
      usersReducer: {},
    });
    initialProps = {
      match: { url: '', params: {} },
    };
    filledStore = mockStore({
      usersReducer: {
        rows: [{ id: '123', name: 'foo', groups: [{ groupId: '1' }] }],
        selectedUsers: [{
          id: '123',
          name: 'foo',
          userid: 'foo',
          groups: [{ groupId: '1' }],
        }],
        groups: [{
          value: '111',
          label: 'Group 111',
        }],
      },
    });
  });

  it('should render spinner', () => {
    const wrapper = shallow(<UserAdd store={store} {...initialProps} />).dive();
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render form for user adding', () => {
    const wrapper = shallow(<UserAdd store={filledStore} {...initialProps} />).dive();
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render form for user editing', () => {
    const wrapper = shallow(<UserAdd store={filledStore} {...initialProps} match={{ url: '/edit/123', params: { userId: '123' } }} />).dive();
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render form form user copying', () => {
    const wrapper = shallow(<UserAdd store={filledStore} {...initialProps} match={{ url: '/add/copy', params: { copy: 'copy' } }} />).dive();
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should dispatch correct actions when edit canceled', () => {
    const wrapper = shallow(<UserAdd store={filledStore} {...initialProps} />).dive();
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
