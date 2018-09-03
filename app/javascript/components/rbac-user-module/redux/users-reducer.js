import * as actionTypes from './action-types';

const columns = [{
  property: 'name',
  label: 'Full Name',
}, {
  property: 'userid',
  label: 'Username',
}, {
  property: 'email',
  label: 'E-mail',
}, {
  property: 'current_group',
  label: 'Current Group',
}, {
  property: 'role',
  label: 'Role',
}, {
  property: 'lastlogon',
  label: 'Last Logon',
}, {
  property: 'lastlogoff',
  label: 'Last Logoff',
}];

const handleSelectUser = (users = [], user) => user.selected ? [ ...users, user] : users.filter(({ id }) => id !== user.id);

const usersReducer = (state = {
  isLoaded: false,
  isFetching: false,
  isValid: true,
  columns,
  flashMessages: [],
}, action) => {
  let newState = {};
  switch (action.type) {
    case actionTypes.FETCH_SUCESFULL:
      return { ...state, isFetching: false, isValid: true };
    case actionTypes.REQUEST_FAILED:
      return { ...state, isFetching: false, isValid: false };
    case actionTypes.FETCH_DATA:
    case actionTypes.SAVE_USER:
      return { ...state, isFetching: true };
    case actionTypes.LOAD_DATA:
      newState = {
        ...state,
        rows: [...action.data.rows],
        isLoaded: true,
        isFetching: false,
        isValid: true,
      };
      return { ...newState };
    case actionTypes.SELECT_USERS:
      return { ...state, selectedUsers: handleSelectUser(state.selectedUsers, action.selectedUser) };
    case actionTypes.RESET_SELECTED_USERS:
      return { ...state, selectedUsers: action.selectedUsers };
    case actionTypes.STORE_GROUPS:
      return { ...state, groups: action.groups };
    case actionTypes.STORE_USERS_TREE:
      return { ...state, usersTree: action.usersTree };
    case actionTypes.STORE_TAG_CATEGORIES:
      return { ...state, categories: action.categories };
    case actionTypes.ADD_FLASH_MESSAGE:
      return { ...state, flashMessages: [...state.flashMessages, action.flashMessage] }
    case actionTypes.REMOVE_FLASH_MESSAGE:
      return { ...state, flashMessages: state.flashMessages.filter(({ flashId }) =>  flashId !== action.flashMessage.flashId) }
    default:
      return { ...state };
  }
};
export default usersReducer;


