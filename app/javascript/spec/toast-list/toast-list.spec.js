import React from 'react';
import { act } from 'react-dom/test-utils';
import fetchMock from 'fetch-mock';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import ToastList from '../../components/toast-list/toast-list';
import { MARK_NOTIFICATION_READ, REMOVE_TOAST_NOTIFICATION } from '../../miq-redux/actions/notifications-actions';
import notifications from '../fixtures/notifications.json';

describe('Toast list tests', () => {
  const initialState = {
    notificationReducer: {
      unreadCount: 1,
      isDrawerVisible: 'false',
      notifications,
      totalNotificationsCount: 0,
      toastNotifications: notifications,
      maxNotifications: 100,
    },
  };
  const mockStore = configureStore([thunk]);

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
      wrapper.find('button.close.close-default').first().simulate('click');
    });
    const expectedPayload = {
      payload: '10000000003625',
      type: MARK_NOTIFICATION_READ,
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
        toastNotifications: notifications,
      },
    });
    mount(
      <Provider store={store}>
        <ToastList />
      </Provider>,
    );
    const expectedPayload = {
      payload: '10000000003624',
      type: REMOVE_TOAST_NOTIFICATION,
    };
    jest.runAllTimers();
    expect(store.getActions()).toEqual([expectedPayload]);
  });
});
