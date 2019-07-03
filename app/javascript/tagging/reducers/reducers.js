import * as actionsConstants from '../actions/actions';

/* ================== SECTION: state = state.assignedTags ================== */
function deleteAssignedTag(state, actionTag) {
  const filteredState = state.filter(tag => (tag.id !== actionTag.tagCategory.id));
  const selectedItem = state.find(tag => (tag.id === actionTag.tagCategory.id));
  const filteredTagValues = selectedItem.values.filter(value => (value.id !== actionTag.tagValue.id));
  return [...filteredState,
    {
      description: actionTag.tagCategory.description,
      id: actionTag.tagCategory.id,
      values: [...filteredTagValues],
    },
  ].filter(tag => (tag.values.length !== 0));
}

/**
 * Replaces all assigned tags with the received ones.
 *
 * If single value tags are used it will receive array with length 1.
 * With multi select enabled it can receive arrays with variable sizes.
 * When receiving an empty array it removes also the category from the
 * assigned arrays.
 */
function changeAssignedTags(state, actionTag) {
  const filteredState = state.filter(tag => (tag.id !== actionTag.tagCategory.id));

  if (actionTag.tagValue !== null && actionTag.tagValue.length > 0) {
    return [...filteredState,
      {
        description: actionTag.tagCategory.description,
        id: actionTag.tagCategory.id,
        values: actionTag.tagValue,
      }];
  }

  return [...filteredState];
}

export const modifyAssignedTags = (state = [], action) => {
  switch (action.type) {
    case actionsConstants.DELETE_ASSIGNED_TAG:
      return deleteAssignedTag(state, action.tag);
    case actionsConstants.DELETE_ALL_ASSIGNED_TAGS:
      return [];
    case actionsConstants.CHANGE_ASSIGNED_TAGS:
    case actionsConstants.ADD_ASSIGNED_TAG:
      return changeAssignedTags(state, action.tag);
    default:
      return state;
  }
};

/* ================ SECTION: state = state = state.selected ================ */
export const toggle = (state = { tagCategory: {}, tagValue: {} }, action) => {
  switch (action.type) {
    case actionsConstants.TOGGLE_TAG_CATEGORY_CHANGE:
      return { tagCategory: action.tagCategory, tagValue: {} };
    case actionsConstants.TOGGLE_TAG_VALUE_CHANGE:
      return { tagCategory: state.tagCategory, tagValue: action.tag.tagValue[action.tag.tagValue.length - 1] };
    default:
      return state;
  }
};

export const tags = (state = []) => state;
export const affectedItems = (state = []) => state;

export const initialize = (state = {}, action) => {
  switch (action.type) {
    case actionsConstants.LOAD_STATE:
      return {
        ...state,
        initialState: action.initialState,
        appState: {
          tags: action.initialState.tags,
          assignedTags: action.initialState.assignedTags,
          affectedItems: action.initialState.affectedItems,
        },
      };
    case actionsConstants.RESET_STATE:
      return { ...state, appState: { ...state.initialState } };
    default:
      return { ...state };
  }
};
