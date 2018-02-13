import { combineReducers } from 'redux';
import { modifySetTags, toggle } from './reducers';

const TAGS = {
  Name: ['Pepa', 'Franta', 'Karel'],
  Number: ['1', '2', '3', '4', '5'],
  Animal: ['Duck', 'Pig', 'Dog', 'Unicorn'],
  Food: ['Steak', 'Duck', 'Knedlik', 'Parek'],
  Something: ['Steak', 'Duck', 'Veeeeery loooong teeeeeext heeeerreeee', 'Blabla'],
};
function tags() { return TAGS; }

const taggingApp = combineReducers({
  tags,
  setTags: modifySetTags,
  selected: toggle,
});

export default taggingApp;
