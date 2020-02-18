import { maxNotifications } from '../notifications/backend.js';
import {
  INIT_NOTIFICATIONS,
  TOGGLE_DRAWER_VISIBILITY,
  ADD_NOTIFICATION,
  MARK_NOTIFICATION_READ,
  REMOVE_TOAST_NOTIFICATION,
  MARK_ALL_READ,
  CLEAR_NOTIFICATION,
  CLEAR_ALL,
  TOGGLE_MAX_NOTIFICATIONS,
} from './actions/notifications-actions';

const notificationInitialState = {
  unreadCount: 0,
  isDrawerVisible: window.localStorage.getItem('miq-notification-drawer-shown') === 'true',
  notifications: [],
  totalNotificationsCount: 0,
  toastNotifications: [],
  maxNotifications,
};

export const notificationReducer = (state = notificationInitialState, action) => {
  switch (action.type) {
    case INIT_NOTIFICATIONS:
      return {
        ...state,
        notifications: action.payload.notifications,
        unreadCount: action.payload.notifications.filter(notification => notification.unread).length,
        totalNotificationsCount: action.payload.count,
      };

    case ADD_NOTIFICATION:
      const notifications = [action.payload, ...state.notifications].slice(0, 100);
      return {
        ...state,
        notifications,
        unreadCount: notifications.filter(notification => notification.unread).length,
        totalNotificationsCount: state.totalNotificationsCount + 1,
        toastNotifications: [action.payload, ...state.toastNotifications].slice(0, 3),
      };

    case TOGGLE_DRAWER_VISIBILITY:
      return { ...state, isDrawerVisible: !state.isDrawerVisible };

    case MARK_NOTIFICATION_READ:
      return {
        ...state,
        notifications: state.notifications.map(notification => (notification.id === action.payload ? ({
          ...notification,
          unread: false,
        }) : notification)),
        unreadCount: state.unreadCount - 1,
        toastNotifications: state.toastNotifications.filter(item => (item.id !== action.payload)),
      };

    case REMOVE_TOAST_NOTIFICATION:
      return {
        ...state,
        toastNotifications: state.toastNotifications.filter(item => (item.id !== action.payload)),
      };

    case MARK_ALL_READ:
      return {
        ...state,
        notifications: state.notifications.map(notification => ({ ...notification, unread: false })),
        unreadCount: 0,
        toastNotifications: [],
      };

    case CLEAR_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(notification => notification.id !== action.payload.id),
        unreadCount: action.payload.unread ? state.unreadCount - 1 : state.unreadCount,
        toastNotifications: state.toastNotifications.filter(item => (item.id !== action.payload.id)),
      };

    case CLEAR_ALL:
      return {
        ...state,
        notifications: [],
        unreadCount: 0,
        toastNotifications: [],
      };

    case TOGGLE_MAX_NOTIFICATIONS:
      return { ...state, maxNotifications: state.maxNotifications ? undefined : maxNotifications };

    default:
      return state;
  }
};
