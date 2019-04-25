import * as actions from './actions';

export const toggleTagCategoryChange = tagCategory => ({
  type: actions.TOGGLE_TAG_CATEGORY_CHANGE,
  tagCategory,
});

export const toggleTagValueChange = (tag, meta) => ({
  type: actions.TOGGLE_TAG_VALUE_CHANGE,
  tag,
  meta,
});

export const deleteAssignedTag = (tag, meta) => ({
  type: actions.DELETE_ASSIGNED_TAG,
  tag,
  meta,
});

export const changeAssignedTag = tag => ({
  type: actions.CHANGE_ASSIGNED_TAG,
  tag,
});

export const addAssignedTag = tag => ({
  type: actions.ADD_ASSIGNED_TAG,
  tag,
});


export const loadState = initialState => ({
  type: actions.LOAD_STATE,
  initialState,
});

export const resetState = () => ({
  type: actions.RESET_STATE,
});
