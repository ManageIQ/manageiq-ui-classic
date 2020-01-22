import React from 'react';
import { act } from 'react-dom/test-utils';
import fetchMock from 'fetch-mock';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import ToastList from '../../components/toast-list/toast-list';

describe('Toast list tests', () => {
  const initialState = {
    notificationReducer: {
      unreadCount: 1,
      isDrawerVisible: 'false',
      notifications: [
        {
          data: { link: 'http://localhost:3000/api/notifications/10000000003624' },
          href: 'http://localhost:3000/api/notifications/10000000003625',
          id: '10000000003625',
          message: 'Plan has completed with errors',
          notificationType: 'event',
          timeStamp: '2020-01-16T10:15:19Z',
          type: 'error',
          unread: true,
        },
      ],
      totalNotificationsCount: 0,
      toastNotifications: [
        {
          data: { link: 'http://localhost:3000/api/notifications/10000000003624' },
          href: 'http://localhost:3000/api/notifications/10000000003625',
          id: '10000000003625',
          message: 'Plan has completed with errors',
          notificationType: 'event',
          timeStamp: '2020-01-16T10:15:19Z',
          type: 'error',
          unread: true,
        },
      ],
      maxNotifications: 100,
    },
  };
  const mockStore = configureStore();

  beforeEach(() => {

  });

  afterEach(() => {
  });

  it('should render correctly with notifications', () => {
    const store = mockStore({ ...initialState });
    const wrapper = mount(
      <Provider store={store}>
        <ToastList />
      </Provider>,
    );
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should not render without notifications', () => {
    const store = mockStore({
      ...initialState,
      notificationReducer: { ...initialState.notificationReducer, notifications: [], toastNotifications: [] },
    });
    const wrapper = mount(
      <Provider store={store}>
        <ToastList />
      </Provider>,
    );
    expect(wrapper.find('div.toast-notifications-list-pf')).toHaveLength(0);
  });

  it('should dispatch markNotificationRead after click on close button', async(done) => {
    fetchMock.postOnce('/api/notifications/10000000003625', {});
    const store = mockStore(initialState);
    const wrapper = mount(
      <Provider store={store}>
        <ToastList />
      </Provider>,
    );
    await act(async() => {
      wrapper.find('button.close.close-default').simulate('click');
    });
    const expectedPayload = {
      payload: '10000000003625',
      type: '@@notifications/markNotificationRead',
    };
    expect(store.getActions()).toEqual([expectedPayload]);
    done();
  });

  it('should dispatch removeToastNotification after delay', () => {
    jest.useFakeTimers();
    const store = mockStore({
      ...initialState,
      notificationReducer: {
        ...initialState.notificationReducer,
        toastNotifications: [
          {
            id: '10000000003625',
            type: 'success',
          },
        ],
      },
    });
    mount(
      <Provider store={store}>
        <ToastList />
      </Provider>,
    );
    const expectedPayload = {
      payload: '10000000003625',
      type: '@@notifications/removeToastNotification',
    };
    jest.runAllTimers();
    expect(store.getActions()).toEqual([expectedPayload]);
  });
});
