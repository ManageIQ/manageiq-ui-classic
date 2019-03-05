import { combineReducers } from 'redux';
import { modifyassignedTags as assignedTags, toggle as selected, tags, initialize, affectedItems } from './reducers';

const combinedReducers = combineReducers({
  tags,
  assignedTags,
  selected,
  affectedItems,
});


function taggingApp(state = {}, action) {
  let newState = Object.assign(state.tagging || state);
  newState = initialize(newState, action);
  return { appState: combinedReducers(newState.appState, action), initialState: newState.initialState };
}

export default taggingApp;
