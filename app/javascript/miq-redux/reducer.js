import { combineReducers } from 'redux';
/**
 * Root reducer, used when creating the Redux store.
 *
 * Now its is only a dummy reducer, since Redux needs some initial reducer co configure store
 * Should be replaced by global initial reducers, once it is required
 *
 * @returns New application state.
 */
function rootReducer(state) {
  const newState = state || {};
  return newState;
}

/**
 * Reducer that tracks the current router location in Redux state.
 * Listens for ROUTER_LOCATION_CHANGE actions dispatched by the router middleware.
 */
function routerReducer(state = { action: null, location: null }, action) {
  if (action.type === '@@router/LOCATION_CHANGE') {
    return { ...state, action: action.payload.action, location: action.payload.location };
  }
  return state;
}

/**
 * Initial reducer
 * @param {Object} asyncReducers - object of reducers
 */
export default ({ asyncReducers = {} }) => (combineReducers({
  rootReducer,
  router: routerReducer,
  ...asyncReducers,
}));
