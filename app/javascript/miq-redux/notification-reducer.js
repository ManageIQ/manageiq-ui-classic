import { maxNotifications } from '../packs/notification-drawer-common';

const notificationInitialState = {
  unreadCount: 0,
  isDrawerVisible: window.localStorage.getItem('miq-notification-drawer-shown') === 'true',
  notifications: [],
  totalNotificationsCount: 0,
  toastNotifications: [],
  maxNotifications,
};

const nPrefix = '@@notifications/';

export const notificationReducer = (state = notificationInitialState, action) => {
  switch (action.type) {
    case `${nPrefix}initNotifications`:
      return {
        ...state,
        notifications: action.payload.notifications,
        unreadCount: action.payload.notifications.filter(notification => notification.unread).length,
        totalNotificationsCount: action.payload.count,
      };
    case `${nPrefix}setTotalNotificatonsCount`:
      return { ...state, totalNotificationsCount: action.payload };
    case `${nPrefix}addNotification`:
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadCount: state.unreadCount + 1,
        toastNotifications: [action.payload, ...state.toastNotifications].slice(0, 3),
      };
    case `${nPrefix}toggleDrawerVisibility`:
      return { ...state, isDrawerVisible: !state.isDrawerVisible };
    case `${nPrefix}markNotificationRead`:
      return {
        ...state,
        notifications: state.notifications.map(notification => (notification.id === action.payload ? ({
          ...notification,
          unread: false,
        }) : notification)),
        unreadCount: state.unreadCount - 1,
        toastNotifications: state.toastNotifications.filter(item => (item.id !== action.payload)),
      };
    case `${nPrefix}removeToastNotification`:
      return {
        ...state,
        toastNotifications: state.toastNotifications.filter(item => (item.id !== action.payload)),
      };
    case `${nPrefix}markAllRead`:
      return {
        ...state,
        notifications: state.notifications.map(notification => ({ ...notification, unread: false })),
        unreadCount: 0,
        toastNotifications: [],
      };
    case `${nPrefix}clearNotification`:
      return {
        ...state,
        notifications: state.notifications.filter(notification => notification.id !== action.payload.id),
        unreadCount: action.payload.unread ? state.unreadCount - 1 : state.unreadCount,
        toastNotifications: state.toastNotifications.filter(item => (item.id !== action.payload.id)),
      };
    case `${nPrefix}clearAll`:
      return {
        ...state,
        notifications: [],
        unreadCount: 0,
        toastNotifications: [],
      };
    case `${nPrefix}toggleMaxNotifications`:
      return { ...state, maxNotifications: state.maxNotifications ? undefined : 100 };
    default:
      return state;
  }
};
