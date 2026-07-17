import { combineReducers } from 'redux';

function rootReducer(state) {
  const newState = state || {};
  return newState;
}

export default ({ asyncReducers = {} } = {}) => (combineReducers({
  rootReducer,
  ...asyncReducers,
}));
