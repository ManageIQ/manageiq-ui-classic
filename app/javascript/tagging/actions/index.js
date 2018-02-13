import * as actions from './actions';

export const toggleTagCategoryChange = tagCategory => ({
  type: actions.TOGGLE_TAG_CATEGORY_CHANGE,
  tagCategory,
});

export const toggleTagValueChange = tag => ({
  type: actions.TOGGLE_TAG_VALUE_CHANGE,
  tag,
});

export const deleteSetTag = tag => ({
  type: actions.DELETE_SET_TAG,
  tag,
});

export const addSetTag = tag => ({
  type: actions.ADD_SET_TAG,
  tag,
});
