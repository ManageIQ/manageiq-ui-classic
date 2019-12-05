export const TOGGLE_VERTICAL_MENU_COLLAPSED = 'SET_VERTICAL_MENU_COLLAPSED';

export const toggleVerticalMenuCollapsed = isVerticalMenuCollapsed => ({
  type: TOGGLE_VERTICAL_MENU_COLLAPSED,
  payload: {
    isVerticalMenuCollapsed,
  },
});

export const menuReducer = (state = {
  isVerticalMenuCollapsed: window.localStorage.getItem('patternfly-navigation-primary') === 'collapsed',
}, action) => {
  switch (action.type) {
    case TOGGLE_VERTICAL_MENU_COLLAPSED:
      return { ...state, isVerticalMenuCollapsed: !state.isVerticalMenuCollapsed };
    default:
      return state;
  }
};
