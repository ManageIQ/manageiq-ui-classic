const notificationInitialState = {
  unreadCount: 0,
};

const nPrefix = '@@notifications/';

export const notificationReducer = (state = notificationInitialState, action) => {
  switch (action.type) {
    case `${nPrefix}setUnreadCount`:
      return { ...state, unreadCount: action.payload };
    default:
      return state;
  }
};
