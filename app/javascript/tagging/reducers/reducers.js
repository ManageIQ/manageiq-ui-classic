import * as actionsConstants from '../actions/actions';
// state = state.assignedTags
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

function changeAssignedTag(state, actionTag) {
  const filteredState = state.filter(tag => (tag.id !== actionTag.tagCategory.id));
  return [
    ...filteredState,
    {
      description: actionTag.tagCategory.description,
      id: actionTag.tagCategory.id,
      values: [actionTag.tagValue],
    },
  ];
}

function addAssignedTag(state, actionTag) {
  const filteredState = state.filter(tag => (tag.id !== actionTag.tagCategory.id));
  const selectedItem = state.find(tag => (tag.id === actionTag.tagCategory.id)) || { values: [] };
  const oldValues = selectedItem.values.filter(tagValue => (tagValue.id !== actionTag.tagValue.id));
  return [...filteredState,
    {
      description: actionTag.tagCategory.description,
      id: actionTag.tagCategory.id,
      values: [...oldValues].concat([actionTag.tagValue]),
    }];
}

export const modifyassignedTags = (state = [], action) => {
  switch (action.type) {
    case actionsConstants.DELETE_ASSIGNED_TAG:
      return deleteAssignedTag(state, action.tag);
    case actionsConstants.CHANGE_ASSIGNED_TAG:
      return changeAssignedTag(state, action.tag);
    case actionsConstants.ADD_ASSIGNED_TAG:
      return addAssignedTag(state, action.tag);
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
