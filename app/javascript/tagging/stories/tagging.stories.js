import React from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import Tagging from '../components/tagging';
import TagView from '../components/tagView';
import TaggingConnected from '../containers/tagging';
import taggingApp from '../reducers/'

const store = createStore(taggingApp);
const tags = { animal: ['duck', 'pig'], food: ['steak', 'salad'] };
const setTags = [{ tagCategory: 'animal', tagValue: 'pig' }, { tagCategory: 'food', tagValue: 'steak' }];
const selectedTagCategory = 'animal';
const selectedTagValue = 'pig';

storiesOf('Tagging', module)
  .add('Tagging dummy', () => <Tagging
    tags={tags}
    setTags={setTags}
    onTagValueChange={action('onTagValueChange')}
    onTagCategoryChange={action('onTagCategoryChange')}
    onTagDeleteClick={action('onTagDeleteClick')}
    selectedTagCategory={selectedTagCategory}
    selectedTagValue={selectedTagValue}
  />);
storiesOf('Tagging', module)
  .add('Tagging with logic', () => <Provider store={store}><TaggingConnected /></Provider>);

storiesOf('Tagging', module)
  .add('TagView', () => <TagView setTags={setTags} onTagDeleteClick={action('onTagDeleteClick')} />);
