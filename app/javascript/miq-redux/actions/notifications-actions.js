import * as backend from '../../notifications/backend.js';

export const INIT_NOTIFICATIONS = '@@notifications/initNotifications';
export const ADD_NOTIFICATION = '@@notifications/addNotification';
export const TOGGLE_DRAWER_VISIBILITY = '@@notifications/toggleDrawerVisibility';
export const MARK_NOTIFICATION_READ = '@@notifications/markNotificationRead';
export const REMOVE_TOAST_NOTIFICATION = '@@notifications/removeToastNotification';
export const MARK_ALL_READ = '@@notifications/markAllRead';
export const CLEAR_NOTIFICATION = '@@notifications/clearNotification';
export const CLEAR_ALL = '@@notifications/clearAll';
export const TOGGLE_MAX_NOTIFICATIONS = '@@notifications/toggleMaxNotifications';

export const initNotifications = (useLimit) => (dispatch) => {
  return backend.load(useLimit)
    .then(({ notifications, subcount }) => dispatch({
      type: INIT_NOTIFICATIONS,
      payload: {
        notifications,
        count: subcount,
      },
    }));
};

export const addNotification = (notification) => (dispatch) => {
  dispatch({
    type: ADD_NOTIFICATION,
    payload: backend.convert(notification),
  });
};

export const toggleDrawerVisibility = () => ({
  type: TOGGLE_DRAWER_VISIBILITY,
});

export const markNotificationRead = (notification) => (dispatch) => {
  return backend.markRead([notification])
    .then(() => dispatch({
      type: MARK_NOTIFICATION_READ,
      payload: notification.id,
    }));
};

export const removeToastNotification = (notification) => ({
  type: REMOVE_TOAST_NOTIFICATION,
  payload: notification.id,
});

export const markAllRead = (notifications) => (dispatch) => {
  return backend.markRead(notifications)
    .then(() => dispatch({
      type: MARK_ALL_READ,
    }));
};

export const clearNotification = (notification, useLimit) => (dispatch) => {
  return backend.clear([notification])
    .then(() => {
      dispatch({
        type: CLEAR_NOTIFICATION,
        payload: notification,
      });
      dispatch(initNotifications(useLimit));
    });
};

export const clearAll = (notifications, useLimit) => (dispatch) => {
  return backend.clear(notifications)
    .then(() => {
      dispatch({
        type: CLEAR_ALL,
        payload: notifications.map((notification) => ({id: notification.id})),
      });
      dispatch(initNotifications(useLimit));
    });
};

export const toggleMaxNotifications = () => (dispatch, getState) => {
  const { maxNotifications } = getState().notificationReducer;

  return dispatch(initNotifications(!maxNotifications))
    .then(() => dispatch({ type: TOGGLE_MAX_NOTIFICATIONS }));
};
