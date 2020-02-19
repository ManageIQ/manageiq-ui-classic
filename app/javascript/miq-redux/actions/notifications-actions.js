import { get } from 'lodash';
import moment from 'moment';
import { notificationsInit, convert } from '../../notifications/backend.js';
import { API } from '../../http_api';

export const NOTIFICATIONS_ACTIONS_PREFIX = '@@notifications';
export const INIT_NOTIFICATIONS = `${NOTIFICATIONS_ACTIONS_PREFIX}/initNotifications`;
export const ADD_NOTIFICATION = `${NOTIFICATIONS_ACTIONS_PREFIX}/addNotification`;
export const TOGGLE_DRAWER_VISIBILITY = `${NOTIFICATIONS_ACTIONS_PREFIX}/toggleDrawerVisibility`;
export const MARK_NOTIFICATION_READ = `${NOTIFICATIONS_ACTIONS_PREFIX}/markNotificationRead`;
export const REMOVE_TOAST_NOTIFICATION = `${NOTIFICATIONS_ACTIONS_PREFIX}/removeToastNotification`;
export const MARK_ALL_READ = `${NOTIFICATIONS_ACTIONS_PREFIX}/markAllRead`;
export const CLEAR_NOTIFICATION = `${NOTIFICATIONS_ACTIONS_PREFIX}/clearNotification`;
export const CLEAR_ALL = `${NOTIFICATIONS_ACTIONS_PREFIX}/clearAll`;
export const TOGGLE_MAX_NOTIFICATIONS = `${NOTIFICATIONS_ACTIONS_PREFIX}/toggleMaxNotifications`;

export const initNotifications = useLimit => dispatch =>
  notificationsInit(useLimit)
    .then(({ notifications, subcount }) =>
      dispatch({ type: INIT_NOTIFICATIONS, payload: { notifications, count: subcount } }));

export const addNotification = data => (dispatch) => {
  const newNotification = convert(data.notification);
  dispatch({ type: ADD_NOTIFICATION, payload: newNotification });
};

export const toggleDrawerVisibility = () => ({ type: TOGGLE_DRAWER_VISIBILITY });

export const markNotificationRead = notificationId => dispatch => API.post(`/api/notifications/${notificationId}`, { action: 'mark_as_seen' })
  .then(() =>
    dispatch({ type: MARK_NOTIFICATION_READ, payload: notificationId }));

export const removeToastNotification = notificationId => ({ type: REMOVE_TOAST_NOTIFICATION, payload: notificationId });

export const markAllRead = notifications => (dispatch) => {
  const resources = notifications.map(notification => ({ id: notification.id }));
  return API.post('/api/notifications/', { action: 'mark_as_seen', resources })
    .then(() =>
      dispatch({ type: MARK_ALL_READ }));
};

export const clearNotification = (notification, useLimit) => (dispatch) => {
  return API.delete(`/api/notifications/${notification.id}`)
    .then(() => {
      dispatch({
        type: CLEAR_NOTIFICATION,
        payload: notification,
      });
      dispatch(initNotifications(useLimit));
    });
};

export const clearAll = (notifications, useLimit) => (dispatch) => {
  const resources = notifications.map(notification => ({ id: notification.id }));
  return API.post('/api/notifications/', { action: 'delete', resources })
    .then(() => {
      dispatch({
        type: CLEAR_ALL,
        payload: resources,
      });
      dispatch(initNotifications(useLimit));
    });
};

export const toggleMaxNotifications = () => (dispatch, getState) => {
  const { maxNotifications } = getState().notificationReducer;
  return dispatch(initNotifications(!maxNotifications)).then(() =>
    dispatch({ type: TOGGLE_MAX_NOTIFICATIONS }));
};
