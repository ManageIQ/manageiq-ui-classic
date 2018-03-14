import React from 'react';
import { Provider } from 'react-redux';
import { createStore, combineReducers } from 'redux';
import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import Tagging from '../components/tagging';
import TagView from '../components/tagView';
import TaggingConnected from '../containers/tagging';
import taggingApp from '../reducers/'

const tags_obj = { animal: ['duck', 'pig'], food: ['steak', 'salad'] };
function tags() { return tags_obj; }
const assignedTags = [{ tagCategory: 'animal', tagValue: 'pig' }, { tagCategory: 'food', tagValue: 'steak' }];
const selectedTagCategory = 'animal';
const selectedTagValue = 'pig';
const taggingApp2 = combineReducers({ taggingApp, tags });
const store = createStore(taggingApp2);

storiesOf('Tagging', module)
  .add('Tagging dummy', () => <Tagging
    tags={tags_obj}
    assignedTags={assignedTags}
    onTagValueChange={action('onTagValueChange')}
    onTagCategoryChange={action('onTagCategoryChange')}
    onTagDeleteClick={action('onTagDeleteClick')}
    selectedTagCategory={selectedTagCategory}
    selectedTagValue={selectedTagValue}
  />);
storiesOf('Tagging', module)
  .add('Tagging with logic', () => <Provider store={store}><TaggingConnected /></Provider>);

storiesOf('Tagging', module)
  .add('TagView', () => <TagView assignedTags={assignedTags} onTagDeleteClick={action('onTagDeleteClick')} />);
