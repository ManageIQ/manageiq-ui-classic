import * as actionsConstants from '../actions/actions';
// state = state.assignedTags
export const modifyassignedTags = (state = [], action) => {
  switch (action.type) {
    case actionsConstants.DELETE_ASSIGNED_TAG:
      return [...state.filter(tag => (tag.tagCategory.id !== action.tag.tagCategory.id)),
        {
          tagCategory: action.tag.tagCategory,
          tagValues: ([...state].find(tag => (tag.tagCategory.id === action.tag.tagCategory.id))
            .tagValues.filter(value => (value.id !== action.tag.tagValue.id))),
        }].filter(tag => (tag.tagValues.length !== 0));
    case actionsConstants.CHANGE_ASSIGNED_TAG:
      return [...state.filter(tag => (tag.tagCategory.id !== action.tag.tagCategory.id)),
        { tagCategory: action.tag.tagCategory, tagValues: [action.tag.tagValue] }];
    case actionsConstants.ADD_ASSIGNED_TAG:
      return [...state.filter(tag => (tag.tagCategory.id !== action.tag.tagCategory.id)),
        {
          tagCategory: { description: action.tag.tagCategory.description, id: action.tag.tagCategory.id },
          tagValues: ([...state].find(tag => (tag.tagCategory.id === action.tag.tagCategory.id)) || { tagValues: [] })
            .tagValues.filter(tagValue => (tagValue.id !== action.tag.tagValue.id)).concat([action.tag.tagValue]),
        }];
      // sort((a, b) => (a.description > b.description))
    default:
      return state;
  }
};

// state = state.selected
export const toggle = (state = { tagCategory: {}, tagValue: {} }, action) => {
  switch (action.type) {
    case actionsConstants.TOGGLE_TAG_CATEGORY_CHANGE:
      return { tagCategory: action.tagCategory, tagValue: {} };
    case actionsConstants.TOGGLE_TAG_VALUE_CHANGE:
      return { tagCategory: state.tagCategory, tagValue: action.tag.tagValue };
    default:
      return state;
  }
};

export const tags = (state = []) => state;

export const initialize = (state = {}, action) => {
  switch (action.type) {
    case actionsConstants.LOAD_STATE:
      return Object.assign(
        { initialState: action.initialState },
        { appState: { tags: action.initialState.tags, assignedTags: action.initialState.assignedTags } },
      );
    case actionsConstants.RESET_STATE:
      return { ...state, appState: state.initialState };
    default:
      return { ...state };
  }
};
