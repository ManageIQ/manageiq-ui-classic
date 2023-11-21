const miqCustomTabReducer = (clickCount = 0, action) => {
  switch (action.type) {
    case 'INCREMENT_CLICK_COUNT':
      return clickCount + 1;
    default:
      return clickCount;
  }
};

export default miqCustomTabReducer;
