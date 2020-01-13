const notificationInitialState = {
  unreadCount: 0,
  isDrawerVisible: window.localStorage.getItem('miq-notification-drawer-shown') === 'true',
  notifications: [],
};

const nPrefix = '@@notifications/';

export const notificationReducer = (state = notificationInitialState, action) => {
  switch (action.type) {
    case `${nPrefix}init`:
      return {
        ...state,
        notifications: action.payload,
        unreadCount: action.payload.filter(notification => notification.unread).length,
      };
    case `${nPrefix}add`:
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      };
    case `${nPrefix}toggleDrawerVisibility`:
      return { ...state, isDrawerVisible: !action.payload };
    case `${nPrefix}markNotificationRead`:
      return {
        ...state,
        notifications: state.notifications.map(notification => (notification.id === action.payload ? ({
          ...notification,
          unread: false,
        }) : notification)),
        unreadCount: state.unreadCount - 1,
      };
    case `${nPrefix}markAllRead`:
      return {
        ...state,
        notifications: state.notifications.map(notification => ({ ...notification, unread: false })),
        unreadCount: 0,
      };
    case `${nPrefix}clearNotification`:
      return {
        ...state,
        notifications: state.notifications.filter(notification => notification.id !== action.payload.id),
        unreadCount: action.payload.unread ? state.unreadCount - 1 : state.unreadCount,
      };
    case `${nPrefix}clearAll`:
      return { ...state, notifications: [], unreadCount: 0 };
    default:
      return state;
  }
};
