import fetchMock from 'fetch-mock';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import '../../helpers/miqFormatNotification';
import {
  initNotifications,
  INIT_NOTIFICATIONS,
  addNotification,
  ADD_NOTIFICATION,
  TOGGLE_DRAWER_VISIBILITY,
  toggleDrawerVisibility,
  markNotificationRead,
  MARK_NOTIFICATION_READ,
  removeToastNotification,
  REMOVE_TOAST_NOTIFICATION,
  MARK_ALL_READ,
  markAllRead,
  CLEAR_NOTIFICATION,
  clearNotification,
  CLEAR_ALL,
  clearAll,
  TOGGLE_MAX_NOTIFICATIONS,
  toggleMaxNotifications,
} from '../../../miq-redux/actions/notifications-actions';
import notifications from '../../fixtures/notifications.json';
import initResources from '../../fixtures/resources.json';
import { maxNotifications } from '../../../notifications/backend.js';

describe('Notifications actions tests', () => {
  const initialState = {
    notificationReducer: {
      unreadCount: 0,
      isDrawerVisible: true,
      notifications,
      totalNotificationsCount: 0,
      toastNotifications: [],
      maxNotifications,
    },
  };
  const mockStore = configureStore([thunk]);
  const miqFormatNotificationSpy = jest.spyOn(window, 'miqFormatNotification');

  afterEach(() => {
    fetchMock.reset();
    miqFormatNotificationSpy.mockReset();
  });

  it('should dispatch initNotifications correctly', () => {
    const store = mockStore(initialState);
    fetchMock.getOnce('/api/notifications?expand=resources&attributes=details&sort_by=id&sort_order=desc', initResources);
    const expectedPayload = expect.objectContaining({
      type: INIT_NOTIFICATIONS,
    });
    return store.dispatch(initNotifications(false)).then(() => {
      expect(store.getActions()).toEqual([expectedPayload]);
    });
  });

  it('should dispatch addNotification correctly', () => {
    const store = mockStore(initialState);
    const expectedPayload = expect.objectContaining({
      type: ADD_NOTIFICATION,
    });
    store.dispatch(addNotification({
      notification: initResources,
    }));
    return expect(store.getActions()).toEqual([expectedPayload]);
  });

  it('should dispatch toggleDrawerVisibility correctly', () => {
    const store = mockStore(initialState);
    const expectedPayload = {
      type: TOGGLE_DRAWER_VISIBILITY,
    };
    store.dispatch(toggleDrawerVisibility());
    return expect(store.getActions()).toEqual([expectedPayload]);
  });

  it('should dispatch markNotificationRead correctly', (done) => {
    const store = mockStore(initialState);
    const notification = store.getState().notificationReducer.notifications[0];
    fetchMock.postOnce('/api/notifications/', {
      action: 'mark_as_seen',
      resources: [{ id: notification.id }],
    });
    const expectedPayload = {
      payload: '10000000003625',
      type: MARK_NOTIFICATION_READ,
    };
    return store.dispatch(markNotificationRead(notification)).then(() => {
      expect(store.getActions()).toEqual([expectedPayload]);
      done();
    });
  });

  it('should dispatch removeToastNotification correctly', () => {
    const store = mockStore(initialState);
    const expectedPayload = {
      type: REMOVE_TOAST_NOTIFICATION,
      payload: '123',
    };
    store.dispatch(removeToastNotification({ id: '123' }));
    return expect(store.getActions()).toEqual([expectedPayload]);
  });

  it('should dispatch markAllRead correctly', (done) => {
    const store = mockStore(initialState);
    const resources = [{ id: '10000000003625' }, { id: '10000000003624' }];
    fetchMock.postOnce('/api/notifications/', { action: 'mark_as_seen', resources });
    const expectedPayload = {
      type: MARK_ALL_READ,
    };
    return store.dispatch(markAllRead(store.getState().notificationReducer.notifications))
      .then(() => {
        expect(store.getActions()).toEqual([expectedPayload]);
        done();
      });
  });

  it('should dispatch clearNotification correctly', (done) => {
    const store = mockStore(initialState);
    const notification = store.getState().notificationReducer.notifications[0];
    fetchMock.postOnce('/api/notifications/', {
      action: 'delete',
      resources: [{ id: notification.id }],
    });
    fetchMock.getOnce('/api/notifications?expand=resources&attributes=details&sort_by=id&sort_order=desc&limit=100', initResources);
    fetchMock.getOnce('/api/notifications', {});
    const expectedPayload = expect.objectContaining({
      type: CLEAR_NOTIFICATION,
    });
    return store.dispatch(clearNotification(notification, true))
      .then(() => {
        expect(store.getActions()).toEqual([expectedPayload]);
        done();
      });
  });

  it('should dispatch clearAll correctly', (done) => {
    const store = mockStore(initialState);
    const resources = [{ id: '10000000003625' }, { id: '10000000003624' }];
    fetchMock.getOnce('/api/notifications?expand=resources&attributes=details&sort_by=id&sort_order=desc', initResources);
    fetchMock.postOnce('/api/notifications/', { action: 'delete', resources });
    const expectedPayload = expect.objectContaining({
      type: CLEAR_ALL,
    });
    return store.dispatch(clearAll(store.getState().notificationReducer.notifications))
      .then(() => {
        expect(store.getActions()).toEqual([expectedPayload]);
        done();
      });
  });

  it('should dispatch toggleMaxNotifications correctly', (done) => {
    const store = mockStore(initialState);
    fetchMock.getOnce('/api/notifications?expand=resources&attributes=details&sort_by=id&sort_order=desc', initResources);
    const expectedPayload = [
      expect.objectContaining({
        type: INIT_NOTIFICATIONS,
      }),
      expect.objectContaining({
        type: TOGGLE_MAX_NOTIFICATIONS,
      }),
    ];
    return store.dispatch(toggleMaxNotifications())
      .then(() => {
        expect(store.getActions()).toEqual(expectedPayload);
        done();
      });
  });
});
