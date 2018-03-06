import { combineReducers } from 'redux';
import { modifySetTags as setTags, toggle as selected, tags } from './reducers';


const taggingApp = combineReducers({
  tags,
  setTags,
  selected,
});

export default taggingApp;
