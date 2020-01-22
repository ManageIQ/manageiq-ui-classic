import React from 'react';
import { act } from 'react-dom/test-utils';
import fetchMock from 'fetch-mock';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import '../helpers/sprintf';
import NotificationDrawer from '../../components/notification-drawer/notification-drawer';

const lowerMaxNotifications = 1;

jest.mock('../../packs/notification-drawer-common', () => ({
  notificationsInit: () => {},
  maxNotifications: 1,
}));

describe('Notification drawer tests', () => {
  const initialState = {
    notificationReducer: {
      unreadCount: 2,
      isDrawerVisible: 'true',
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
        {
          data: { link: undefined },
          href: 'http://localhost:3000/api/notifications/10000000003624',
          id: '10000000003624',
          message: 'Plan has completed successfully',
          notificationType: 'event',
          timeStamp: '2020-01-16T10:15:19Z',
          type: 'success',
          unread: true,
        },
      ],
      totalNotificationsCount: 2,
      toastNotifications: [],
      maxNotifications: 100,
    },
  };
  const mockStore = configureStore();

  beforeEach(() => {
  });

  afterEach(() => {
    fetchMock.reset();
  });

  it('should render correctly', () => {
    const store = mockStore({ ...initialState });
    const wrapper = mount(
      <Provider store={store}>
        <NotificationDrawer />
      </Provider>,
    );
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should dispatch toggleDrawerVisibility after click on Close button', () => {
    const store = mockStore({ ...initialState });
    const wrapper = mount(
      <Provider store={store}>
        <NotificationDrawer />
      </Provider>,
    );
    wrapper.find('.drawer-pf-close').simulate('click');
    const expectedPayload = { type: '@@notifications/toggleDrawerVisibility' };
    expect(store.getActions()).toEqual([expectedPayload]);
  });

  it('should expand drawer after click on expand button', () => {
    const store = mockStore({ ...initialState });
    const wrapper = mount(
      <Provider store={store}>
        <NotificationDrawer />
      </Provider>,
    );
    expect(wrapper.find('.drawer-pf-notifications.drawer-pf-expanded')).toHaveLength(0);
    wrapper.find('.drawer-pf-toggle-expand').simulate('click');
    expect(wrapper.find('.drawer-pf-notifications.drawer-pf-expanded')).toHaveLength(1);
  });

  it('should collapse events group after click on expand button', () => {
    const store = mockStore({ ...initialState });
    const wrapper = mount(
      <Provider store={store}>
        <NotificationDrawer />
      </Provider>,
    );
    expect(wrapper.find('.panel-collapse')).toHaveLength(1);
    wrapper.find('#eventsExpander').simulate('click');
    expect(wrapper.find('.panel-collapse')).toHaveLength(0);
  });

  it('should dispatch markNotificationRead after click on Mark read dropdown item', async(done) => {
    fetchMock.postOnce('/api/notifications/10000000003624', {});
    const store = mockStore({ ...initialState });
    const wrapper = mount(
      <Provider store={store}>
        <NotificationDrawer />
      </Provider>,
    );
    await act(async() => {
      wrapper.find('a#dropdownMarkRead-10000000003624').simulate('click');
    });
    const expectedPayload = {
      payload: '10000000003624',
      type: '@@notifications/markNotificationRead',
    };
    expect(store.getActions()).toEqual([expectedPayload]);
    done();
  });

  it('should dispatch clearNotification after click on Remove dropdown item', async(done) => {
    fetchMock.deleteOnce('/api/notifications/10000000003624', {});
    const store = mockStore({ ...initialState });
    const wrapper = mount(
      <Provider store={store}>
        <NotificationDrawer />
      </Provider>,
    );
    await act(async() => {
      wrapper.find('a#dropdownRemove-10000000003624').simulate('click');
    });
    const expectedPayload = {
      payload: {
        data: {
          link: undefined,
        },
        href: 'http://localhost:3000/api/notifications/10000000003624',
        id: '10000000003624',
        message: 'Plan has completed successfully',
        notificationType: 'event',
        timeStamp: '2020-01-16T10:15:19Z',
        type: 'success',
        unread: true,
      },
      type: '@@notifications/clearNotification',
    };
    expect(store.getActions()).toEqual([expectedPayload]);
    done();
  });

  it('should dispatch markNotificationRead after click on notification content', async(done) => {
    fetchMock.post('/api/notifications/10000000003625', {});
    const store = mockStore({ ...initialState });
    const wrapper = mount(
      <Provider store={store}>
        <NotificationDrawer />
      </Provider>,
    );
    await act(async() => {
      wrapper.find('span.pull-left').first().simulate('click');
      wrapper.find('span.drawer-pf-notification-message').first().simulate('click');
    });
    const expectedPayload = [
      {
        payload: '10000000003625',
        type: '@@notifications/markNotificationRead',
      },
      {
        payload: '10000000003625',
        type: '@@notifications/markNotificationRead',
      }];
    expect(store.getActions()).toEqual(expectedPayload);
    done();
  });

  it('should show notification limit bar', () => {
    const store = mockStore({
      ...initialState,
      notificationReducer: {
        ...initialState.notificationReducer,
        maxNotifications: lowerMaxNotifications,
      },
    });
    const wrapper = mount(
      <Provider store={store}>
        <NotificationDrawer />
      </Provider>,
    );
    expect(wrapper.find('div#notificationLimitBar')).toHaveLength(1);
  });

  it('should dispatch toogleMaxNotifications after click on Show all', () => {
    const store = mockStore({ ...initialState, maxNotifications: lowerMaxNotifications });
    const wrapper = mount(
      <Provider store={store}>
        <NotificationDrawer />
      </Provider>,
    );
    wrapper.find('#toggleMaxNotifications').simulate('click');
    const expectedPayload = {
      type: '@@notifications/toggleMaxNotifications',
    };
    expect(store.getActions()).toEqual([expectedPayload]);
  });

  it('should dispatch markAllRead after click on Mark all read', async(done) => {
    fetchMock.postOnce('/api/notifications/', {});
    const store = mockStore({ ...initialState });
    const wrapper = mount(
      <Provider store={store}>
        <NotificationDrawer />
      </Provider>,
    );
    await act(async() => {
      wrapper.find('button#markAllReadBtn').simulate('click');
    });
    const expectedPayload = {
      type: '@@notifications/markAllRead',
    };
    expect(store.getActions()).toEqual([expectedPayload]);
    done();
  });

  it('should clear all and init after click on Clear all', async(done) => {
    fetchMock.postOnce('/api/notifications/', {});
    const store = mockStore({ ...initialState });
    const wrapper = mount(
      <Provider store={store}>
        <NotificationDrawer />
      </Provider>,
    );
    await act(async() => {
      wrapper.find('button#clearAllBtn').simulate('click');
    });
    expect(store.getActions()).toEqual([]);
    done();
  });

  it('should not render notification drawer when hidden', () => {
    const store = mockStore({
      ...initialState,
      notificationReducer: {
        ...initialState.notificationReducer,
        isDrawerVisible: false,
      },
    });
    const wrapper = mount(
      <Provider store={store}>
        <NotificationDrawer />
      </Provider>,
    );
    expect(wrapper.find('#miq-notifications-drawer-container')).toHaveLength(0);
  });
});
