import { combineReducers } from 'redux';
import { modifyassignedTags as assignedTags, toggle as selected, tags, initialize } from './reducers';

const combinedReducers = combineReducers({
  tags,
  assignedTags,
  selected,
});


function taggingApp(state = {}, action) {
  let newState = Object.assign(state.tagging || state);
  newState = initialize(newState, action);
  return { tagging: { appState: combinedReducers(newState.appState, action), initialState: newState.initialState } };
}

export default taggingApp;
