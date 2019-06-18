import React from 'react';
import { Provider } from 'react-redux';
import { createStore, combineReducers } from 'redux';
import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import Tagging from '../components/Tagging/Tagging';
import TagView from '../components/InnerComponents/TagView';
import { TaggingConnected, TaggingWithButtonsConnected } from '../containers/tagging';
import taggingApp from '../reducers/';
import { loadState } from '../actions';

const tags = [
  { description: 'Name veryyyyyveryyyy loooong namee', id: 1, singleValue: true, values: [{ description: 'Pepa', id: 11 }, { description: 'Franta', id: 12 }] },
  { description: 'Number xxx xxxxxxxxxxxx xxx xxxxxxxxx xxx', id: 2, singleValue: true, values: [{ description: '1', id: 21 }, { description: '2', id: 22 }] },
  { description: 'Animal', id: 3, singleValue: true, values: [{ description: 'Duck', id: 31 }, { description: 'Cat', id: 32 }, { description: 'Dog', id: 33 }] },
  { description: 'Food xxx xxxxxxxxxxxx xxx xxxxxxxxx xxx', id: 4,singleValue: true,  values: [{ description: 'Steak', id: 41 }, { description: 'Duck', id: 42 }, { description: 'Salad', id: 43 }] },
  {
    description: 'Something',
    id: 5,
    values: [{ description: 'Knedlik', id: 51 },
      { description: 'Daenerys Stormborn of the House Targaryen, First of Her Name,...and Mother of Dragons', id: 52 }],
  },
];
const singleTags = [
  { description: 'Name veryyyyyveryyyy loooong nameeeeeeee', id: 1, singleValue: true, values: [{ description: 'Pepa', id: 11 }, { description: 'Franta', id: 12 }] },
  { description: 'Number', id: 2, singleValue: true, values: [{ description: '1', id: 21 }, { description: '2', id: 22 }] },
  { description: 'Animal', id: 3,singleValue: true, values: [{ description: 'Duck', id: 31 }, { description: 'Cat', id: 32 }, { description: 'Dog', id: 33 }] },
  { description: 'Food', id: 4, singleValue: true, values: [{ description: 'Steak', id: 41 }, { description: 'Duck', id: 42 }, { description: 'Salad', id: 43 }] },
  {
    description: 'Something',
    id: 5,
    values: [{ description: 'Knedlik', id: 51 },
      { description: 'Daenerys Stormborn of the House Targaryen, First of Her Name,...and Mother of Dragons', id: 52 }],
  },
];

const cancelButton = {
  onClick: () => {}, href: '', type: 'button', disabled: false, description: 'Cancel',
};

const resetButton = {
  onClick: () => {}, href: '', type: 'reset', disabled: false, description: 'Reset',
};
const saveButton = {
  onClick: () => {}, href: '', type: 'submit', disabled: false, description: 'Save',
};
const assignedTags = [{ description: 'Name', id: 1, values: [{ description: 'Pepa', id: 11 }] }];
const selectedTagCategory = {};
const selectedTagValue = {};
const defaultState = { tags, assignedTags };
const defaultStateSingle = { singleTags, assignedTags };
const store = createStore((state = {}, action) => ({tagging: taggingApp(state, action)}));
store.dispatch(loadState(defaultState));
const storeSingle = createStore(taggingApp);
storeSingle.dispatch(loadState(defaultStateSingle));

storiesOf('Tagging', module)
  .add('Tagging dummy', () => (<Tagging
    tags={tags}
    assignedTags={assignedTags}
    onTagValueChange={action('onTagValueChange')}
    onTagMultiValueChange={action('onTagMultiValueChange')}
    onTagCategoryChange={action('onTagCategoryChange')}
    onTagDeleteClick={action('onTagDeleteClick')}
    selectedTagCategory={selectedTagCategory}
    selectedTagValue={selectedTagValue}
  />));


storiesOf('Tagging', module)
  .add('Simple Tagging', () => <Provider store={store}><TaggingConnected /></Provider>);
storiesOf('Tagging', module)
  .add('Tagging with buttons', () => <Provider store={store}><TaggingWithButtonsConnected saveButton={saveButton} cancelButton={cancelButton} resetButton={resetButton}/></Provider>);
storiesOf('Tagging', module)
  .add('Tagging with hidden reset button', () => <Provider store={store}><TaggingWithButtonsConnected showReset={false} saveButton={saveButton} cancelButton={cancelButton} resetButton={resetButton}/></Provider>);
storiesOf('Tagging', module)
  .add('TagView', () => <TagView assignedTags={assignedTags} onTagDeleteClick={action('onTagDeleteClick')} />);
