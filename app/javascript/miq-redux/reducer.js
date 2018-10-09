import { combineReducers } from 'redux';
/**
 * Root reducer, used when creating the Redux store.
 *
 * Now its is only a dymmy reducer, since Redux needs some initial reducer co configure store
 * Should replaced by global initial reducer, once it is required
 *
 * @returns New application state.
 */
function rootReducer(state) {
  const newState = state || {};
  return newState;
}

/**
 * Initial reducer
 * @param {Object} asyncReducers - object of reducers
 */
export default (asyncReducers = {}) => combineReducers({
  rootReducer,
  ...asyncReducers,
});
