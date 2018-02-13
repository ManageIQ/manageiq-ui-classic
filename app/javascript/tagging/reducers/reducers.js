import * as actionsConstants from '../actions/actions';
// state = state.setTags
export const modifySetTags = (state = [], action) => {
  switch (action.type) {
    case actionsConstants.DELETE_SET_TAG:
      return state.filter(tag => (tag.tagCategory !== action.tag.tagCategory));
    case actionsConstants.ADD_SET_TAG:
      return [...state.filter(tag => (tag.tagCategory !== action.tag.tagCategory)),
        { tagCategory: action.tag.tagCategory, tagValue: action.tag.tagValue }];
    default:
      return state;
  }
};

// state = state.selected
export const toggle = (state = { tagCategory: '', tagValue: '' }, action) => {
  switch (action.type) {
    case actionsConstants.TOGGLE_TAG_CATEGORY_CHANGE:
      return { tagCategory: action.tagCategory, tagValue: '' };
    case actionsConstants.TOGGLE_TAG_VALUE_CHANGE:
      return { tagCategory: state.tagCategory, tagValue: action.tag.tagValue };
    default:
      return state;
  }
};
