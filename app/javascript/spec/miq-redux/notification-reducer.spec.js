// import React from 'react';
// import { mount, shallow } from 'enzyme';
// import toJson from 'enzyme-to-json';
import { notificationReducer } from '../../miq-redux/notification-reducer';
import { maxNotifications } from '../../packs/notification-drawer-common';
// import { Provider } from 'react-redux';
// import '../helpers/sprintf';
// import NotificationDrawer from '../../components/notification-drawer/notification-drawer';

describe('Notification reducer tests', () => {
  const initialState = {
    unreadCount: 0,
    isDrawerVisible: 'true',
    notifications: [],
    totalNotificationsCount: 0,
    toastNotifications: [],
    maxNotifications,
  };

  beforeEach(() => {
  });

  afterEach(() => {
  });

  it('should initNotifications correctly', () => {
    const action = {
      type: '@@notifications/initNotifications',
      payload: {
        notifications: [
          {
            id: '10000000003625',
            unread: true,
          }],
        count: 500,
      },
    };
    const newState = notificationReducer(initialState, action);
    expect(newState.notifications.length).toEqual(1);
    expect(newState.totalNotificationsCount).toEqual(500);
    expect(newState.unreadCount).toEqual(1);
  });

  it('should setTotalNotificatonsCount correctly', () => {
    const action = {
      type: '@@notifications/setTotalNotificatonsCount',
      payload: 300,
    };
    const newState = notificationReducer(initialState, action);
    expect(newState.totalNotificationsCount).toEqual(300);
  });

  it('should addNotification correctly', () => {
    const action = {
      type: '@@notifications/addNotification',
      payload: {
        id: '10000000003626',
        unread: true,
      },
    };
    const newState = notificationReducer(initialState, action);
    expect(newState.notifications.length).toEqual(1);
    expect(newState.toastNotifications.length).toEqual(1);
    expect(newState.unreadCount).toEqual(1);
  });

  it('should toggleDrawervisibility correctly', () => {
    const action = {
      type: '@@notifications/toggleDrawerVisibility',
    };
    const newState = notificationReducer(initialState, action);
    expect(newState.isDrawerVisible).toEqual(!initialState.isDrawerVisible);
  });

  it('should markNotificationRead correctly', () => {
    const action = {
      type: '@@notifications/markNotificationRead',
      payload: '10000000003625',
    };
    const newState = notificationReducer({
      ...initialState,
      notifications: [
        {
          id: '10000000003625',
          unread: true,
        },
        {
          id: '10000000003624',
          unread: false,
        },
      ],
      toastNotifications: [
        {
          id: '10000000003625',
          unread: true,
        },
      ],
      unreadCount: 2,
    }, action);
    expect(newState.notifications.find(notification => (notification.id === '10000000003625')).unread).toEqual(false);
    expect(newState.toastNotifications.length).toEqual(0);
    expect(newState.unreadCount).toEqual(1);
  });

  it('should removeToastNotification correctly', () => {
    const action = {
      type: '@@notifications/removeToastNotification',
      payload: '10000000003625',
    };
    const newState = notificationReducer({
      ...initialState,
      toastNotifications: [
        {
          id: '10000000003625',
        },
      ],
    }, action);
    expect(newState.toastNotifications.length).toEqual(0);
  });

  it('should markAllRead correctly', () => {
    const action = {
      type: '@@notifications/markAllRead',
    };
    const newState = notificationReducer({
      ...initialState,
      notifications: [
        {
          id: '10000000003625',
          unread: true,
        },
        {
          id: '10000000003624',
          unread: true,
        },
      ],
      toastNotifications: [
        {
          id: '10000000003625',
          unread: true,
        },
      ],
      unreadCount: 2,
    }, action);
    expect(newState.notifications.find(notification => (notification.unread))).toEqual(undefined);
    expect(newState.toastNotifications.length).toEqual(0);
    expect(newState.unreadCount).toEqual(0);
  });

  it('should clearNotification correctly', () => {
    const action = {
      type: '@@notifications/clearNotification',
      payload: {
        id: '10000000003625',
        unread: true,
      },
    };
    const newState = notificationReducer({
      ...initialState,
      notifications: [
        {
          id: '10000000003625',
          unread: true,
        },
      ],
      toastNotifications: [
        {
          id: '10000000003625',
          unread: true,
        },
      ],
      unreadCount: 1,
    }, action);
    expect(newState.notifications.find(notification => (notification.id === '10000000003625'))).toEqual(undefined);
    expect(newState.toastNotifications.length).toEqual(0);
    expect(newState.unreadCount).toEqual(0);
  });

  it('should clearAll correctly', () => {
    const action = {
      type: '@@notifications/clearAll',
    };
    const newState = notificationReducer({
      ...initialState,
      notifications: [
        {
          id: '10000000003625',
          unread: true,
        },
      ],
      toastNotifications: [
        {
          id: '10000000003625',
          unread: true,
        },
      ],
      unreadCount: 1,
    }, action);
    expect(newState.notifications).toEqual([]);
    expect(newState.toastNotifications).toEqual([]);
    expect(newState.unreadCount).toEqual(0);
  });

  it('should toggleMaxNotifications correctly', () => {
    const action = {
      type: '@@notifications/toggleMaxNotifications',
    };
    let newState = notificationReducer(initialState, action);
    expect(newState.maxNotifications).toEqual(undefined);
    newState = notificationReducer(newState, action);
    expect(newState.maxNotifications).toEqual(maxNotifications);
  });
});
